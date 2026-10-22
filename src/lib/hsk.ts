import level1 from "@/data/hsk1.json";
import level2 from "@/data/hsk2.json";
import { plainPinyin, plainVi, type HskEntry, type HskLevel, type HskListItem, type HskWord } from "@/lib/hsk-text";

export * from "@/lib/hsk-text";

/** Word lists by HSK 3.0 level, each numbered from 1 as in the official list. */
const SOURCES: [HskLevel, HskWord[]][] = [
  [1, level1 as HskWord[]],
  [2, level2 as HskWord[]],
];

/**
 * Slugs are toneless pinyin, with -2, -3… for repeats. Levels are processed in order so adding a level never changes
 * the slug (and URL) of a word from an earlier one.
 */
function buildEntries(): HskEntry[] {
  const used = new Map<string, number>();
  return SOURCES.flatMap(([level, words]) =>
    [...words]
      .sort((a, b) => a.n - b.n)
      .map((w) => {
        const base = plainPinyin(w.pinyin) || `tu-${level}-${w.n}`;
        const count = (used.get(base) ?? 0) + 1;
        used.set(base, count);
        return { ...w, level, slug: count === 1 ? base : `${base}-${count}` };
      }),
  );
}

/** Every word, level 1 first, each level in list order. */
export const WORDS: HskEntry[] = buildEntries();

export const LEVELS: { level: HskLevel; count: number }[] = SOURCES.map(([level, words]) => ({ level, count: words.length }));

export const levelCount = (level: HskLevel) => LEVELS.find((l) => l.level === level)?.count ?? 0;

const bySlug = new Map(WORDS.map((w) => [w.slug, w]));

export const getWord = (slug: string) => bySlug.get(slug);

export function neighbours(word: HskEntry): [prev: HskEntry | undefined, next: HskEntry | undefined] {
  const i = WORDS.indexOf(word);
  return [WORDS[i - 1], WORDS[i + 1]];
}

/** Other entries that share a character with this one, e.g. 爱 → 爱好, easier levels first. */
export function related(word: HskEntry, limit = 8): HskEntry[] {
  const chars = new Set([...word.hanzi]);
  return WORDS.filter((w) => w !== word && [...w.hanzi].some((c) => chars.has(c))).slice(0, limit);
}

export const listItems = (): HskListItem[] =>
  WORDS.map(({ n, hanzi, variants, pinyin, pos, meaning, hanViet, slug, level }) => ({
    n,
    hanzi,
    pinyin,
    pos,
    meaning,
    slug,
    level,
    zh: [hanzi, ...(variants ?? [])].join(" "),
    py: plainPinyin(pinyin),
    vi: plainVi(meaning),
    hv: plainVi(hanViet),
  }));
