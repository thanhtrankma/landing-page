import { clientIp, rateLimit } from "@/lib/rate-limit";
import { fail, ok, readJson, sameOrigin } from "@/lib/cards/http";
import { safeNext, sessionCookie, verifyLoginCode } from "@/lib/account/server";
import { afterLogin } from "@/lib/invites/access";

// Step 2 of email login: check the code, start the session, attach this browser's draft invitations.
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Yêu cầu không hợp lệ.", 403);
  const body = await readJson(request);
  if (!rateLimit(`login-verify:${clientIp(request.headers)}`, 20, 15 * 60_000).ok) return fail("Thử quá nhiều lần, vui lòng đợi ít phút.", 429);
  const result = await verifyLoginCode(String(body?.email ?? ""), String(body?.code ?? ""));
  if ("error" in result) return fail(result.error);
  await afterLogin(result, request.headers.get("cookie") ?? "").catch((e) => console.error("[auth] afterLogin:", e));
  const c = sessionCookie(result.id);
  const res = ok({ next: safeNext(body?.next) });
  res.cookies.set(c.name, c.value, c.options);
  return res;
}
