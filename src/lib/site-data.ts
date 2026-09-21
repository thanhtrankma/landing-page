import "server-only";
import { EMAIL, ADDRESS, PHONE, FACEBOOK_URL, INSTAGRAM_URL, TIKTOK_URL, SHOW_SOCIALS, faqs as staticFaqs, pricingPlans as staticPlans } from "@/data/site";
import { posts as staticPosts, projectList as staticProjects, type Post, type ProjectRecord } from "./content";
import { db } from "./db";
import { legalDefaults } from "@/data/legal";
import { derivePhone, pageFromRow, postFromRow, projectFromRow, type SitePage, type SiteSettings, type StoredContact, type StoredFaq, type StoredSocials } from "./models";
import type { Row } from "./db/types";
import type { PricingPlan } from "@/data/site";

// Public reads. Content comes from the database when it has rows, otherwise from the bundled JSON so the site
// never goes blank (e.g. before the first import). Tags let the admin refresh pages on demand.
export const TAGS = { posts: "posts", projects: "projects", settings: "settings", pages: "pages" } as const;
const cache = (tag: string) => ({ tags: [tag], revalidate: 3600 });

const POST_LIST_COLUMNS = "id,slug,title,category,img,summary,meta_title,meta_description,meta_keywords,service,published,created_at";
const PROJECT_LIST_COLUMNS =
  "id,slug,title,category,category_label,code,img,demo_url,description,meta_title,meta_description,meta_keywords,home_order,hub_order,sample,published";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.error("[site-data] database read failed, using bundled data:", (e as Error).message);
    return fallback;
  }
}

// ---------- posts ----------
export async function getPosts(): Promise<Post[]> {
  const fallback = [...staticPosts];
  return safe(async () => {
    const { rows } = await db.select<Row>("posts", { columns: POST_LIST_COLUMNS, order: [{ col: "created_at", asc: false }] }, cache(TAGS.posts));
    if (!rows.length) return fallback;
    return rows.map(postFromRow).filter((p) => p.published !== false);
  }, fallback);
}

export async function getPost(slug: string): Promise<Post | undefined> {
  return safe(async () => {
    const { rows } = await db.select<Row>("posts", { filters: [{ col: "slug", op: "eq", val: slug }], limit: 1 }, cache(TAGS.posts));
    if (rows.length) {
      const p = postFromRow(rows[0]);
      return p.published === false ? undefined : p;
    }
    // Not in the database: it may still be an original article before the first import.
    const { count } = await db.select("posts", { columns: "id", limit: 1 }, cache(TAGS.posts));
    return count === 0 ? staticPosts.find((x) => x.slug === slug) : undefined;
  }, staticPosts.find((x) => x.slug === slug));
}

// ---------- projects ----------
export async function getProjects(): Promise<ProjectRecord[]> {
  const fallback = [...staticProjects];
  return safe(async () => {
    const { rows } = await db.select<Row>("projects", { columns: PROJECT_LIST_COLUMNS, order: [{ col: "home_order", asc: true }] }, cache(TAGS.projects));
    if (!rows.length) return fallback;
    return rows.map(projectFromRow).filter((p) => p.published !== false);
  }, fallback);
}

export async function getProject(slug: string): Promise<ProjectRecord | undefined> {
  return safe(async () => {
    const { rows } = await db.select<Row>("projects", { filters: [{ col: "slug", op: "eq", val: slug }], limit: 1 }, cache(TAGS.projects));
    if (rows.length) {
      const p = projectFromRow(rows[0]);
      return p.published === false ? undefined : p;
    }
    const { count } = await db.select("projects", { columns: "id", limit: 1 }, cache(TAGS.projects));
    return count === 0 ? staticProjects.find((x) => x.slug === slug) : undefined;
  }, staticProjects.find((x) => x.slug === slug));
}

