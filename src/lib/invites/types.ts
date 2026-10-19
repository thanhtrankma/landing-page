// Online wedding invitation (a mobile web page shared by link). Shared by the builder, the public page and the
// server. Image and music fields hold URLs in the browser and "r2:<key>" in the database.

export type InviteEvent = {
  id: string;
  title: string;
  /** "17:00" */
  time: string;
  /** "2026-10-03" */
  date: string;
  /** "(Tức ngày 23 tháng 08 năm Bính Ngọ)" — pre-filled from the date, editable. */
  lunar: string;
  venue: string;
  address: string;
  /** Google Maps link; built from the address when empty. */
  mapUrl: string;
  /** "ceremony" = lễ (vu quy, thành hôn) at home; "party" = tiệc at a venue. */
  kind: "ceremony" | "party";
  /** Optional "Đón khách 17:00 · Khai tiệc 18:00" under the main time. */
  welcomeTime: string;
  startTime: string;
  /** Embed a Google map of the address under this event. */
  showMap: boolean;
};

export type Family = { title: string; parents: string; address: string };
/** `code` = VietQR bank id (e.g. "VCB"): when set with an account number, the QR is generated automatically. */
export type BankInfo = { bank: string; account: string; holder: string; qr: string; code: string };

/** Sections the couple can show or hide (the cover is always shown). */
export const SECTION_KEYS = ["families", "couple", "invite", "events", "calendar", "countdown", "gallery", "schedule", "dressCode", "rsvp", "guestbook", "gift", "thanks"] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];
export const SECTION_LABELS: Record<SectionKey, string> = {
  families: "Thông tin gia đình",
  couple: "Cô dâu & chú rể",
  invite: "Lời mời & ảnh ngày cưới",
  events: "Lễ & tiệc cưới",
  calendar: "Lịch tháng",
  countdown: "Đồng hồ đếm ngược",
  gallery: "Album ảnh",
  schedule: "Lịch trình ngày cưới",
  dressCode: "Dress code",
  rsvp: "Xác nhận tham dự",
  guestbook: "Sổ lưu bút",
  gift: "Hộp mừng cưới",
  thanks: "Lời cảm ơn",
};

export type RsvpQuestion = { id: string; label: string; type: "choice" | "text"; options: string[] };
export type ScheduleItem = { time: string; label: string };

/** English versions of the couple's own texts, shown under the Vietnamese when the card is bilingual. */
export type EnglishTexts = { inviteHeading: string; inviteLine: string; announcement: string; quote: string; thanks: string; groomFamily: string; brideFamily: string };

export type InviteTheme = "song-hy" | "phong-bi-hong" | "toi-gian" | "dong-noi" | "vang-do" | "do-do" | "long-phung" | "hoang-kim" | "baroque" | "mau-nuoc" | "co-phuc";

export type InviteData = {
  theme: InviteTheme;
  /** Colour variant id of the theme ("" = its first, original palette). */
  color: string;
  groomName: string;
  brideName: string;
  groomFullName: string;
  brideFullName: string;
  /** "Trưởng nam", "Út nữ"… */
  groomTitle: string;
  brideTitle: string;
  /** Show the groom and his family first (default) or the bride's. */
  groomFirst: boolean;
  /** "Trân trọng báo tin lễ thành hôn của con chúng tôi" */
  announcement: string;
  /** Main wedding date: hero, calendar, countdown. */
  date: string;
  cover: string;
  couplePhoto: string;
  /** Three photos shown under the invitation line, with day / month / year on them. */
  highlights: string[];
  groomFamily: Family;
  brideFamily: Family;
  inviteHeading: string;
  inviteLine: string;
  /** Short romantic line shown by some themes ("Hôn nhân là chuyện cả đời…"). */
  quote: string;
  /** Used when the link has no ?khach=… */
  defaultGuest: string;
  events: InviteEvent[];
  gallery: string[];
  gift: { enabled: boolean; groom: BankInfo; bride: BankInfo };
  rsvp: {
    enabled: boolean;
    /** "button" opens a pop-up; "inline" shows the form on the page. */
    mode: "button" | "inline";
    /** Max people per answer (null = guest decides). */
    limit: number | null;
    questions: RsvpQuestion[];
  };
  thanks: string;
  thanksPhoto: string;
  music: { src: string; title: string };
  petals: boolean;
  /** Full-screen "Mở thiệp" envelope before the page (also what unlocks music autoplay). */
  intro: boolean;
  show: Record<SectionKey, boolean>;
  schedule: { title: string; items: ScheduleItem[] };
  dressCode: { note: string; colors: string[] };
  /** "vi" or bilingual "vi-en". */
  lang: "vi" | "vi-en";
  en: EnglishTexts;
};

