import "server-only";
import { db } from "../db";
import type { Row } from "../db/types";
import { getUserById, normalizeEmail, type AppUser } from "../account/server";
import { emptyBook, sanitizeBook, type ShopBook } from "./types";

// Data access for the sales & stock book. Every account owns one book (created on first visit) and can be
// invited into other people's books: as "editor" (manages it fully, except who is in it) or "viewer".
// Books are saved whole with optimistic versioning; the client merges when someone else saved first.

export type BookRole = "owner" | "editor" | "viewer";
export type MemberRole = Exclude<BookRole, "owner">;
/** A book the user can open: their own first, then the ones shared with them. */
export type BookRef = { id: string; name: string; owner: string; role: BookRole };
export type StoredBook = { book: ShopBook; version: number; updatedAt: string };
export type Member = { id: string; email: string; name: string; role: MemberRole; joined: boolean; createdAt: string };

export const MAX_MEMBERS = 20;
export const isUuid = (s: unknown): s is string => typeof s === "string" && /^[0-9a-f-]{36}$/i.test(s);
const memberRole = (v: unknown): MemberRole => (v === "viewer" ? "viewer" : "editor");
const stored = (r: Row): StoredBook => ({ book: sanitizeBook(r.data), version: Number(r.version ?? 1), updatedAt: String(r.updated_at ?? "") });
const shopName = (r: Row) => String((r.data as { shopName?: unknown } | null)?.shopName ?? "").trim();
const userLabel = (u: AppUser | null) => (u ? u.name || u.email : "");

async function bookRow(id: string, columns?: string): Promise<Row | null> {
  if (!isUuid(id)) return null;
  const { rows } = await db.select<Row>("shop_books", { filters: [{ col: "id", op: "eq", val: id }], columns, limit: 1 });
  return rows[0] ?? null;
}

/** The user's own book, created empty the first time so it always has an id to share. */
async function ownRow(userId: string): Promise<Row> {
  const find = async () => (await db.select<Row>("shop_books", { filters: [{ col: "user_id", op: "eq", val: userId }], limit: 1 })).rows[0];
  const found = await find();
  if (found) return found;
  try {
    const [row] = await db.insert<Row>("shop_books", { user_id: userId, data: emptyBook(), version: 1, updated_at: new Date().toISOString() });
    return row;
  } catch (e) {
    // Unique user_id: another tab created it at the same moment.
    const again = await find();
    if (again) return again;
    throw e;
  }
}

async function membership(bookId: string, email: string): Promise<Row | null> {
  const { rows } = await db.select<Row>("shop_members", {
    filters: [
      { col: "book_id", op: "eq", val: bookId },
      { col: "invited_email", op: "eq", val: normalizeEmail(email) },
    ],
    limit: 1,
  });
  return rows[0] ?? null;
}

/** The user's role in a book, or null when they may not open it. */
export async function bookAccess(user: AppUser, bookId: string): Promise<{ role: BookRole; ownerId: string } | null> {
  const row = await bookRow(bookId, "id,user_id");
  if (!row) return null;
  const ownerId = String(row.user_id);
  if (ownerId === user.id) return { role: "owner", ownerId };
  const m = await membership(bookId, user.email);
  if (!m) return null;
  if (!m.user_id) await db.update("shop_members", [{ col: "id", op: "eq", val: String(m.id) }], { user_id: user.id }).catch(() => undefined);
  return { role: memberRole(m.role), ownerId };
}

/** Own book first, then the shared ones (with the full rows, so the chosen one needs no second read). */
async function myBooks(user: AppUser): Promise<{ refs: BookRef[]; rows: Map<string, Row> }> {
  const own = await ownRow(user.id);
  const rows = new Map<string, Row>([[String(own.id), own]]);
  const refs: BookRef[] = [{ id: String(own.id), name: shopName(own) || "Sổ hàng của tôi", owner: "", role: "owner" }];
  const mem = await db.select<Row>("shop_members", { filters: [{ col: "invited_email", op: "eq", val: user.email }], order: [{ col: "created_at", asc: true }] });
  for (const m of mem.rows) {
    const row = await bookRow(String(m.book_id));
    if (!row || String(row.user_id) === user.id) continue;
    if (!m.user_id) await db.update("shop_members", [{ col: "id", op: "eq", val: String(m.id) }], { user_id: user.id }).catch(() => undefined);
    const owner = userLabel(await getUserById(String(row.user_id)).catch(() => null));
    rows.set(String(row.id), row);
    refs.push({ id: String(row.id), name: shopName(row) || `Sổ hàng của ${owner || "người mời"}`, owner, role: memberRole(m.role) });
  }
  return { refs, rows };
}

