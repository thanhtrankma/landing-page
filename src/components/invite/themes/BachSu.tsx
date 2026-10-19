"use client";

import { useId, type ReactNode } from "react";
import { lunarLabel } from "@/lib/invites/lunar";
import { mapsLink, parseDate, type InviteEvent } from "@/lib/invites/types";
import { calendarLink, Calendar, Countdown, Gallery, GiftReveal, Photo } from "../parts";
import { Announce, Bi, FamilyTitle, PersonTitle, T } from "../lang";
import type { ThemeCtx } from "./types";
import "./bach-su.css";

// "Bạch Sứ": blue-and-white porcelain. Glazed white ground with a faint crackle, everything painted in one
// cobalt (var(--c1)) with a lighter wash of the same pigment, and a thin gold rim line (var(--c2)).
// The cover photo sits inside a mai-bình vase (cloud collar on the shoulder, lotus panels at the foot, on a
// carved stand); the couple photo and the date trio sit in plates with painted rims. Peony scrolls, ruyi
// cloud heads, key-fret (hồi văn) and wave bands are drawn here as SVG or as CSS masks coloured by the vars,
// so the colour variants recolour the whole card. Styles: bach-su.css.

/* ───────────── deterministic geometry helpers (identical on server and client) ───────────── */

const r2 = (n: number) => Math.round(n * 100) / 100;
type Pt = [number, number];
const TAU = Math.PI * 2;

/** SVG-safe unique id (React ids contain ':' which url(#…) dislikes). */
function useSvgId(prefix: string) {
  return prefix + useId().replace(/[^a-zA-Z0-9_-]/g, "");
}

const poly = (pts: Pt[]) => `M${pts.map(([x, y]) => `${r2(x)} ${r2(y)}`).join(" L")}`;

/** Inward spiral: the curl at the end of a scroll. */
const spiral = (cx: number, cy: number, r: number, turns = 1.3, start = 0, dir = 1) => {
  const pts: Pt[] = [];
  const n = 24;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = start + dir * t * turns * TAU;
    const rr = r * (1 - t * 0.8);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return poly(pts);
};

/** Scalloped ring: n petals around (cx, cy), each bulging out to r * bulge. */
const bloom = (cx: number, cy: number, r: number, n: number, rot = 0, bulge = 1.32) => {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a0 = rot + (i * TAU) / n;
    const a1 = rot + ((i + 1) * TAU) / n;
    const am = (a0 + a1) / 2;
    const p0: Pt = [cx + Math.cos(a0) * r, cy + Math.sin(a0) * r];
    const c: Pt = [cx + Math.cos(am) * r * bulge, cy + Math.sin(am) * r * bulge];
    const p1: Pt = [cx + Math.cos(a1) * r, cy + Math.sin(a1) * r];
    d += `${i ? "" : `M${r2(p0[0])} ${r2(p0[1])}`} Q${r2(c[0])} ${r2(c[1])} ${r2(p1[0])} ${r2(p1[1])}`;
  }
  return `${d} Z`;
};

/** Pointed leaf from a base point, `deg` direction, `len` long and `w` wide. */
const leaf = (x: number, y: number, len: number, deg: number, w = 0.32) => {
  const a = (deg * Math.PI) / 180;
  const [dx, dy] = [Math.cos(a), Math.sin(a)];
  const tip: Pt = [x + dx * len, y + dy * len];
  const m: Pt = [x + dx * len * 0.48, y + dy * len * 0.48];
  const [nx, ny] = [-dy * len * w, dx * len * w];
  return {
    d: `M${r2(x)} ${r2(y)} Q${r2(m[0] + nx)} ${r2(m[1] + ny)} ${r2(tip[0])} ${r2(tip[1])} Q${r2(m[0] - nx)} ${r2(m[1] - ny)} ${r2(x)} ${r2(y)} Z`,
    rib: `M${r2(x)} ${r2(y)} L${r2(x + dx * len * 0.82)} ${r2(y + dy * len * 0.82)}`,
  };
};

