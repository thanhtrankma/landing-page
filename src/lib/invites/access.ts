import "server-only";
import { cookies } from "next/headers";
import { db } from "../db";
import type { Row } from "../db/types";
import { normalizeEmail, userFromRequest, currentUser, type AppUser } from "../account/server";
import { INVITE_COOKIE, inviteFromRow, inviteRow, inviteTokenMatches, isUuid, type OwnedInvite } from "./server";

// Who may edit an invitation:
//   owner  — the account that published (or created it while signed in)
//   editor — an account invited by email from the "Thành viên" settings
//   token  — this browser holds the edit cookie of a draft nobody has claimed yet (anonymous start)

export type Role = "owner" | "editor" | "token";

function cookieFrom(header: string, name: string) {
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

async function roleFor(id: string, user: AppUser | null, editToken: string | undefined): Promise<Role | null> {
  const r = await inviteRow(id);
  if (!r) return null;
  if (user && r.owner_id && String(r.owner_id) === user.id) return "owner";
  if (user) {
    const { rows } = await db.select<Row>("invitation_members", {
      filters: [
        { col: "invitation_id", op: "eq", val: id },
        { col: "invited_email", op: "eq", val: user.email },
      ],
      limit: 1,
    });
    if (rows[0]) return "editor";
  }
  // The anonymous edit link keeps working only until the draft belongs to an account.
  if (!r.owner_id && (await inviteTokenMatches(id, editToken))) return "token";
  return null;
}

export async function requestRole(request: Request, id: string): Promise<{ role: Role | null; user: AppUser | null }> {
  if (!isUuid(id)) return { role: null, user: null };
  const user = await userFromRequest(request);
  const token = request.headers.get("x-edit-token") ?? cookieFrom(request.headers.get("cookie") ?? "", INVITE_COOKIE(id));
  return { role: await roleFor(id, user, token), user };
}

export async function pageRole(id: string): Promise<{ role: Role | null; user: AppUser | null }> {
  if (!isUuid(id)) return { role: null, user: null };
  const user = await currentUser();
  const token = (await cookies()).get(INVITE_COOKIE(id))?.value;
  return { role: await roleFor(id, user, token), user };
}

/** After any login: link pending memberships and adopt the drafts this browser created anonymously. */
export async function afterLogin(user: AppUser, cookieHeader: string) {
  await db.update("invitation_members", [{ col: "invited_email", op: "eq", val: user.email }], { user_id: user.id });
  for (const part of cookieHeader.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (!k.startsWith("it_")) continue;
    const id = k.slice(3);
    if (!isUuid(id)) continue;
    const r = await inviteRow(id);
    if (r && !r.owner_id && (await inviteTokenMatches(id, decodeURIComponent(v.join("="))))) {
      await db.update("invitations", [{ col: "id", op: "eq", val: id }], { owner_id: user.id });
    }
  }
}

/** Dashboard list: invitations the user owns or was invited to edit. */
export async function listMyInvites(user: AppUser): Promise<(OwnedInvite & { role: Role })[]> {
  const own = await db.select<Row>("invitations", { filters: [{ col: "owner_id", op: "eq", val: user.id }], order: [{ col: "updated_at", asc: false }] });
  const mem = await db.select<Row>("invitation_members", { filters: [{ col: "invited_email", op: "eq", val: user.email }] });
  const shared: Row[] = [];
  for (const m of mem.rows) {
    const r = await inviteRow(String(m.invitation_id));
    if (r && String(r.owner_id) !== user.id) shared.push(r);
  }
  return [...own.rows.map((r) => ({ ...inviteFromRow(r), role: "owner" as const })), ...shared.map((r) => ({ ...inviteFromRow(r), role: "editor" as const }))];
}

// ───────────── members ─────────────

export type Member = { id: string; email: string; joined: boolean; createdAt: string };

export async function listMembers(inviteId: string): Promise<Member[]> {
  const { rows } = await db.select<Row>("invitation_members", { filters: [{ col: "invitation_id", op: "eq", val: inviteId }], order: [{ col: "created_at", asc: true }] });
  return rows.map((r) => ({ id: String(r.id), email: String(r.invited_email), joined: Boolean(r.user_id), createdAt: String(r.created_at) }));
}

export async function addMember(inviteId: string, rawEmail: string) {
  const email = normalizeEmail(rawEmail);
  const existing = await listMembers(inviteId);
  if (existing.some((m) => m.email === email)) return;
  const { rows } = await db.select<Row>("app_users", { filters: [{ col: "email", op: "eq", val: email }], columns: "id", limit: 1 });
  await db.insert("invitation_members", { invitation_id: inviteId, invited_email: email, user_id: rows[0] ? String(rows[0].id) : null, role: "editor" });
}

export async function removeMember(inviteId: string, memberId: string) {
  if (!isUuid(memberId)) return;
  await db.remove("invitation_members", [
    { col: "id", op: "eq", val: memberId },
    { col: "invitation_id", op: "eq", val: inviteId },
  ]);
}