export type Wish = { id: string; createdAt: string; name: string; message: string; attend: "yes" | "no" | "maybe" | null; guests: number; hidden: boolean };
export type PublicWish = Pick<Wish, "id" | "name" | "message" | "createdAt">;

/** A colour variant re-maps the theme's two palette vars (--c1 main, --c2 accent); see themes.css. */
export type ThemeVariant = { id: string; name: string; c1: string; c2?: string };
type ThemeDef = { id: InviteTheme; name: string; note: string; colors: [string, string, string]; style: string; variants: ThemeVariant[] };

export const INVITE_THEMES: ThemeDef[] = [
  {
    id: "song-hy", name: "Song Hỷ", note: "Truyền thống, chữ Hỷ, viền hoa văn", style: "Truyền thống", colors: ["#9b1b1f", "#c8a15a", "#fdf8ef"],
    variants: [
      { id: "do", name: "Đỏ", c1: "#8d0f14", c2: "#c8161d" },
      { id: "xanh", name: "Xanh lục", c1: "#1f5a3d", c2: "#2f7a52" },
      { id: "lam", name: "Xanh lam", c1: "#173f73", c2: "#2459a3" },
      { id: "nau", name: "Nâu", c1: "#5b3a22", c2: "#8d5a2f" },
    ],
  },
  {
    id: "phong-bi-hong", name: "Phong bì", note: "Lãng mạn, ảnh polaroid trong phong bì", style: "Lãng mạn", colors: ["#e89aa8", "#f7dfe3", "#8a5a63"],
    variants: [
      { id: "hong", name: "Hồng", c1: "#c7697c" },
      { id: "dao", name: "Đào", c1: "#d9825b" },
      { id: "tim", name: "Tím", c1: "#8f6fb3" },
      { id: "xanh", name: "Xanh biển", c1: "#5f8fb8" },
      { id: "la", name: "Xanh lá", c1: "#6f9a76" },
    ],
  },
  {
    id: "toi-gian", name: "Tối giản", note: "Thanh lịch, chữ thư pháp, hoa màu nước", style: "Tối giản", colors: ["#ffffff", "#1f1f1f", "#f2c9cf"],
    variants: [
      { id: "hong", name: "Đen – hồng", c1: "#1f1f1f", c2: "#c99aa2" },
      { id: "xanh", name: "Đen – xanh lá", c1: "#1f1f1f", c2: "#8fae93" },
      { id: "navy", name: "Xanh navy", c1: "#1d2d4f", c2: "#a9b9d6" },
      { id: "nau", name: "Nâu", c1: "#4a3326", c2: "#c9a27e" },
      { id: "tim", name: "Tím", c1: "#2d2440", c2: "#b8a3d6" },
    ],
  },
  {
    id: "dong-noi", name: "Hoa đồng nội", note: "Ảnh tràn màn hình, hoa cỏ dại", style: "Thiên nhiên", colors: ["#f7f1e5", "#6f8a5e", "#c46b4e"],
    variants: [
      { id: "xanh", name: "Xanh lá", c1: "#6f8a5e", c2: "#c46b4e" },
      { id: "lam", name: "Xanh lam", c1: "#5b7f95", c2: "#d08a4c" },
      { id: "nau", name: "Nâu đất", c1: "#8a6a4e", c2: "#c9687a" },
      { id: "tim", name: "Tím", c1: "#7c6a9a", c2: "#c9973f" },
    ],
  },
  {
    id: "vang-do", name: "Vang", note: "Ảnh bìa lớn, nền màu đậm, bản đồ địa điểm", style: "Sang trọng", colors: ["#8b1f2b", "#ffffff", "#e7c9a0"],
    variants: [
      { id: "do", name: "Đỏ rượu", c1: "#8b1f2b" },
      { id: "reu", name: "Xanh rêu", c1: "#2f4d3a" },
      { id: "navy", name: "Xanh navy", c1: "#1f2f55" },
      { id: "nau", name: "Nâu", c1: "#5a3a28" },
      { id: "hong", name: "Hồng đất", c1: "#a0525c" },
    ],
  },
  {
    id: "do-do", name: "Polaroid", note: "Ảnh bìa mờ dần, chữ serif, ảnh polaroid trên nền giấy", style: "Cổ điển", colors: ["#6b1418", "#f2efec", "#3a4a35"],
    variants: [
      { id: "do", name: "Đỏ đô", c1: "#6b1418", c2: "#3a4a35" },
      { id: "navy", name: "Xanh navy", c1: "#1d2b4a", c2: "#8a6a3a" },
      { id: "reu", name: "Xanh rêu", c1: "#2f4434", c2: "#7a5a2e" },
      { id: "nau", name: "Nâu", c1: "#4e3424", c2: "#3a4a35" },
      { id: "tim", name: "Tím", c1: "#3f2a52", c2: "#3a4a35" },
    ],
  },
  {
    id: "long-phung", name: "Long Phụng", note: "Rồng phượng chầu chữ Hỷ, hoa văn mây, nền son", style: "Truyền thống", colors: ["#9e1b1b", "#c9a24a", "#fbf3e2"],
    variants: [
      { id: "do", name: "Đỏ", c1: "#9e1b1b", c2: "#c9a24a" },
      { id: "xanh", name: "Xanh ngọc", c1: "#1d4a3a", c2: "#c9a24a" },
      { id: "lam", name: "Xanh lam", c1: "#1b2f5e", c2: "#c9a24a" },
      { id: "huyen", name: "Huyền", c1: "#231d1c", c2: "#c9a24a" },
    ],
  },
  {
    id: "hoang-kim", name: "Hoàng Kim", note: "Khung viền ánh kim, chữ serif, sang trọng", style: "Sang trọng", colors: ["#7a1420", "#c9a24a", "#fffaf0"],
    variants: [
      { id: "do", name: "Đỏ", c1: "#7a1420", c2: "#c9a24a" },
      { id: "xanh", name: "Xanh lục bảo", c1: "#173c33", c2: "#c9a24a" },
      { id: "lam", name: "Xanh lam", c1: "#14284a", c2: "#c9a24a" },
      { id: "tim", name: "Tím", c1: "#3a2350", c2: "#c9a24a" },
    ],
  },
  {
    id: "baroque", name: "Baroque", note: "Hoa văn cuộn châu Âu, khung tranh cổ điển", style: "Châu Âu", colors: ["#5e1220", "#b8955a", "#f7f1e6"],
    variants: [
      { id: "do", name: "Đỏ đậm", c1: "#5e1220", c2: "#b8955a" },
      { id: "xanh", name: "Xanh đậm", c1: "#1f3b30", c2: "#b8955a" },
      { id: "lam", name: "Lam đậm", c1: "#1a2a4a", c2: "#b8955a" },
      { id: "nau", name: "Nâu", c1: "#4a3020", c2: "#c2a06a" },
    ],
  },
  {
    id: "mau-nuoc", name: "Hoa màu nước", note: "Hoa lá màu nước, nền trắng, nhẹ nhàng", style: "Hoa", colors: ["#c98a8f", "#8aa58a", "#ffffff"],
    variants: [
      { id: "hong", name: "Hồng", c1: "#c98a8f", c2: "#8aa58a" },
      { id: "xanh", name: "Xanh lá", c1: "#7d9c8a", c2: "#c9a27e" },
      { id: "lam", name: "Xanh lam", c1: "#7b95b5", c2: "#d9a7a0" },
      { id: "cam", name: "Cam đất", c1: "#d08a5c", c2: "#8f9f7a" },
    ],
  },
  {
    id: "co-phuc", name: "Cổ phục", note: "Giấy kem, khung cửa đình, chữ thư pháp", style: "Cổ phục", colors: ["#8a2121", "#2f4a3a", "#f5ecd9"],
    variants: [
      { id: "do", name: "Đỏ son", c1: "#8a2121", c2: "#2f4a3a" },
      { id: "xanh", name: "Xanh ngọc", c1: "#2f4a3a", c2: "#8a2121" },
      { id: "lam", name: "Xanh lam", c1: "#22385e", c2: "#b8863a" },
      { id: "nau", name: "Nâu", c1: "#5a3a24", c2: "#8a2121" },
    ],
  },
];
export const isTheme = (v: unknown): v is InviteTheme => INVITE_THEMES.some((t) => t.id === v);
export const themeDef = (theme: InviteTheme) => INVITE_THEMES.find((t) => t.id === theme) ?? INVITE_THEMES[0];
/** The chosen variant, falling back to the theme's first (original) palette. */
export const themeVariant = (theme: InviteTheme, color: string) => {
  const t = themeDef(theme);
  return t.variants.find((v) => v.id === color) ?? t.variants[0];
};
/** Swatch for a variant: main colour, accent (or the theme's second colour) and the paper. */
export const variantSwatch = (theme: InviteTheme, color: string): [string, string, string] => {
  const t = themeDef(theme);
  const v = themeVariant(theme, color);
  return [v.c1, v.c2 ?? t.colors[1], t.colors[2]];
};
/** "Song Hỷ – Xanh lục". */
export const templateName = (theme: InviteTheme, color: string) => `${themeDef(theme).name} – ${themeVariant(theme, color).name}`;
/** Every theme × colour, for the template gallery. */
export const ALL_TEMPLATES = INVITE_THEMES.flatMap((t) => t.variants.map((v, i) => ({ theme: t.id, color: i ? v.id : "", variant: v, def: t })));
/** Demo links: /thiep/mau-<theme> or /thiep/mau-<theme>--<colour>. */
export const demoSlug = (theme: InviteTheme, color = "") => `mau-${theme}${color && color !== themeDef(theme).variants[0].id ? `--${color}` : ""}`;