/** Ruyi cloud head pointing down, centred on (0, 0), about 24 × 22 units. */
const RUYI = "M0 11 C-4 7 -12 6.5 -12 -1 C-12 -7.5 -5.5 -9.5 -2.6 -5.6 C-3.6 -11.4 3.6 -11.4 2.6 -5.6 C5.5 -9.5 12 -7.5 12 -1 C12 6.5 4 7 0 11 Z";

const ink = { fill: "var(--c1)" } as const;
const inkLine = { stroke: "var(--c1)", fill: "none" } as const;
const wash = { fill: "var(--bs-wash)", stroke: "var(--c1)" } as const;
const washSoft = { fill: "var(--bs-wash-soft)", stroke: "var(--c1)" } as const;
const glaze = { fill: "var(--bs-glaze)" } as const;
const goldLine = { stroke: "var(--c2)", fill: "none" } as const;

/* ───────────── painted motifs ───────────── */

/** A peony seen from the front: wash outer petals, deeper middle ring, solid heart with white stamens. */
function Peony({ cx, cy, r, rot = 0 }: { cx: number; cy: number; r: number; rot?: number }) {
  const veins = Array.from({ length: 8 }, (_, i) => {
    const a = rot + ((i + 0.5) * TAU) / 8;
    return `M${r2(cx + Math.cos(a) * r * 0.72)} ${r2(cy + Math.sin(a) * r * 0.72)} L${r2(cx + Math.cos(a) * r * 1.12)} ${r2(cy + Math.sin(a) * r * 1.12)}`;
  });
  const dots = Array.from({ length: 5 }, (_, i) => {
    const a = rot + (i * TAU) / 5;
    return [r2(cx + Math.cos(a) * r * 0.2), r2(cy + Math.sin(a) * r * 0.2)] as const;
  });
  return (
    <g strokeLinejoin="round">
      <path d={bloom(cx, cy, r, 8, rot)} style={washSoft} strokeWidth="1.1" />
      {veins.map((v, i) => (
        <path key={i} d={v} style={inkLine} strokeWidth="0.6" opacity="0.7" />
      ))}
      <path d={bloom(cx, cy, r * 0.66, 7, rot + 0.3)} style={wash} strokeWidth="1" />
      <path d={bloom(cx, cy, r * 0.36, 6, rot + 0.6, 1.4)} style={ink} />
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={r2(r * 0.055)} fill="#fff" />
      ))}
    </g>
  );
}

function Leaf({ x, y, len, deg, w }: { x: number; y: number; len: number; deg: number; w?: number }) {
  const l = leaf(x, y, len, deg, w);
  return (
    <g>
      <path d={l.d} style={wash} strokeWidth="0.9" />
      <path d={l.rib} style={inkLine} strokeWidth="0.7" />
    </g>
  );
}

/** Half of a peony scroll: vine curling out to the left with leaves, a bud and a tendril. Mirrored for the other side. */
function ScrollHalf() {
  return (
    <g strokeLinecap="round">
      <path d="M100 56 C82 74 60 78 44 66 C32 57 34 40 48 38" style={inkLine} strokeWidth="1.5" />
      <path d={spiral(52, 46, 7, 1.15, Math.PI * 1.1, 1)} style={inkLine} strokeWidth="1.1" />
      <path d="M70 72 C62 86 46 92 30 86" style={inkLine} strokeWidth="1.1" />
      <path d={spiral(30, 80, 5.5, 1.2, Math.PI * 0.4, 1)} style={inkLine} strokeWidth="0.9" />
      <Leaf x={86} y={67} len={20} deg={200} />
      <Leaf x={64} y={74} len={17} deg={120} />
      <Leaf x={46} y={66} len={15} deg={235} w={0.3} />
      <Leaf x={40} y={86} len={12} deg={165} w={0.3} />
      <path d={bloom(14, 70, 7, 5, -0.4, 1.4)} style={wash} strokeWidth="0.9" />
      <circle cx="14" cy="70" r="3" style={ink} />
      <path d="M30 86 C24 84 19 78 16 76" style={inkLine} strokeWidth="1" />
    </g>
  );
}

