import { clientIp, rateLimit } from "@/lib/rate-limit";
import { canEdit, fail, ok, readJson, sameOrigin } from "@/lib/cards/http";
import { OBJECT_KEY_RE } from "@/lib/r2";
import { setSharing } from "@/lib/cards/server";

// Turns the public link on (with a freshly uploaded preview JPEG) or off.
export async function POST(request: Request, ctx: RouteContext<"/api/cards/[id]/share">) {
  const { id } = await ctx.params;
  if (!sameOrigin(request)) return fail("Yêu cầu không hợp lệ.", 403);
  const limit = rateLimit(`card:share:${clientIp(request.headers)}`, 40, 60 * 60_000);
  if (!limit.ok) return fail("Bạn thao tác quá nhanh, vui lòng thử lại sau.", 429);
  if (!(await canEdit(request, id))) return fail("Bạn không có quyền chia sẻ thiệp này.", 403);

  const body = await readJson(request);
  if (!body) return fail("Dữ liệu không hợp lệ.");
  if (body.enabled === false) {
    await setSharing(id, null);
    return ok({ slug: null });
  }
  const previewKey = String(body.previewKey ?? "");
  if (!OBJECT_KEY_RE.test(previewKey) || !previewKey.startsWith("cards/images/")) return fail("Ảnh xem trước không hợp lệ.");
  try {
    return ok({ slug: await setSharing(id, previewKey) });
  } catch (e) {
    return fail((e as Error).message, 500);
  }
}
