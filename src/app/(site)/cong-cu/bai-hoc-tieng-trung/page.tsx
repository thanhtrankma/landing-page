import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { LESSONS_PATH, lessonBooks, lessonHref, wordKey } from "@/lib/lessons";
import { SITE_URL, breadcrumbJsonLd, graph, pageMetadata } from "@/lib/seo";
import "../cards.css";
import "../luyen-viet-chu-han/hanzi.css";
import "./lesson.css";

export const metadata = pageMetadata({
  title: "Bài Học Tiếng Trung Theo Buổi – Từ Mới, Ngữ Pháp, Luyện Viết, Game | SuperLanding",
  description: "Tổng hợp từ mới và ngữ pháp tiếng Trung theo từng buổi học: nghe phát âm, xem ví dụ, luyện viết đúng thứ tự nét và chơi game ôn từ của buổi.",
  path: LESSONS_PATH,
  keywords: "bài học tiếng trung, từ mới tiếng trung theo buổi, ngữ pháp tiếng trung, luyện viết chữ hán, game học tiếng trung",
});

export default function LessonsPage() {
  const url = `${SITE_URL}${LESSONS_PATH}`;
  const books = lessonBooks();
  return (
    <main className="cards-page">
      <JsonLd data={graph(breadcrumbJsonLd(url, [["Trang chủ", "/"], ["Công cụ", LESSONS_PATH], ["Bài học tiếng Trung", LESSONS_PATH]]))} />

      <section className="hanzi-hero lesson-hero">
        <div className="gv-wrap">
          <div className="hanzi-hero-copy fade-in-up">
            <span className="invite-eyebrow">ÔN BÀI THEO BUỔI</span>
            <h1>
              Bài học tiếng Trung <em>theo từng buổi.</em>
            </h1>
            <p>Mỗi buổi gom đủ từ mới và ngữ pháp đã học trên lớp, kèm phát âm, ví dụ, luyện viết đúng thứ tự nét và game ôn từ.</p>
          </div>

          {books.map(([book, lessons]) => (
            <div key={book} className="lesson-book">
              <h2>Quyển {book}</h2>
              <div className="lesson-cards">
                {lessons.map((l) => (
                  <Link key={l.slug} href={lessonHref(l)} className="lesson-card">
                    <span className="lesson-card-tag">Buổi {l.session}</span>
                    <b>{l.title}</b>
                    <span className="lesson-card-words" lang="zh">
                      {l.words.slice(0, 8).map((w) => wordKey(w).hanzi).join(" · ")}
                      {l.words.length > 8 && " …"}
                    </span>
                    <small>
                      {l.words.length} từ mới · {l.grammar.length} điểm ngữ pháp
                    </small>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
