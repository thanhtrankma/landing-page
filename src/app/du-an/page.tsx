import Image from "next/image";
import Link from "next/link";
import { projectList } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Dự Án Thiết Kế Website & Landing Page | WebLanding",
  description:
    "Xem các dự án website, Landing Page và mẫu giao diện WebLanding đã triển khai cho doanh nghiệp, bán hàng, nhà hàng, nội thất và bất động sản.",
  ogDescription: "Các dự án website và Landing Page tiêu biểu do WebLanding thiết kế, lập trình và tối ưu.",
  path: "/du-an",
  ogImageSize: false,
});

export default function ProjectsPage() {
  const items = [...projectList].sort((a, b) => a.hubOrder - b.hubOrder);
  return (
    <main style={{ minHeight: "100vh", paddingTop: "120px", paddingBottom: "80px", background: "var(--surface)" }}>
      <div className="gv-wrap">
        <nav aria-label="Breadcrumb" style={{ fontSize: "14px", color: "var(--tertiary)", marginBottom: "28px" }}>
          <Link href="/">Trang chủ</Link> <span aria-hidden="true">/</span> <span>Dự án</span>
        </nav>
        <header className="gv-heading center" style={{ marginBottom: "48px" }}>
          <span>PORTFOLIO / CASE STUDY</span>
          <h1 style={{ fontSize: "clamp(34px, 5vw, 52px)", marginBottom: "16px" }}>Dự án Website &amp; Landing Page</h1>
          <p style={{ maxWidth: "760px", marginInline: "auto" }}>
            Khám phá các website, Landing Page và mẫu giao diện WebLanding đã triển khai. Mỗi trang dự án trình bày bối
            cảnh, giải pháp và những hạng mục nổi bật.
          </p>
        </header>
        <div className="project-hub-grid">
          {items.map((p) => (
            <article key={p.slug} className="gv-card project-hub-card">
              <Link className="project-hub-image" aria-label={`Xem ${p.title}`} href={`/du-an/${p.slug}`}>
                <Image src={p.img} alt={p.title} fill sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw" />
              </Link>
              <div className="project-hub-content">
                <span>{p.categoryLabel}</span>
                <h2>{p.title}</h2>
                <p>{p.description}</p>
                <Link href={`/du-an/${p.slug}`}>Xem chi tiết dự án →</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
