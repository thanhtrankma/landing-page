import Image from "next/image";
import Link from "next/link";
import { categoryLabel, formatDate, postCategories, posts } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Tin Tức & Kiến Thức Website, SEO, CRO | WebLanding",
  description:
    "Bài viết chuyên sâu về thiết kế website, Landing Page, SEO kỹ thuật, trải nghiệm người dùng và tối ưu chuyển đổi từ WebLanding.",
  path: "/tin-tuc",
  ogImageAlt: "Tin tức WebLanding",
});

const PAGE_SIZE = 9;

const calendar = (size: number) => (
  <svg
    style={{ width: `${size}px`, height: `${size}px`, color: "var(--primary)", flexShrink: 0 }}
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
);

const pill = (active: boolean) =>
  ({
    padding: "10px 20px",
    borderRadius: "30px",
    fontSize: "14px",
    fontWeight: 600,
    background: active ? "var(--sky-300)" : "var(--surface-2)",
    color: "var(--neutral)",
    border: active ? "1px solid var(--sky-500)" : "1px solid var(--sky-200)",
    boxShadow: active ? "0 8px 18px -8px rgba(79,179,224,0.9)" : "none",
    transition: "all 0.2s ease",
  }) as const;

const circle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "40px",
  height: "40px",
  borderRadius: "50%",
} as const;

export default async function NewsPage({ searchParams }: PageProps<"/tin-tuc">) {
  const sp = await searchParams;
  const catParam = typeof sp["danh-muc"] === "string" ? sp["danh-muc"] : "";
  const category = postCategories.find((c) => c.slug === catParam)?.slug ?? "";
  const filtered = posts.filter((p) => !category || p.category === category);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const requested = Number(typeof sp["trang"] === "string" ? sp["trang"] : 1);
  const page = Math.min(Math.max(1, Number.isFinite(requested) ? Math.floor(requested) : 1), totalPages);
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const href = (n: number) => {
    const q = new URLSearchParams();
    if (category) q.set("danh-muc", category);
    q.set("trang", String(n));
    return `/tin-tuc?${q.toString()}`;
  };

  return (
    <main style={{ minHeight: "100vh", paddingTop: "120px", paddingBottom: "80px", background: "var(--surface)" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(1200px, 100%)",
          height: "500px",
          background: "radial-gradient(circle at 50% 0%, rgba(79,179,224, 0.08), transparent 60%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div className="gv-wrap" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: "var(--primary)",
              background: "rgba(11,111,164, 0.06)",
              padding: "6px 14px",
              borderRadius: "999px",
              display: "inline-block",
              marginBottom: "16px",
            }}
          >
            ✦ GÓC CHIA SẺ KINH NGHIỆM
          </span>
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 42px)",
              fontWeight: 800,
              lineHeight: 1.2,
              margin: "0 0 16px 0",
              color: "var(--neutral)",
            }}
          >
            Tin tức &amp; <span style={{ color: "var(--primary)" }}>Kiến thức chuyên sâu</span>
          </h1>
          <p style={{ color: "var(--tertiary)", maxWidth: "600px", margin: "auto", fontSize: "15px", lineHeight: 1.6 }}>
            Cập nhật xu hướng thiết kế web mới nhất, chia sẻ mẹo tối ưu SEO website lên Top bền vững và nâng cao tỷ lệ
            chuyển đổi doanh số kinh doanh.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "10px", marginBottom: "40px" }}>
          <Link style={pill(!category)} href="/tin-tuc">
            Tất cả
          </Link>
          {postCategories.map((c) => (
            <Link key={c.slug} style={pill(category === c.slug)} href={`/tin-tuc?danh-muc=${c.slug}`}>
              {c.label}
            </Link>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "30px" }}>
          {visible.map((p) => (
            <article
              key={p.slug}
              className="group hover:-translate-y-1 hover:shadow-lg"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--line)",
                borderRadius: "20px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 4px 20px rgba(8,80,122, 0.02)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
            >
              <Link
                style={{ display: "block", overflow: "hidden", position: "relative", aspectRatio: "16/10" }}
                href={`/tin-tuc/${p.slug}`}
              >
                <Image
                  src={p.img}
                  alt={p.title}
                  fill
                  sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
                  style={{ objectFit: "cover", transition: "transform 0.5s ease" }}
                />
                <span
                  style={{
                    position: "absolute",
                    top: "16px",
                    left: "16px",
                    background: "rgba(255,255,255,0.94)",
                    color: "var(--sky-800)",
                    border: "1px solid var(--sky-300)",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {categoryLabel(p.category)}
                </span>
              </Link>
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12.5px",
                    color: "var(--tertiary)",
                    marginBottom: "10px",
                  }}
                >
                  {calendar(14)}
                  <span>{formatDate(p.createdAt)}</span>
                </div>
                <h3
                  style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 10px 0", lineHeight: 1.4, color: "var(--neutral)" }}
                >
                  <Link className="hover:text-primary" style={{ transition: "color 0.2s" }} href={`/tin-tuc/${p.slug}`}>
                    {p.title}
                  </Link>
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: "var(--tertiary)",
                    lineHeight: 1.6,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {p.summary}
                </p>
                <div style={{ marginTop: "auto", paddingTop: "20px" }}>
                  <Link
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "var(--primary)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                    href={`/tin-tuc/${p.slug}`}
                  >
                    <span>Đọc bài viết</span>
                    <svg
                      style={{ width: "15px", height: "15px" }}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "48px" }}>
            {page > 1 ? (
              <Link
                style={{
                  ...circle,
                  background: "var(--surface-2)",
                  border: "1px solid var(--line)",
                  color: "var(--neutral)",
                  fontSize: "16px",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                }}
                className="hover:border-primary hover:text-primary"
                href={href(page - 1)}
              >
                ←
              </Link>
            ) : (
              <span
                style={{
                  ...circle,
                  background: "var(--surface-2)",
                  border: "1px solid var(--line)",
                  color: "var(--quaternary)",
                  fontSize: "16px",
                  cursor: "not-allowed",
                }}
              >
                ←
              </span>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                className={n === page ? "" : "hover:border-primary hover:text-primary"}
                style={
                  n === page
                    ? {
                        ...circle,
                        background: "var(--primary)",
                        border: "none",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "14px",
                        transition: "all 0.2s ease",
                        boxShadow: "0 4px 12px rgba(79,179,224, 0.2)",
                      }
                    : {
                        ...circle,
                        background: "var(--surface-2)",
                        border: "1px solid var(--line)",
                        color: "var(--neutral)",
                        fontWeight: 600,
                        fontSize: "14px",
                        transition: "all 0.2s ease",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                      }
                }
                href={href(n)}
              >
                {n}
              </Link>
            ))}
            {page < totalPages ? (
              <Link
                style={{
                  ...circle,
                  background: "var(--surface-2)",
                  border: "1px solid var(--line)",
                  color: "var(--neutral)",
                  fontSize: "16px",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                }}
                className="hover:border-primary hover:text-primary"
                href={href(page + 1)}
              >
                →
              </Link>
            ) : (
              <span
                style={{
                  ...circle,
                  background: "var(--surface-2)",
                  border: "1px solid var(--line)",
                  color: "var(--quaternary)",
                  fontSize: "16px",
                  cursor: "not-allowed",
                }}
              >
                →
              </span>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
