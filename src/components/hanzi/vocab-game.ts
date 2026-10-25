// Shared pieces of the two vocabulary games (Mưa từ vựng, Chữ Hán rơi): word tuples, answer checking, deck and
// best-score helpers. Pure functions only, so both client components can use them.
import { plainPinyin, plainVi } from "@/lib/hsk-text";

/** Compact word passed from the server page: [hanzi, pinyin (display), meaning, Hán Việt, level, slug, parts of speech]. */
export type GameWord = [hanzi: string, pinyin: string, meaning: string, hanViet: string, level: number, slug: string, pos: string[]];

/** What the player types: toneless pinyin, a Vietnamese meaning, or either. */
export type AnswerMode = "pinyin" | "meaning" | "both";
export const MODES: [AnswerMode, string][] = [
  ["pinyin", "Pinyin"],
  ["meaning", "Nghĩa"],
  ["both", "Cả hai"],
];

/** Which HSK levels are in play: 0 means every level. */
export type LevelPick = 0 | 1 | 2;
export const LEVEL_PICKS: [LevelPick, string][] = [
  [1, "HSK 1"],
  [2, "HSK 2"],
  [0, "Cả hai"],
];

export const MODE_PLACEHOLDER: Record<AnswerMode, string> = {
  pinyin: "Gõ pinyin không dấu, ví dụ: nihao",
  meaning: "Gõ nghĩa tiếng Việt",
  both: "Gõ pinyin hoặc nghĩa",
};

/** Player input as toneless pinyin letters: "Nǐ hǎo" → "nihao", "lü" → "lv". */
const inputPinyin = (s: string) => plainPinyin(s);

/** Accent-free, single-spaced Vietnamese: "  Thương  Nhân " → "thuong nhan". */
const inputVi = (s: string) => plainVi(s).replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

/** Every accepted meaning: each part of "túi, cặp; gói (lượng từ)" without the brackets, plus the Hán Việt reading. */
export function meaningAnswers(meaning: string, hanViet: string): string[] {
  const parts = meaning
    .replace(/\([^)]*\)/g, " ")
    .split(/[;,:/]|\bhoặc\b/)
    .map(inputVi)
    .filter((p) => p.length > 0);
  const hv = inputVi(hanViet);
  return [...new Set(hv ? [...parts, hv] : parts)];
}

/** Toneless spellings accepted for a pinyin answer: ü may be typed as v or u. */
export function pinyinAnswers(pinyin: string): string[] {
  const base = plainPinyin(pinyin);
  return [...new Set([base, base.replace(/v/g, "u")])].filter(Boolean);
}

/** True when the typed text answers this word in the chosen mode. */
export function isCorrect(word: GameWord, typed: string, mode: AnswerMode): boolean {
  const [, pinyin, meaning, hanViet] = word;
  if (mode !== "meaning") {
    const p = inputPinyin(typed);
    if (p && pinyinAnswers(pinyin).includes(p)) return true;
  }
  if (mode !== "pinyin") {
    const v = inputVi(typed);
    if (v && meaningAnswers(meaning, hanViet).includes(v)) return true;
  }
  return false;
}

/** Endless shuffled supply of words: reshuffles when it runs out, never repeating the word just drawn. */
export function makeDeck(words: GameWord[]) {
  let pile: GameWord[] = [];
  let last: GameWord | undefined;
  const refill = () => {
    pile = [...words];
    for (let i = pile.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pile[i], pile[j]] = [pile[j], pile[i]];
    }
    if (pile.length > 1 && pile[pile.length - 1] === last) [pile[0], pile[pile.length - 1]] = [pile[pile.length - 1], pile[0]];
  };
  return {
    /** Next word, skipping any whose hanzi `avoid` rejects (e.g. already on screen); gives up after a few tries. */
    draw(avoid?: (w: GameWord) => boolean): GameWord {
      for (let tries = 0; tries < 8; tries++) {
        if (!pile.length) refill();
        const w = pile.pop()!;
        if (!avoid?.(w) || tries === 7) return (last = w);
      }
      return (last = pile.pop() ?? words[0]);
    },
  };
}

export const pickWords = (words: GameWord[], level: LevelPick) => (level === 0 ? words : words.filter((w) => w[4] === level));

/** Best score kept in this browser only (wrapped: storage can be blocked in private windows). */
export function readBest(key: string): number {
  try {
    return Number(localStorage.getItem(key)) || 0;
  } catch {
    return 0;
  }
}

export function saveBest(key: string, score: number): number {
  const best = Math.max(readBest(key), score);
  try {
    localStorage.setItem(key, String(best));
  } catch {
    /* storage blocked: the record just isn't kept */
  }
  return best;
}

/** Remembered game settings (mode, level, hints), so a returning player starts where they left off. */
export function readPrefs<T extends object>(key: string, fallback: T): T {
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(key) ?? "{}") };
  } catch {
    return fallback;
  }
}

export function savePrefs(key: string, value: object) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/** First meaning only, for compact labels: "túi, cặp; gói" → "túi". */
export const shortMeaning = (meaning: string) => meaning.split(/[;,]/)[0].replace(/\([^)]*\)/g, "").trim();

/** "àihào" → "à___o": keeps the first and last letter, for hints that shouldn't give the whole answer away. */
export function maskText(text: string): string {
  const chars = [...text];
  const letters = chars.map((c, i) => ({ c, i })).filter(({ c }) => /\p{L}/u.test(c));
  if (!letters.length) return text;
  const keep = new Set(letters.length <= 2 ? [letters[0].i] : [letters[0].i, letters[letters.length - 1].i]);
  return chars.map((c, i) => (keep.has(i) || !/\p{L}/u.test(c) ? c : "_")).join("");
}
