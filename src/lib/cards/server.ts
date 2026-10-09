import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { blankCanvas, seedTemplates } from "@/data/card-templates";
import { db } from "../db";
import type { Row } from "../db/types";
import { keyFromUrl, OBJECT_KEY_RE, publicUrlFor } from "../r2";
import { type CardDesign, type CardJson, type CardMeta, type CardTemplate, type SharedCard } from "./types";

// Server side of the wedding card tool: canvas validation, URL ⇄ key rewriting and data access.

export const TEMPLATE_TAG = "card-templates";
const MAX_JSON_BYTES = 700_000;
const MAX_OBJECTS = 250;

// ───────────── canvas JSON ─────────────

const ALLOWED_TYPES = new Set(["rect", "circle", "ellipse", "triangle", "line", "path", "polygon", "polyline", "textbox", "i-text", "itext", "text", "image", "group"]);
const KEY_PREFIX = "r2:";

type Obj = Record<string, unknown>;

/** Depth-first visit of every object, including group children and clip paths. */
function visit(objects: unknown, fn: (o: Obj) => void) {
  if (!Array.isArray(objects)) return;
  for (const o of objects) {
    if (!o || typeof o !== "object") continue;
    fn(o as Obj);
    visit((o as Obj).objects, fn);
    if ((o as Obj).clipPath) visit([(o as Obj).clipPath], fn);
  }
}

const isPattern = (v: unknown) => Boolean(v && typeof v === "object" && ((v as Obj).type === "pattern" || "source" in (v as Obj)));

/**
 * Checks a canvas coming from the browser and rewrites image URLs to "r2:<key>". Only images stored in our own
 * bucket are accepted: anything else would taint the export canvas and leak viewers' IPs to third parties.
 */
export function sanitizeCanvas(input: unknown): { ok: true; json: CardJson } | { ok: false; error: string } {
  if (!input || typeof input !== "object" || !Array.isArray((input as Obj).objects)) return { ok: false, error: "Dữ liệu thiệp không hợp lệ." };
  const raw = JSON.stringify(input);
  if (raw.length > MAX_JSON_BYTES) return { ok: false, error: "Thiệp quá phức tạp, hãy bớt bớt chi tiết." };
  const json = JSON.parse(raw) as CardJson;

  let count = 0;
  let error = "";
  visit(json.objects, (o) => {
    count++;
    const type = String(o.type ?? "").toLowerCase();
    if (!ALLOWED_TYPES.has(type)) error ||= `Loại đối tượng không được hỗ trợ: ${type || "?"}.`;
    if (isPattern(o.fill) || isPattern(o.stroke)) error ||= "Không hỗ trợ nền dạng mẫu lặp.";
    if (type === "image") {
      const src = String(o.src ?? "");
      const key = src.startsWith(KEY_PREFIX) ? src.slice(KEY_PREFIX.length) : keyFromUrl(src);
      if (!key || !OBJECT_KEY_RE.test(key)) error ||= "Ảnh phải được tải lên từ công cụ này.";
      else o.src = `${KEY_PREFIX}${key}`;
      delete o.filters;
      delete o.resizeFilter;
    }
  });
  if (error) return { ok: false, error };
  if (count > MAX_OBJECTS) return { ok: false, error: `Thiệp có quá nhiều đối tượng (tối đa ${MAX_OBJECTS}).` };
  if (typeof json.background !== "string") json.background = "#ffffff";
  return { ok: true, json };
}

/** Turns stored "r2:<key>" sources back into public URLs for the browser. */
export function expandCanvas(json: CardJson): CardJson {
  const out = structuredClone(json);
  visit(out.objects, (o) => {
    if (typeof o.src === "string" && o.src.startsWith(KEY_PREFIX)) o.src = publicUrlFor(o.src.slice(KEY_PREFIX.length));
  });
  return out;
}

/** Names, date and venue read from role-tagged text: used for page titles and link previews. */
export function deriveMeta(json: CardJson): CardMeta {
  const meta: CardMeta = {};
  const map: Record<string, keyof CardMeta> = { groomName: "groom", brideName: "bride", date: "date", venue: "venue" };
  visit(json.objects, (o) => {
    const k = map[String(o.role ?? "")];
    if (k && !meta[k] && typeof o.text === "string") meta[k] = o.text.replace(/\s+/g, " ").trim().slice(0, 80);
  });
  return meta;
}

