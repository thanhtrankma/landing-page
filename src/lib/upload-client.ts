"use client";

import { MB, UPLOAD_RULES, type SignedUpload, type UploadKind } from "./upload-rules";

// Browser side of user uploads: shrink photos before they leave the device, sanity-check videos,
// then PUT the file straight to storage with the URL from /api/uploads/sign.

export class UploadError extends Error {}

export type UploadResult = { url: string; key: string; width?: number; height?: number; duration?: number };

/**
 * Resizes to UPLOAD_RULES.image.maxEdge and re-encodes as WebP (JPEG where the browser cannot encode WebP,
 * PNG when the source has transparency). Re-encoding also strips EXIF, including GPS location.
 * <img> decoding applies the EXIF orientation, so phone photos come out upright.
 */
export async function prepareImage(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const rules = UPLOAD_RULES.image;
  if (!file.type.startsWith("image/")) throw new UploadError("Tệp này không phải ảnh.");
  if (file.size > rules.maxOriginalBytes) throw new UploadError(`Ảnh gốc tối đa ${MB(rules.maxOriginalBytes)}.`);

  const src = URL.createObjectURL(file);
  let img: HTMLImageElement;
  try {
    img = new Image();
    img.src = src;
    await img.decode();
  } catch {
    throw new UploadError(
      /hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name)
        ? "Trình duyệt này chưa đọc được ảnh HEIC. Hãy chọn ảnh JPG/PNG, hoặc mở bằng Safari."
        : "Không đọc được ảnh này.",
    );
  } finally {
    URL.revokeObjectURL(src);
  }

  const scale = Math.min(1, rules.maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new UploadError("Thiết bị không đủ bộ nhớ để xử lý ảnh.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  const encode = (type: string) => new Promise<Blob | null>((r) => canvas.toBlob(r, type, rules.quality));
  let blob = await encode("image/webp");
  // Safari silently falls back to PNG when it cannot encode WebP.
  if (!blob || blob.type !== "image/webp") {
    blob = file.type === "image/png" ? await encode("image/png") : await encode("image/jpeg");
  }
  if (!blob) throw new UploadError("Không nén được ảnh.");
  if (blob.size > rules.maxBytes) throw new UploadError(`Ảnh sau khi nén vẫn lớn hơn ${MB(rules.maxBytes)}.`);
  return { blob, width, height };
}

/** Reads the video's metadata to enforce type, size and duration before uploading. */
export async function checkVideo(file: File): Promise<{ duration: number; width: number; height: number }> {
  const rules = UPLOAD_RULES.video;
  if (!rules.types[file.type]) throw new UploadError("Chỉ hỗ trợ video MP4, WebM, MOV.");
  if (file.size > rules.maxBytes) throw new UploadError(`Video tối đa ${MB(rules.maxBytes)}.`);

  const src = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.src = src;
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new UploadError("Trình duyệt không phát được video này. Hãy dùng MP4 (H.264)."));
    });
    if (video.duration > rules.maxSeconds) throw new UploadError(`Video tối đa ${rules.maxSeconds} giây.`);
    return { duration: video.duration, width: video.videoWidth, height: video.videoHeight };
  } finally {
    URL.revokeObjectURL(src);
  }
}

async function requestSignedUrl(kind: UploadKind, type: string, size: number): Promise<SignedUpload> {
  const res = await fetch("/api/uploads/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, type, size }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new UploadError(data.error || "Không xin được quyền tải lên.");
  return data as SignedUpload;
}

/** XHR rather than fetch: it is the only way to report upload progress in every browser. */
function put(signed: SignedUpload, body: Blob, onProgress?: (ratio: number) => void, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signed.uploadUrl);
    for (const [k, v] of Object.entries(signed.headers)) xhr.setRequestHeader(k, v);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new UploadError(`Tải lên thất bại (${xhr.status}).`)));
    xhr.onerror = () => reject(new UploadError("Mất kết nối khi tải lên, vui lòng thử lại."));
    xhr.onabort = () => reject(new UploadError("Đã huỷ tải lên."));
    signal?.addEventListener("abort", () => xhr.abort());
    xhr.send(body);
  });
}

/** Compresses (photos), checks (videos) and uploads one file. Returns its public URL. */
export async function uploadFile(
  file: File,
  kind: UploadKind,
  opts: { onProgress?: (ratio: number) => void; signal?: AbortSignal } = {},
): Promise<UploadResult> {
  if (kind === "image") {
    const { blob, width, height } = await prepareImage(file);
    const signed = await requestSignedUrl("image", blob.type, blob.size);
    await put(signed, blob, opts.onProgress, opts.signal);
    return { url: signed.publicUrl, key: signed.key, width, height };
  }
  const meta = await checkVideo(file);
  const signed = await requestSignedUrl("video", file.type, file.size);
  await put(signed, file, opts.onProgress, opts.signal);
  return { url: signed.publicUrl, key: signed.key, ...meta };
}
