import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Glyph, { type GlyphName } from "@/components/Glyph";
import JsonLd from "@/components/JsonLd";
import { categories } from "@/data/projects";
import { getProject, getSettings } from "@/lib/site-data";
import { SITE_URL, breadcrumbJsonLd, graph, pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/du-an/[slug]">) {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) return {};
  return pageMetadata({
    title: p.metaTitle ?? `${p.title} | SuperLanding`,
    description: p.metaDescription ?? p.description,
    keywords: p.metaKeywords ?? undefined,
    path: `/du-an/${p.slug}`,
    ogImage: `${SITE_URL}${p.img}`,
    ogImageAlt: p.title,
  });
}

const card = {
  background: "#fff",
  border: "1px solid rgba(0,0,0,0.06)",
  borderRadius: "24px",
} as const;

const highlights: [GlyphName, string][] = [
  ["check", "Chuẩn SEO Google"],
  ["bolt", "Tốc độ tải trang tối ưu"],
  ["mobile", "Tương thích di động (Responsive)"],
  ["lock", "Bảo mật an toàn tuyệt đối"],
];

export default async function ProjectPage({ params }: PageProps<"/du-an/[slug]">) {
  const { slug } = await params;
  const [p, { zaloUrl: ZALO_URL }] = await Promise.all([getProject(slug), getSettings()]);
  if (!p) notFound();
  const url = `${SITE_URL}/du-an/${p.slug}`;
  const related =
    p.category === "nha-hang"
      ? { href: "/thiet-ke-website-nha-hang", label: "dịch vụ thiết kế website nhà hàng" }
      : p.category === "landing-page"
        ? { href: "/thiet-ke-landing-page", label: "dịch vụ thiết kế Landing Page" }
        : p.category === "ban-hang"
          ? { href: "/thiet-ke-website-ban-hang", label: "dịch vụ thiết kế website bán hàng" }
          : { href: "/thiet-ke-website-doanh-nghiep", label: "dịch vụ thiết kế website doanh nghiệp" };

  return (
    <main style={{ minHeight: "100vh", paddingTop: "120px", paddingBottom: "80px", background: "var(--surface)" }}>
      <JsonLd
        data={graph(
          {
            "@type": "CreativeWork",
            "@id": `${url}#project`,
            name: p.title,
            image: [`${SITE_URL}${p.img}`],
            description: p.description,
            url,
            creator: { "@id": `${SITE_URL}/#organization` },
            inLanguage: "vi-VN",
          },
          breadcrumbJsonLd(url, [
            ["Trang chủ", "/"],
            ["Dự án", "/du-an"],
            [p.title, `/du-an/${p.slug}`],
          ]),
        )}
      />
      <div className="gv-wrap">
        <nav style={{ fontSize: "14px", color: "var(--tertiary)", marginBottom: "32px" }}>
          <Link className="hover:text-[var(--primary)]" href="/">
            Trang chủ
          </Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link className="hover:text-[var(--primary)]" href="/du-an">
            Dự án
          </Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--neutral)", fontWeight: 500 }}>{p.title}</span>
        </nav>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "48px",
            alignItems: "start",
            marginBottom: "60px",
          }}
        >
          <div style={{ ...card, overflow: "hidden", boxShadow: "0 10px 30px rgba(8,80,122,0.03)", padding: "16px" }}>
            <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", aspectRatio: "4/3" }}>
              <Image
                src={p.img}
                alt={p.title}
                fill
                fetchPriority="high"
                sizes="(max-width: 720px) 100vw, 50vw"
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span
                style={{
                  background: "rgba(11,111,164, 0.08)",
                  color: "var(--primary)",
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "4px 12px",
                  borderRadius: "6px",
                  textTransform: "uppercase",
                }}
              >
                {categories.find((c) => c.id === p.category)?.label ?? p.category}
              </span>
              <span
                style={{
                  background: "var(--surface-2)",
                  color: "var(--neutral)",
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: "6px",
                }}
              >
                Mã: {p.code}
              </span>
            </div>
            <h1
              style={{
                fontSize: "clamp(24px, 4vw, 36px)",
                fontWeight: 800,
                color: "var(--neutral)",
                lineHeight: 1.3,
                margin: 0,
              }}
            >
              {p.title}
            </h1>
            <p style={{ fontSize: "16px", color: "var(--tertiary)", lineHeight: 1.6, margin: 0 }}>{p.description}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "12px" }}>
              {p.demoUrl && (
                <a
                  href={p.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-95"
                  style={{
                    background: "var(--sky-300)",
                    color: "var(--neutral)",
                    border: "1px solid var(--sky-500)",
                    padding: "14px 28px",
                    borderRadius: "12px",
                    fontWeight: 700,
                    fontSize: "15px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 8px 18px -8px rgba(79,179,224,0.9)",
                    transition: "all 0.2s ease",
                  }}
                >
                  Xem Live Demo <Glyph name="globe" size={18} />
                </a>
              )}
              <a
                href={ZALO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-95"
                style={{
                  background: "#fff",
                  color: "var(--neutral)",
                  border: "1px solid var(--sky-400)",
                  padding: "12px 26px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "15px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                }}
              >
                Nhận tư vấn Zalo <Glyph name="chat" size={18} />
              </a>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginTop: "20px",
                borderTop: "1px solid var(--line)",
                paddingTop: "20px",
              }}
            >
              {highlights.map(([icon, text]) => (
                <div
                  key={text}
                  style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "13px", color: "var(--tertiary)" }}
                >
                  <span style={{ color: "var(--sky-700)", display: "inline-flex" }}>
                    <Glyph name={icon} size={16} />
                  </span>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <section style={{ ...card, padding: "40px", boxShadow: "0 4px 20px rgba(8,80,122,0.02)" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--neutral)", marginTop: 0, marginBottom: "20px" }}>
            Chi tiết dự án &amp; Tính năng nổi bật
          </h2>
          <div
            className="project-detail-content"
            style={{ fontSize: "15px", lineHeight: 1.8, color: "var(--neutral)" }}
            dangerouslySetInnerHTML={{ __html: p.content }}
          />
        </section>

        <section className="service-detail-card" style={{ marginTop: "32px" }}>
          <h2 style={{ marginTop: 0 }}>Giải pháp liên quan đến dự án</h2>
          <p style={{ color: "var(--tertiary)", lineHeight: 1.7 }}>
            Nếu bạn cần triển khai một dự án có mục tiêu tương tự, hãy xem{" "}
            <Link style={{ color: "var(--primary)", fontWeight: 700 }} href={related.href}>
              {related.label}
            </Link>{" "}
            hoặc{" "}
            <Link style={{ color: "var(--primary)", fontWeight: 700 }} href="/lien-he">
              trao đổi trực tiếp với SuperLanding
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