export const cardTitle = (m: CardMeta, fallback = "Thiệp cưới") => (m.groom && m.bride ? `Thiệp cưới ${m.groom} & ${m.bride}` : fallback);

export const validSize = (w: unknown, h: unknown) =>
  Number.isInteger(w) && Number.isInteger(h) && (w as number) >= 300 && (h as number) >= 300 && (w as number) <= 3000 && (h as number) <= 3000;

// ───────────── templates ─────────────

const templateFromRow = (r: Row): CardTemplate => ({
  id: String(r.id),
  slug: String(r.slug),
  name: String(r.name ?? ""),
  tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
  width: Number(r.width),
  height: Number(r.height),
  canvas: expandCanvas((r.canvas_json ?? { objects: [] }) as CardJson),
  thumbUrl: r.thumb_key ? publicUrlFor(String(r.thumb_key)) : "",
  sortOrder: Number(r.sort_order ?? 0),
  published: Boolean(r.published),
});

/** Public gallery: published templates from the database, or the bundled seeds when there are none. */
export async function listPublishedTemplates(): Promise<CardTemplate[]> {
  try {
    const { rows } = await db.select<Row>(
      "card_templates",
      { filters: [{ col: "published", op: "eq", val: true }], order: [{ col: "sort_order", asc: true }] },
      { tags: [TEMPLATE_TAG], revalidate: 3600 },
    );
    if (rows.length) return rows.map(templateFromRow);
  } catch (e) {
    console.error("[cards] templates read failed, using bundled seeds:", (e as Error).message);
  }
  return seedTemplates();
}

export async function getPublishedTemplate(slug: string): Promise<CardTemplate | undefined> {
  return (await listPublishedTemplates()).find((t) => t.slug === slug);
}

export async function adminListTemplates(): Promise<CardTemplate[]> {
  const { rows } = await db.select<Row>("card_templates", { order: [{ col: "sort_order", asc: true }, { col: "created_at", asc: true }] });
  return rows.map(templateFromRow);
}

export async function adminGetTemplate(id: string): Promise<CardTemplate | undefined> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return undefined;
  const { rows } = await db.select<Row>("card_templates", { filters: [{ col: "id", op: "eq", val: id }], limit: 1 });
  return rows[0] ? templateFromRow(rows[0]) : undefined;
}

export async function adminCreateTemplate(input: { name: string; width: number; height: number; canvas?: CardJson; slug?: string; tags?: string[]; sortOrder?: number; published?: boolean; thumbKey?: string }) {
  const canvas = sanitizeCanvas(input.canvas ?? blankCanvas(input.width, input.height));
  if (!canvas.ok) throw new Error(canvas.error);
  const [row] = await db.insert<Row>("card_templates", {
    slug: input.slug || `mau-${randomBytes(4).toString("hex")}`,
    name: input.name,
    tags: input.tags ?? [],
    width: input.width,
    height: input.height,
    canvas_json: canvas.json,
    thumb_key: input.thumbKey ?? "",
    sort_order: input.sortOrder ?? 100,
    published: input.published ?? false,
  });
  return String(row.id);
}

export async function adminUpdateTemplate(id: string, patch: { name?: string; slug?: string; tags?: string[]; published?: boolean; sortOrder?: number; canvas?: CardJson; width?: number; height?: number; thumbKey?: string }) {
  const row: Row = { updated_at: new Date().toISOString() };
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.slug !== undefined) row.slug = patch.slug;
  if (patch.tags !== undefined) row.tags = patch.tags;
  if (patch.published !== undefined) row.published = patch.published;
  if (patch.sortOrder !== undefined) row.sort_order = patch.sortOrder;
  if (patch.width !== undefined) row.width = patch.width;
  if (patch.height !== undefined) row.height = patch.height;
  if (patch.thumbKey !== undefined) row.thumb_key = patch.thumbKey;
  if (patch.canvas !== undefined) {
    const c = sanitizeCanvas(patch.canvas);
    if (!c.ok) throw new Error(c.error);
    row.canvas_json = c.json;
  }
  await db.update("card_templates", [{ col: "id", op: "eq", val: id }], row);
}

export async function adminDeleteTemplate(id: string) {
  await db.remove("card_templates", [{ col: "id", op: "eq", val: id }]);
}

