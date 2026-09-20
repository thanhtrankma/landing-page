import postsData from "@/data/posts.json";
import projectRecords from "@/data/projects.json";
import serviceRecords from "@/data/services.json";

export type Post = {
  slug: string;
  title: string;
  category: string;
  img: string;
  summary: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  createdAt: string;
  service: string;
};

export type ProjectRecord = {
  slug: string;
  title: string;
  category: string;
  categoryLabel: string;
  code: string;
  img: string;
  demoUrl: string | null;
  description: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  hubOrder: number;
};

export type ServicePageData = {
  slug: string;
  eyebrow: string;
  shortLabel: string;
  image: string;
  imageAlt: string;
  imagePosition?: string;
  title: string;
  metaTitle: string;
  description: string;
  lead: string;
  audience: string[];
  outcomes: string[];
  deliverables: string[];
  process: { title: string; text: string }[];
  faqs: { question: string; answer: string }[];
  supportingLinks: { href: string; label: string }[];
  relatedProjects?: { href: string; label: string }[];
  sidebarPhrase: string;
};

export const postCategories: { slug: string; label: string }[] = postsData.categories;
export const posts = postsData.posts as Post[];
export const projectList = projectRecords as ProjectRecord[];
export const servicePages = serviceRecords as ServicePageData[];

export const categoryLabel = (slug: string) => postCategories.find((c) => c.slug === slug)?.label ?? slug;

// Dates are published in Vietnam time, e.g. "19/9/2026".
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", day: "numeric", month: "numeric", year: "numeric" });
