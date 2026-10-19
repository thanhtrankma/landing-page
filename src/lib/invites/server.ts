import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { db } from "../db";
import type { Row } from "../db/types";
import { keyFromUrl, OBJECT_KEY_RE, publicUrlFor } from "../r2";
import { defaultInvite, demoBySlug, demoInvite } from "./defaults";
import { isReservedSlug, isTheme, LIMITS, themeDef, SECTION_KEYS, SLUG_RE, VIETQR_BANKS, type BankInfo, type Family, type InviteData, type InviteEvent, type PublicWish, type RsvpQuestion, type SectionKey, type Wish } from "./types";

// Server side of the online invitation: input cleaning, URL ⇄ key rewriting and data access.

const KEY = "r2:";
type Any = Record<string, unknown>;

const str = (v: unknown, max: number = LIMITS.short) => (typeof v === "string" ? v.normalize("NFC").trim().slice(0, max) : "");
const isoDate = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "");
const httpUrl = (v: unknown) => {
  const s = str(v, 600);
  return /^https:\/\/[^\s]+$/.test(s) ? s : "";
};

/** Media must come from our storage (or the bundled /music presets): never arbitrary third-party URLs. */
function media(v: unknown): string {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return "";
  if (/^\/music\/[a-z0-9-]+\.(mp3|m4a)$/.test(s)) return s;
  const key = s.startsWith(KEY) ? s.slice(KEY.length) : keyFromUrl(s);
  return key && OBJECT_KEY_RE.test(key) ? `${KEY}${key}` : "";
}
const expand = (v: string) => (v.startsWith(KEY) ? publicUrlFor(v.slice(KEY.length)) : v);

const family = (v: unknown, title: string): Family => {
  const o = (v ?? {}) as Any;
  return { title: str(o.title) || title, parents: str(o.parents, 300), address: str(o.address, 300) };
};
const bank = (v: unknown): BankInfo => {
  const o = (v ?? {}) as Any;
  const code = str(o.code, 12).toUpperCase();
  return { bank: str(o.bank, 80), account: str(o.account, 40), holder: str(o.holder, 80), qr: media(o.qr), code: VIETQR_BANKS.some(([c]) => c === code) ? code : "" };
};
const time = (v: unknown) => {
  const s = str(v, 5);
  return /^\d{1,2}:\d{2}$/.test(s) ? s : "";
};
const color = (v: unknown) => (typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : "");
const id = (v: unknown) => str(v, 20).replace(/[^a-z0-9-]/gi, "") || randomBytes(4).toString("hex");

