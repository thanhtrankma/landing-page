import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { signUpload } from "@/lib/r2";
import { MB, UPLOAD_RULES, type UploadKind } from "@/lib/upload-rules";

// Hands the browser a short-lived URL to PUT one file straight into R2 (or the local fallback).
// Type and exact byte size are part of the signature, so the limits below cannot be bypassed.

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

// Per IP: photos are cheap and frequent while designing, videos are not.
const LIMITS: Record<UploadKind, [count: number, windowMs: number]> = {
  image: [40, 10 * 60_000],
  video: [6, 60 * 60_000],
};

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail("Dữ liệu không hợp lệ.");
  }

  const kind = body.kind === "image" || body.kind === "video" ? body.kind : null;
  if (!kind) return fail("Loại tệp không hợp lệ.");
  const rules = UPLOAD_RULES[kind];
  const type = typeof body.type === "string" ? body.type : "";
  const size = typeof body.size === "number" ? body.size : 0;

  if (!rules.types[type]) {
    return fail(kind === "image" ? "Chỉ hỗ trợ ảnh WebP, JPG, PNG." : "Chỉ hỗ trợ video MP4, WebM, MOV.");
  }
  if (!Number.isInteger(size) || size <= 0) return fail("Kích thước tệp không hợp lệ.");
  if (size > rules.maxBytes) return fail(`${kind === "image" ? "Ảnh" : "Video"} tối đa ${MB(rules.maxBytes)}.`);

  const [count, windowMs] = LIMITS[kind];
  const limit = rateLimit(`upload:${kind}:${clientIp(request.headers)}`, count, windowMs);
  if (!limit.ok) return fail(`Bạn tải lên quá nhiều, vui lòng thử lại sau ${Math.ceil(limit.retryAfterS / 60)} phút.`, 429);

  return NextResponse.json(signUpload(kind, type, size), { headers: { "Cache-Control": "no-store" } });
}
