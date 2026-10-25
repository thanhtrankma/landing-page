import JsonLd from "@/components/JsonLd";
import { Button, Heading } from "@/components/ui";
import VocabMeteor from "@/components/hanzi/VocabMeteor";
import type { GameWord } from "@/components/hanzi/vocab-game";
import { LEVELS, WORDS, displayPinyin } from "@/lib/hsk";
import { SITE_URL, breadcrumbJsonLd, graph, pageMetadata } from "@/lib/seo";
import "../cards.css";
import "../luyen-viet-chu-han/hanzi.css";
import "./game.css";

const PATH = "/cong-cu/mua-tu-vung-tieng-trung";

export const metadata = pageMetadata({
  title: "Mưa Từ Vựng Tiếng Trung – Game Luyện Từ Vựng HSK Online Miễn Phí | SuperLanding",
  description: `Game luyện từ vựng tiếng Trung: bắn hạ thiên thạch mang chữ Hán bằng cách gõ pinyin hoặc nghĩa tiếng Việt. ${WORDS.length} từ vựng HSK 1–2, tăng tốc theo level, miễn phí.`,
  path: PATH,
  keywords: "game học tiếng trung, luyện từ vựng hsk, trò chơi từ vựng tiếng trung, học pinyin, luyện phản xạ chữ hán",
});

const features: [string, string][] = [
  ["Học mà chơi", "Mỗi thiên thạch là một từ HSK. Gõ đúng để bắn hạ, nhìn thấy chữ Hán là phải nhớ ra cách đọc hoặc nghĩa."],
  ["Gõ pinyin không dấu", "Chỉ cần gõ “nihao” cho 你好, không phải bận tâm dấu thanh. Có thể chọn gõ nghĩa tiếng Việt thay cho pinyin."],
  ["Khó dần theo level", "Cứ mỗi 100 điểm lại lên level: thiên thạch rơi nhanh hơn và xuất hiện dày hơn."],
  ["Ôn lại từ bị lọt", "Hết mạng, game liệt kê các từ bạn để rơi kèm pinyin và nghĩa, bấm vào để mở trang từ điển."],
  ["Gợi ý khi cần", "Bật gợi ý để hiện nghĩa, pinyin hoặc âm Hán Việt ngay dưới chữ khi mới làm quen với bộ từ."],
  ["Chơi trên điện thoại", "Ô gõ đáp án nằm ngay dưới màn chơi, dùng bàn phím điện thoại vẫn chơi mượt."],
];

const faqs: [string, string][] = [
  ["Game có miễn phí không?", "Hoàn toàn miễn phí, không cần đăng ký tài khoản. Điểm kỷ lục được lưu ngay trên trình duyệt của bạn."],
  ["Có cần gõ dấu thanh pinyin không?", "Không. Gõ pinyin không dấu là đủ, ví dụ 谢谢 gõ “xiexie”. Chữ ü có thể gõ bằng v hoặc u (绿 → lv hoặc lu)."],
  ["Gõ nghĩa tiếng Việt thì tính đúng thế nào?", "Gõ một trong các nghĩa của từ, có dấu hoặc không đều được. Ví dụ 商人 chấp nhận “thương nhân” hoặc “nhà buôn”."],
  ["Từ vựng lấy từ đâu?", `Từ danh sách HSK 3.0: ${LEVELS.map((l) => `HSK ${l.level} (${l.count} từ)`).join(", ")}, giống bộ từ trong Từ điển HSK của SuperLanding.`],
];

export default function VocabMeteorPage() {
  const url = `${SITE_URL}${PATH}`;
  const words: GameWord[] = WORDS.map((w) => [w.hanzi, displayPinyin(w.pinyin), w.meaning, w.hanViet, w.level, w.slug, w.pos]);
  return (
    <main className="cards-page">
      <JsonLd
        data={graph(
          {
            "@type": "WebApplication",
            "@id": `${url}#app`,
            name: "Mưa Từ Vựng Tiếng Trung – SuperLanding",
            url,
            applicationCategory: "GameApplication",
            operatingSystem: "Web",
            inLanguage: "vi-VN",
            offers: { "@type": "Offer", price: "0", priceCurrency: "VND" },
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
          { "@type": "FAQPage", mainEntity: faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) },
          breadcrumbJsonLd(url, [["Trang chủ", "/"], ["Công cụ", PATH], ["Mưa từ vựng tiếng Trung", PATH]]),
        )}
      />

      <section className="hanzi-hero">
        <div className="gv-wrap">
          <div className="hanzi-hero-copy fade-in-up">
            <span className="invite-eyebrow">TRÒ CHƠI MIỄN PHÍ</span>
            <h1>
              Mưa Từ Vựng Tiếng Trung <em>bắn hạ từng chữ Hán.</em>
            </h1>
            <p>Thiên thạch mang chữ Hán rơi xuống liên tục. Gõ pinyin không dấu hoặc nghĩa tiếng Việt rồi nhấn Enter để bắn hạ trước khi chúng chạm đất.</p>
          </div>
          <VocabMeteor words={words} />
        </div>
      </section>

      <section>
        <div className="gv-wrap">
          <Heading center eyebrow="CÁCH CHƠI" title="Luyện phản xạ từ vựng như chơi điện tử" />
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

      <section className="cards-promo">
        <div className="gv-wrap">
          <div>
            <h2>Gặp từ lạ trong game?</h2>
            <p>Tra nghĩa, âm Hán Việt, câu ví dụ và cách viết từng nét trong Từ điển HSK.</p>
          </div>
          <Button href="/cong-cu/tu-dien-hsk" light>
            Mở từ điển HSK
          </Button>
        </div>
      </section>
    </main>
  );
}
