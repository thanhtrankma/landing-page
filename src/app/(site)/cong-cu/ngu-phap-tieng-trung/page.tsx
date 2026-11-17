import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import GrammarIndex from "@/components/hanzi/GrammarIndex";
import { GRAMMAR_PATH, LESSONS, grammarIndex } from "@/lib/lessons";
import { SITE_URL, breadcrumbJsonLd, graph, pageMetadata } from "@/lib/seo";
import "../cards.css";
import "../luyen-viet-chu-han/hanzi.css";
import "../bai-hoc-tieng-trung/lesson.css";

const entries = grammarIndex();

export const metadata = pageMetadata({
  title: "Tổng Hợp Ngữ Pháp Tiếng Trung Theo Bài Học – Cấu Trúc, Ví Dụ | SuperLanding",
  description: `${entries.length} điểm ngữ pháp tiếng Trung từ các buổi học: cấu trúc, giải thích tiếng Việt và câu ví dụ có pinyin, phát âm. Tìm nhanh theo chữ Hán hoặc tiếng Việt.`,
  path: GRAMMAR_PATH,
  keywords: "ngữ pháp tiếng trung, tổng hợp ngữ pháp tiếng trung, cấu trúc câu tiếng trung, ngữ pháp hsk, ngữ pháp tiếng trung cơ bản",
});

export default function GrammarPage() {
  const url = `${SITE_URL}${GRAMMAR_PATH}`;
  return (
    <main className="cards-page">
      <JsonLd
        data={graph(
          breadcrumbJsonLd(url, [
            ["Trang chủ", "/"],
            ["Học HSK", "/cong-cu/hoc-hsk"],
            ["Tổng hợp ngữ pháp", GRAMMAR_PATH],
          ]),
        )}
      />

      <section className="lesson-page">
        <div className="gv-wrap">
          <Link href="/cong-cu/hoc-hsk" className="lesson-back">
            ← Học HSK
          </Link>
          <header className="lesson-head">
            <span className="invite-eyebrow">ÔN NGỮ PHÁP</span>
            <h1>Tổng hợp điểm ngữ pháp</h1>
            <p>
              {entries.length} điểm ngữ pháp từ {LESSONS.length} buổi học, mỗi điểm có cấu trúc, giải thích và câu ví dụ kèm phát âm.
            </p>
          </header>
          <GrammarIndex entries={entries} />
        </div>
      </section>
    </main>
  );
}
