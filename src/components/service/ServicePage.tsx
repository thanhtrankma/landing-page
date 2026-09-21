import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { getSettings } from "@/lib/site-data";
import { servicePages, type ServicePageData } from "@/lib/content";
import { SITE_URL, breadcrumbJsonLd, graph } from "@/lib/seo";

const arrow = <span aria-hidden="true">→</span>;
const external = <span aria-hidden="true">↗</span>;

export default async function ServicePage({ service }: { service: ServicePageData }) {
  const { phoneDisplay: PHONE_DISPLAY, phoneIntl: PHONE_INTL } = await getSettings();
  const url = `${SITE_URL}/${service.slug}`;
  const related = servicePages.filter((s) => s.slug !== service.slug).slice(0, 3);
  const knowledge = service.supportingLinks;
  const projects = [
    ...(service.relatedProjects ?? []),
    { href: "/bang-gia", label: "Tham khảo bảng giá thiết kế" },
  ];

  return (
    <main className="service-page">
      <JsonLd
        data={graph(
          {
            "@type": "Service",
            "@id": `${url}#service`,
            name: service.title,
            description: service.description,
            url,
            areaServed: { "@type": "Country", name: "Việt Nam" },
            provider: { "@id": `${SITE_URL}/#organization` },
          },
          breadcrumbJsonLd(url, [
            ["Trang chủ", "/"],
            ["Dịch vụ", "/dich-vu"],
            [service.title, `/${service.slug}`],
          ]),
          {
            "@type": "FAQPage",
            "@id": `${url}#faq`,
            mainEntity: service.faqs.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          },
        )}
      />

      <section className="service-page-hero">
        <div className="service-page-orb service-page-orb-one" />
        <div className="service-page-orb service-page-orb-two" />
        <div className="gv-wrap service-page-hero-grid">
          <div className="service-page-hero-copy fade-in-up">
            <nav className="service-page-breadcrumb" aria-label="Breadcrumb">
              <ol>
                <li>
                  <Link href="/">Trang chủ</Link>
                </li>
                <li>
                  <Link href="/dich-vu">Dịch vụ</Link>
                </li>
                <li aria-current="page">{service.shortLabel}</li>
              </ol>
            </nav>
            <span className="service-page-eyebrow">{service.eyebrow}</span>
            <h1>{service.title}</h1>
            <p>{service.lead}</p>
            <div className="service-page-actions">
              <Link className="service-primary-action" href="/lien-he">
                Nhận tư vấn miễn phí {arrow}
              </Link>
              <Link className="service-secondary-action" href="/bang-gia">
                Xem bảng giá
              </Link>
            </div>
            <ul className="service-page-trust" aria-label="Cam kết dịch vụ">
              <li>Thiết kế riêng</li>
              <li>Chuẩn responsive</li>
              <li>Sẵn sàng cho SEO</li>
            </ul>
          </div>
          <div className="service-page-hero-visual fade-in-up">
            <div className="service-browser-frame">
              <div className="service-browser-bar" aria-hidden="true">
                <span />
                <span />
                <span />
                <div>web-landing.com</div>
              </div>
              <div className="service-browser-image">
                <Image
                  src={service.image}
                  alt={service.imageAlt}
                  fill
                  fetchPriority="high"
                  sizes="(max-width: 900px) calc(100vw - 32px), 48vw"
                  style={{ objectPosition: service.imagePosition ?? "center" }}
                />
              </div>
            </div>
            <div className="service-visual-note">
              <span>01</span>
              <div>
                <strong>Thiết kế theo mục tiêu</strong>
                <small>Không dùng giao diện đại trà</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="service-page-overview">
        <div className="gv-wrap">
          <div className="service-section-heading">
            <div>
              <span>GIẢI PHÁP PHÙ HỢP</span>
              <h2>Từ nhu cầu thực tế đến giá trị rõ ràng</h2>
            </div>
            <p>
              Mỗi quyết định thiết kế đều bắt đầu từ khách hàng, mục tiêu kinh doanh và cách website được vận hành sau
              bàn giao.
            </p>
          </div>
          <div className="service-value-grid">
            <article className="service-value-card service-value-card-light">
              <span className="service-card-kicker">PHÙ HỢP VỚI</span>
              <h3>Khi nào bạn nên chọn dịch vụ này?</h3>
              <ul>
                {service.audience.map((text, i) => (
                  <li key={text}>
                    <span>0{i + 1}</span>
                    {text}
                  </li>
                ))}
              </ul>
            </article>
            <article className="service-value-card service-value-card-dark">
              <span className="service-card-kicker">GIÁ TRỊ NHẬN ĐƯỢC</span>
              <h3>Mục tiêu sau khi dự án hoàn thiện</h3>
              <ul>
                {service.outcomes.map((text) => (
                  <li key={text}>
                    <span aria-hidden="true">✓</span>
                    {text}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="service-page-scope">
        <div className="gv-wrap">
          <div className="service-section-heading service-section-heading-center">
            <div>
              <span>PHẠM VI TRIỂN KHAI</span>
              <h2>Những hạng mục cốt lõi</h2>
            </div>
            <p>Phạm vi cuối cùng được xác nhận theo nhu cầu và báo giá của từng dự án.</p>
          </div>
          <div className="service-deliverable-grid">
            {service.deliverables.map((text, i) => (
              <article key={text} className="service-scope-card">
                <div className="service-scope-index">0{i + 1}</div>
                <h3>{text}</h3>
                <span className="service-scope-arrow" aria-hidden="true">
                  ↗
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="service-page-process-section">
        <div className="gv-wrap">
          <div className="service-section-heading">
            <div>
              <span>QUY TRÌNH</span>
              <h2>Bốn bước rõ ràng, dễ theo dõi</h2>
            </div>
            <p>Bạn luôn biết dự án đang ở giai đoạn nào, đầu việc cần xác nhận và kết quả sẽ nhận được.</p>
          </div>
          <ol className="service-process-grid">
            {service.process.map((step, i) => (
              <li key={step.title}>
                <div className="service-process-number">{i + 1}</div>
                <small>BƯỚC 0{i + 1}</small>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="service-page-resources-section">
        <div className="gv-wrap service-page-resources">
          <div className="service-resource-intro">
            <span>TÀI NGUYÊN &amp; DỰ ÁN</span>
            <h2>Xem kiến thức và sản phẩm thực tế trước khi bắt đầu</h2>
            <p>
              Thông tin minh bạch giúp bạn chọn đúng phạm vi, chuẩn bị nội dung tốt hơn và rút ngắn thời gian triển khai.
            </p>
            <Link href="/du-an">Khám phá toàn bộ dự án {arrow}</Link>
          </div>
          <div className="service-resource-columns">
            <div>
              <span className="service-resource-label">KIẾN THỨC HỖ TRỢ</span>
              <ul>
                {knowledge.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>
                      {l.label}
                      {external}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="service-resource-label">DỰ ÁN LIÊN QUAN</span>
              <ul>
                {projects.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>
                      {l.label}
                      {external}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="service-page-faq-section">
        <div className="gv-wrap service-page-faq">
          <aside>
            <span className="service-page-eyebrow">CÂU HỎI THƯỜNG GẶP</span>
            <h2>Thông tin cần biết trước khi triển khai</h2>
            <p>Không thấy câu trả lời bạn cần? Gửi nhu cầu để SuperLanding tư vấn phạm vi phù hợp.</p>
            <Link href="/lien-he">Đặt câu hỏi {arrow}</Link>
          </aside>
          <div className="service-faq-list">
            {service.faqs.map((f, i) => (
              <details key={f.question} className="service-faq-item" open={i === 0}>
                <summary>
                  <span>0{i + 1}</span>
                  {f.question}
                </summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="service-page-related-section">
        <div className="gv-wrap">
          <div className="service-section-heading service-section-heading-center">
            <div>
              <span>DỊCH VỤ LIÊN QUAN</span>
              <h2>Khám phá thêm giải pháp</h2>
            </div>
          </div>
          <div className="service-related-grid">
            {related.map((s) => (
              <article key={s.slug} className="service-related-card">
                <div className="service-related-image">
                  <Image
                    src={s.image}
                    alt={s.imageAlt}
                    fill
                    sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 900px) 50vw, 384px"
                    style={{ objectPosition: s.imagePosition ?? "center" }}
                  />
                </div>
                <div>
                  <span>{s.shortLabel}</span>
                  <h3>{s.title}</h3>
                  <Link href={`/${s.slug}`}>Xem dịch vụ {arrow}</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="service-page-cta">
        <div className="gv-wrap service-page-cta-inner">
          <div>
            <span>BẮT ĐẦU DỰ ÁN</span>
            <h2>Biến ý tưởng của bạn thành một website đáng tin cậy.</h2>
          </div>
          <div className="service-page-cta-actions">
            <Link className="service-primary-action" href="/lien-he">
              Nhận tư vấn miễn phí {arrow}
            </Link>
            <a className="service-cta-phone" href={`tel:${PHONE_INTL}`}>
              Gọi {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