/** Copies the bundled templates whose slug is not in the database yet. Returns how many were added. */
export async function importSeedTemplates(): Promise<number> {
  const existing = new Set((await adminListTemplates()).map((t) => t.slug));
  const missing = seedTemplates().filter((t) => !existing.has(t.slug));
  for (const t of missing) {
    await adminCreateTemplate({ name: t.name, slug: t.slug, tags: t.tags, width: t.width, height: t.height, canvas: t.canvas, sortOrder: t.sortOrder, published: true });
  }
  return missing.length;
}

// ───────────── designs ─────────────

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
export const EDIT_COOKIE = (id: string) => `ct_${id}`;
export const isDesignId = (id: string) => /^[0-9a-f-]{36}$/i.test(id);

const designFromRow = (r: Row): CardDesign => ({
  id: String(r.id),
  title: String(r.title ?? ""),
  templateSlug: (r.template_slug as string) ?? null,
  width: Number(r.width),
  height: Number(r.height),
  canvas: expandCanvas(r.canvas_json as CardJson),
  shareSlug: (r.share_slug as string) ?? null,
  previewUrl: r.preview_key ? publicUrlFor(String(r.preview_key)) : "",
  updatedAt: String(r.updated_at ?? r.created_at ?? ""),
});

export async function createDesign(input: { title: string; templateSlug: string | null; width: number; height: number; canvas: CardJson; ip: string }) {
  const token = randomBytes(24).toString("base64url");
  const [row] = await db.insert<Row>("card_designs", {
    edit_token_hash: hashToken(token),
    title: input.title,
    template_slug: input.templateSlug,
    width: input.width,
    height: input.height,
    canvas_json: input.canvas,
    meta: deriveMeta(input.canvas),
    ip: input.ip.slice(0, 64),
  });
  return { id: String(row.id), token };
}

async function designRow(id: string): Promise<Row | undefined> {
  if (!isDesignId(id)) return undefined;
  const { rows } = await db.select<Row>("card_designs", { filters: [{ col: "id", op: "eq", val: id }], limit: 1 });
  return rows[0];
}

export async function tokenMatches(id: string, token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const row = await designRow(id);
  if (!row) return false;
  const a = Buffer.from(String(row.edit_token_hash));
  const b = Buffer.from(hashToken(token));
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function getDesign(id: string): Promise<CardDesign | undefined> {
  const row = await designRow(id);
  return row ? designFromRow(row) : undefined;
}

export async function updateDesign(id: string, patch: { title?: string; canvas?: CardJson }) {
  const row: Row = { updated_at: new Date().toISOString() };
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.canvas) {
    row.canvas_json = patch.canvas;
    row.meta = deriveMeta(patch.canvas);
  }
  const [out] = await db.update<Row>("card_designs", [{ col: "id", op: "eq", val: id }], row);
  return out ? designFromRow(out) : undefined;
}

const SLUG_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";
const newShareSlug = () => Array.from(randomBytes(10), (b) => SLUG_ALPHABET[b % SLUG_ALPHABET.length]).join("");

/** Turns sharing on (keeping an existing slug) with a fresh preview image, or off. */
export async function setSharing(id: string, previewKey: string | null): Promise<string | null> {
  const row = await designRow(id);
  if (!row) throw new Error("Không tìm thấy thiệp.");
  if (previewKey === null) {
    await db.update("card_designs", [{ col: "id", op: "eq", val: id }], { share_slug: null });
    return null;
  }
  const slug = (row.share_slug as string) || newShareSlug();
  await db.update("card_designs", [{ col: "id", op: "eq", val: id }], { share_slug: slug, preview_key: previewKey });
  return slug;
}

export async function deleteDesign(id: string) {
  await db.remove("card_designs", [{ col: "id", op: "eq", val: id }]);
}

export async function getSharedCard(slug: string): Promise<SharedCard | undefined> {
  if (!/^[a-z0-9]{6,20}$/.test(slug)) return undefined;
  const { rows } = await db.select<Row>("card_designs", {
    filters: [{ col: "share_slug", op: "eq", val: slug }],
    columns: "id,title,width,height,preview_key,meta,view_count",
    limit: 1,
  });
  const r = rows[0];
  if (!r || !r.preview_key) return undefined;
  // Best effort; a lost increment under concurrent views is fine.
  db.update("card_designs", [{ col: "id", op: "eq", val: String(r.id) }], { view_count: Number(r.view_count ?? 0) + 1 }).catch(() => {});
  return {
    title: String(r.title ?? ""),
    width: Number(r.width),
    height: Number(r.height),
    previewUrl: publicUrlFor(String(r.preview_key)),
    meta: (r.meta ?? {}) as CardMeta,
  };
}
