import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { env, supabaseAuthHeaders, supabaseConfigured } from "@/lib/env";

const TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };
const MAX = 5 * 1024 * 1024;

export async function POST(request: Request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  const file = (await request.formData()).get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Không có tệp." }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "Chỉ hỗ trợ ảnh PNG, JPG, WebP, GIF, AVIF." }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "Ảnh tối đa 5MB." }, { status: 400 });

  const name = `${new Date().toISOString().slice(0, 7)}/${randomBytes(8).toString("hex")}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (supabaseConfigured()) {
    const res = await fetch(`${env.supabaseUrl}/storage/v1/object/${env.storageBucket}/${name}`, {
      method: "POST",
      headers: { ...supabaseAuthHeaders(), "Content-Type": file.type, "x-upsert": "false" },
      body: bytes,
    });
    if (!res.ok) return NextResponse.json({ error: `Không tải lên được (Supabase Storage ${res.status}).` }, { status: 502 });
    return NextResponse.json({ url: `${env.supabaseUrl}/storage/v1/object/public/${env.storageBucket}/${name}` });
  }

  // No Supabase configured (local development): keep the file under public/uploads.
  const target = path.join(process.cwd(), "public", "uploads", name);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, bytes);
  return NextResponse.json({ url: `/uploads/${name}` });
}
