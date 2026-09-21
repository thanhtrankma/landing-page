import Image from "next/image";
import Link from "next/link";
import InetPartner from "@/components/InetPartner";
import Services from "@/components/home/Services";
import { Button, Heading, Icon } from "@/components/ui";
import type { IconName } from "@/data/site";
import { servicePages } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Dịch Vụ Website & Landing Page | SuperLanding",
  description:
    "Tổng hợp dịch vụ thiết kế Website, Landing Page, website bán hàng, doanh nghiệp, nhà hàng và tiệm nail theo yêu cầu, chuẩn SEO và tối ưu chuyển đổi.",
  ogDescription: "Khám phá các nhóm dịch vụ Website và Landing Page theo mục tiêu kinh doanh tại SuperLanding.",
  path: "/dich-vu",
  ogImageAlt: "Dịch vụ Thiết kế Website & Landing Page Chuẩn SEO — SuperLanding",
});

const commitments: [IconName, string, string][] = [
  ["shield", "Tận tâm", "Hỗ trợ trực tiếp 1-1"],
  ["chart", "Chuẩn SEO", "Tối ưu hóa tìm kiếm Google"],
  ["cloud", "Tốc độ", "Tải trang nhanh và gọn nhẹ"],
  ["code", "Bảo trì", "Hỗ trợ sửa lỗi sau bàn giao"],
];

export default function ServicesPage() {
  return (
    <main>
      <section className="sub-hero services-hero">
        <div className="gv-wrap fade-in-up">
          <span>DỊCH VỤ CỦA CHÚNG TÔI</span>
          <h1>
            Dịch vụ Website &amp;
            <br />
            <em>Landing Page theo mục tiêu.</em>
          </h1>
          <p>Chọn đúng giải pháp theo loại hình kinh doanh, hành trình khách hàng và mục tiêu chuyển đổi của bạn.</p>
          <Button href="#dich-vu-chi-tiet">Khám phá dịch vụ</Button>
        </div>
      </section>

      <section id="dich-vu-chi-tiet" className="service-hub-section">
        <div className="gv-wrap">
          <div className="animate-on-scroll">
            <Heading
              center
              eyebrow="SERVICE HUB"
              title="Chọn dịch vụ phù hợp với nhu cầu"
              text="Mỗi trang dịch vụ tập trung vào một nhu cầu tìm kiếm và một mục tiêu kinh doanh riêng."
            />
          </div>
          <div className="service-hub-grid">
            {servicePages.map((s, i) => (
              <article key={s.slug} className="service-hub-card animate-on-scroll" style={{ transitionDelay: `${70 * i}ms` }}>
                <div className="service-hub-image">
                  <Image
                    src={s.image}
                    alt={s.imageAlt}
                    fill
                    sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) 50vw, 384px"
                    style={{ objectPosition: s.imagePosition ?? "center" }}
                  />
                  <span className="service-hub-number">0{i + 1}</span>
                </div>
                <div className="service-hub-content">
                  <span className="service-hub-label">{s.shortLabel}</span>
                  <h2>{s.title}</h2>
                  <p>{s.description}</p>
                  <Link className="service-hub-link" href={`/${s.slug}`}>
                    Khám phá dịch vụ <Icon name="arrow" size={17} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Services eyebrow="BA TRỤ CỘT" title="Dịch vụ cốt lõi" text={null} large />

      <section className="surface" style={{ position: "relative", overflow: "hidden" }}>
        <div className="bento-glow-bg" />
        <div className="gv-wrap why-grid" style={{ position: "relative", zIndex: 1 }}>
          <div className="animate-on-scroll">
            <Heading
              eyebrow="CAM KẾT DỊCH VỤ"
              title="Thiết kế tận tâm. Hiệu quả thực tế."
              text="Tôi luôn tập trung vào sự chỉn chu, tối ưu trải nghiệm người dùng trên mọi thiết bị và đồng hành hỗ trợ bạn vận hành lâu dài."
            />
            <Button href="/lien-he">Liên hệ ngay</Button>
          </div>
          <div className="bento">
            {commitments.map(([icon, title, text], i) => (
              <div key={text} className="animate-on-scroll" style={{ transitionDelay: `${100 * i}ms` }}>
                <article style={{ width: "100%", height: "100%" }}>
                  <div className="icon-box">
                    <Icon name={icon} size={22} />
                  </div>
                  <b>{title}</b>
                  <span>{text}</span>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <InetPartner />

      <section className="mini-cta">
        <div className="gv-wrap animate-on-scroll">
          <div>
            <span>BẮT ĐẦU DỰ ÁN</span>
            <h2>Sẵn sàng cho dự án tiếp theo?</h2>
          </div>
          <Button href="/lien-he">Đặt lịch tư vấn</Button>
        </div>
      </section>
    </main>
  );
}
