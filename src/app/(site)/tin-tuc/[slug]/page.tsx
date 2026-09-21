import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { facebookPath } from "@/data/site";
import { categoryLabel, formatDate, servicePages } from "@/lib/content";
import { getPost, getPosts, getSettings } from "@/lib/site-data";
import { SITE_URL, breadcrumbJsonLd, graph, pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/tin-tuc/[slug]">) {
  const { slug } = await params;
  const p = await getPost(slug);
  if (!p) return {};
  return pageMetadata({
    title: p.metaTitle ?? `${p.title} | SuperLanding`,
    description: p.metaDescription ?? p.summary,
    keywords: p.metaKeywords ?? undefined,
    path: `/tin-tuc/${p.slug}`,
    ogImage: `${SITE_URL}${p.img}`,
    ogImageAlt: p.title,
    ogImageSize: false,
    type: "article",
    publishedTime: p.createdAt,
  });
}

const sidebarPoints = [
  "Lập trình website độc quyền theo yêu cầu",
  "Chỉnh sửa và nâng cấp Landing Page chuyên nghiệp",
  "Bảo mật thông tin & Chứng chỉ SSL an toàn",
  "Bàn giao toàn bộ mã nguồn sạch gốc 100%",
  "Tối ưu hóa tốc độ tải trang di động cực nhanh",
];

const meta = (size: number) =>
  ({
    width: `${size}px`,
    height: `${size}px`,
    color: "var(--primary)",
    flexShrink: 0,
  }) as const;