/** Builds a clean InviteData from untrusted input. Missing fields (older invitations) fall back to defaults. */
export function sanitizeInvite(input: unknown): InviteData {
  const o = (input && typeof input === "object" ? input : {}) as Any;
  const base = defaultInvite();
  const events = (Array.isArray(o.events) ? o.events : []).slice(0, LIMITS.events).map((e): InviteEvent => {
    const x = (e ?? {}) as Any;
    const kind = x.kind === "ceremony" ? "ceremony" : "party";
    return {
      id: id(x.id),
      kind,
      title: str(x.title, 80),
      time: str(x.time, 20),
      welcomeTime: time(x.welcomeTime),
      startTime: time(x.startTime),
      date: isoDate(x.date),
      lunar: str(x.lunar, 80),
      venue: str(x.venue, 160),
      address: str(x.address, 300),
      mapUrl: httpUrl(x.mapUrl),
      showMap: typeof x.showMap === "boolean" ? x.showMap : kind === "party",
    };
  });
  const gift = (o.gift ?? {}) as Any;
  const music = (o.music ?? {}) as Any;
  const rsvp = (o.rsvp ?? {}) as Any;
  const show = (o.show ?? {}) as Any;
  const schedule = (o.schedule ?? {}) as Any;
  const dress = (o.dressCode ?? {}) as Any;
  const en = (o.en ?? {}) as Any;
  const enText = (k: keyof InviteData["en"], max = 200) => (typeof en[k] === "string" ? str(en[k], max) : base.en[k]);
  const limit = Number(rsvp.limit);
  return {
    theme: isTheme(o.theme) ? o.theme : "song-hy",
    color: isTheme(o.theme) && themeDef(o.theme).variants.some((v) => v.id === o.color) ? String(o.color) : "",
    groomName: str(o.groomName, 60),
    brideName: str(o.brideName, 60),
    groomFullName: str(o.groomFullName, 80),
    brideFullName: str(o.brideFullName, 80),
    groomTitle: typeof o.groomTitle === "string" ? str(o.groomTitle, 40) : base.groomTitle,
    brideTitle: typeof o.brideTitle === "string" ? str(o.brideTitle, 40) : base.brideTitle,
    groomFirst: o.groomFirst !== false,
    announcement: typeof o.announcement === "string" ? str(o.announcement, 160) : base.announcement,
    date: isoDate(o.date) || base.date,
    cover: media(o.cover),
    couplePhoto: media(o.couplePhoto),
    highlights: [0, 1, 2].map((i) => media(Array.isArray(o.highlights) ? o.highlights[i] : "")),
    groomFamily: family(o.groomFamily, "Nhà trai"),
    brideFamily: family(o.brideFamily, "Nhà gái"),
    inviteHeading: str(o.inviteHeading, 80),
    inviteLine: str(o.inviteLine, 160),
    quote: typeof o.quote === "string" ? str(o.quote, 200) : base.quote,
    defaultGuest: str(o.defaultGuest, 60) || "Quý khách",
    events,
    gallery: (Array.isArray(o.gallery) ? o.gallery : []).map(media).filter(Boolean).slice(0, LIMITS.gallery),
    gift: { enabled: gift.enabled === true, groom: bank(gift.groom), bride: bank(gift.bride) },
    rsvp: {
      enabled: rsvp.enabled !== false,
      mode: rsvp.mode === "inline" ? "inline" : "button",
      limit: Number.isInteger(limit) && limit > 0 && limit <= 20 ? limit : null,
      questions: (Array.isArray(rsvp.questions) ? rsvp.questions : base.rsvp.questions).slice(0, 6).map((q): RsvpQuestion => {
        const x = (q ?? {}) as Any;
        return {
          id: id(x.id),
          label: str(x.label, 120),
          type: x.type === "text" ? "text" : "choice",
          options: (Array.isArray(x.options) ? x.options : []).map((v) => str(v, 60)).filter(Boolean).slice(0, 8),
        };
      }).filter((q) => q.label),
    },
    thanks: str(o.thanks, LIMITS.text),
    thanksPhoto: media(o.thanksPhoto),
    music: { src: media(music.src), title: str(music.title, 80) },
    petals: o.petals !== false,
    intro: typeof o.intro === "boolean" ? o.intro : base.intro,
    show: Object.fromEntries(SECTION_KEYS.map((k) => [k, typeof show[k] === "boolean" ? show[k] : base.show[k]])) as Record<SectionKey, boolean>,
    schedule: {
      title: typeof schedule.title === "string" ? str(schedule.title, 80) : base.schedule.title,
      items: (Array.isArray(schedule.items) ? schedule.items : base.schedule.items).slice(0, 12).map((it) => {
        const x = (it ?? {}) as Any;
        return { time: str(x.time, 12), label: str(x.label, 100) };
      }).filter((it) => it.time || it.label),
    },
    dressCode: {
      note: typeof dress.note === "string" ? str(dress.note, 200) : base.dressCode.note,
      colors: (Array.isArray(dress.colors) ? dress.colors : base.dressCode.colors).map(color).filter(Boolean).slice(0, 6),
    },
    lang: o.lang === "vi-en" ? "vi-en" : "vi",
    en: {
      inviteHeading: enText("inviteHeading", 80),
      inviteLine: enText("inviteLine", 160),
      announcement: enText("announcement", 160),
      quote: enText("quote"),
      thanks: enText("thanks", LIMITS.text),
      groomFamily: enText("groomFamily", 40),
      brideFamily: enText("brideFamily", 40),
    },
  };
}

/** Stored form → browser form (keys become public URLs). */
export function expandInvite(d: InviteData): InviteData {
  return {
    ...d,
    cover: expand(d.cover),
    couplePhoto: expand(d.couplePhoto),
    highlights: d.highlights.map(expand),
    gallery: d.gallery.map(expand),
    thanksPhoto: expand(d.thanksPhoto),
    gift: { ...d.gift, groom: { ...d.gift.groom, qr: expand(d.gift.groom.qr) }, bride: { ...d.gift.bride, qr: expand(d.gift.bride.qr) } },
    music: { ...d.music, src: expand(d.music.src) },
  };
}

