import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { DICT_PATH, WORDS } from "@/lib/hsk";
import { LESSONS, LESSONS_PATH } from "@/lib/lessons";
import { SITE_URL, breadcrumbJsonLd, graph, pageMetadata } from "@/lib/seo";
import "../cards.css";
import "../luyen-viet-chu-han/hanzi.css";
import "../bai-hoc-tieng-trung/lesson.css";

const PATH = "/cong-cu/hoc-hsk";

export const metadata = pageMetadata({
  title: "Học HSK Online Miễn Phí – Bài Học, Từ Điển, Luyện Viết, Game | SuperLanding",
  description: "Bộ công cụ học tiếng Trung HSK miễn phí: bài học theo buổi, từ điển HSK 1–2, luyện viết chữ Hán đúng thứ tự nét và game ôn từ vựng.",
  path: PATH,
  keywords: "học hsk, học tiếng trung online, từ điển hsk, luyện viết chữ hán, game học tiếng trung",
});

const tools: { href: string; tag: string; title: string; text: string; stat: string }[] = [
  {
    href: LESSONS_PATH,
    tag: "Ôn bài",
    title: "Bài học theo buổi",
    text: "Từ mới và ngữ pháp của từng buổi học trên lớp, kèm ví dụ, luyện viết và game riêng cho buổi.",
    stat: `${LESSONS.length} buổi · ${LESSONS.reduce((n, l) => n + l.words.length, 0)} từ mới`,
  },
  {
    href: DICT_PATH,
    tag: "Tra cứu",
    title: "Từ điển HSK",
    text: "Tra nghĩa, pinyin, Hán Việt, cách dùng và câu ví dụ của toàn bộ từ vựng HSK 1–2.",
    stat: `${WORDS.length.toLocaleString("vi-VN")} từ HSK 1–2`,
  },
  {
    href: "/cong-cu/luyen-viet-chu-han",
    tag: "Luyện viết",
    title: "Luyện viết chữ Hán",
    text: "Xem hoạt hình thứ tự nét rồi tự viết lại trên ô chữ điền, được chấm từng nét ngay.",
    stat: "Chấm từng nét",
  },
  {
    href: "/cong-cu/chu-han-roi",
    tag: "Game",
    title: "Chữ Hán rơi",
    text: "Mỗi lượt một chữ rơi xuống, gõ từng chữ cái để đại bác bắn vào ô chữ trước khi thẻ chạm đáy.",
    stat: "Bắn chữ cái · gợi ý mở dần",
  },
  {
    href: "/cong-cu/mua-tu-vung-tieng-trung",
    tag: "Game",
    title: "Mưa từ vựng",
    text: "Thiên thạch chữ Hán rơi liên tục, gõ pinyin hoặc nghĩa để bắn hạ, luyện phản xạ nhớ từ.",
    stat: "Luyện phản xạ",
  },
];

export default function HskHubPage() {
  const url = `${SITE_URL}${PATH}`;
  return (
    <main className="cards-page">
      <JsonLd data={graph(breadcrumbJsonLd(url, [["Trang chủ", "/"], ["Công cụ", PATH], ["Học HSK", PATH]]))} />

      <section className="hanzi-hero lesson-hero">
        <div className="gv-wrap">
          <div className="hanzi-hero-copy fade-in-up">
            <span className="invite-eyebrow">CÔNG CỤ MIỄN PHÍ</span>
            <h1>
              Học HSK <em>trong một chỗ.</em>
            </h1>
            <p>Ôn bài theo buổi, tra từ, luyện viết chữ Hán và chơi game ôn từ vựng, tất cả miễn phí, không cần đăng ký.</p>
          </div>

          <div className="lesson-book">
            <div className="lesson-cards">
              {tools.map((t) => (
                <Link key={t.href} href={t.href} className="lesson-card">
                  <span className="lesson-card-tag">{t.tag}</span>
                  <b>{t.title}</b>
                  <span className="lesson-card-text">{t.text}</span>
                  <small>{t.stat}</small>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