export default async function PostPage({
  params,
}: PageProps<"/tin-tuc/[slug]">) {
  const { slug } = await params;
  const [p, posts, { showSocials: SHOW_SOCIALS, facebookUrl: FACEBOOK_URL }] = await Promise.all([
    getPost(slug),
    getPosts(),
    getSettings(),
  ]);
  if (!p) notFound();

  const url = `${SITE_URL}/tin-tuc/${p.slug}`;
  const label = categoryLabel(p.category);
  const service = servicePages.find((s) => s.slug === p.service);
  const related = posts
    .filter((q) => q.category === p.category && q.slug !== p.slug)
    .slice(0, 3);
  const keywords = p.metaKeywords
    ? p.metaKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : [];

  return (
    <main
      style={{
        minHeight: "100vh",
        paddingTop: "120px",
        paddingBottom: "80px",
        background: "var(--surface)",
      }}
    >
      <JsonLd
        data={graph(
          {
            "@type": "BlogPosting",
            "@id": `${url}#article`,
            isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
            headline: p.title,
            description: p.summary,
            image: [`${SITE_URL}${p.img}`],
            datePublished: p.createdAt,
            dateModified: p.createdAt,
            mainEntityOfPage: url,
            inLanguage: "vi-VN",
            articleSection: label,
            keywords,
            author: {
              "@type": "Organization",
              name: "SuperLanding",
              url: SITE_URL,
            },
            publisher: {
              "@type": "Organization",
              name: "SuperLanding",
              logo: {
                "@type": "ImageObject",
                url: `${SITE_URL}/images/logo.png`,
              },
            },
            speakable: {
              "@type": "SpeakableSpecification",
              cssSelector: ["h1", "header p", "article p"],
            },
          },
          breadcrumbJsonLd(url, [
            ["Trang chủ", "/"],
            ["Tin tức", "/tin-tuc"],
            [p.title, `/tin-tuc/${p.slug}`],
          ]),
        )}
      />
      <div
        className="gv-wrap"
        style={{ maxWidth: "1200px", position: "relative", zIndex: 1 }}
      >
        <nav
          style={{
            fontSize: "14px",
            color: "var(--tertiary)",
            marginBottom: "24px",
          }}
        >
          <Link className="hover:text-[var(--primary)]" href="/">
            Trang chủ
          </Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link className="hover:text-[var(--primary)]" href="/tin-tuc">
            Tin tức
          </Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link
            className="hover:text-[var(--primary)]"
            href={`/tin-tuc?danh-muc=${p.category}`}
          >
            {label}
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 items-start">
          <div>
            <header style={{ marginBottom: "32px" }}>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--primary)",
                  background: "rgba(11,111,164, 0.06)",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  display: "inline-block",
                  marginBottom: "16px",
                }}
              >
                {label}
              </span>
              <h1
                style={{
                  fontSize: "clamp(28px, 4vw, 40px)",
                  fontWeight: 800,
                  lineHeight: 1.3,
                  color: "var(--neutral)",
                  margin: "0 0 16px 0",
                }}
              >
                {p.title}
              </h1>
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  color: "var(--tertiary)",
                  fontSize: "14px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <svg
                    style={meta(15)}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{formatDate(p.createdAt)}</span>
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <svg
                    style={meta(15)}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>
                    Tác giả: <strong>SuperLanding</strong>
                  </span>
                </span>
              </div>
            </header>

            <div
              style={{
                position: "relative",
                borderRadius: "24px",
                overflow: "hidden",
                marginBottom: "40px",
                aspectRatio: "16/9",
              }}
            >
              <Image
                src={p.img}
                alt={p.title}
                fill
                fetchPriority="high"
                sizes="(max-width: 1024px) 100vw, 800px"
                style={{ objectFit: "cover" }}
              />
            </div>

            <article
              className="blog-detail-content"
              style={{
                fontSize: "16px",
                lineHeight: 1.8,
                color: "var(--neutral)",
                marginBottom: "60px",
              }}
              dangerouslySetInnerHTML={{ __html: p.content }}
            />
          </div>

          <aside className="space-y-8 lg:sticky lg:top-[120px]">
            <div
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--line)",
                borderRadius: "24px",
                padding: "28px",
                boxShadow: "0 10px 30px rgba(11,111,164, 0.02)",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "var(--primary)",
                  background: "rgba(11,111,164, 0.08)",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "inline-block",
                  marginBottom: "16px",
                }}
              >
                Dịch vụ chuyên nghiệp
              </span>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "var(--neutral)",
                  margin: "0 0 12px 0",
                  lineHeight: 1.4,
                }}
              >
                Giải pháp phù hợp với chủ đề bài viết
              </h3>
              <p
                style={{
                  fontSize: "13.5px",
                  color: "var(--tertiary)",
                  lineHeight: 1.6,
                  margin: "0 0 20px 0",
                }}
              >
                Tìm hiểu phạm vi, quy trình và các hạng mục của dịch vụ{" "}
                {service?.sidebarPhrase} trước khi yêu cầu tư vấn.
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginBottom: "24px",
                }}
              >
                {sidebarPoints.map((text) => (
                  <div
                    key={text}
                    style={{
                      display: "flex",
                      alignItems: "start",
                      gap: "10px",
                      fontSize: "13px",
                      color: "var(--neutral)",
                      lineHeight: 1.4,
                    }}
                  >
                    <svg
                      style={{
                        width: "16px",
                        height: "16px",
                        color: "var(--primary)",
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
              <Link
                className="hover:shadow-lg text-center block"
                style={{
                  display: "block",
                  width: "100%",
                  background: "var(--sky-300)",
                  color: "var(--neutral)",
                  border: "1px solid var(--sky-500)",
                  textAlign: "center",
                  padding: "12px 14px",
                  borderRadius: "14px",
                  fontWeight: 700,
                  fontSize: "13.5px",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  boxShadow: "0 8px 18px -8px rgba(79,179,224,0.9)",
                }}
                href={`/${p.service}`}
              >
                Xem dịch vụ liên quan ➔
              </Link>
            </div>

            {SHOW_SOCIALS && (
              <div
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--line)",
                  borderRadius: "24px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div
                  style={{ display: "flex", gap: "12px", alignItems: "center" }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "#1877f2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      style={{ width: "20px", height: "20px" }}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d={facebookPath} />
                    </svg>
                  </div>
                  <div>
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "var(--neutral)",
                        margin: 0,
                      }}
                    >
                      SuperLanding
                    </h4>
                    <span
                      style={{ fontSize: "11.5px", color: "var(--tertiary)" }}
                    >
                      Cộng đồng Facebook
                    </span>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: "12.5px",
                    color: "var(--tertiary)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  Theo dõi Fanpage chính thức để cập nhật các mẫu giao diện và
                  ưu đãi thiết kế web mới nhất.
                </p>
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-90 text-center"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    background: "rgba(24,119,242, 0.12)",
                    color: "#1877f2",
                    padding: "10px",
                    borderRadius: "10px",
                    fontWeight: 600,
                    fontSize: "12.5px",
                    textDecoration: "none",
                    transition: "background 0.2s",
                  }}
                >
                  Ghé thăm Fanpage ➔
                </a>
              </div>
            )}
          </aside>
        </div>

        <section
          style={{
            borderTop: "1px solid var(--line)",
            paddingTop: "48px",
            marginTop: "60px",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--neutral)",
              marginBottom: "32px",
            }}
          >
            Bài viết liên quan
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "24px",
            }}
          >
            {related.map((q) => (
              <article
                key={q.slug}
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--line)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Link
                  style={{ display: "block", aspectRatio: "16/10" }}
                  href={`/tin-tuc/${q.slug}`}
                >
                  <span
                    style={{
                      position: "relative",
                      display: "block",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <Image
                      src={q.img}
                      alt={q.title}
                      fill
                      sizes="(max-width: 720px) 100vw, 33vw"
                      style={{ objectFit: "cover" }}
                    />
                  </span>
                </Link>
                <div
                  style={{
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--primary)",
                      marginBottom: "6px",
                      textTransform: "uppercase",
                    }}
                  >
                    {categoryLabel(q.category)}
                  </span>
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      margin: "0 0 8px 0",
                      lineHeight: 1.4,
                      color: "var(--neutral)",
                    }}
                  >
                    <Link
                      style={{ textDecoration: "none" }}
                      href={`/tin-tuc/${q.slug}`}
                    >
                      {q.title}
                    </Link>
                  </h4>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "11.5px",
                      color: "var(--tertiary)",
                      marginTop: "auto",
                    }}
                  >
                    <svg
                      style={meta(13)}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{formatDate(q.createdAt)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
