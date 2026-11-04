import "server-only";
import { db } from "../db";
import type { Row } from "../db/types";
import { emptyBook, sanitizeBook, type ShopBook } from "./types";

// Data access for the sales & stock book: one row per account, saved whole with optimistic versioning.

export type StoredBook = { book: ShopBook; version: number; updatedAt: string };

export async function loadBook(userId: string): Promise<StoredBook> {
  const { rows } = await db.select<Row>("shop_books", { filters: [{ col: "user_id", op: "eq", val: userId }], limit: 1 });
  const r = rows[0];
  if (!r) return { book: emptyBook(), version: 0, updatedAt: "" };
  return { book: sanitizeBook(r.data), version: Number(r.version ?? 1), updatedAt: String(r.updated_at ?? "") };
}

/**
 * Saves when `version` is still the stored one and returns the new version; null when another device saved
 * in between (the caller reloads instead of overwriting).
 */
export async function saveBook(userId: string, book: ShopBook, version: number): Promise<number | null> {
  const updated_at = new Date().toISOString();
  if (version === 0) {
    const { rows } = await db.select<Row>("shop_books", { filters: [{ col: "user_id", op: "eq", val: userId }], columns: "id", limit: 1 });
    if (rows.length) return null;
    try {
      await db.insert("shop_books", { user_id: userId, data: book, version: 1, updated_at });
    } catch (e) {
      // Unique user_id: a parallel first save from another tab won the race.
      if (/duplicate|23505|409/i.test((e as Error).message)) return null;
      throw e;
    }
    return 1;
  }
  const hit = await db.update<Row>(
    "shop_books",
    [
      { col: "user_id", op: "eq", val: userId },
      { col: "version", op: "eq", val: version },
    ],
    { data: book, version: version + 1, updated_at },
  );
  return hit.length ? version + 1 : null;
}