/** Peony scroll spray: one bloom in the middle, vines and buds both sides. */
function PeonySpray({ className = "" }: { className?: string }) {
  return (
    <svg className={`bs-spray ${className}`} viewBox="0 0 200 104" aria-hidden="true">
      <ScrollHalf />
      <g transform="translate(200 0) scale(-1 1)">
        <ScrollHalf />
      </g>
      <Leaf x={100} y={56} len={22} deg={-120} />
      <Leaf x={100} y={56} len={22} deg={-60} />
      <Peony cx={100} cy={56} r={22} rot={-0.2} />
    </svg>
  );
}

/** A single ruyi head ornament (used under headings and as a seal). */
function RuyiMark({ className = "" }: { className?: string }) {
  return (
    <svg className={`bs-ruyi ${className}`} viewBox="-14 -13 28 26" aria-hidden="true">
      <path d={RUYI} style={washSoft} strokeWidth="1.1" />
      <path d={RUYI} transform="scale(0.55) translate(0 -1)" style={ink} />
    </svg>
  );
}

/** Heading: kicker, painted script title, and a gold rule with a ruyi head. */
function Heading({ kicker, children, className = "" }: { kicker: ReactNode; children: ReactNode; className?: string }) {
  return (
    <header className={`bs-heading iv-reveal ${className}`}>
      <p className="bs-kicker">{kicker}</p>
      <h2 className="bs-title">{children}</h2>
      <div className="bs-rule" aria-hidden="true">
        <span />
        <RuyiMark />
        <span />
      </div>
    </header>
  );
}

/* ───────────── vessels: vase and plate holding photos ───────────── */

// Mai bình silhouette in a 300 × 400 box (the stand below goes to 430). The same outline is the CSS mask of the photo.
const VASE =
  "M126 6 H174 V16 H170 V34 C230 40 290 70 290 140 C290 230 240 320 228 380 H232 V394 H68 V380 H72 C60 320 10 230 10 140 C10 70 70 40 130 34 V16 H126 Z";

/** Collar lobes hanging from the shoulder: [cx, scale]. */
const COLLAR: [number, number][] = [
  [0, 3.1],
  [75, 3.1],
  [150, 3.1],
  [225, 3.1],
  [300, 3.1],
];

/** Lotus panels around the foot. */
const LOTUS = Array.from({ length: 9 }, (_, i) => 30 + i * 30);

