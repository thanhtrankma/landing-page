import JsonLd from "@/components/JsonLd";
import { Button } from "@/components/ui";
import HskDictionary from "@/components/hanzi/HskDictionary";
import { DICT_PATH, HSK1, listItems } from "@/lib/hsk";
import { SITE_URL, breadcrumbJsonLd, graph, pageMetadata } from "@/lib/seo";
import "../cards.css";
import "../luyen-viet-chu-han/hanzi.css";
import "./dict.css";

export const metadata = pageMetadata({
  title: `Từ Điển HSK 1 – ${HSK1.length} Từ Vựng Có Nghĩa, Cách Viết, Ví Dụ | SuperLanding`,
  description: `Tra cứu ${HSK1.length} từ vựng HSK 1 (chuẩn HSK 3.0): pinyin, âm Hán Việt, nghĩa tiếng Việt, cách dùng, câu ví dụ và hoạt hình thứ tự nét viết từng chữ.`,
  path: DICT_PATH,
  keywords: "từ điển hsk 1, từ vựng hsk 1, 500 từ hsk 1, hsk 3.0, tra từ tiếng trung, từ vựng tiếng trung cơ bản",
});

export default function HskDictionaryPage() {
  const url = `${SITE_URL}${DICT_PATH}`;
  return (
    <main className="cards-page">
      <JsonLd
        data={graph(
          {
            "@type": "DefinedTermSet",
            "@id": `${url}#set`,
            name: "Từ vựng HSK 1",
            url,
            inLanguage: ["zh-CN", "vi-VN"],
          },
          breadcrumbJsonLd(url, [["Trang chủ", "/"], ["Công cụ", DICT_PATH], ["Từ điển HSK 1", DICT_PATH]]),
        )}
      />

      <section className="hanzi-hero">
        <div className="gv-wrap">
          <div className="hanzi-hero-copy fade-in-up">
            <span className="invite-eyebrow">CÔNG CỤ MIỄN PHÍ</span>
            <h1>
              Từ điển HSK 1 <em>{HSK1.length} từ vựng.</em>
            </h1>
            <p>Danh sách từ vựng cấp 1 theo chuẩn HSK 3.0. Bấm vào một từ để xem nghĩa, âm Hán Việt, cách dùng, câu ví dụ và cách viết từng nét.</p>
          </div>
          <HskDictionary words={listItems()} />
        </div>
      </section>

      <section className="cards-promo">
        <div className="gv-wrap">
          <div>
            <h2>Muốn luyện viết chữ bất kỳ?</h2>
            <p>Nhập chữ Hán bạn muốn, xem thứ tự nét và tự viết lại trên ô chữ điền.</p>
          </div>
          <Button href="/cong-cu/luyen-viet-chu-han" light>
            Luyện viết chữ Hán
          </Button>
        </div>
      </section>
    </main>
  );
}
