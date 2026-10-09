import { clientIp, rateLimit } from "@/lib/rate-limit";
import { canEdit, fail, ok, readJson, sameOrigin } from "@/lib/cards/http";
import { EDIT_COOKIE, deleteDesign, getDesign, sanitizeCanvas, updateDesign } from "@/lib/cards/server";

export async function GET(request: Request, ctx: RouteContext<"/api/cards/[id]">) {
  const { id } = await ctx.params;
  if (!(await canEdit(request, id))) return fail("Bạn không có quyền sửa thiệp này.", 403);
  const design = await getDesign(id);
  return design ? ok({ design }) : fail("Không tìm thấy thiệp.", 404);
}

export async function PUT(request: Request, ctx: RouteContext<"/api/cards/[id]">) {
  const { id } = await ctx.params;
  if (!sameOrigin(request)) return fail("Yêu cầu không hợp lệ.", 403);
  const limit = rateLimit(`card:save:${clientIp(request.headers)}`, 120, 10 * 60_000);
  if (!limit.ok) return fail("Bạn lưu quá nhanh, vui lòng thử lại sau ít phút.", 429);
  if (!(await canEdit(request, id))) return fail("Bạn không có quyền sửa thiệp này.", 403);

  const body = await readJson(request);
  if (!body) return fail("Dữ liệu không hợp lệ.");
  const patch: { title?: string; canvas?: import("@/lib/cards/types").CardJson } = {};
  if (typeof body.title === "string") patch.title = body.title.trim().slice(0, 120) || "Thiệp cưới";
  if (body.canvas !== undefined) {
    const canvas = sanitizeCanvas(body.canvas);
    if (!canvas.ok) return fail(canvas.error);
    patch.canvas = canvas.json;
  }
  try {
    const design = await updateDesign(id, patch);
    return design ? ok({ updatedAt: design.updatedAt }) : fail("Không tìm thấy thiệp.", 404);
  } catch (e) {
    console.error("[cards] save failed:", (e as Error).message);
    return fail("Không lưu được, vui lòng thử lại.", 500);
  }
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/cards/[id]">) {
  const { id } = await ctx.params;
  if (!sameOrigin(request)) return fail("Yêu cầu không hợp lệ.", 403);
  if (!(await canEdit(request, id))) return fail("Bạn không có quyền xoá thiệp này.", 403);
  await deleteDesign(id);
  const res = ok({ deleted: true });
  res.cookies.delete(EDIT_COOKIE(id));
  return res;
}
