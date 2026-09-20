import type { Metadata } from "next";

export const SITE_URL = "https://web-landing.com";
export const OG_IMAGE = `${SITE_URL}/images/og-image.png`;

type PageMeta = {
  title: string;
  description: string;
  path: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogImageSize?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  keywords?: string;
};

// Mirrors the original site: every page sets canonical, Open Graph and Twitter card together.
export function pageMetadata(m: PageMeta): Metadata {
  const url = `${SITE_URL}${m.path}`;
  const image = m.ogImage ?? OG_IMAGE;
  const ogTitle = m.ogTitle ?? m.title;
  const ogDescription = m.ogDescription ?? m.description;
  return {
    title: m.title,
    description: m.description,
    keywords: m.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url,
      siteName: "WebLanding",
      locale: "vi_VN",
      type: m.type ?? "website",
      ...(m.publishedTime ? { publishedTime: m.publishedTime } : {}),
      images: [
        {
          url: image,
          ...(m.ogImageSize === false ? {} : { width: 1200, height: 630 }),
          ...(m.ogImageAlt ? { alt: m.ogImageAlt } : {}),
        },
      ],
    },
    twitter: { card: "summary_large_image", title: ogTitle, description: ogDescription, images: [image] },
  };
}

export function breadcrumbJsonLd(url: string, items: [name: string, path: string][]) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: items.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `${SITE_URL}${path === "/" ? "" : path}`,
    })),
  };
}

export const graph = (...nodes: object[]) => ({ "@context": "https://schema.org", "@graph": nodes });
