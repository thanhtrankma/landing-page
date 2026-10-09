// Upload limits shared by the browser (pre-checks, compression targets) and the server (enforcement).

export type UploadKind = "image" | "video" | "audio";

export const UPLOAD_RULES = {
  image: {
    // What the server accepts after the browser has compressed the photo.
    types: { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" } as Record<string, string>,
    maxBytes: 5 * 1024 * 1024,
    // Compression target in the browser.
    maxEdge: 2560,
    quality: 0.85,
    // What the file picker accepts before compression (originals from phones can be large).
    maxOriginalBytes: 30 * 1024 * 1024,
  },
  video: {
    types: { "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov" } as Record<string, string>,
    maxBytes: 50 * 1024 * 1024,
    maxSeconds: 90,
  },
  audio: {
    types: { "audio/mpeg": "mp3", "audio/mp3": "mp3", "audio/mp4": "m4a", "audio/x-m4a": "m4a", "audio/aac": "aac" } as Record<string, string>,
    maxBytes: 10 * 1024 * 1024,
  },
} as const;

export const MB = (bytes: number) => `${Math.round(bytes / 1024 / 1024)}MB`;

export type SignedUpload = {
  uploadUrl: string;
  /** Headers the PUT must carry exactly as given: they are part of the signature. */
  headers: Record<string, string>;
  publicUrl: string;
  key: string;
};