export const LIMITS = { events: 6, gallery: 24, highlights: 3, text: 600, short: 120 } as const;

export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;
export const RESERVED_SLUGS = new Set(["mau", "demo", "admin", "api", "tao", "sua", "thiep", "superlanding"]);
/** "mau-…" links are the theme demos. */
export const isReservedSlug = (s: string) => RESERVED_SLUGS.has(s) || s.startsWith("mau-");

export const emptyBank = (): BankInfo => ({ bank: "", account: "", holder: "", qr: "", code: "" });

/** Banks supported by VietQR image links (id = bank short code). */
export const VIETQR_BANKS: [code: string, name: string][] = [
  ["VCB", "Vietcombank"], ["BIDV", "BIDV"], ["ICB", "VietinBank"], ["VBA", "Agribank"], ["MB", "MB Bank"], ["TCB", "Techcombank"],
  ["ACB", "ACB"], ["VPB", "VPBank"], ["TPB", "TPBank"], ["STB", "Sacombank"], ["HDB", "HDBank"], ["VIB", "VIB"], ["SHB", "SHB"],
  ["MSB", "MSB"], ["OCB", "OCB"], ["SEAB", "SeABank"], ["LPB", "LPBank"], ["EIB", "Eximbank"], ["NAB", "Nam A Bank"], ["BAB", "Bac A Bank"],
  ["CAKE", "CAKE by VPBank"], ["TIMO", "Timo"], ["VCCB", "Bản Việt"], ["ABB", "ABBANK"], ["PVCB", "PVcomBank"], ["SCB", "SCB"],
];
export const vietQrUrl = (b: Pick<BankInfo, "code" | "account" | "holder">) =>
  b.code && b.account ? `https://img.vietqr.io/image/${encodeURIComponent(b.code)}-${encodeURIComponent(b.account.replace(/\s/g, ""))}-qr_only.png?accountName=${encodeURIComponent(b.holder)}` : "";

export const newEvent = (date: string, title = "Tiệc cưới", kind: InviteEvent["kind"] = "party"): InviteEvent => ({
  id: Math.random().toString(36).slice(2, 10),
  title,
  kind,
  welcomeTime: "",
  startTime: "",
  showMap: kind === "party",
  time: "11:00",
  date,
  lunar: "",
  venue: "",
  address: "",
  mapUrl: "",
});

export const mapsLink = (e: Pick<InviteEvent, "mapUrl" | "address" | "venue">) =>
  e.mapUrl || (e.address || e.venue ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([e.venue, e.address].filter(Boolean).join(", "))}` : "");

const WEEKDAYS = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
export function parseDate(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return { y, m: mo, d, weekday: WEEKDAYS[date.getUTCDay()], dd: String(d).padStart(2, "0"), mm: String(mo).padStart(2, "0") };
}

/** Readable title used for the browser tab and link previews. */
export const inviteTitle = (d: Pick<InviteData, "groomName" | "brideName">) =>
  d.groomName && d.brideName ? `Thiệp cưới ${d.groomName} & ${d.brideName}` : "Thiệp cưới online";