// ───────────── invitations ─────────────

export const INVITE_COOKIE = (id: string) => `it_${id}`;
export const isUuid = (id: string) => /^[0-9a-f-]{36}$/i.test(id);
export const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");

export type InviteStatus = "draft" | "published";
export type OwnedInvite = {
  id: string;
  slug: string;
  status: InviteStatus;
  /** false = temporarily hidden by the couple. */
  published: boolean;
  ownerId: string | null;
  data: InviteData;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  viewCount: number;
};
export const inviteFromRow = (r: Row): OwnedInvite => ({
  id: String(r.id),
  slug: String(r.slug),
  status: r.status === "draft" ? "draft" : "published",
  published: r.published !== false,
  ownerId: (r.owner_id as string) ?? null,
  data: expandInvite(sanitizeInvite(r.data)),
  createdAt: String(r.created_at ?? ""),
  updatedAt: String(r.updated_at ?? r.created_at ?? ""),
  publishedAt: (r.published_at as string) ?? null,
  viewCount: Number(r.view_count ?? 0),
});

export function slugProblem(slug: string): string | null {
  if (!SLUG_RE.test(slug)) return "Đường dẫn chỉ gồm chữ thường không dấu, số và dấu gạch ngang (3–40 ký tự).";
  if (isReservedSlug(slug)) return "Đường dẫn này đã được dành riêng, hãy chọn tên khác.";
  return null;
}

export async function slugTaken(slug: string, exceptId?: string) {
  const { rows } = await db.select<Row>("invitations", { filters: [{ col: "slug", op: "eq", val: slug }], columns: "id", limit: 1 });
  return Boolean(rows[0] && String(rows[0].id) !== exceptId);
}

/** A free slug derived from the names ("dung-thanh-thuy-trang", then "-2", "-3"… or a random tail). */
export async function freeSlug(base: string) {
  const root = (base || "thiep-cuoi").slice(0, 32).replace(/-+$/g, "") || "thiep-cuoi";
  for (const tail of ["", "-2", "-3", "-4", `-${randomBytes(2).toString("hex")}`, `-${randomBytes(3).toString("hex")}`]) {
    const s = `${root}${tail}`;
    if (!slugProblem(s) && !(await slugTaken(s))) return s;
  }
  return `thiep-${randomBytes(5).toString("hex")}`;
}

/** New invitations start as drafts. An anonymous one is reachable through its edit token until someone claims it. */
export async function createInvite(input: { slug: string; data: InviteData; ip: string; ownerId?: string | null }) {
  const token = randomBytes(24).toString("base64url");
  const [r] = await db.insert<Row>("invitations", {
    edit_token_hash: hashToken(token),
    slug: input.slug,
    data: input.data,
    published: true,
    status: "draft",
    owner_id: input.ownerId ?? null,
    ip: input.ip.slice(0, 64),
  });
  return { id: String(r.id), token };
}

export async function inviteRow(id: string) {
  if (!isUuid(id)) return undefined;
  const { rows } = await db.select<Row>("invitations", { filters: [{ col: "id", op: "eq", val: id }], limit: 1 });
  return rows[0];
}

