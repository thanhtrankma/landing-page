import { clientIp, rateLimit } from "@/lib/rate-limit";
import { fail, ok, readJson, sameOrigin } from "@/lib/cards/http";
import { guard } from "@/lib/invites/http";
import { deleteInvite, getInvite, INVITE_COOKIE, sanitizeInvite, slugProblem, slugTaken, updateInvite, type InviteStatus } from "@/lib/invites/server";
import type { InviteData } from "@/lib/invites/types";

export async function GET(request: Request, ctx: RouteContext<"/api/invites/[id]">) {
  const { id } = await ctx.params;
  const g = await guard(request, id);
  if ("denied" in g) return g.denied;
  const invite = await getInvite(id);
  return invite ? ok({ invite, role: g.role }) : fail("Không tìm thấy thiệp.", 404);
}

/** Autosave (data, slug) and the "tạm ẩn" switch (published). Publishing has its own route. */
export async function PUT(request: Request, ctx: RouteContext<"/api/invites/[id]">) {
  const { id } = await ctx.params;
  if (!sameOrigin(request)) return fail("Yêu cầu không hợp lệ.", 403);
  if (!rateLimit(`invite:save:${clientIp(request.headers)}`, 300, 10 * 60_000).ok) return fail("Bạn lưu quá nhanh, vui lòng thử lại sau ít phút.", 429);
  const g = await guard(request, id);
  if ("denied" in g) return g.denied;

  const body = await readJson(request);
  if (!body) return fail("Dữ liệu không hợp lệ.");
  const patch: { slug?: string; data?: InviteData; published?: boolean; status?: InviteStatus } = {};
  if (body.slug !== undefined) {
    const slug = String(body.slug).trim().toLowerCase();
    const problem = slugProblem(slug);
    if (problem) return fail(problem);
    if (await slugTaken(slug, id)) return fail("Đường dẫn này đã có người dùng, hãy chọn tên khác.", 409);
    patch.slug = slug;
  }
  if (body.data !== undefined) patch.data = sanitizeInvite(body.data);
  if (typeof body.published === "boolean") patch.published = body.published;
  try {
    const invite = await updateInvite(id, patch);
    return invite ? ok({ updatedAt: invite.updatedAt, slug: invite.slug, published: invite.published, status: invite.status }) : fail("Không tìm thấy thiệp.", 404);
  } catch (e) {
    console.error("[invites] save failed:", (e as Error).message);
    return fail("Không lưu được, vui lòng thử lại.", 500);
  }
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/invites/[id]">) {
  const { id } = await ctx.params;
  if (!sameOrigin(request)) return fail("Yêu cầu không hợp lệ.", 403);
  const g = await guard(request, id, ["owner", "token"]);
  if ("denied" in g) return g.denied;
  await deleteInvite(id);
  const res = ok({ deleted: true });
  res.cookies.delete(INVITE_COOKIE(id));
  return res;
}
