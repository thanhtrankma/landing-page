// Types and text helpers shared by the server pages and the client search. Kept free of the word data so importing
// them doesn't pull hsk1.json (≈280KB) into the browser bundle; the client loads "@/lib/hsk" lazily when it needs it.

export type HskExample = { zh: string; pinyin: string; vi: string };

export type HskWord = {
  n: number;
  hanzi: string;
  variants?: string[];
  pinyin: string;
  pos: string[];
  hanViet: string;
  meaning: string;
  usage: string;
  examples: HskExample[];
};

export type HskEntry = HskWord & { slug: string };

/** What the client-side search list needs; the full entry (usage, examples) is loaded on demand. */
export type HskListItem = Pick<HskEntry, "n" | "hanzi" | "pinyin" | "pos" | "meaning" | "slug"> & {
  /** Search fields: hanzi + variants, toneless pinyin, accent-free meaning and Hán Việt. */
  zh: string;
  py: string;
  vi: string;
  hv: string;
};

export const DICT_PATH = "/cong-cu/tu-dien-hsk";

const POS_VI: Record<string, string> = {
  名: "danh từ",
  动: "động từ",
  形: "tính từ",
  副: "phó từ",
  代: "đại từ",
  数: "số từ",
  量: "lượng từ",
  介: "giới từ",
  连: "liên từ",
  助: "trợ từ",
  叹: "thán từ",
  拟声: "tượng thanh",
  前缀: "tiền tố",
  后缀: "hậu tố",
};

export const posLabel = (pos: string) => POS_VI[pos] ?? pos;

/** Capitalised form for labels that stand alone (filters, tags): "Danh từ". */
export const posTitle = (pos: string) => {
  const label = posLabel(pos);
  return label.charAt(0).toUpperCase() + label.slice(1);
};

/** "Bāng//máng" → "bangmang": lowercase ASCII, no tones, separators or spaces. */
export function plainPinyin(pinyin: string): string {
  return pinyin
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ü/g, "v")
    .replace(/[^a-z]/g, "");
}

/** Lowercase Vietnamese without diacritics, for accent-insensitive meaning search. */
export function plainVi(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "d").toLowerCase();
}

/** Pinyin as shown to readers: the "//" separable-verb marker from the source list is dropped. */
export const displayPinyin = (pinyin: string) => pinyin.replace(/\/\//g, "");

export const wordHref = (slug: string) => `${DICT_PATH}/${slug}`;