function Vase({ src, alt, mono }: { src: string; alt: string; mono: string }) {
  const clip = useSvgId("bs-vclip");
  const sheen = useSvgId("bs-vsheen");
  return (
    <div className="bs-vase iv-reveal">
      <Photo src={src} alt={alt} mono={mono} className="bs-vase-photo" />
      <svg className="bs-vase-art" viewBox="0 0 300 430" aria-hidden="true">
        <defs>
          <clipPath id={clip}>
            <path d={VASE} />
          </clipPath>
          <linearGradient id={sheen} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0.05" />
            <stop offset="0.16" stopColor="#fff" stopOpacity="0.42" />
            <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.82" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.16" />
          </linearGradient>
        </defs>
        <g clipPath={`url(#${clip})`}>
          {/* shoulder: glazed band, key-fret ring, then the cloud collar hanging onto the photo */}
          <path d="M0 92 H300" style={inkLine} strokeWidth="1.6" />
          {COLLAR.map(([cx, s], i) => (
            <g key={i} transform={`translate(${cx} ${r2(92 + 3 * s)}) scale(${s})`}>
              <path d={RUYI} style={{ fill: "var(--bs-glaze)", stroke: "var(--c1)" }} strokeWidth={r2(1.6 / s)} />
              <path d={RUYI} transform="scale(0.62) translate(0 -0.5)" style={{ fill: "var(--bs-wash-soft)", stroke: "var(--c1)" }} strokeWidth={r2(0.9 / s)} />
              <path d={bloom(0, -0.6, 2.6, 6, 0.2, 1.45)} style={ink} />
            </g>
          ))}
          <rect x="0" y="0" width="300" height="91.2" style={glaze} />
          <path d="M0 34 H300" style={inkLine} strokeWidth="1.2" />
          <path d="M0 50 H300 M0 76 H300" style={inkLine} strokeWidth="1" />
          {Array.from({ length: 13 }, (_, i) => {
            const x = 6 + i * 24;
            return <path key={i} d={`M${x} 73 V53 H${x + 18} V73 H${x + 5} V58 H${x + 13} V68 H${x + 9}`} style={inkLine} strokeWidth="1.1" />;
          })}
          <path d="M0 82 H300" style={goldLine} strokeWidth="1.1" />
          {/* neck rings */}
          <rect x="0" y="0" width="300" height="16" style={ink} />
          <path d="M0 22 H300 M0 28 H300" style={inkLine} strokeWidth="0.8" />
          {/* foot: lotus panels and the base ring */}
          <rect x="0" y="328" width="300" height="72" style={glaze} />
          <path d="M0 328 H300" style={inkLine} strokeWidth="1.6" />
          <path d="M0 333 H300" style={goldLine} strokeWidth="1" />
          {LOTUS.map((x) => (
            <g key={x}>
              <path d={`M${x - 13} 374 V354 Q${x - 13} 340 ${x} 337 Q${x + 13} 340 ${x + 13} 354 V374`} style={{ fill: "var(--bs-wash-soft)", stroke: "var(--c1)" }} strokeWidth="1.2" />
              <path d={`M${x - 7} 374 V358 Q${x - 7} 349 ${x} 346 Q${x + 7} 349 ${x + 7} 358 V374`} style={inkLine} strokeWidth="0.9" />
              <path d={`M${x} 352 C${x - 3} 357 ${x + 3} 361 ${x} 366`} style={inkLine} strokeWidth="0.8" />
            </g>
          ))}
          <path d="M0 374 H300" style={inkLine} strokeWidth="1.3" />
          <rect x="0" y="380" width="300" height="20" style={ink} />
          {/* glaze sheen */}
          <rect x="0" y="0" width="300" height="400" style={{ fill: `url(#${sheen})` }} />
        </g>
        <path d={VASE} style={inkLine} strokeWidth="2.2" strokeLinejoin="round" />
        {/* carved wooden stand */}
        <path d="M58 398 H242 C246 406 256 410 268 412 V420 H32 V412 C44 410 54 406 58 398 Z" style={{ fill: "var(--bs-deep)" }} />
        <path d="M44 420 H62 V428 H44 Z M238 420 H256 V428 H238 Z" style={{ fill: "var(--bs-deep)" }} />
        <path d="M70 404 H230" style={goldLine} strokeWidth="1" />
      </svg>
    </div>
  );
}

/** Rim motif: alternating scrolls and dots around a ring. */
function rimMotif(r: number, n: number) {
  const scrolls: string[] = [];
  const dots: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i * TAU) / n;
    const a2 = a + TAU / n / 2;
    const span = TAU / n / 2.6;
    // a little wave crest: an arc that curls back at one end
    const p0: Pt = [100 + Math.cos(a - span) * r, 100 + Math.sin(a - span) * r];
    const c: Pt = [100 + Math.cos(a) * (r + 6), 100 + Math.sin(a) * (r + 6)];
    const p1: Pt = [100 + Math.cos(a + span) * (r - 1), 100 + Math.sin(a + span) * (r - 1)];
    const k: Pt = [100 + Math.cos(a + span * 0.35) * (r - 3), 100 + Math.sin(a + span * 0.35) * (r - 3)];
    scrolls.push(`M${r2(p0[0])} ${r2(p0[1])} Q${r2(c[0])} ${r2(c[1])} ${r2(p1[0])} ${r2(p1[1])} Q${r2(k[0])} ${r2(k[1])} ${r2(100 + Math.cos(a) * (r + 0.5))} ${r2(100 + Math.sin(a) * (r + 0.5))}`);
    dots.push([r2(100 + Math.cos(a2) * (r + 1.5)), r2(100 + Math.sin(a2) * (r + 1.5))]);
  }
  return { scrolls, dots };
}

