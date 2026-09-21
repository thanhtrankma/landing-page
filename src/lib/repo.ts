import "server-only";
import { posts as staticPosts, projectList as staticProjects, type Post, type ProjectRecord } from "./content";
import { db } from "./db";
import type { Filter, Row } from "./db/types";
import { TABLES } from "./db/types";
import { defaultSettings } from "./site-data";
import { legalDefaults } from "@/data/legal";
import { pageFromRow, pageToRow, type SitePage, postFromRow, postToRow, projectFromRow, projectToRow, type StoredContact, type StoredFaq, type StoredSocials } from "./models";
import { derivePhone } from "./models";

// Admin-side data access (writes and unfiltered reads). Every caller must already have passed requireAdmin().

// ---------------- leads ----------------
export const LEAD_STATUSES = ["new", "contacted", "done", "spam"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export const STATUS_LABEL: Record<LeadStatus, string> = { new: "Mới", contacted: "Đã liên hệ", done: "Hoàn tất", spam: "Spam" };
export type Lead = { id: string; createdAt: string; name: string; phone: string; message: string; status: LeadStatus; note: string; page: string | null };

const leadFromRow = (r: Row): Lead => ({
  id: String(r.id),
  createdAt: String(r.created_at),
  name: String(r.name ?? ""),
  phone: String(r.phone ?? ""),
  message: String(r.message ?? ""),
  status: (LEAD_STATUSES as readonly string[]).includes(String(r.status)) ? (r.status as LeadStatus) : "new",
  note: String(r.note ?? ""),
  page: (r.page as string) ?? null,
});

export async function createLead(input: { name: string; phone: string; message: string; page?: string; userAgent?: string }) {
  await db.insert("leads", { name: input.name, phone: input.phone, message: input.message, page: input.page ?? "/lien-he", user_agent: (input.userAgent ?? "").slice(0, 300) });
}

export async function listLeads(opts: { status?: string; q?: string; limit?: number; offset?: number } = {}) {
  const filters: Filter[] = [];
  if (opts.status && opts.status !== "all") filters.push({ col: "status", op: "eq", val: opts.status });
  const q = opts.q?.trim();
  const { rows, count } = await db.select<Row>("leads", {
    filters,
    or: q ? [{ col: "name", op: "ilike", val: q }, { col: "phone", op: "ilike", val: q }, { col: "message", op: "ilike", val: q }] : undefined,
    order: [{ col: "created_at", asc: false }],
    limit: opts.limit ?? 20,
    offset: opts.offset ?? 0,
  });
  return { rows: rows.map(leadFromRow), count };
}

export async function leadCounts(): Promise<Record<LeadStatus | "total", number>> {
  const out = { new: 0, contacted: 0, done: 0, spam: 0, total: 0 } as Record<LeadStatus | "total", number>;
  await Promise.all(
    LEAD_STATUSES.map(async (s) => {
      out[s] = (await db.select("leads", { columns: "id", filters: [{ col: "status", op: "eq", val: s }], limit: 1 })).count;
    }),
  );
  out.total = LEAD_STATUSES.reduce((n, s) => n + out[s], 0);
  return out;
}

export async function updateLead(id: string, patch: { status?: LeadStatus; note?: string }) {
  const row: Row = {};
  if (patch.status && (LEAD_STATUSES as readonly string[]).includes(patch.status)) row.status = patch.status;
  if (patch.note !== undefined) row.note = patch.note.slice(0, 2000);
  if (Object.keys(row).length) await db.update("leads", [{ col: "id", op: "eq", val: id }], row);
}

export const deleteLead = (id: string) => db.remove("leads", [{ col: "id", op: "eq", val: id }]);

// ---------------- posts ----------------
const POST_COLS = "id,slug,title,category,img,summary,meta_title,meta_description,meta_keywords,service,published,created_at,updated_at";

export async function adminListPosts(opts: { q?: string; category?: string; published?: "yes" | "no"; limit?: number; offset?: number } = {}) {
  const filters: Filter[] = [];
  if (opts.category) filters.push({ col: "category", op: "eq", val: opts.category });
  if (opts.published) filters.push({ col: "published", op: "eq", val: opts.published === "yes" });
  const q = opts.q?.trim();
  const { rows, count } = await db.select<Row>("posts", {
    columns: POST_COLS,
    filters,
    or: q ? [{ col: "title", op: "ilike", val: q }, { col: "slug", op: "ilike", val: q }] : undefined,
    order: [{ col: "created_at", asc: false }],
    limit: opts.limit ?? 20,
    offset: opts.offset ?? 0,
  });
  return { rows: rows.map(postFromRow), count };
}

export async function adminGetPost(id: string): Promise<Post | null> {
  const { rows } = await db.select<Row>("posts", { filters: [{ col: "id", op: "eq", val: id }], limit: 1 });
  return rows[0] ? postFromRow(rows[0]) : null;
}

export async function slugTaken(table: "posts" | "projects", slug: string, exceptId?: string) {
  const filters: Filter[] = [{ col: "slug", op: "eq", val: slug }];
  if (exceptId) filters.push({ col: "id", op: "neq", val: exceptId });
  return (await db.select(table, { columns: "id", filters, limit: 1 })).count > 0;
}

export async function savePost(input: Partial<Post>, id?: string): Promise<Post> {
  const row = { ...postToRow(input), updated_at: new Date().toISOString() };
  if (id) {
    const out = await db.update<Row>("posts", [{ col: "id", op: "eq", val: id }], row);
    if (!out[0]) throw new Error("Không tìm thấy bài viết.");
    return postFromRow(out[0]);
  }
  return postFromRow((await db.insert<Row>("posts", row))[0]);
}

export const deletePost = (id: string) => db.remove("posts", [{ col: "id", op: "eq", val: id }]);

// ---------------- projects ----------------
const PROJECT_COLS = "id,slug,title,category,category_label,code,img,demo_url,description,meta_title,meta_description,meta_keywords,home_order,hub_order,sample,published,created_at";

export async function adminListProjects(opts: { q?: string; category?: string; published?: "yes" | "no"; limit?: number; offset?: number } = {}) {
  const filters: Filter[] = [];
  if (opts.category) filters.push({ col: "category", op: "eq", val: opts.category });
  if (opts.published) filters.push({ col: "published", op: "eq", val: opts.published === "yes" });
  const q = opts.q?.trim();
  const { rows, count } = await db.select<Row>("projects", {
    columns: PROJECT_COLS,
    filters,
    or: q ? [{ col: "title", op: "ilike", val: q }, { col: "code", op: "ilike", val: q }, { col: "slug", op: "ilike", val: q }] : undefined,
    order: [{ col: "home_order", asc: true }],
    limit: opts.limit ?? 20,
    offset: opts.offset ?? 0,
  });
  return { rows: rows.map(projectFromRow), count };
}

export async function adminGetProject(id: string): Promise<ProjectRecord | null> {
  const { rows } = await db.select<Row>("projects", { filters: [{ col: "id", op: "eq", val: id }], limit: 1 });
  return rows[0] ? projectFromRow(rows[0]) : null;
}

export async function nextProjectOrder(): Promise<number> {
  const { rows } = await db.select<Row>("projects", { columns: "home_order", order: [{ col: "home_order", asc: false }], limit: 1 });
  return Number(rows[0]?.home_order ?? -1) + 1;
}

export async function saveProject(input: Partial<ProjectRecord>, id?: string): Promise<ProjectRecord> {
  const row = projectToRow(input);
  if (id) {
    const out = await db.update<Row>("projects", [{ col: "id", op: "eq", val: id }], row);
    if (!out[0]) throw new Error("Không tìm thấy dự án.");
    return projectFromRow(out[0]);
  }
  return projectFromRow((await db.insert<Row>("projects", row))[0]);
}

export const deleteProject = (id: string) => db.remove("projects", [{ col: "id", op: "eq", val: id }]);

// ---------------- settings ----------------
export async function readSettingsRaw(): Promise<Record<string, unknown>> {
  const { rows } = await db.select<Row>("settings", {});
  return Object.fromEntries(rows.map((r) => [String(r.key), r.value]));
}

export async function writeSetting(key: "contact" | "socials" | "pricing" | "faqs", value: unknown) {
  await db.upsert("settings", { key, value, updated_at: new Date().toISOString() }, "key");
}

// ---------------- legal pages ----------------
/** All legal pages for the admin: saved rows plus any default that has not been imported yet (id undefined). */
export async function adminListPages(): Promise<SitePage[]> {
  const { rows } = await db.select<Row>("pages", {});
  const stored = new Map(rows.map((r) => [String(r.slug), pageFromRow(r)]));
  return legalDefaults.map((d) => stored.get(d.slug) ?? { slug: d.slug, title: d.title, description: d.description, content: d.content, published: true, updatedAt: "", id: undefined });
}

export async function adminGetPage(slug: string): Promise<SitePage | null> {
  try {
    return (await adminListPages()).find((p) => p.slug === slug) ?? null;
  } catch {
    // Table missing (schema not updated yet): still let the admin see the original text; saving will explain what to run.
    const d = legalDefaults.find((x) => x.slug === slug);
    return d ? { slug, title: d.title, description: d.description, content: d.content, published: true, updatedAt: "" } : null;
  }
}

/** Creates or updates a legal page by slug. */
export async function savePage(slug: string, input: Partial<SitePage>): Promise<void> {
  const row = { ...pageToRow(input), updated_at: new Date().toISOString() };
  const out = await db.update<Row>("pages", [{ col: "slug", op: "eq", val: slug }], row);
  if (out.length) return;
  const d = legalDefaults.find((x) => x.slug === slug);
  if (!d) throw new Error("Trang không tồn tại.");
  await db.insert("pages", { slug, title: d.title, description: d.description, content: d.content, published: true, ...row });
}

/** Puts the original text back. */
export const resetPage = (slug: string) => {
  const d = legalDefaults.find((x) => x.slug === slug);
  if (!d) throw new Error("Trang không tồn tại.");
  return savePage(slug, { title: d.title, description: d.description, content: d.content });
};

// ---------------- import of the bundled content ----------------
export async function seedFromStatic() {
  const existingPosts = new Set((await db.select<Row>("posts", { columns: "slug" })).rows.map((r) => String(r.slug)));
  const existingProjects = new Set((await db.select<Row>("projects", { columns: "slug" })).rows.map((r) => String(r.slug)));

  const newPosts = staticPosts.filter((p) => !existingPosts.has(p.slug)).map((p) => ({ ...postToRow({ ...p, published: true }) }));
  for (let i = 0; i < newPosts.length; i += 15) await db.insert("posts", newPosts.slice(i, i + 15));

  const newProjects = staticProjects
    .filter((p) => !existingProjects.has(p.slug))
    .map((p, i) => projectToRow({ ...p, homeOrder: i, published: true }));
  for (let i = 0; i < newProjects.length; i += 30) await db.insert("projects", newProjects.slice(i, i + 30));

  const existingPages = new Set((await db.select<Row>("pages", { columns: "slug" })).rows.map((r) => String(r.slug)));
  const newPages = legalDefaults.filter((p) => !existingPages.has(p.slug));
  if (newPages.length) await db.insert("pages", newPages.map((p) => ({ slug: p.slug, title: p.title, description: p.description, content: p.content, published: true })));

  const stored = await readSettingsRaw();
  const d = defaultSettings();
  const wrote: string[] = [];
  const contact: StoredContact = { phone: d.phone, email: d.email, address: d.address };
  const socials: StoredSocials = { show: d.showSocials, facebook: d.facebookUrl, instagram: d.instagramUrl, tiktok: d.tiktokUrl };
  const faqs: StoredFaq[] = d.faqs.map(([question, answer]) => ({ question, answer }));
  if (!stored.contact) { await writeSetting("contact", contact); wrote.push("contact"); }
  if (!stored.socials) { await writeSetting("socials", socials); wrote.push("socials"); }
  if (!stored.pricing) { await writeSetting("pricing", d.pricingPlans); wrote.push("pricing"); }
  if (!stored.faqs) { await writeSetting("faqs", faqs); wrote.push("faqs"); }
  return { posts: newPosts.length, projects: newProjects.length, pages: newPages.length, settings: wrote };
}

// ---------------- health ----------------
export async function checkDatabase() {
  const result: { table: string; ok: boolean; rows?: number; error?: string }[] = [];
  for (const table of TABLES) {
    try {
      const { count } = await db.select(table, { limit: 1 });
      result.push({ table, ok: true, rows: count });
    } catch (e) {
      result.push({ table, ok: false, error: (e as Error).message });
    }
  }
  return { mode: db.mode, tables: result };
}

// ---------------- analytics events ----------------
export type EventRow = { type: "view" | "click"; path: string; kind: string | null; label: string | null; href: string | null; visitor: string | null; referrer: string | null; device: string | null; created_at: string };

export async function recordEvents(events: Omit<EventRow, "created_at">[]) {
  if (events.length) await db.insert("events", events as unknown as Row[]);
}

/** Pulls events newer than `since`, paginating past PostgREST's 1000-row page. Capped to keep the admin fast. */
export async function fetchEvents(since: string, cap = 30000): Promise<{ rows: EventRow[]; truncated: boolean }> {
  const rows: EventRow[] = [];
  const page = 1000;
  for (let offset = 0; offset < cap; offset += page) {
    const { rows: chunk } = await db.select<EventRow>("events", { filters: [{ col: "created_at", op: "gte", val: since }], order: [{ col: "created_at", asc: false }], limit: page, offset });
    rows.push(...chunk);
    if (chunk.length < page) return { rows, truncated: false };
  }
  return { rows, truncated: true };
}

export { derivePhone };