// ---------- settings ----------
export const defaultSettings = (): SiteSettings => ({
  ...derivePhone(PHONE),
  email: EMAIL,
  address: ADDRESS,
  zaloUrl: `https://zalo.me/${PHONE}`,
  showSocials: SHOW_SOCIALS,
  facebookUrl: FACEBOOK_URL,
  instagramUrl: INSTAGRAM_URL,
  tiktokUrl: TIKTOK_URL,
  pricingPlans: staticPlans,
  faqs: staticFaqs,
});

export function mergeSettings(stored: Record<string, unknown>): SiteSettings {
  const base = defaultSettings();
  const contact = stored.contact as Partial<StoredContact> | undefined;
  const socials = stored.socials as Partial<StoredSocials> | undefined;
  const pricing = stored.pricing as PricingPlan[] | undefined;
  const faqs = stored.faqs as StoredFaq[] | undefined;
  const phone = contact?.phone ? derivePhone(contact.phone) : derivePhone(base.phone);
  return {
    ...base,
    ...phone,
    email: contact?.email || base.email,
    address: contact?.address || base.address,
    zaloUrl: `https://zalo.me/${phone.phone}`,
    showSocials: socials?.show ?? base.showSocials,
    facebookUrl: socials?.facebook || base.facebookUrl,
    instagramUrl: socials?.instagram || base.instagramUrl,
    tiktokUrl: socials?.tiktok || base.tiktokUrl,
    pricingPlans: Array.isArray(pricing) && pricing.length ? pricing : base.pricingPlans,
    faqs: Array.isArray(faqs) && faqs.length ? faqs.map((f) => [f.question, f.answer] as [string, string]) : base.faqs,
  };
}

export async function getSettings(): Promise<SiteSettings> {
  return safe(async () => {
    const { rows } = await db.select<Row>("settings", {}, cache(TAGS.settings));
    return mergeSettings(Object.fromEntries(rows.map((r) => [String(r.key), r.value])));
  }, defaultSettings());
}


// ---------- legal pages ----------
const defaultPage = (slug: string): SitePage | undefined => {
  const d = legalDefaults.find((p) => p.slug === slug);
  return d && { slug: d.slug, title: d.title, description: d.description, content: d.content, published: true, updatedAt: "2026-09-21T00:00:00.000Z" };
};

/** Published legal page, or undefined when it does not exist / is hidden. Falls back to the bundled text until it is saved in the database. */
export async function getPage(slug: string): Promise<SitePage | undefined> {
  return safe(async () => {
    const { rows } = await db.select<Row>("pages", { filters: [{ col: "slug", op: "eq", val: slug }], limit: 1 }, cache(TAGS.pages));
    if (rows.length) {
      const p = pageFromRow(rows[0]);
      return p.published ? p : undefined;
    }
    return defaultPage(slug);
  }, defaultPage(slug));
}

/** Legal pages currently visible to visitors (for footer links and the sitemap). */
export async function getPublishedPages(): Promise<{ slug: string; title: string }[]> {
  const fallback = legalDefaults.map(({ slug, title }) => ({ slug, title }));
  return safe(async () => {
    const { rows } = await db.select<Row>("pages", { columns: "slug,title,published" }, cache(TAGS.pages));
    if (!rows.length) return fallback;
    const stored = new Map(rows.map((r) => [String(r.slug), r]));
    // A default page that has no row yet still counts as visible.
    return legalDefaults.flatMap((d) => {
      const r = stored.get(d.slug);
      return !r ? [{ slug: d.slug, title: d.title }] : r.published !== false ? [{ slug: d.slug, title: String(r.title || d.title) }] : [];
    });
  }, fallback);
}

const dateVN = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" });

/** Replaces {{phone}}, {{email}}, {{address}}, {{updated}} so contact details always match Settings. */
export function fillTokens(content: string, settings: SiteSettings, updatedAt: string): string {
  const values: Record<string, string> = { phone: settings.phoneDisplay, phoneLink: settings.phone, email: settings.email, address: settings.address, updated: dateVN.format(new Date(updatedAt)) };
  return content.replace(/\{\{\s*(phone|phoneLink|email|address|updated)\s*\}\}/g, (_, k: string) => values[k]);
}
