import { clientIp, rateLimit } from "@/lib/rate-limit";
import { fail, ok, readJson, sameOrigin } from "@/lib/cards/http";
import { inviteCookieOptions } from "@/lib/invites/http";
import { INVITE_COOKIE, inviteTokenMatches } from "@/lib/invites/server";

// The secret edit link (…/sua/<id>#t=<token>) opened on another device: trade the token for the cookie.
export async function POST(request: Request, ctx: RouteContext<"/api/invites/[id]/claim">) {
  const { id } = await ctx.params;
  if (!sameOrigin(request)) return fail("Yêu cầu không hợp lệ.", 403);
  const limit = rateLimit(`invite:claim:${clientIp(request.headers)}`, 10, 15 * 60_000);
  if (!limit.ok) return fail("Thử quá nhiều lần, vui lòng đợi ít phút.", 429);
  const token = String((await readJson(request))?.token ?? "");
  if (!(await inviteTokenMatches(id, token))) return fail("Link chỉnh sửa không đúng hoặc thiệp đã bị xoá.", 403);
  const res = ok({ ok: true });
  res.cookies.set(INVITE_COOKIE(id), token, inviteCookieOptions);
  return res;
}
