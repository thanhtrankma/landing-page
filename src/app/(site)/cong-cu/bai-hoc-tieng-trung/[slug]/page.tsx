import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import LessonView from "@/components/hanzi/LessonView";
import { LESSONS, LESSONS_PATH, dictHref, getLesson, lessonGameWords, lessonHref, lessonLabel, wordKey } from "@/lib/lessons";
import { SITE_URL, breadcrumbJsonLd, graph, pageMetadata } from "@/lib/seo";
import "../../cards.css";
import "../../luyen-viet-chu-han/hanzi.css";
import "../../mua-tu-vung-tieng-trung/game.css";
import "../../chu-han-roi/drop.css";
import "../lesson.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return LESSONS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/cong-cu/bai-hoc-tieng-trung/[slug]">) {
  const { slug } = await params;
  const l = getLesson(slug);
  if (!l) return {};
  const words = l.words.map((w) => wordKey(w).hanzi).join(", ");
  return pageMetadata({
    title: `${lessonLabel(l)}: ${l.title} – Từ mới & ngữ pháp tiếng Trung | SuperLanding`,
    description: `Từ mới ${lessonLabel(l)} (${words}) và ngữ pháp ${l.grammar.map((g) => g.title).join(", ")}: phát âm, ví dụ, luyện viết, game ôn từ.`.slice(0, 300),
    path: lessonHref(l),
    keywords: `${words}, ${l.grammar.map((g) => g.title).join(", ")}, bài học tiếng trung quyển ${l.book}`,
  });
}

export default async function LessonPage({ params }: PageProps<"/cong-cu/bai-hoc-tieng-trung/[slug]">) {
  const { slug } = await params;
  const l = getLesson(slug);
  if (!l) notFound();
  const url = `${SITE_URL}${lessonHref(l)}`;

  return (
    <main className="cards-page">
      <JsonLd
        data={graph(
          breadcrumbJsonLd(url, [
            ["Trang chủ", "/"],
            ["Bài học tiếng Trung", LESSONS_PATH],
            [lessonLabel(l), lessonHref(l)],
          ]),
        )}
      />

      <section className="lesson-page">
        <div className="gv-wrap">
          <Link href={LESSONS_PATH} className="lesson-back">
            ← Tất cả buổi học
          </Link>
          <header className="lesson-head">
            <span className="invite-eyebrow">{lessonLabel(l).toUpperCase()}</span>
            <h1>{l.title}</h1>
            <p>
              {l.words.length} từ mới · {l.grammar.length} điểm ngữ pháp: <span lang="zh">{l.grammar.map((g) => g.title).join("、")}</span>
            </p>
          </header>
          <LessonView lesson={l} keys={l.words.map((w) => wordKey(w).hanzi)} dict={l.words.map(dictHref)} gameWords={lessonGameWords(l)} />
        </div>
      </section>
    </main>
  );
}
