import { fail, ok, readJson, sameOrigin } from "@/lib/cards/http";
import { validEmail } from "@/lib/account/server";
import { addMember, listMembers, removeMember } from "@/lib/invites/access";
import { guard } from "@/lib/invites/http";

// "Thành viên": people who can edit with you. Only the owner adds or removes them.
export async function GET(request: Request, ctx: RouteContext<"/api/invites/[id]/members">) {
  const { id } = await ctx.params;
  const g = await guard(request, id, ["owner", "editor"]);
  if ("denied" in g) return g.denied;
  return ok({ members: await listMembers(id), role: g.role });
}

export async function POST(request: Request, ctx: RouteContext<"/api/invites/[id]/members">) {
  const { id } = await ctx.params;
  if (!sameOrigin(request)) return fail("Yêu cầu không hợp lệ.", 403);
  const g = await guard(request, id, ["owner"]);
  if ("denied" in g) return g.denied;
  const body = await readJson(request);
  if (body?.remove) {
    await removeMember(id, String(body.remove));
    return ok({ members: await listMembers(id) });
  }
  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!validEmail(email)) return fail("Email không hợp lệ.");
  if (email === g.user?.email) return fail("Đây là email của bạn.");
  if ((await listMembers(id)).length >= 10) return fail("Tối đa 10 thành viên.");
  await addMember(id, email);
  return ok({ members: await listMembers(id) });
}
