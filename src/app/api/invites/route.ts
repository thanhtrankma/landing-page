import { clientIp, rateLimit } from "@/lib/rate-limit";
import { fail, ok, readJson, sameOrigin } from "@/lib/cards/http";
import { inviteCookieOptions } from "@/lib/invites/http";
import { createInvite, INVITE_COOKIE, sanitizeInvite, slugProblem, slugTaken } from "@/lib/invites/server";

// Creates an invitation. The edit token is returned once and also set as an httpOnly cookie.
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Yêu cầu không hợp lệ.", 403);
  const body = await readJson(request);
  if (!body) return fail("Dữ liệu không hợp lệ.");
  const slug = String(body.slug ?? "").trim().toLowerCase();
  const problem = slugProblem(slug);
  if (problem) return fail(problem);

  const ip = clientIp(request.headers);
  const limit = rateLimit(`invite:create:${ip}`, 10, 60 * 60_000);
  if (!limit.ok) return fail("Bạn tạo quá nhiều thiệp, vui lòng thử lại sau.", 429);

  try {
    if (await slugTaken(slug)) return fail("Đường dẫn này đã có người dùng, hãy chọn tên khác.", 409);
    const { id, token } = await createInvite({ slug, data: sanitizeInvite(body.data), ip });
    const res = ok({ id, token, slug });
    res.cookies.set(INVITE_COOKIE(id), token, inviteCookieOptions);
    return res;
  } catch (e) {
    console.error("[invites] create failed:", (e as Error).message);
    return fail("Hệ thống đang bận, vui lòng thử lại.", 500);
  }
}
