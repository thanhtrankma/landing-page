import type { MetadataRoute } from "next";
import { servicePages } from "@/lib/content";
import { getPosts, getProjects, getPublishedPages } from "@/lib/site-data";
import { SITE_URL } from "@/lib/seo";

type Entry = MetadataRoute.Sitemap[number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, projectList, legal] = await Promise.all([getPosts(), getProjects(), getPublishedPages()]);
  const page = (path: string, changeFrequency: Entry["changeFrequency"], priority: number, lastModified?: string): Entry => ({
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
    ...(lastModified ? { lastModified } : {}),
  });

  return [
    page("", "weekly", 1),
    page("/dich-vu", "monthly", 0.8),
    page("/bang-gia", "monthly", 0.8),
    page("/lien-he", "monthly", 0.8),
    page("/tin-tuc", "weekly", 0.9),
    page("/du-an", "monthly", 0.8),
    ...legal.map((p) => page(`/${p.slug}`, "yearly", 0.3)),
    ...servicePages.map((s) => page(`/${s.slug}`, "monthly", 0.9)),
    ...posts.map((p) => page(`/tin-tuc/${p.slug}`, "weekly", 0.7, p.createdAt)),
    ...projectList.map((p) => page(`/du-an/${p.slug}`, "monthly", 0.7)),
  ];
}
