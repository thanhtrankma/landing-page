import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, breadcrumbJsonLd, graph, pageMetadata } from "@/lib/seo";
import { fillTokens, getPage, getSettings } from "@/lib/site-data";

/** Metadata for a legal page; hidden pages get no metadata (they render 404). */
export async function legalMetadata(slug: string) {
  const p = await getPage(slug);
  if (!p) return {};
  return pageMetadata({ title: `${p.title} | SuperLanding`, description: p.description || p.title, path: `/${slug}`, ogImageAlt: p.title });
}

export default async function LegalPage({ slug }: { slug: string }) {
  const [page, settings] = await Promise.all([getPage(slug), getSettings()]);
  if (!page) notFound();
  const html = fillTokens(page.content, settings, page.updatedAt);
  return (
    <main className="legal-page">
      <JsonLd
        data={graph(
          { "@type": "WebPage", "@id": `${SITE_URL}/${slug}#page`, name: page.title, url: `${SITE_URL}/${slug}`, dateModified: page.updatedAt },
          breadcrumbJsonLd(`${SITE_URL}/${slug}`, [["Trang chủ", "/"], [page.title, `/${slug}`]]),
        )}
      />
      <div className="gv-wrap legal-wrap">
        <nav aria-label="Breadcrumb" className="legal-crumb">
          <Link href="/">Trang chủ</Link> <span aria-hidden="true">/</span> <span>{page.title}</span>
        </nav>
        <h1>{page.title}</h1>
        <article className="legal-prose" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </main>
  );
}
