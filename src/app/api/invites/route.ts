import { clientIp, rateLimit } from "@/lib/rate-limit";
import { fail, ok, readJson, sameOrigin } from "@/lib/cards/http";
import { userFromRequest } from "@/lib/account/server";
import { inviteCookieOptions } from "@/lib/invites/http";
import { createInvite, freeSlug, INVITE_COOKIE, sanitizeInvite } from "@/lib/invites/server";
import { slugify } from "@/lib/validate";

// Starts a draft. Signed-in users own it at once; anonymous visitors get an edit cookie until they publish.
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Yêu cầu không hợp lệ.", 403);
  const body = await readJson(request);
  if (!body) return fail("Dữ liệu không hợp lệ.");
  const ip = clientIp(request.headers);
  if (!rateLimit(`invite:create:${ip}`, 15, 60 * 60_000).ok) return fail("Bạn tạo quá nhiều thiệp, vui lòng thử lại sau.", 429);
  try {
    const user = await userFromRequest(request);
    const data = sanitizeInvite(body.data);
    const slug = await freeSlug(slugify(`${data.groomName}-${data.brideName}`));
    const { id, token } = await createInvite({ slug, data, ip, ownerId: user?.id ?? null });
    const res = ok({ id, slug });
    res.cookies.set(INVITE_COOKIE(id), token, inviteCookieOptions);
    return res;
  } catch (e) {
    console.error("[invites] create failed:", (e as Error).message);
    return fail("Hệ thống đang bận, vui lòng thử lại.", 500);
  }
}
