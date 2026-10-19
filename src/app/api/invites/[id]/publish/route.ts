import { fail, ok, readJson, sameOrigin } from "@/lib/cards/http";
import { guard } from "@/lib/invites/http";
import { getInvite, slugProblem, slugTaken, updateInvite } from "@/lib/invites/server";

// "Xuất bản": needs an account. A draft started anonymously becomes the publisher's.
export async function POST(request: Request, ctx: RouteContext<"/api/invites/[id]/publish">) {
  const { id } = await ctx.params;
  if (!sameOrigin(request)) return fail("Yêu cầu không hợp lệ.", 403);
  const g = await guard(request, id);
  if ("denied" in g) return g.denied;
  if (!g.user) return fail("Vui lòng đăng nhập để xuất bản thiệp.", 401);

  const body = await readJson(request);
  const invite = await getInvite(id);
  if (!invite) return fail("Không tìm thấy thiệp.", 404);
  const slug = typeof body?.slug === "string" ? body.slug.trim().toLowerCase() : invite.slug;
  const problem = slugProblem(slug);
  if (problem) return fail(problem);
  if (await slugTaken(slug, id)) return fail("Đường dẫn này đã có người dùng, hãy chọn tên khác.", 409);
  if (!invite.data.groomName || !invite.data.brideName) return fail("Hãy nhập tên cô dâu và chú rể trước khi xuất bản.");

  const updated = await updateInvite(id, { slug, status: "published", published: true, ...(g.role === "token" ? { ownerId: g.user.id } : {}) });
  return ok({ slug: updated?.slug, status: updated?.status, publishedAt: updated?.publishedAt });
}
