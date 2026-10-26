import { LESSONS, type Lesson, type LessonWord } from "@/data/lessons";
import { WORDS, wordHref } from "@/lib/hsk";
import type { GameWord } from "@/components/hanzi/vocab-game";

export * from "@/data/lessons";

export const LESSONS_PATH = "/cong-cu/bai-hoc-tieng-trung";

export const lessonHref = (l: Lesson) => `${LESSONS_PATH}/${l.slug}`;
export const lessonLabel = (l: Lesson) => `Quyển ${l.book} · Buổi ${l.session}`;

const bySlug = new Map(LESSONS.map((l) => [l.slug, l]));
export const getLesson = (slug: string) => bySlug.get(slug);

/** Lessons grouped by book, books and sessions in order. */
export function lessonBooks(): [book: number, lessons: Lesson[]][] {
  const books = new Map<number, Lesson[]>();
  for (const l of [...LESSONS].sort((a, b) => a.book - b.book || a.session - b.session)) books.set(l.book, [...(books.get(l.book) ?? []), l]);
  return [...books];
}

/** The characters to write and play for a word: "一边……，一边……" → 一边. */
export const wordKey = (w: LessonWord) => w.key ?? { hanzi: w.hanzi, pinyin: w.pinyin };

const dictByHanzi = new Map(WORDS.map((w) => [w.hanzi, w]));

/** Dictionary page for a lesson word, when the HSK dictionary has it. */
export const dictHref = (w: LessonWord) => {
  const entry = dictByHanzi.get(wordKey(w).hanzi);
  return entry && wordHref(entry.slug);
};

export const wordAnchor = (i: number) => `tu-${i + 1}`;

/** The lesson's words in the games' format; each links to its dictionary entry, or to its card on the lesson page. */
export function lessonGameWords(l: Lesson): GameWord[] {
  return l.words.map((w, i) => {
    const { hanzi, pinyin } = wordKey(w);
    const entry = dictByHanzi.get(hanzi);
    return [hanzi, pinyin, w.meaning, w.hanViet, l.book, entry?.slug ?? `${l.slug}-${i + 1}`, w.pos ? w.pos.split("/") : [], entry ? wordHref(entry.slug) : `${lessonHref(l)}#${wordAnchor(i)}`];
  });
}
