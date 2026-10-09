import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { r2Configured } from "@/lib/env";
import { verifyLocalTicket } from "@/lib/r2";

// Development stand-in for R2: accepts the PUT that /api/uploads/sign issued and stores it under public/uploads.
export async function PUT(request: Request) {
  if (r2Configured() || process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const q = new URL(request.url).searchParams;
  const key = q.get("key") ?? "";
  const size = Number(q.get("size"));
  const type = request.headers.get("content-type") ?? "";
  if (!verifyLocalTicket(key, type, size, Number(q.get("exp")), q.get("sig") ?? "")) {
    return NextResponse.json({ error: "Chữ ký không hợp lệ hoặc đã hết hạn." }, { status: 403 });
  }

  const bytes = Buffer.from(await request.arrayBuffer());
  if (bytes.length !== size) return NextResponse.json({ error: "Sai kích thước tệp." }, { status: 400 });

  const target = path.join(process.cwd(), "public", "uploads", key);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, bytes);
  return new NextResponse(null, { status: 200 });
}
