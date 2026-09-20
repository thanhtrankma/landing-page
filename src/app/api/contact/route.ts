import { NextResponse } from "next/server";

// Development stub: validates like the public form does, but delivers nowhere.
// Wire this to email / CRM / webhook before going live.
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  // Honeypot: pretend success so bots learn nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ success: true });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (name.length < 2) return NextResponse.json({ success: false, error: "Họ và tên phải có ít nhất 2 ký tự." }, { status: 400 });
  if (!/^(0|84)(3|5|7|8|9)[0-9]{8}$/.test(phone))
    return NextResponse.json(
      { success: false, error: "Số điện thoại không hợp lệ (vui lòng sử dụng số điện thoại Việt Nam)." },
      { status: 400 },
    );
  if (message.length < 5)
    return NextResponse.json({ success: false, error: "Nội dung yêu cầu phải có ít nhất 5 ký tự." }, { status: 400 });

  console.log("[contact] new request", { name, phone, message });
  return NextResponse.json({ success: true });
}