export async function inviteTokenMatches(id: string, token: string | undefined) {
  if (!token) return false;
  const r = await inviteRow(id);
  if (!r) return false;
  const a = Buffer.from(String(r.edit_token_hash));
  const b = Buffer.from(hashToken(token));
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function getInvite(id: string) {
  const r = await inviteRow(id);
  return r ? inviteFromRow(r) : undefined;
}

export async function updateInvite(id: string, patch: { slug?: string; data?: InviteData; published?: boolean; status?: InviteStatus; ownerId?: string }) {
  const p: Row = { updated_at: new Date().toISOString() };
  if (patch.slug !== undefined) p.slug = patch.slug;
  if (patch.data !== undefined) p.data = patch.data;
  if (patch.published !== undefined) p.published = patch.published;
  if (patch.ownerId !== undefined) p.owner_id = patch.ownerId;
  if (patch.status !== undefined) {
    p.status = patch.status;
    if (patch.status === "published") p.published_at = new Date().toISOString();
  }
  const [r] = await db.update<Row>("invitations", [{ col: "id", op: "eq", val: id }], p);
  return r ? inviteFromRow(r) : undefined;
}

export async function deleteInvite(id: string) {
  for (const t of ["rsvps", "guests", "guest_groups", "invitation_members", "invitation_wishes"]) {
    await db.remove(t, [{ col: "invitation_id", op: "eq", val: id }]).catch(() => 0);
  }
  await db.remove("invitations", [{ col: "id", op: "eq", val: id }]);
}

/** Published (and not hidden) invitation by slug. Demo slugs are served from code, without the database. */
export async function getPublicInvite(slug: string, countView = true): Promise<{ id: string | null; data: InviteData } | undefined> {
  const demo = demoBySlug(slug);
  if (demo) return { id: null, data: demoInvite(demo.theme, demo.color) };
  if (!SLUG_RE.test(slug)) return undefined;
  const { rows } = await db.select<Row>("invitations", { filters: [{ col: "slug", op: "eq", val: slug }], limit: 1 });
  const r = rows[0];
  if (!r || r.published === false || r.status === "draft") return undefined;
  if (countView) db.update("invitations", [{ col: "id", op: "eq", val: String(r.id) }], { view_count: Number(r.view_count ?? 0) + 1 }).catch(() => {});
  return { id: String(r.id), data: expandInvite(sanitizeInvite(r.data)) };
}

export async function inviteIdBySlug(slug: string) {
  if (!SLUG_RE.test(slug)) return undefined;
  const { rows } = await db.select<Row>("invitations", { filters: [{ col: "slug", op: "eq", val: slug }], columns: "id,published,status,data", limit: 1 });
  const r = rows[0];
  if (!r || r.published === false || r.status === "draft") return undefined;
  const data = sanitizeInvite(r.data);
  return { id: String(r.id), rsvp: data.rsvp, guestbook: data.show.guestbook };
}

// ───────────── wishes ─────────────

const wishFromRow = (r: Row): Wish => ({
  id: String(r.id),
  createdAt: String(r.created_at),
  name: String(r.name ?? ""),
  message: String(r.message ?? ""),
  attend: ["yes", "no", "maybe"].includes(String(r.attend)) ? (r.attend as Wish["attend"]) : null,
  guests: Number(r.guests ?? 1),
  hidden: Boolean(r.hidden),
});

export async function addWish(inviteId: string, w: { name: string; message: string; attend: Wish["attend"]; guests: number; ip: string }) {
  const [r] = await db.insert<Row>("invitation_wishes", { invitation_id: inviteId, name: w.name, message: w.message, attend: w.attend, guests: w.guests, hidden: false, ip: w.ip.slice(0, 64) });
  return wishFromRow(r);
}

export async function listPublicWishes(inviteId: string, limit = 60): Promise<PublicWish[]> {
  const { rows } = await db.select<Row>("invitation_wishes", {
    filters: [
      { col: "invitation_id", op: "eq", val: inviteId },
      { col: "hidden", op: "eq", val: false },
    ],
    columns: "id,name,message,created_at",
    order: [{ col: "created_at", asc: false }],
    limit,
  });
  return rows.filter((r) => String(r.message ?? "").trim()).map((r) => ({ id: String(r.id), name: String(r.name), message: String(r.message), createdAt: String(r.created_at) }));
}

export async function listAllWishes(inviteId: string): Promise<Wish[]> {
  const { rows } = await db.select<Row>("invitation_wishes", { filters: [{ col: "invitation_id", op: "eq", val: inviteId }], order: [{ col: "created_at", asc: false }], limit: 1000 });
  return rows.map(wishFromRow);
}

export async function setWishHidden(inviteId: string, wishId: string, hidden: boolean) {
  if (!isUuid(wishId)) return;
  await db.update(
    "invitation_wishes",
    [
      { col: "id", op: "eq", val: wishId },
      { col: "invitation_id", op: "eq", val: inviteId },
    ],
    { hidden },
  );
}
