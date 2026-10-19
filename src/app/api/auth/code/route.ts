import { clientIp, rateLimit } from "@/lib/rate-limit";
import { fail, ok, readJson, sameOrigin } from "@/lib/cards/http";
import { normalizeEmail, sendLoginCode, validEmail } from "@/lib/account/server";

// Step 1 of email login: send a 6-digit code.
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Yêu cầu không hợp lệ.", 403);
  const email = normalizeEmail(String((await readJson(request))?.email ?? ""));
  if (!validEmail(email)) return fail("Email không hợp lệ.");
  const ip = clientIp(request.headers);
  if (!rateLimit(`login-code:ip:${ip}`, 10, 15 * 60_000).ok || !rateLimit(`login-code:email:${email}`, 4, 15 * 60_000).ok) {
    return fail("Bạn yêu cầu mã quá nhiều lần, vui lòng thử lại sau ít phút.", 429);
  }
  try {
    await sendLoginCode(email);
    return ok({ sent: true });
  } catch (e) {
    console.error("[auth] send code failed:", (e as Error).message);
    return fail("Không gửi được mã, vui lòng thử lại.", 500);
  }
}
