import type { Metadata } from "next";
import { Icon, type IconName } from "@/components/admin/Icons";
import { db } from "@/lib/db";
import { readSettingsRaw } from "@/lib/repo";
import { mergeSettings } from "@/lib/site-data";
import { ContactForm, DatabaseTools, FaqForm, PricingForm, SocialsForm } from "./Forms";

export const metadata: Metadata = { title: "Cài đặt" };

const sections: { id: string; icon: IconName; title: string; desc: string }[] = [
  { id: "contact", icon: "phone", title: "Thông tin liên hệ", desc: "Hiển thị ở chân trang, nút gọi/Zalo và dữ liệu SEO." },
  { id: "socials", icon: "external", title: "Mạng xã hội", desc: "Bật hoặc tắt Facebook, Instagram, TikTok trên toàn website." },
  { id: "pricing", icon: "news", title: "Bảng giá", desc: "Các gói dịch vụ trên trang chủ và trang Bảng giá." },
  { id: "faq", icon: "message", title: "Câu hỏi thường gặp", desc: "Phần giải đáp trên trang chủ và trang Bảng giá." },
  { id: "database", icon: "database", title: "Cơ sở dữ liệu", desc: "Kiểm tra kết nối và nhập dữ liệu có sẵn." },
];

function Head({ id }: { id: string }) {
  const s = sections.find((x) => x.id === id)!;
  return (
    <div className="card-head">
      <div className="ico"><Icon name={s.icon} size={20} /></div>
      <div>
        <h2>{s.title}</h2>
        <p>{s.desc}</p>
      </div>
    </div>
  );
}

export default async function SettingsPage() {
  const raw = await readSettingsRaw().catch(() => ({}));
  const s = mergeSettings(raw);
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Cài đặt website</h1>
          <p>Thay đổi có hiệu lực trên website ngay sau khi lưu.</p>
        </div>
      </div>
      <div className="chips" aria-label="Chuyển nhanh tới mục">
        {sections.map((x) => (
          <a key={x.id} className="chip" href={`#${x.id}`}>{x.title}</a>
        ))}
      </div>

      <section className="card" id="contact" style={{ scrollMarginTop: 20 }}>
        <Head id="contact" />
        <ContactForm value={{ phone: s.phone, email: s.email, address: s.address }} />
      </section>
      <section className="card" id="socials" style={{ scrollMarginTop: 20 }}>
        <Head id="socials" />
        <SocialsForm value={{ show: s.showSocials, facebook: s.facebookUrl, instagram: s.instagramUrl, tiktok: s.tiktokUrl }} />
      </section>
      <section className="card" id="pricing" style={{ scrollMarginTop: 20 }}>
        <Head id="pricing" />
        <PricingForm value={s.pricingPlans} />
      </section>
      <section className="card" id="faq" style={{ scrollMarginTop: 20 }}>
        <Head id="faq" />
        <FaqForm value={s.faqs.map(([question, answer]) => ({ question, answer }))} />
      </section>
      <section className="card" id="database" style={{ scrollMarginTop: 20 }}>
        <Head id="database" />
        <p style={{ marginTop: 0 }}>
          Chế độ hiện tại: <span className={`badge ${db.mode === "supabase" ? "on" : "new"}`}>{db.mode === "supabase" ? "Supabase" : "Tệp cục bộ (chỉ để phát triển)"}</span>
        </p>
        <DatabaseTools />
      </section>
    </>
  );
}