const RIM_BIG = rimMotif(90.5, 22);
const RIM_SMALL = rimMotif(89.5, 14);

/** A round plate: photo in the well, painted rim with wave scrolls, gold line round the well. */
function Plate({ src, alt, mono, className = "", small = false, children }: { src: string; alt: string; mono: string; className?: string; small?: boolean; children?: ReactNode }) {
  const rim = small ? RIM_SMALL : RIM_BIG;
  return (
    <div className={`bs-plate ${small ? "sm" : ""} ${className}`}>
      <Photo src={src} alt={alt} mono={mono} className="bs-plate-photo">
        {children}
      </Photo>
      <svg className="bs-plate-art" viewBox="0 0 200 200" aria-hidden="true">
        <path d="M100 1 A99 99 0 1 1 99.99 1 Z M100 18 A82 82 0 1 0 100.01 18 Z" fillRule="evenodd" style={glaze} />
        <circle cx="100" cy="100" r="98.6" style={inkLine} strokeWidth="2" />
        <circle cx="100" cy="100" r="95" style={inkLine} strokeWidth="0.7" />
        {rim.scrolls.map((s, i) => (
          <path key={i} d={s} style={inkLine} strokeWidth={small ? 1.6 : 1.2} strokeLinecap="round" />
        ))}
        {rim.dots.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={small ? 2.2 : 1.6} style={ink} />
        ))}
        <circle cx="100" cy="100" r="84.5" style={inkLine} strokeWidth="1.3" />
        <circle cx="100" cy="100" r="82.3" style={goldLine} strokeWidth="1.4" />
      </svg>
    </div>
  );
}

