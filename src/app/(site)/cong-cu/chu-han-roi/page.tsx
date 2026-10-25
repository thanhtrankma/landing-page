import JsonLd from "@/components/JsonLd";
import { Button, Heading } from "@/components/ui";
import HanziDrop from "@/components/hanzi/HanziDrop";
import type { GameWord } from "@/components/hanzi/vocab-game";
import { LEVELS, WORDS, displayPinyin } from "@/lib/hsk";
import { SITE_URL, breadcrumbJsonLd, graph, pageMetadata } from "@/lib/seo";
import "../cards.css";
import "../luyen-viet-chu-han/hanzi.css";
import "../mua-tu-vung-tieng-trung/game.css";
import "./drop.css";

const PATH = "/cong-cu/chu-han-roi";

export const metadata = pageMetadata({
  title: "Chữ Hán Rơi – Game Đoán Từ Vựng Tiếng Trung Có Gợi Ý | SuperLanding",
  description: `Game đoán từ tiếng Trung: mỗi lượt một chữ Hán rơi xuống, càng rơi thấp càng mở thêm gợi ý (Hán Việt, nghĩa, pinyin). ${WORDS.length} từ HSK 1–2, miễn phí.`,
  path: PATH,
  keywords: "game đoán chữ hán, học từ vựng tiếng trung, luyện từ vựng hsk, đoán pinyin, trò chơi tiếng trung",
});

const features: [string, string][] = [
  ["Mỗi lượt một từ", "Chỉ một chữ Hán rơi xuống mỗi lần, đủ thời gian để nhớ lại thay vì phải chạy theo cả màn hình."],
  ["Gợi ý mở dần", "Dưới chữ Hán là ô chữ kiểu x_ ____ cho từng âm tiết. Rơi qua mỗi mốc trên thanh độ sâu, ô chữ lộ thêm chữ cái, kèm gợi ý Hán Việt, nghĩa…"],
  ["Đoán sớm, điểm cao", "Trả lời trước khi có gợi ý được 50 điểm, mỗi gợi ý mở ra bớt 10 điểm. Đoán đúng liên tiếp để giữ chuỗi."],
  ["Lịch sử từ đã rơi", "Khung bên cạnh lưu mọi từ đã rơi qua, đúng hay lọt, kèm pinyin và nghĩa. Bấm vào để mở trong từ điển."],
  ["Gõ pinyin hoặc nghĩa", "Chọn gõ pinyin không dấu, nghĩa tiếng Việt hoặc cả hai. Gợi ý tự đổi để không lộ đáp án quá sớm."],
  ["Nhanh dần theo level", "Cứ 5 từ đúng lại lên level, chữ rơi nhanh hơn và gợi ý xuất hiện sớm hơn theo thời gian."],
];

const faqs: [string, string][] = [
  ["Khác gì với game Mưa từ vựng?", "Mưa từ vựng có nhiều thiên thạch rơi cùng lúc để luyện phản xạ. Chữ Hán rơi chỉ một từ mỗi lượt và có gợi ý mở dần, phù hợp để ôn và ghi nhớ từ mới."],
  ["Gợi ý xuất hiện khi nào?", "Khi từ rơi qua 20%, 40%, 60% và 80% quãng đường, các mốc này hiện trên thanh độ sâu bên trái khung chơi."],
  ["Tính điểm thế nào?", "Đúng khi chưa có gợi ý: 50 điểm. Sau mỗi gợi ý giảm 10 điểm, thấp nhất 10 điểm. Từ chạm đáy sẽ mất 1 trong 3 mạng."],
  ["Từ vựng lấy từ đâu?", `Từ danh sách HSK 3.0: ${LEVELS.map((l) => `HSK ${l.level} (${l.count} từ)`).join(", ")}, giống Từ điển HSK của SuperLanding.`],
];

export default function HanziDropPage() {
  const url = `${SITE_URL}${PATH}`;
  const words: GameWord[] = WORDS.map((w) => [w.hanzi, displayPinyin(w.pinyin), w.meaning, w.hanViet, w.level, w.slug, w.pos]);
  return (
    <main className="cards-page">
      <JsonLd
        data={graph(
          {
            "@type": "WebApplication",
            "@id": `${url}#app`,
            name: "Chữ Hán Rơi – SuperLanding",
            url,
            applicationCategory: "GameApplication",
            operatingSystem: "Web",
            inLanguage: "vi-VN",
            offers: { "@type": "Offer", price: "0", priceCurrency: "VND" },
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
          { "@type": "FAQPage", mainEntity: faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) },
          breadcrumbJsonLd(url, [["Trang chủ", "/"], ["Công cụ", PATH], ["Chữ Hán rơi", PATH]]),
        )}
      />

      <section className="hanzi-hero">
        <div className="gv-wrap">
          <div className="hanzi-hero-copy fade-in-up">
            <span className="invite-eyebrow">TRÒ CHƠI MIỄN PHÍ</span>
            <h1>
              Chữ Hán Rơi <em>đoán từ, gợi ý mở dần.</em>
            </h1>
            <p>Mỗi lượt một chữ Hán rơi xuống. Rơi càng thấp càng có thêm gợi ý, nhưng điểm càng ít. Gõ đáp án trước khi chữ chạm đáy!</p>
          </div>
          <HanziDrop words={words} />
        </div>
      </section>

      <section>
        <div className="gv-wrap">
          <Heading center eyebrow="CÁCH CHƠI" title="Ôn từ vựng bằng phản xạ và gợi ý" />
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
            <h2>Muốn thử thách phản xạ hơn?</h2>
            <p>Chơi Mưa từ vựng: nhiều thiên thạch chữ Hán rơi cùng lúc, bắn hạ trước khi chúng chạm đất.</p>
          </div>
          <Button href="/cong-cu/mua-tu-vung-tieng-trung" light>
            Chơi Mưa từ vựng
          </Button>
        </div>
      </section>
    </main>
  );
}
