import { fail, ok, readJson, sameOrigin } from "@/lib/cards/http";
import { guard } from "@/lib/invites/http";
import { listAllWishes, setWishHidden } from "@/lib/invites/server";

// The couple's view of wishes and RSVPs, and hiding a wish from the public page.
export async function GET(request: Request, ctx: RouteContext<"/api/invites/[id]/wishes">) {
  const { id } = await ctx.params;
  const g = await guard(request, id);
  if ("denied" in g) return g.denied;
  return ok({ wishes: await listAllWishes(id) });
}

export async function PATCH(request: Request, ctx: RouteContext<"/api/invites/[id]/wishes">) {
  const { id } = await ctx.params;
  if (!sameOrigin(request)) return fail("Yêu cầu không hợp lệ.", 403);
  const g = await guard(request, id);
  if ("denied" in g) return g.denied;
  const body = await readJson(request);
  if (!body || typeof body.wishId !== "string" || typeof body.hidden !== "boolean") return fail("Dữ liệu không hợp lệ.");
  await setWishHidden(id, body.wishId, body.hidden);
  return ok({ ok: true });
}
