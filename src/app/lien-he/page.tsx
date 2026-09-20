import ContactForm from "@/components/ContactForm";
import { Icon } from "@/components/ui";
import { ZALO_URL, type IconName } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Liên Hệ Tư Vấn Thiết Kế Website & Landing Page | WebLanding",
  description:
    "Liên hệ ngay với WebLanding để nhận tư vấn miễn phí 1-1 giải pháp thiết kế Website & Landing Page tối ưu tỷ lệ chuyển đổi, chuẩn SEO. Phản hồi nhanh trong 5 phút.",
  path: "/lien-he",
  ogImageAlt: "Liên Hệ Tư Vấn Thiết Kế Website — WebLanding",
});

const methods: { icon: IconName; label: string; value: string; note: string; href: string }[] = [
  { icon: "phone", label: "Hotline", value: "0971 424 792", note: "Thứ 2 – Thứ 7, 08:00 – 21:00", href: "tel:0971424792" },
  { icon: "mail", label: "Email", value: "nhuy04625@gmail.com", note: "Phản hồi trong vòng 24 giờ", href: "mailto:nhuy04625@gmail.com" },
];

export default function ContactPage() {
  return (
    <main className="contact-page">
      <div className="contact-orb contact-orb-one" />
      <div className="contact-orb contact-orb-two" />
      <section className="gv-wrap contact-layout">
        <div className="contact-copy fade-in-left">
          <span className="contact-eyebrow">
            <i /> TƯ VẤN MIỄN PHÍ
          </span>
          <h1>
            Cùng biến ý tưởng
            <br />
            thành <em>sản phẩm.</em>
          </h1>
          <p className="contact-lead">
            Kể chúng tôi nghe về dự án của bạn. WebLanding sẽ cùng bạn làm rõ mục tiêu, đề xuất giải pháp phù hợp và gửi
            báo giá minh bạch.
          </p>
          <div className="contact-methods">
            {methods.map((m) => (
              <a key={m.label} className="contact-method" href={m.href}>
                <span className="contact-method-icon">
                  <Icon name={m.icon} size={21} />
                </span>
                <span className="contact-method-content">
                  <small>{m.label}</small>
                  <strong>{m.value}</strong>
                  <span>{m.note}</span>
                </span>
                <span className="contact-method-arrow">
                  <Icon name="arrow" size={18} />
                </span>
              </a>
            ))}
          </div>
          <aside>
            <p>
              <b>Trao đổi trực tiếp qua Zalo</b>
              <br />
              Không cần điền biểu mẫu dài. Gửi yêu cầu, tài liệu hoặc website tham khảo và nhận tư vấn trực tiếp từ chuyên
              gia.
            </p>
            <a
              href={ZALO_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "8px" }}
            >
              Nhắn tin Zalo ngay <Icon name="arrow" size={14} />
            </a>
          </aside>
          <div className="contact-trust">
            <div className="contact-avatars" aria-hidden="true">
              <span>WL</span>
              <span>UX</span>
              <span>DEV</span>
            </div>
            <p>
              <b>100+ dự án</b>
              <br />
              đã được tư vấn và triển khai
            </p>
          </div>
        </div>
        <ContactForm />
      </section>
    </main>
  );
}
