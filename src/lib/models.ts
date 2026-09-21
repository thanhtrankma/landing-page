import type { Row } from "./db/types";
import type { Post, ProjectRecord } from "./content";
import type { PricingPlan } from "@/data/site";

// ---- posts ----
export const postFromRow = (r: Row): Post => ({
  id: String(r.id),
  slug: String(r.slug),
  title: String(r.title ?? ""),
  category: String(r.category ?? ""),
  img: String(r.img ?? ""),
  summary: String(r.summary ?? ""),
  content: String(r.content ?? ""),
  metaTitle: (r.meta_title as string) || null,
  metaDescription: (r.meta_description as string) || null,
  metaKeywords: (r.meta_keywords as string) || null,
  createdAt: String(r.created_at ?? new Date().toISOString()),
  service: String(r.service ?? "thiet-ke-website"),
  published: r.published !== false,
});

export const postToRow = (p: Partial<Post>): Row => ({
  ...(p.slug !== undefined && { slug: p.slug }),
  ...(p.title !== undefined && { title: p.title }),
  ...(p.category !== undefined && { category: p.category }),
  ...(p.img !== undefined && { img: p.img }),
  ...(p.summary !== undefined && { summary: p.summary }),
  ...(p.content !== undefined && { content: p.content }),
  ...(p.metaTitle !== undefined && { meta_title: p.metaTitle || null }),
  ...(p.metaDescription !== undefined && { meta_description: p.metaDescription || null }),
  ...(p.metaKeywords !== undefined && { meta_keywords: p.metaKeywords || null }),
  ...(p.service !== undefined && { service: p.service }),
  ...(p.published !== undefined && { published: p.published }),
  ...(p.createdAt !== undefined && { created_at: p.createdAt }),
});

// ---- projects ----
export const projectFromRow = (r: Row): ProjectRecord => ({
  id: String(r.id),
  slug: String(r.slug),
  title: String(r.title ?? ""),
  category: String(r.category ?? ""),
  categoryLabel: String(r.category_label ?? ""),
  code: String(r.code ?? ""),
  img: String(r.img ?? ""),
  demoUrl: (r.demo_url as string) || null,
  description: String(r.description ?? ""),
  content: String(r.content ?? ""),
  metaTitle: (r.meta_title as string) || null,
  metaDescription: (r.meta_description as string) || null,
  metaKeywords: (r.meta_keywords as string) || null,
  hubOrder: Number(r.hub_order ?? 0),
  homeOrder: Number(r.home_order ?? 0),
  sample: r.sample === true,
  published: r.published !== false,
});

export const projectToRow = (p: Partial<ProjectRecord>): Row => ({
  ...(p.slug !== undefined && { slug: p.slug }),
  ...(p.title !== undefined && { title: p.title }),
  ...(p.category !== undefined && { category: p.category }),
  ...(p.categoryLabel !== undefined && { category_label: p.categoryLabel }),
  ...(p.code !== undefined && { code: p.code }),
  ...(p.img !== undefined && { img: p.img }),
  ...(p.demoUrl !== undefined && { demo_url: p.demoUrl || null }),
  ...(p.description !== undefined && { description: p.description }),
  ...(p.content !== undefined && { content: p.content }),
  ...(p.metaTitle !== undefined && { meta_title: p.metaTitle || null }),
  ...(p.metaDescription !== undefined && { meta_description: p.metaDescription || null }),
  ...(p.metaKeywords !== undefined && { meta_keywords: p.metaKeywords || null }),
  ...(p.hubOrder !== undefined && { hub_order: p.hubOrder }),
  ...(p.homeOrder !== undefined && { home_order: p.homeOrder }),
  ...(p.sample !== undefined && { sample: p.sample }),
  ...(p.published !== undefined && { published: p.published }),
});

// ---- settings ----
export type SiteSettings = {
  phone: string; // digits only, e.g. 0365614597
  phoneDisplay: string; // 0365 614 597
  phoneDotted: string; // 0365.614.597
  phoneIntl: string; // +84365614597
  email: string;
  address: string;
  zaloUrl: string;
  showSocials: boolean;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  pricingPlans: PricingPlan[];
  faqs: [question: string, answer: string][];
};

/** What is actually stored, one JSON value per key in the `settings` table. */
export type StoredContact = { phone: string; email: string; address: string };
export type StoredSocials = { show: boolean; facebook: string; instagram: string; tiktok: string };
export type StoredFaq = { question: string; answer: string };

export const digitsOnly = (s: string) => s.replace(/\D/g, "");

export function derivePhone(raw: string) {
  let d = digitsOnly(raw);
  if (d.startsWith("84") && d.length >= 11) d = `0${d.slice(2)}`;
  const display = d.length === 10 ? `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}` : d;
  const dotted = d.length === 10 ? `${d.slice(0, 4)}.${d.slice(4, 7)}.${d.slice(7)}` : d;
  const intl = d.startsWith("0") ? `+84${d.slice(1)}` : `+${d}`;
  return { phone: d, phoneDisplay: display, phoneDotted: dotted, phoneIntl: intl };
}
