import { ok, sameOrigin, fail } from "@/lib/cards/http";
import { USER_COOKIE } from "@/lib/account/server";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Yêu cầu không hợp lệ.", 403);
  const res = ok({ ok: true });
  res.cookies.delete(USER_COOKIE);
  return res;
}
