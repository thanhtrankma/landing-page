import JsonLd from "@/components/JsonLd";
import PricingCompare from "@/components/PricingCompare";
import InetPartner from "@/components/InetPartner";
import Faq from "@/components/home/Faq";
import { PricingCards } from "@/components/home/Pricing";
import { faqs } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Bảng Giá Thiết Kế Website & Landing Page Trọn Gói | SuperLanding",
  description:
    "Bảng giá dịch vụ thiết kế Website và Landing Page minh bạch, không chi phí ẩn. Đa dạng gói Cơ Bản, Tiêu Chuẩn, Cao Cấp và Theo Yêu Cầu cho mọi quy mô.",
  path: "/bang-gia",
  ogImageAlt: "Bảng Giá Thiết Kế Website & Landing Page — SuperLanding",
});

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })),
};

export default function PricingPage() {
  return (
    <main>
      <JsonLd data={faqJsonLd} />
      <section className="sub-hero compact">
        <div className="gv-wrap center fade-in-up">
          <span>BẢNG GIÁ</span>
          <h1>
            Bảng giá thiết kế Website &amp; Landing Page
            <br />
            <em>theo từng quy mô dự án.</em>
          </h1>
          <p>Minh bạch về phạm vi. Linh hoạt theo nhu cầu. Không có chi phí ẩn.</p>
        </div>
      </section>
      <section className="pricing-section">
        <div className="gv-wrap">
          <PricingCards tilt={false} />
        </div>
      </section>
      <PricingCompare />
      <InetPartner />
      <Faq
        images={[
          { src: "/images/faq-illustration.png", alt: "Giải đáp thắc mắc dịch vụ thiết kế website và landing page SuperLanding", width: 280, height: 200 },
          { src: "/images/faq-support.png", alt: "Đội ngũ hỗ trợ tư vấn thiết kế website chuẩn SEO 24/7", width: 280, height: 200 },
        ]}
      />
    </main>
  );
}
