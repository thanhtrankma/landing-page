import JsonLd from "@/components/JsonLd";
import { Heading } from "@/components/ui";
import HanziWriterPractice from "@/components/hanzi/HanziWriterPractice";
import { SITE_URL, breadcrumbJsonLd, graph, pageMetadata } from "@/lib/seo";
import "../cards.css";
import "./hanzi.css";

const PATH = "/cong-cu/luyen-viet-chu-han";

export const metadata = pageMetadata({
  title: "Luyện Viết Chữ Hán Online Miễn Phí – Xem Thứ Tự Nét | SuperLanding",
  description:
    "Luyện viết chữ Hán online miễn phí: xem hoạt hình thứ tự nét từng chữ, tự viết trên ô chữ điền (米字格) và được chấm từng nét ngay lập tức.",
  path: PATH,
  keywords: "luyện viết chữ hán, thứ tự nét chữ hán, cách viết chữ hán, tập viết tiếng trung, viết chữ trung quốc online",
});

const features: [string, string][] = [
  ["Hoạt hình thứ tự nét", "Xem từng nét được viết theo đúng thứ tự và chiều bút, bấm xem lại bao nhiêu lần cũng được."],
  ["Tự viết, chấm từng nét", "Chế độ đố vui: bạn vẽ bằng chuột hoặc ngón tay, sai nét sẽ được nhắc ngay để viết lại."],
  ["Ô chữ điền 米字格", "Khung lưới giống vở tập viết giúp canh vị trí và tỉ lệ của từng nét trong chữ."],
  ["Luyện cả từ", "Nhập tối đa 6 chữ cùng lúc, mỗi chữ một ô riêng để luyện cả cụm từ."],
  ["Bộ thủ nổi bật", "Phần bộ thủ được tô màu khác để dễ nhận ra cấu tạo của chữ."],
  ["Dùng tốt trên điện thoại", "Viết trực tiếp bằng tay trên màn hình cảm ứng, không cần cài ứng dụng."],
];

const faqs: [string, string][] = [
  ["Công cụ luyện viết chữ Hán có mất phí không?", "Hoàn toàn miễn phí, không cần đăng ký tài khoản."],
  ["Có hỗ trợ chữ phồn thể không?", "Có, phần lớn chữ phồn thể thông dụng đều có dữ liệu nét viết. Nếu một chữ không có dữ liệu, công cụ sẽ báo để bạn thử chữ khác."],
  ["Làm sao để tự viết và được chấm?", "Bấm “Tự viết (đố vui)”, rồi vẽ từng nét vào ô theo đúng thứ tự. Viết sai nét, công cụ sẽ nhắc và gợi ý nét đúng sau vài lần thử."],
  ["Vì sao nên học đúng thứ tự nét?", "Viết đúng thứ tự giúp chữ cân đối, viết nhanh hơn và tra từ điển viết tay chính xác hơn."],
];

export default function HanziWritingToolPage() {
  const url = `${SITE_URL}${PATH}`;
  return (
    <main className="cards-page">
      <JsonLd
        data={graph(
          {
            "@type": "WebApplication",
            "@id": `${url}#app`,
            name: "Luyện viết chữ Hán – SuperLanding",
            url,
            applicationCategory: "EducationalApplication",
            operatingSystem: "Web",
            inLanguage: "vi-VN",
            offers: { "@type": "Offer", price: "0", priceCurrency: "VND" },
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
          { "@type": "FAQPage", mainEntity: faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) },
          breadcrumbJsonLd(url, [["Trang chủ", "/"], ["Công cụ", PATH], ["Luyện viết chữ Hán", PATH]]),
        )}
      />

      <section className="hanzi-hero">
        <div className="gv-wrap">
          <div className="hanzi-hero-copy fade-in-up">
            <span className="invite-eyebrow">CÔNG CỤ MIỄN PHÍ</span>
            <h1>
              Luyện viết chữ Hán <em>đúng thứ tự nét.</em>
            </h1>
            <p>Nhập chữ cần luyện, xem hoạt hình từng nét rồi tự viết lại trên ô chữ điền. Công cụ chấm từng nét ngay khi bạn viết.</p>
          </div>
          <HanziWriterPractice />
        </div>
      </section>

      <section>
        <div className="gv-wrap">
          <Heading center eyebrow="TÍNH NĂNG" title="Học viết như có vở tập viết bên cạnh" />
          <div className="cards-features">
            {features.map(([title, text]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="gv-wrap cards-faq">
          <Heading center eyebrow="HỎI ĐÁP" title="Câu hỏi thường gặp" />
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
