import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { createLead } from "@/lib/repo";
import { notifyNewLead } from "@/lib/telegram";

const fail = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status });

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail("Dữ liệu không hợp lệ.");
  }

  // Honeypot: pretend success so bots learn nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ success: true });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const phone = typeof body.phone === "string" ? body.phone.trim().replace(/[\s.-]/g, "") : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 3000) : "";

  if (name.length < 2) return fail("Họ và tên phải có ít nhất 2 ký tự.");
  if (!/^(0|84)(3|5|7|8|9)[0-9]{8}$/.test(phone)) return fail("Số điện thoại không hợp lệ (vui lòng sử dụng số điện thoại Việt Nam).");
  if (message.length < 5) return fail("Nội dung yêu cầu phải có ít nhất 5 ký tự.");

  const limit = rateLimit(`lead:${clientIp(request.headers)}`, 5, 10 * 60_000);
  if (!limit.ok) return fail("Bạn gửi quá nhanh, vui lòng thử lại sau ít phút hoặc liên hệ qua Zalo.", 429);

  const page = typeof body.page === "string" ? body.page.slice(0, 200) : undefined;
  try {
    await createLead({ name, phone, message, page, userAgent: request.headers.get("user-agent") ?? "" });
  } catch (e) {
    console.error("[contact] could not save lead:", (e as Error).message);
    return fail("Hệ thống đang bận, vui lòng thử lại hoặc liên hệ qua Zalo.", 500);
  }
  await notifyNewLead({ name, phone, message, page }, new URL(request.url).origin);
  return NextResponse.json({ success: true });
}
