import "server-only";
import { EMAIL, ADDRESS, PHONE, FACEBOOK_URL, INSTAGRAM_URL, TIKTOK_URL, SHOW_SOCIALS, faqs as staticFaqs, pricingPlans as staticPlans } from "@/data/site";
import { posts as staticPosts, projectList as staticProjects, type Post, type ProjectRecord } from "./content";
import { db } from "./db";
import { derivePhone, postFromRow, projectFromRow, type SiteSettings, type StoredContact, type StoredFaq, type StoredSocials } from "./models";
import type { Row } from "./db/types";
import type { PricingPlan } from "@/data/site";

// Public reads. Content comes from the database when it has rows, otherwise from the bundled JSON so the site
// never goes blank (e.g. before the first import). Tags let the admin refresh pages on demand.
export const TAGS = { posts: "posts", projects: "projects", settings: "settings" } as const;
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
