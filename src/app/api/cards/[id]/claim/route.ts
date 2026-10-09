import { clientIp, rateLimit } from "@/lib/rate-limit";
import { fail, ok, readJson, sameOrigin, withEditCookie } from "@/lib/cards/http";
import { tokenMatches } from "@/lib/cards/server";

// Opening the secret edit link (…/sua/<id>#t=<token>) on another device: trade the token for the cookie.
export async function POST(request: Request, ctx: RouteContext<"/api/cards/[id]/claim">) {
  const { id } = await ctx.params;
  if (!sameOrigin(request)) return fail("Yêu cầu không hợp lệ.", 403);
  const limit = rateLimit(`card:claim:${clientIp(request.headers)}`, 10, 15 * 60_000);
  if (!limit.ok) return fail("Thử quá nhiều lần, vui lòng đợi ít phút.", 429);

  const token = String((await readJson(request))?.token ?? "");
  if (!(await tokenMatches(id, token))) return fail("Link chỉnh sửa không đúng hoặc thiệp đã bị xoá.", 403);
  return withEditCookie(ok({ ok: true }), id, token);
}
