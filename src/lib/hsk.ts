import raw from "@/data/hsk1.json";
import { plainPinyin, plainVi, type HskEntry, type HskListItem, type HskWord } from "@/lib/hsk-text";

export * from "@/lib/hsk-text";

function buildEntries(words: HskWord[]): HskEntry[] {
  const used = new Map<string, number>();
  return [...words]
    .sort((a, b) => a.n - b.n)
    .map((w) => {
      const base = plainPinyin(w.pinyin) || `tu-${w.n}`;
      const count = (used.get(base) ?? 0) + 1;
      used.set(base, count);
      return { ...w, slug: count === 1 ? base : `${base}-${count}` };
    });
}

export const HSK1: HskEntry[] = buildEntries(raw as HskWord[]);

const bySlug = new Map(HSK1.map((w) => [w.slug, w]));

export const getWord = (slug: string) => bySlug.get(slug);

export function neighbours(word: HskEntry): [prev: HskEntry | undefined, next: HskEntry | undefined] {
  const i = HSK1.indexOf(word);
  return [HSK1[i - 1], HSK1[i + 1]];
}

/** Other entries that share a character with this one, e.g. 爱 → 爱好. */
export function related(word: HskEntry, limit = 8): HskEntry[] {
  const chars = new Set([...word.hanzi]);
  return HSK1.filter((w) => w !== word && [...w.hanzi].some((c) => chars.has(c))).slice(0, limit);
}

export const listItems = (): HskListItem[] =>
  HSK1.map(({ n, hanzi, variants, pinyin, pos, meaning, hanViet, slug }) => ({
    n,
    hanzi,
    pinyin,
    pos,
    meaning,
    slug,
    zh: [hanzi, ...(variants ?? [])].join(" "),
    py: plainPinyin(pinyin),
    vi: plainVi(meaning),
    hv: plainVi(hanViet),
  }));
