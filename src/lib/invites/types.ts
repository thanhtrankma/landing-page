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

export type InviteData = {
  theme: "song-hy";
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
};

export type Wish = { id: string; createdAt: string; name: string; message: string; attend: "yes" | "no" | "maybe" | null; guests: number; hidden: boolean };
export type PublicWish = Pick<Wish, "id" | "name" | "message" | "createdAt">;

export const INVITE_THEMES = [{ id: "song-hy", name: "Song Hỷ đỏ – vàng" }] as const;

export const LIMITS = { events: 6, gallery: 24, highlights: 3, text: 600, short: 120 } as const;

export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;
export const RESERVED_SLUGS = new Set(["mau", "mau-song-hy", "demo", "admin", "api", "tao", "sua", "thiep", "superlanding"]);

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