/** Lobed cartouche (khung lá đề) behind the guest name; strokes keep their width when stretched. */
function Cartouche() {
  const d = "M20 4 H180 C186 4 188 10 194 12 C198 13 198 18 198 22 V38 C198 42 198 47 194 48 C188 50 186 56 180 56 H20 C14 56 12 50 6 48 C2 47 2 42 2 38 V22 C2 18 2 13 6 12 C12 10 14 4 20 4 Z";
  return (
    <svg className="bs-cartouche" viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} style={{ fill: "var(--bs-glaze)", stroke: "var(--c1)" }} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
      <path d={d} transform="translate(100 30) scale(0.955 0.82) translate(-100 -30)" style={goldLine} strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Four ruyi corners for a porcelain tile. */
function TileCorners() {
  return (
    <>
      {["tl", "tr", "bl", "br"].map((c) => (
        <svg key={c} className={`bs-tc ${c}`} viewBox="0 0 40 40" aria-hidden="true">
          <path d="M2 2 H38 C30 6 26 10 24 16 C20 12 14 12 12 16 C10 12 6 10 2 12 Z M2 2 V38 C6 30 10 26 16 24 C12 20 12 14 16 12" style={{ fill: "var(--bs-wash-soft)", stroke: "var(--c1)" }} strokeWidth="1.1" strokeLinejoin="round" />
          <path d={spiral(14, 14, 5, 1.1, Math.PI * 0.25, 1)} style={inkLine} strokeWidth="1" />
        </svg>
      ))}
    </>
  );
}

/* ───────────── event card ───────────── */

function Event({ e, title }: { e: InviteEvent; title: string }) {
  const p = parseDate(e.date);
  const map = mapsLink(e);
  return (
    <article className="bs-event iv-reveal">
      <TileCorners />
      <h3>{e.title || "Sự kiện"}</h3>
      {p && (
        <div className="bs-event-date">
          <span>
            {e.time || "—"}
            <small>{p.weekday}</small>
          </span>
          <b>{p.dd}</b>
          <span>
            Tháng {p.mm}
            <small>{p.y}</small>
          </span>
        </div>
      )}
      {e.lunar && <p className="bs-event-lunar">{e.lunar}</p>}
      {(e.welcomeTime || e.startTime) && (
        <p className="iv-event-sub">
          {e.welcomeTime && (
            <span>
              <T vi="Đón khách" en="Welcome" /> {e.welcomeTime}
            </span>
          )}
          {e.startTime && (
            <span>
              <T vi="Khai tiệc" en="Dinner" /> {e.startTime}
            </span>
          )}
        </p>
      )}
      {(e.venue || e.address) && <RuyiMark className="bs-event-sep" />}
      {e.venue && <p className="bs-event-venue">{e.venue}</p>}
      {e.address && <p className="bs-event-address">{e.address}</p>}
      {e.showMap && (e.venue || e.address) && (
        <iframe
          className="iv-event-map"
          src={`https://maps.google.com/maps?q=${encodeURIComponent([e.venue, e.address].filter(Boolean).join(", "))}&z=15&output=embed`}
          title={`Bản đồ ${e.venue || e.title}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
      {(map || p) && (
        <div className="bs-event-actions">
          {map && (
            <a href={map} target="_blank" rel="noopener noreferrer">
              <T vi="Chỉ đường" en="Directions" />
            </a>
          )}
          {p && (
            <a href={calendarLink(e, title)} target="_blank" rel="noopener noreferrer">
              <T vi="Lưu vào lịch" en="Add to calendar" />
            </a>
          )}
        </div>
      )}
    </article>
  );
}

/* ───────────── layout ───────────── */

export default function BachSuTheme({ d, title, date, mono, guestName, highlights, wishes, show, labels, mainEvent }: ThemeCtx) {
  const lunar = date ? lunarLabel(d.date) : "";
  const when = mainEvent?.time && date ? `${mainEvent.time} · ${parseDate(mainEvent.date)?.weekday ?? date.weekday}` : date?.weekday;
  return (
    <>
      <section className="bs-cover bs-glazed">
        <span className="bs-band fret top" aria-hidden="true" />
        <PeonySpray className="bs-cover-spray iv-reveal" />
        <p className="bs-cover-kicker iv-reveal">
          <T vi="Lễ Thành Hôn" en="The Wedding of" />
        </p>
        <h1 className="bs-cover-names iv-reveal">
          <span>{d.groomName}</span>
          <i aria-hidden="true">
            <RuyiMark />
          </i>
          <span>{d.brideName}</span>
        </h1>
        <Vase src={d.cover} alt={`Ảnh cưới ${title}`} mono={mono} />
        {date && (
          <div className="bs-cover-date iv-reveal">
            {when && <span className="bs-cover-when">{when}</span>}
            <b>
              {date.dd}
              <i />
              {date.mm}
              <i />
              {date.y}
            </b>
            {lunar && <span className="bs-lunar">{lunar}</span>}
          </div>
        )}
        <span className="bs-band wave bottom" aria-hidden="true" />
      </section>

      {show.families && (
        <section className="iv-sec bs-glazed bs-families">
          <div className="bs-fam-grid">
            {[d.groomFamily, d.brideFamily].map((f, i) => (
              <div key={i} className="bs-fam iv-reveal">
                <h2>
                  <FamilyTitle which={i ? "brideFamily" : "groomFamily"} />
                </h2>
                <p className="bs-parents">{f.parents}</p>
                {f.address && <p className="bs-addr">{f.address}</p>}
              </div>
            ))}
            <span className="bs-fam-seal" aria-hidden="true">
              囍
            </span>
          </div>
        </section>
      )}

      {show.couple && (
        <section className="iv-sec bs-glazed bs-couple">
          <Announce className="bs-announce" />
          <Plate src={d.couplePhoto || d.cover} alt={`Ảnh cô dâu chú rể ${title}`} mono={mono} className="bs-couple-plate iv-reveal" />
          <div className="bs-couple-names">
            <div className="bs-person iv-reveal">
              <em>{labels.first}</em>
              <b>{d.groomFullName || d.groomName}</b>
              <PersonTitle which="groom" />
            </div>
            <span className="bs-couple-amp iv-reveal" aria-hidden="true">
              &amp;
            </span>
            <div className="bs-person iv-reveal">
              <em>{labels.second}</em>
              <b>{d.brideFullName || d.brideName}</b>
              <PersonTitle which="bride" />
            </div>
          </div>
        </section>
      )}

      {show.invite && (
        <section className="iv-sec bs-glazed bs-invite">
          <span className="bs-band fret top" aria-hidden="true" />
          {d.quote && (
            <p className="bs-quote iv-reveal">
              <Bi k="quote" />
            </p>
          )}
          <p className="bs-inv-heading iv-reveal">
            <Bi k="inviteHeading" />
          </p>
          <div className="bs-guest iv-reveal">
            <Cartouche />
            <p>{guestName}</p>
          </div>
          <p className="bs-inv-line iv-reveal">
            <Bi k="inviteLine" />
          </p>
          <div className="bs-trio iv-reveal">
            {[date?.dd, date?.mm, date?.y].map((label, i) => (
              <Plate key={i} small src={highlights[i] ?? ""} alt={`Ảnh cưới ${i + 1}`} mono={mono}>
                {label && <b>{label}</b>}
              </Plate>
            ))}
          </div>
        </section>
      )}

      {show.events && d.events.length > 0 && (
        <section className="iv-sec bs-cobalt bs-events">
          <span className="bs-band wave top" aria-hidden="true" />
          <Heading kicker={<T vi="Trân trọng kính mời" en="Join us at" />}>
            <T vi="Hôn lễ" en="The ceremony" />
          </Heading>
          <div className="bs-event-list">
            {d.events.map((e) => (
              <Event key={e.id} e={e} title={title} />
            ))}
          </div>
          <span className="bs-band wave bottom" aria-hidden="true" />
        </section>
      )}

      {(show.calendar || show.countdown) && date && (
        <section className="iv-sec bs-glazed bs-when">
          <Heading kicker={<T vi="Ngày chung đôi" en="Save the date" />}>
            Tháng {date.mm} · {date.y}
          </Heading>
          {show.calendar && (
            <div className="bs-cal-wrap iv-reveal">
              <Calendar date={d.date} />
            </div>
          )}
          {show.countdown && (
            <div className="iv-reveal">
              <Countdown date={d.date} />
            </div>
          )}
        </section>
      )}

      {show.gallery && d.gallery.length > 0 && (
        <section className="iv-sec bs-glazed bs-album">
          <span className="bs-band fret top" aria-hidden="true" />
          <Heading kicker={<T vi="Khoảnh khắc" en="Moments" />}>Album ảnh cưới</Heading>
          <Gallery photos={d.gallery} mono={mono} />
        </section>
      )}

      {wishes}

      {show.gift && d.gift.enabled && (
        <section className="iv-sec bs-glazed bs-gift">
          <Heading kicker={<T vi="Gửi trao yêu thương" en="With love" />}>
            <T vi="Mừng cưới" en="Wedding gift" />
          </Heading>
          <p className="bs-gift-note iv-reveal">
            <T vi="Gửi lời chúc phúc và quà mừng đến cô dâu chú rể" en="Send your blessings and a wedding gift" />
          </p>
          <div className="iv-reveal">
            <GiftReveal groom={d.gift.groom} bride={d.gift.bride} />
          </div>
        </section>
      )}

      {show.thanks && (
        <section className="iv-sec iv-thanks bs-thanks">
          <Photo src={d.thanksPhoto || d.cover} alt="" mono="" className="iv-thanks-bg" />
          <div className="iv-thanks-body">
            <PeonySpray className="bs-thanks-spray iv-reveal" />
            <h2 className="iv-reveal">Thank you</h2>
            <p className="iv-reveal">
              <Bi k="thanks" />
            </p>
          </div>
        </section>
      )}
    </>
  );
}
