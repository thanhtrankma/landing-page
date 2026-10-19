import { fail, ok, readJson, sameOrigin } from "@/lib/cards/http";
import { guard } from "@/lib/invites/http";
import { addGuests, createGroup, deleteGroup, deleteGuests, listGroups, listGuests, listRsvps, moveGuests, renameGroup, rsvpStats, updateGuest } from "@/lib/invites/guests";

// Guest list & RSVP for the couple (owner, members, or the anonymous draft holder).
export async function GET(request: Request, ctx: RouteContext<"/api/invites/[id]/guests">) {
  const { id } = await ctx.params;
  const g = await guard(request, id);
  if ("denied" in g) return g.denied;
  const [guests, groups, rsvps] = await Promise.all([listGuests(id), listGroups(id), listRsvps(id)]);
  return ok({ guests, groups, rsvps, stats: rsvpStats(guests, rsvps) });
}

export async function POST(request: Request, ctx: RouteContext<"/api/invites/[id]/guests">) {
  const { id } = await ctx.params;
  if (!sameOrigin(request)) return fail("Yêu cầu không hợp lệ.", 403);
  const g = await guard(request, id);
  if ("denied" in g) return g.denied;
  const b = (await readJson(request)) ?? {};
  const ids = Array.isArray(b.ids) ? b.ids.map(String) : [];
  try {
    switch (b.action) {
      case "add": {
        const list: Record<string, unknown>[] = Array.isArray(b.guests) ? b.guests : [];
        // An imported file names its groups ("groupName"): reuse a group with that name or create it.
        const byName = new Map((await listGroups(id)).map((x) => [x.name.trim().toLowerCase(), x.id]));
        for (const x of list) {
          const n = typeof x.groupName === "string" ? x.groupName.trim().slice(0, 60) : "";
          if (!n || x.groupId || byName.has(n.toLowerCase())) continue;
          byName.set(n.toLowerCase(), (await createGroup(id, n)).id);
        }
        const groupOf = (x: Record<string, unknown>) => (x.groupId as string) || byName.get(String(x.groupName ?? "").trim().toLowerCase()) || null;
        const added = await addGuests(id, list.map((x) => ({ name: String(x.name ?? ""), groupId: groupOf(x), greeting: String(x.greeting ?? ""), maxPeople: x.maxPeople == null ? null : Number(x.maxPeople) })));
        if (!added) return fail("Hãy nhập tên khách mời.");
        break;
      }
      case "update":
        await updateGuest(id, String(b.guestId), b.patch ?? {});
        break;
      case "delete":
        await deleteGuests(id, ids);
        break;
      case "move":
        await moveGuests(id, ids, b.groupId ? String(b.groupId) : null);
        break;
      case "group-create":
        await createGroup(id, String(b.name ?? ""));
        break;
      case "group-rename":
        await renameGroup(id, String(b.groupId), String(b.name ?? ""));
        break;
      case "group-delete":
        await deleteGroup(id, String(b.groupId));
        break;
      default:
        return fail("Thao tác không hợp lệ.");
    }
  } catch (e) {
    return fail((e as Error).message || "Không thực hiện được.", 400);
  }
  const [guests, groups, rsvps] = await Promise.all([listGuests(id), listGroups(id), listRsvps(id)]);
  return ok({ guests, groups, rsvps, stats: rsvpStats(guests, rsvps) });
}
