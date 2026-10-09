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
};

export type Family = { title: string; parents: string; address: string };
export type BankInfo = { bank: string; account: string; holder: string; qr: string };

export type InviteTheme = "song-hy" | "phong-bi-hong" | "toi-gian" | "dong-noi" | "vang-do" | "do-do";

export type InviteData = {
  theme: InviteTheme;
  groomName: string;
  brideName: string;
  groomFullName: string;
  brideFullName: string;
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
  rsvp: { enabled: boolean };
  thanks: string;
  thanksPhoto: string;
  music: { src: string; title: string };
  petals: boolean;
  /** Full-screen "Mở thiệp" envelope before the page (also what unlocks music autoplay). */
  intro: boolean;
};

export type Wish = { id: string; createdAt: string; name: string; message: string; attend: "yes" | "no" | "maybe" | null; guests: number; hidden: boolean };
export type PublicWish = Pick<Wish, "id" | "name" | "message" | "createdAt">;

export const INVITE_THEMES: { id: InviteTheme; name: string; note: string; colors: [string, string, string] }[] = [
  { id: "song-hy", name: "Song Hỷ đỏ – vàng", note: "Truyền thống, chữ Hỷ, viền hoa văn", colors: ["#9b1b1f", "#c8a15a", "#fdf8ef"] },
  { id: "phong-bi-hong", name: "Phong bì hồng", note: "Lãng mạn, ảnh polaroid trong phong bì", colors: ["#e89aa8", "#f7dfe3", "#8a5a63"] },
  { id: "toi-gian", name: "Tối giản trắng", note: "Thanh lịch, chữ thư pháp, hoa màu nước", colors: ["#ffffff", "#1f1f1f", "#f2c9cf"] },
  { id: "dong-noi", name: "Hoa đồng nội", note: "Ảnh tràn màn hình, hoa cỏ dại", colors: ["#f7f1e5", "#6f8a5e", "#c46b4e"] },
  { id: "vang-do", name: "Đỏ rượu vang", note: "Ảnh bìa lớn, nền đỏ rượu, bản đồ địa điểm", colors: ["#8b1f2b", "#ffffff", "#e7c9a0"] },
  { id: "do-do", name: "Đỏ đô polaroid", note: "Ảnh bìa mờ dần, chữ serif đỏ đô, ảnh polaroid trên nền giấy", colors: ["#6b1418", "#f2efec", "#3a4a35"] },
];
export const isTheme = (v: unknown): v is InviteTheme => INVITE_THEMES.some((t) => t.id === v);
export const demoSlug = (theme: InviteTheme) => `mau-${theme}`;

export const LIMITS = { events: 6, gallery: 24, highlights: 3, text: 600, short: 120 } as const;

export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;
export const RESERVED_SLUGS = new Set(["mau", "demo", "admin", "api", "tao", "sua", "thiep", "superlanding"]);
/** "mau-…" links are the theme demos. */
export const isReservedSlug = (s: string) => RESERVED_SLUGS.has(s) || s.startsWith("mau-");

export const emptyBank = (): BankInfo => ({ bank: "", account: "", holder: "", qr: "" });

export const newEvent = (date: string, title = "Tiệc cưới"): InviteEvent => ({
  id: Math.random().toString(36).slice(2, 10),
  title,
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