/**
 * Picks the book to show: the first of `wanted` (link, then last used) the user may open; otherwise their
 * own, unless it is still empty and someone shared a book with them (staff usually come for that one).
 */
export async function openBook(user: AppUser, wanted: (string | undefined)[]): Promise<{ current: BookRef; stored: StoredBook; books: BookRef[] }> {
  const { refs, rows } = await myBooks(user);
  const own = stored(rows.get(refs[0].id)!);
  const ownEmpty = !own.book.products.length && !own.book.vouchers.length;
  const current = wanted.map((w) => refs.find((r) => r.id === w)).find(Boolean) ?? (ownEmpty && refs[1] ? refs[1] : refs[0]);
  return { current, stored: stored(rows.get(current.id)!), books: refs };
}

/** The whole book, or just its version when the caller already has that one (cheap polling). */
export async function loadBook(bookId: string, have?: number): Promise<StoredBook | { version: number; unchanged: true } | null> {
  if (have !== undefined) {
    const meta = await bookRow(bookId, "id,version");
    if (!meta) return null;
    if (Number(meta.version) === have) return { version: have, unchanged: true };
  }
  const row = await bookRow(bookId);
  return row ? stored(row) : null;
}

/** Saves when `version` is still the stored one and returns the new version; null when someone saved in between. */
export async function saveBook(bookId: string, book: ShopBook, version: number): Promise<number | null> {
  const hit = await db.update<Row>(
    "shop_books",
    [
      { col: "id", op: "eq", val: bookId },
      { col: "version", op: "eq", val: version },
    ],
    { data: book, version: version + 1, updated_at: new Date().toISOString() },
  );
  return hit.length ? version + 1 : null;
}

// ───────────── members ─────────────

export async function bookOwner(ownerId: string) {
  const u = await getUserById(ownerId).catch(() => null);
  return { name: u?.name ?? "", email: u?.email ?? "" };
}

export async function bookTitle(bookId: string) {
  const row = await bookRow(bookId, "id,data");
  return row ? shopName(row) : "";
}

export async function listMembers(bookId: string): Promise<Member[]> {
  const { rows } = await db.select<Row>("shop_members", { filters: [{ col: "book_id", op: "eq", val: bookId }], order: [{ col: "created_at", asc: true }] });
  return Promise.all(
    rows.map(async (r) => {
      const u = r.user_id ? await getUserById(String(r.user_id)).catch(() => null) : null;
      return { id: String(r.id), email: String(r.invited_email), name: u?.name ?? "", role: memberRole(r.role), joined: Boolean(r.user_id), createdAt: String(r.created_at) };
    }),
  );
}

/** Adds someone by email (or changes their role when already invited). Returns true when newly added. */
export async function addMember(bookId: string, rawEmail: string, role: MemberRole, invitedBy: string): Promise<boolean> {
  const email = normalizeEmail(rawEmail);
  const existing = await membership(bookId, email);
  if (existing) {
    await db.update("shop_members", [{ col: "id", op: "eq", val: String(existing.id) }], { role });
    return false;
  }
  // user_id stays empty until they open the book, so the owner sees who has not come in yet.
  await db.insert("shop_members", { book_id: bookId, invited_email: email, user_id: null, role, invited_by: invitedBy });
  return true;
}

export async function setMemberRole(bookId: string, memberId: string, role: MemberRole) {
  if (!isUuid(memberId)) return;
  await db.update(
    "shop_members",
    [
      { col: "id", op: "eq", val: memberId },
      { col: "book_id", op: "eq", val: bookId },
    ],
    { role },
  );
}

export async function removeMember(bookId: string, memberId: string) {
  if (!isUuid(memberId)) return;
  await db.remove("shop_members", [
    { col: "id", op: "eq", val: memberId },
    { col: "book_id", op: "eq", val: bookId },
  ]);
}

export async function leaveBook(bookId: string, email: string) {
  await db.remove("shop_members", [
    { col: "book_id", op: "eq", val: bookId },
    { col: "invited_email", op: "eq", val: normalizeEmail(email) },
  ]);
}
