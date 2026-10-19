import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "../db";
import type { Row } from "../db/types";
import { isUuid } from "./server";

// Guest list, groups, personal links and RSVP answers for one invitation.

export type GuestGroup = { id: string; name: string; sortOrder: number };
export type RsvpStatus = "yes" | "no" | "maybe";
export type Guest = {
  id: string;
  groupId: string | null;
  code: string;
  name: string;
  greeting: string;
  maxPeople: number | null;
  note: string;
  rsvpStatus: RsvpStatus | null;
  rsvpPeople: number | null;
  rsvpAnswers: Record<string, string>;
  rsvpAt: string | null;
  openedAt: string | null;
  createdAt: string;
};
export type Rsvp = { id: string; guestId: string | null; name: string; status: RsvpStatus; people: number; answers: Record<string, string>; createdAt: string };

const STATUSES = ["yes", "no", "maybe"];
const CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const newCode = () => Array.from(randomBytes(7), (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");

const groupFromRow = (r: Row): GuestGroup => ({ id: String(r.id), name: String(r.name), sortOrder: Number(r.sort_order ?? 0) });
const guestFromRow = (r: Row): Guest => ({
  id: String(r.id),
  groupId: (r.group_id as string) ?? null,
  code: String(r.code),
  name: String(r.name),
  greeting: String(r.greeting ?? ""),
  maxPeople: r.max_people == null ? null : Number(r.max_people),
  note: String(r.note ?? ""),
  rsvpStatus: STATUSES.includes(String(r.rsvp_status)) ? (r.rsvp_status as RsvpStatus) : null,
  rsvpPeople: r.rsvp_people == null ? null : Number(r.rsvp_people),
  rsvpAnswers: (r.rsvp_answers ?? {}) as Record<string, string>,
  rsvpAt: (r.rsvp_at as string) ?? null,
  openedAt: (r.opened_at as string) ?? null,
  createdAt: String(r.created_at),
});
const rsvpFromRow = (r: Row): Rsvp => ({
  id: String(r.id),
  guestId: (r.guest_id as string) ?? null,
  name: String(r.name),
  status: STATUSES.includes(String(r.status)) ? (r.status as RsvpStatus) : "maybe",
  people: Number(r.people ?? 1),
  answers: (r.answers ?? {}) as Record<string, string>,
  createdAt: String(r.created_at),
});

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.normalize("NFC").replace(/\s+/g, " ").trim().slice(0, max) : "");

// ───────────── groups ─────────────

export async function listGroups(inviteId: string) {
  const { rows } = await db.select<Row>("guest_groups", { filters: [{ col: "invitation_id", op: "eq", val: inviteId }], order: [{ col: "sort_order", asc: true }, { col: "created_at", asc: true }] });
  return rows.map(groupFromRow);
}

export async function createGroup(inviteId: string, name: string) {
  const n = clean(name, 60);
  if (!n) throw new Error("Tên nhóm không được trống.");
  const count = (await listGroups(inviteId)).length;
  const [r] = await db.insert<Row>("guest_groups", { invitation_id: inviteId, name: n, sort_order: count });
  return groupFromRow(r);
}

export async function renameGroup(inviteId: string, groupId: string, name: string) {
  await db.update("guest_groups", [{ col: "id", op: "eq", val: groupId }, { col: "invitation_id", op: "eq", val: inviteId }], { name: clean(name, 60) });
}

/** Deleting a group keeps its guests (they become ungrouped). */
export async function deleteGroup(inviteId: string, groupId: string) {
  if (!isUuid(groupId)) return;
  await db.update("guests", [{ col: "group_id", op: "eq", val: groupId }, { col: "invitation_id", op: "eq", val: inviteId }], { group_id: null });
  await db.remove("guest_groups", [{ col: "id", op: "eq", val: groupId }, { col: "invitation_id", op: "eq", val: inviteId }]);
}

// ───────────── guests ─────────────

export async function listGuests(inviteId: string) {
  const { rows } = await db.select<Row>("guests", { filters: [{ col: "invitation_id", op: "eq", val: inviteId }], order: [{ col: "created_at", asc: true }], limit: 2000 });
  return rows.map(guestFromRow);
}

export type GuestInput = { name: string; groupId?: string | null; greeting?: string; maxPeople?: number | null; note?: string };

const guestRow = (inviteId: string, g: GuestInput, groupIds: Set<string>) => ({
  invitation_id: inviteId,
  name: clean(g.name, 80),
  group_id: g.groupId && groupIds.has(g.groupId) ? g.groupId : null,
  greeting: clean(g.greeting, 200),
  max_people: Number.isInteger(g.maxPeople) && (g.maxPeople as number) > 0 && (g.maxPeople as number) <= 20 ? g.maxPeople : null,
  note: clean(g.note, 200),
});

/** Adds one or many guests (bulk paste = one name per line). Returns how many were added. */
export async function addGuests(inviteId: string, list: GuestInput[]) {
  const groupIds = new Set((await listGroups(inviteId)).map((g) => g.id));
  const rows = list
    .map((g) => guestRow(inviteId, g, groupIds))
    .filter((r) => r.name)
    .slice(0, 500)
    .map((r) => ({ ...r, code: newCode() }));
  if (!rows.length) return 0;
  await db.insert("guests", rows);
  return rows.length;
}

export async function updateGuest(inviteId: string, guestId: string, g: Partial<GuestInput>) {
  if (!isUuid(guestId)) return;
  const groupIds = new Set((await listGroups(inviteId)).map((x) => x.id));
  const full = guestRow(inviteId, { name: g.name ?? "x", ...g }, groupIds);
  const patch: Row = {};
  if (g.name !== undefined && full.name) patch.name = full.name;
  if (g.groupId !== undefined) patch.group_id = full.group_id;
  if (g.greeting !== undefined) patch.greeting = full.greeting;
  if (g.maxPeople !== undefined) patch.max_people = full.max_people;
  if (g.note !== undefined) patch.note = full.note;
  await db.update("guests", [{ col: "id", op: "eq", val: guestId }, { col: "invitation_id", op: "eq", val: inviteId }], patch);
}

export async function deleteGuests(inviteId: string, ids: string[]) {
  for (const id of ids.filter(isUuid)) {
    await db.remove("guests", [{ col: "id", op: "eq", val: id }, { col: "invitation_id", op: "eq", val: inviteId }]);
  }
}

export async function moveGuests(inviteId: string, ids: string[], groupId: string | null) {
  const groupIds = new Set((await listGroups(inviteId)).map((g) => g.id));
  const gid = groupId && groupIds.has(groupId) ? groupId : null;
  for (const id of ids.filter(isUuid)) {
    await db.update("guests", [{ col: "id", op: "eq", val: id }, { col: "invitation_id", op: "eq", val: inviteId }], { group_id: gid });
  }
}

/** Public: the guest behind a personal link (marks the first open). */
export async function guestByCode(inviteId: string, code: string): Promise<Guest | undefined> {
  if (!/^[a-z0-9]{5,12}$/.test(code)) return undefined;
  const { rows } = await db.select<Row>("guests", { filters: [{ col: "code", op: "eq", val: code }, { col: "invitation_id", op: "eq", val: inviteId }], limit: 1 });
  const r = rows[0];
  if (!r) return undefined;
  if (!r.opened_at) db.update("guests", [{ col: "id", op: "eq", val: String(r.id) }], { opened_at: new Date().toISOString() }).catch(() => {});
  return guestFromRow(r);
}

// ───────────── RSVP ─────────────

export async function addRsvp(inviteId: string, input: { guestId: string | null; name: string; status: RsvpStatus; people: number; answers: Record<string, string>; ip: string }) {
  const [r] = await db.insert<Row>("rsvps", {
    invitation_id: inviteId,
    guest_id: input.guestId,
    name: input.name,
    status: input.status,
    people: input.status === "no" ? 0 : input.people,
    answers: input.answers,
    ip: input.ip.slice(0, 64),
  });
  if (input.guestId) {
    await db.update("guests", [{ col: "id", op: "eq", val: input.guestId }, { col: "invitation_id", op: "eq", val: inviteId }], {
      rsvp_status: input.status,
      rsvp_people: input.status === "no" ? 0 : input.people,
      rsvp_answers: input.answers,
      rsvp_at: new Date().toISOString(),
    });
  }
  return rsvpFromRow(r);
}

export async function listRsvps(inviteId: string) {
  const { rows } = await db.select<Row>("rsvps", { filters: [{ col: "invitation_id", op: "eq", val: inviteId }], order: [{ col: "created_at", asc: false }], limit: 2000 });
  return rows.map(rsvpFromRow);
}

export type RsvpStats = { guests: number; answered: number; yes: number; no: number; maybe: number; pending: number; people: number; answerRate: number };

/**
 * Totals for the dashboard. Personal-link guests count once (their latest answer); answers from the general
 * link (no guest) are added on top.
 */
export function rsvpStats(guests: Guest[], rsvps: Rsvp[]): RsvpStats {
  const anon = rsvps.filter((r) => !r.guestId);
  const yes = guests.filter((g) => g.rsvpStatus === "yes").length + anon.filter((r) => r.status === "yes").length;
  const no = guests.filter((g) => g.rsvpStatus === "no").length + anon.filter((r) => r.status === "no").length;
  const maybe = guests.filter((g) => g.rsvpStatus === "maybe").length + anon.filter((r) => r.status === "maybe").length;
  const people = guests.reduce((n, g) => n + (g.rsvpStatus === "yes" ? g.rsvpPeople ?? 1 : 0), 0) + anon.reduce((n, r) => n + (r.status === "yes" ? r.people : 0), 0);
  const answered = guests.filter((g) => g.rsvpStatus).length;
  return {
    guests: guests.length,
    answered,
    yes,
    no,
    maybe,
    pending: guests.length - answered,
    people,
    answerRate: guests.length ? Math.round((answered / guests.length) * 100) : 0,
  };
}
