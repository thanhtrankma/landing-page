"use client";

import { useId, type ReactNode } from "react";
import { lunarLabel } from "@/lib/invites/lunar";
import { mapsLink, parseDate, type InviteEvent } from "@/lib/invites/types";
import { calendarLink, Calendar, Countdown, Gallery, GiftReveal, Photo } from "../parts";
import { Announce, Bi, FamilyTitle, PersonTitle, T } from "../lang";
import type { ThemeCtx } from "./types";
import "./lau-dai.css";

// "Lâu Đài": a fairy-tale castle at dusk. Cream stone towers with conical roofs and waving pennants rise out of
// a starry sky on the cover, and the couple's photo stands in the castle's own gateway. Stone arches frame the
// photos, a crowned heraldic shield carries the monogram, and royal ribbon banners hold the dates. Every
// ornament is drawn below as inline SVG coloured through var(--c1) (roofs, sky, shield) and var(--c2) (gilt),
// so the colour variants recolour the whole card. Styles: lau-dai.css.

/* ───────────── deterministic geometry helpers (rounded: identical on server and client) ───────────── */

const r2 = (n: number) => Math.round(n * 100) / 100;
const DEG = Math.PI / 180;
const pt = (cx: number, cy: number, r: number, a: number) => `${r2(cx + Math.cos(a * DEG) * r)} ${r2(cy + Math.sin(a * DEG) * r)}`;

/** SVG-safe unique id per instance (url(#…) dislikes the characters React puts in its ids). */
function useSvgId(prefix: string) {
  return prefix + useId().replace(/[^a-zA-Z0-9_-]/g, "");
}

/** Arch voussoirs: n wedge-shaped stones on the upper half circle (180° → 360°), keystone excluded. */
function voussoirs(cx: number, cy: number, rIn: number, rOut: number, n: number) {
  const step = 180 / n;
  return Array.from({ length: n }, (_, i) => {
    const a0 = 180 + i * step;
    const a1 = a0 + step;
    return {
      key: i === (n - 1) / 2,
      d: `M${pt(cx, cy, rOut, a0)} A${rOut} ${rOut} 0 0 1 ${pt(cx, cy, rOut, a1)} L${pt(cx, cy, rIn, a1)} A${rIn} ${rIn} 0 0 0 ${pt(cx, cy, rIn, a0)} Z`,
    };
  });
}

/** Window or doorway with a round top. */
const archWin = (x: number, y: number, w: number, h: number) => `M${x} ${y + h} V${r2(y + w / 2)} A${r2(w / 2)} ${r2(w / 2)} 0 0 1 ${x + w} ${r2(y + w / 2)} V${y + h} Z`;

const gilt = { fill: "var(--c2)" } as const;
const giltLine = { fill: "none", stroke: "var(--c2)" } as const;
const stone = { fill: "var(--ld-stone)", stroke: "var(--ld-joint)" } as const;
const stone2 = { fill: "var(--ld-stone-2)", stroke: "var(--ld-joint)" } as const;
const glow = { fill: "var(--ld-window)" } as const;

/* ───────────── ornaments ───────────── */

/** Swallow-tailed pennant on a pole whose top is at (x, y). The flag waves gently (CSS). */
function Pennant({ x, y, pole = 26, flip = false }: { x: number; y: number; pole?: number; flip?: boolean }) {
  return (
    <g>
      <path d={`M${x} ${y + pole} V${y}`} style={{ stroke: "var(--ld-pole)", fill: "none" }} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx={x} cy={y} r="2" style={gilt} />
      <g transform={`translate(${x} ${y + 2})${flip ? " scale(-1 1)" : ""}`}>
        <path className="ld-flag" d="M0 0 C9 -2 18 2 30 1 L22 6.5 L31 12 C19 11 10 14 0 12 Z" style={gilt} />
      </g>
    </g>
  );
}

/** Round tower with a curved conical roof, a corbelled ring and glowing arched windows. */
function Tower({ cx, hw, roofTop, ringY, bottom, windows, back = false, flip = false }: { cx: number; hw: number; roofTop: number; ringY: number; bottom: number; windows: number[]; back?: boolean; flip?: boolean }) {
  const ov = Math.round(hw * 0.28);
  const L = cx - hw;
  const R = cx + hw;
  const ww = Math.max(8, Math.round(hw * 0.36));
  return (
    <g>
      <rect x={L} y={ringY} width={hw * 2} height={bottom - ringY} style={back ? stone2 : stone} strokeWidth="0.8" />
      {/* shade on the far side of the round tower */}
      <rect x={r2(cx + hw * 0.35)} y={ringY} width={r2(hw * 0.65)} height={bottom - ringY} style={{ fill: "var(--ld-shade)" }} />
      {/* corbel ring with little brackets */}
      <rect x={L - ov} y={ringY - 6} width={(hw + ov) * 2} height="9" style={stone2} strokeWidth="0.8" />
      {Array.from({ length: Math.floor(((hw + ov) * 2) / 9) }, (_, i) => (
        <rect key={i} x={L - ov + 3 + i * 9} y={ringY + 3} width="4" height="5" style={stone2} strokeWidth="0.6" />
      ))}
      {/* curved fairy-tale roof */}
      <path d={`M${L - ov} ${ringY - 6} Q${r2(cx - hw * 0.35)} ${r2(ringY - (ringY - roofTop) * 0.45)} ${cx} ${roofTop} Q${r2(cx + hw * 0.35)} ${r2(ringY - (ringY - roofTop) * 0.45)} ${R + ov} ${ringY - 6} Z`} style={{ fill: back ? "var(--ld-roof-back)" : "var(--ld-roof)" }} />
      <path d={`M${r2(cx - hw * 0.55)} ${ringY - 7} Q${r2(cx - hw * 0.22)} ${r2(ringY - (ringY - roofTop) * 0.5)} ${cx} ${roofTop + 3}`} style={{ fill: "none", stroke: "var(--ld-roof-hi)" }} strokeWidth={back ? 2 : 3} strokeLinecap="round" />
      <path d={`M${L - ov} ${ringY - 6} H${R + ov}`} style={giltLine} strokeWidth="1.4" />
      {windows.map((y, i) => (
        <g key={i}>
          <path d={archWin(cx - ww / 2 - 2, y - 2, ww + 4, ww * 2.2 + 4)} style={stone2} strokeWidth="0.8" />
          <path className="ld-lit" d={archWin(cx - ww / 2, y, ww, ww * 2.2)} style={glow} />
          <path d={`M${cx} ${y + 2} V${r2(y + ww * 2.2)} M${cx - ww / 2} ${r2(y + ww * 1.2)} H${cx + ww / 2}`} style={{ stroke: "var(--ld-joint)", fill: "none" }} strokeWidth="0.8" />
        </g>
      ))}
      <Pennant x={cx} y={roofTop - (back ? 18 : 26)} pole={back ? 18 : 26} flip={flip} />
    </g>
  );
}

/** Cover castle (viewBox 0 -30 400 430). The gateway (x 104–296, top y 116) is left open: the cover photo shows through it. */
function Castle() {
  const id = useSvgId("ld-castle");
  const wall = "M70 96 H330 V400 H296 V212 A96 96 0 0 0 104 212 V400 H70 Z";
  const merlons = Array.from({ length: 10 }, (_, i) => r2(70 + i * (260 / 9.5)));
  const mw = r2(260 / 19);
  const rows = Array.from({ length: 17 }, (_, i) => 112 + i * 17);
  return (
    <svg className="ld-castle" viewBox="0 -30 400 430" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--ld-stone)" }} />
          <stop offset="1" style={{ stopColor: "var(--ld-stone-2)" }} />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <path d={wall} />
        </clipPath>
      </defs>

      {/* back towers, behind the gatehouse */}
      <Tower cx={123} hw={19} roofTop={-6} ringY={38} bottom={100} windows={[52]} back flip />
      <Tower cx={277} hw={19} roofTop={-6} ringY={38} bottom={100} windows={[52]} back />

      {/* gatehouse with battlements */}
      {merlons.map((x, i) => (
        <rect key={i} x={x} y="82" width={mw} height="15" style={stone} strokeWidth="0.8" />
      ))}
      <path d={wall} style={{ fill: `url(#${id}w)`, stroke: "var(--ld-joint)" }} strokeWidth="0.8" />
      <g clipPath={`url(#${id}c)`} style={{ stroke: "var(--ld-joint)", fill: "none" }} strokeWidth="0.7">
        {rows.map((y, i) => (
          <g key={i}>
            <path d={`M70 ${y} H330`} />
            {Array.from({ length: 9 }, (_, k) => {
              const x = 70 + k * 32 + (i % 2 ? 16 : 0);
              return <path key={k} d={`M${x} ${y} V${y + 17}`} />;
            })}
          </g>
        ))}
      </g>
      {/* gate arch: voussoirs, gilt keystone and jambs */}
      {voussoirs(200, 212, 96, 112, 13).map((v, i) => (
        <path key={i} d={v.d} style={v.key ? { fill: "var(--c2)", stroke: "var(--ld-joint)" } : i % 2 ? stone2 : stone} strokeWidth="0.8" />
      ))}
      {Array.from({ length: 7 }, (_, i) => {
        const y = 212 + i * 27;
        const w = i % 2 ? 12 : 16;
        return (
          <g key={i}>
            <rect x={104 - w} y={y} width={w} height="27" style={i % 2 ? stone : stone2} strokeWidth="0.8" />
            <rect x="296" y={y} width={w} height="27" style={i % 2 ? stone : stone2} strokeWidth="0.8" />
          </g>
        );
      })}
      <path d="M200 92 l5 8 h-10 z" style={gilt} />
      {/* banners hanging from the battlements */}
      {[97, 303].map((x) => (
        <g key={x}>
          <path d={`M${x - 8} 104 H${x + 8} V146 L${x} 138 L${x - 8} 146 Z`} style={{ fill: "var(--c1)" }} />
          <path d={`M${x - 8} 104 H${x + 8}`} style={giltLine} strokeWidth="2" />
          <path d={`M${x} 114 l3 5 l-3 5 l-3 -5 z`} style={gilt} />
        </g>
      ))}

      {/* front towers */}
      <Tower cx={44} hw={32} roofTop={8} ringY={118} bottom={400} windows={[150, 248]} flip />
      <Tower cx={356} hw={32} roofTop={8} ringY={118} bottom={400} windows={[150, 248]} />
    </svg>
  );
}

/** Crescent moon. */
function Moon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 60" aria-hidden="true">
      <circle cx="30" cy="30" r="26" style={{ fill: "var(--ld-moon-halo)" }} />
      <path d="M36 8 A22 22 0 1 0 50 44 A17 17 0 1 1 36 8 Z" style={{ fill: "var(--ld-moon)" }} />
    </svg>
  );
}

const STARS = Array.from({ length: 34 }, (_, i) => ({
  x: (i * 47 + 11) % 97,
  y: (i * 31 + 7) % 89,
  s: i % 7 === 0 ? 2 : i % 3 === 0 ? 1 : 0,
  d: (i * 0.7) % 4,
}));

/** Twinkling stars over a dusk section (positions are fixed, not random). */
function Stars({ count = 34, offset = 0 }: { count?: number; offset?: number }) {
  return (
    <div className="ld-stars" aria-hidden="true">
      {STARS.slice(0, count).map((s, i) => (
        <span key={i} className={`s${s.s}`} style={{ left: `${(s.x + offset * 13) % 97}%`, top: `${s.y}%`, animationDelay: `${r2(s.d)}s` }} />
      ))}
    </div>
  );
}

/** Small crown, used over headings and on the event seal. */
function CrownShape() {
  return (
    <g>
      <path d="M10 32 L6 10 L20 21 L32 4 L44 21 L58 10 L54 32 Z" style={gilt} />
      <rect x="9" y="32" width="46" height="5" rx="1" style={gilt} />
      <circle cx="6" cy="9" r="3" style={gilt} />
      <circle cx="32" cy="4" r="3" style={gilt} />
      <circle cx="58" cy="9" r="3" style={gilt} />
      <path d="M32 18 l3 5 l-3 5 l-3 -5 z" style={{ fill: "var(--c1)" }} />
    </g>
  );
}

function Crown({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 40" aria-hidden="true">
      <CrownShape />
    </svg>
  );
}

/** Laurel branch for the crest: leaves along a quadratic curve. */
function laurel() {
  const P0 = [102, 200];
  const P1 = [30, 186];
  const P2 = [46, 84];
  const at = (t: number) => {
    const u = 1 - t;
    return [u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0], u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1]];
  };
  const tan = (t: number) => {
    const dx = 2 * (1 - t) * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]);
    const dy = 2 * (1 - t) * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1]);
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };
  const stem = `M${P0[0]} ${P0[1]} Q${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`;
  const leaves = Array.from({ length: 9 }, (_, i) => {
    const t = 0.12 + i * 0.1;
    const [x, y] = at(t);
    const side = i % 2 ? 1 : -1;
    const a = tan(t) + side * 38;
    const ox = Math.cos(a * DEG) * 7;
    const oy = Math.sin(a * DEG) * 7;
    return { cx: r2(x + ox), cy: r2(y + oy), a: r2(a), s: r2(1 - i * 0.045) };
  });
  return { stem, leaves };
}
const LAUREL = laurel();

/** Heraldic crest: crown, shield with the monogram, laurel branches and a ribbon with the date. */
function Crest({ mono, motto, className = "" }: { mono: string; motto: string; className?: string }) {
  const half = (
    <g>
      <path d={LAUREL.stem} style={giltLine} strokeWidth="1.6" strokeLinecap="round" />
      {LAUREL.leaves.map((l, i) => (
        <ellipse key={i} cx={l.cx} cy={l.cy} rx={r2(8 * l.s)} ry={r2(3.3 * l.s)} transform={`rotate(${l.a} ${l.cx} ${l.cy})`} style={gilt} />
      ))}
    </g>
  );
  return (
    <svg className={className} viewBox="0 0 220 230" aria-hidden="true">
      {half}
      <g transform="translate(220 0) scale(-1 1)">{half}</g>
      <g transform="translate(78 4)">
        <CrownShape />
      </g>
      <path d="M66 50 H154 V104 C154 140 130 158 110 170 C90 158 66 140 66 104 Z" style={{ fill: "var(--c1)", stroke: "var(--c2)" }} strokeWidth="3" />
      <path d="M74 58 H146 V104 C146 134 127 150 110 160 C93 150 74 134 74 104 Z" style={giltLine} strokeWidth="1" />
      <path d="M110 64 V150 M80 100 H140" style={{ stroke: "var(--c2)", fill: "none", opacity: 0.28 }} strokeWidth="1" />
      <text className="ld-crest-mono" x="110" y="106" textAnchor="middle" dominantBaseline="central">
        {mono}
      </text>
      {/* ribbon */}
      <path d="M56 186 L32 189 L42 199 L32 210 L58 207 Z" style={{ fill: "var(--ld-ribbon-dark)" }} />
      <path d="M164 186 L188 189 L178 199 L188 210 L162 207 Z" style={{ fill: "var(--ld-ribbon-dark)" }} />
      <path d="M50 180 Q110 196 170 180 L170 202 Q110 218 50 202 Z" style={{ fill: "var(--c1)", stroke: "var(--c2)" }} strokeWidth="1.4" />
      <text className="ld-crest-motto" x="110" y="200" textAnchor="middle" dominantBaseline="central">
        {motto}
      </text>
    </svg>
  );
}

/** Battlement rule with a fleur-de-lis. */
function Divider({ className = "" }: { className?: string }) {
  return (
    <svg className={`ld-divider ${className}`} viewBox="0 0 240 28" aria-hidden="true">
      <path d="M4 18 H84 V12 H92 V18 H100 V12 H104 M136 12 H140 V18 H148 V12 H156 V18 H236" style={giltLine} strokeWidth="1.2" />
      <path d="M120 2 C127 8 127 15 120 22 C113 15 113 8 120 2 Z" style={gilt} />
      <path d="M117 18 C108 18 104 9 110 7 C113 6 116 10 118 15 M123 18 C132 18 136 9 130 7 C127 6 124 10 122 15" style={giltLine} strokeWidth="1.6" strokeLinecap="round" />
      <rect x="112" y="18" width="16" height="3" rx="1" style={gilt} />
      <path d="M120 21 V26" style={giltLine} strokeWidth="1.6" />
    </svg>
  );
}

/** Stone arch frame (viewBox 0 0 200 280) laid over a photo: voussoirs, keystone and jambs. */
function Gate({ src, alt, mono, className = "", children }: { src: string; alt: string; mono: string; className?: string; children?: ReactNode }) {
  return (
    <div className={`ld-gate ${className}`}>
      <Photo src={src} alt={alt} mono={mono} />
      <svg className="ld-gate-frame" viewBox="0 0 200 280" aria-hidden="true">
        {voussoirs(100, 100, 86, 100, 11).map((v, i) => (
          <path key={i} d={v.d} style={v.key ? { fill: "var(--c2)", stroke: "var(--ld-joint)" } : i % 2 ? stone2 : stone} strokeWidth="0.9" />
        ))}
        {Array.from({ length: 9 }, (_, i) => {
          const y = 100 + i * 20;
          const w = i % 2 ? 11 : 14;
          return (
            <g key={i}>
              <rect x={14 - w} y={y} width={w} height="20" style={i % 2 ? stone : stone2} strokeWidth="0.9" />
              <rect x="186" y={y} width={w} height="20" style={i % 2 ? stone : stone2} strokeWidth="0.9" />
            </g>
          );
        })}
      </svg>
      {children}
    </div>
  );
}

/** Royal ribbon banner with swallow-tailed ends (pure CSS around the text). */
function Ribbon({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`ld-ribbon ${className}`}>
      <span className="ld-ribbon-band">{children}</span>
    </div>
  );
}

/** Castle skyline silhouette for the thank-you photo. */
function Skyline({ className = "" }: { className?: string }) {
  const tower = (cx: number, hw: number, top: number, ring: number) =>
    `M${cx - hw} 120 V${ring} H${cx - hw - 4} Q${r2(cx - hw * 0.3)} ${r2(ring - (ring - top) * 0.45)} ${cx} ${top} Q${r2(cx + hw * 0.3)} ${r2(ring - (ring - top) * 0.45)} ${cx + hw + 4} ${ring} H${cx + hw} V120 Z`;
  return (
    <svg className={className} viewBox="0 0 400 120" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <g style={{ fill: "var(--ld-night)" }}>
        <path d="M0 120 V92 H40 V84 H48 V92 H58 V84 H66 V92 H120 V70 H128 V62 H136 V70 H144 V62 H152 V70 H160 V62 H168 V70 H232 V62 H240 V70 H248 V62 H256 V70 H264 V62 H272 V70 H280 V92 H334 V84 H342 V92 H352 V84 H360 V92 H400 V120 Z" />
        <path d={tower(96, 12, 30, 62)} />
        <path d={tower(304, 12, 30, 62)} />
        <path d={tower(200, 16, 22, 56)} />
        <path d={tower(20, 9, 50, 76)} />
        <path d={tower(380, 9, 50, 76)} />
      </g>
      <g style={{ fill: "var(--ld-window)" }}>
        <path className="ld-lit" d={archWin(196, 62, 8, 16)} />
        <path className="ld-lit" d={archWin(93, 78, 6, 12)} />
        <path className="ld-lit" d={archWin(301, 78, 6, 12)} />
        <path className="ld-lit" d={archWin(190, 92, 20, 28)} />
      </g>
      <path d="M200 22 V4" style={{ stroke: "var(--ld-night)" }} strokeWidth="1.6" />
      <path className="ld-flag" d="M200 4 C208 2 214 6 224 5 L217 9 L225 14 C215 13 208 16 200 14 Z" style={gilt} />
    </svg>
  );
}

/** Section heading: crown, small caps kicker and a large script title. */
function Heading({ kicker, children }: { kicker: ReactNode; children: ReactNode }) {
  return (
    <header className="ld-heading iv-reveal">
      <Crown className="ld-heading-crown" />
      <p className="ld-kicker">{kicker}</p>
      <h2 className="ld-title">{children}</h2>
    </header>
  );
}

/* ───────────── event card ───────────── */

function Event({ e, title, mono }: { e: InviteEvent; title: string; mono: string }) {
  const p = parseDate(e.date);
  const map = mapsLink(e);
  return (
    <article className="ld-event iv-reveal">
      <span className="ld-seal" aria-hidden="true">
        <i>{mono}</i>
      </span>
      <h3>{e.title || "Sự kiện"}</h3>
      {p && (
        <div className="ld-event-date">
          <span>
            {e.time && <b>{e.time}</b>}
            {p.weekday}
          </span>
          <strong>{p.dd}</strong>
          <span>
            <b>Tháng {p.mm}</b>
            {p.y}
          </span>
        </div>
      )}
      {e.lunar && <p className="ld-event-lunar">{e.lunar}</p>}
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
      {(e.venue || e.address) && <Divider className="ld-event-div" />}
      {e.venue && <p className="ld-event-venue">{e.venue}</p>}
      {e.address && <p className="ld-event-address">{e.address}</p>}
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
        <div className="ld-event-actions">
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

export default function LauDaiTheme({ d, title, date, mono, guestName, highlights, wishes, show, labels, mainEvent }: ThemeCtx) {
  const lunar = date ? lunarLabel(d.date) : "";
  const when = mainEvent?.time && date ? `${mainEvent.time} · ${parseDate(mainEvent.date)?.weekday ?? date.weekday}` : date?.weekday;
  const motto = date ? `${date.dd} · ${date.mm} · ${date.y}` : "Forever";
  return (
    <>
      {/* ── cover: dusk sky, castle, the photo in the gateway ── */}
      <section className="ld-cover ld-sky">
        <Stars />
        <Moon className="ld-moon" />
        <div className="ld-cover-head">
          <p className="ld-cover-kicker iv-reveal">
            <T vi="Lễ Thành Hôn" en="The Royal Wedding of" />
          </p>
          <h1 className="ld-cover-names iv-reveal">
            <span>{d.groomName}</span>
            <i>&amp;</i>
            <span>{d.brideName}</span>
          </h1>
        </div>
        <div className="ld-castle-wrap iv-reveal">
          <Photo src={d.cover} alt={`Ảnh cưới ${title}`} mono={mono} className="ld-gateway" />
          <Castle />
        </div>
        {date && (
          <div className="ld-cover-base">
            <Ribbon className="ld-cover-ribbon iv-reveal">
              {date.dd}
              <i>·</i>
              {date.mm}
              <i>·</i>
              {date.y}
            </Ribbon>
            <p className="ld-cover-when iv-reveal">
              {when}
              {lunar && <small>{lunar}</small>}
            </p>
          </div>
        )}
      </section>

      {/* ── announcement + families, under the crest ── */}
      {show.families && (
        <section className="iv-sec ld-parch ld-families">
          <Crest mono={mono} motto={motto} className="ld-crest iv-reveal" />
          <Announce className="ld-announce" />
          <div className="ld-fam-grid">
            {[d.groomFamily, d.brideFamily].map((f, i) => (
              <div key={i} className="ld-fam iv-reveal">
                <h2>
                  <FamilyTitle which={i ? "brideFamily" : "groomFamily"} />
                </h2>
                <p className="ld-parents">{f.parents}</p>
                {f.address && <p className="ld-addr">{f.address}</p>}
              </div>
            ))}
            <span className="ld-fam-bar" aria-hidden="true" />
          </div>
        </section>
      )}

      {/* ── couple ── */}
      {show.couple && (
        <section className="iv-sec ld-sky ld-couple">
          <Stars count={22} offset={3} />
          {!show.families && <Announce className="ld-announce on-sky" />}
          <Heading kicker={<T vi="Hoàng tử & Công chúa" en="The prince & the princess" />}>
            <T vi="Cô dâu & Chú rể" en="The couple" />
          </Heading>
          <Gate src={d.couplePhoto || d.cover} alt={`Ảnh cô dâu chú rể ${title}`} mono={mono} className="ld-couple-gate iv-reveal" />
          <div className="ld-couple-grid">
            <div className="ld-person iv-reveal">
              <em>{labels.first}</em>
              <b>{d.groomFullName || d.groomName}</b>
              <PersonTitle which="groom" />
            </div>
            <span className="ld-couple-amp iv-reveal" aria-hidden="true">
              &amp;
            </span>
            <div className="ld-person iv-reveal">
              <em>{labels.second}</em>
              <b>{d.brideFullName || d.brideName}</b>
              <PersonTitle which="bride" />
            </div>
          </div>
        </section>
      )}

      {/* ── invitation with the guest's name ── */}
      {show.invite && (
        <section className="iv-sec ld-parch ld-invite">
          {d.quote && (
            <p className="ld-quote iv-reveal">
              <Bi k="quote" />
            </p>
          )}
          <Divider className="iv-reveal" />
          <p className="ld-inv-heading iv-reveal">
            <Bi k="inviteHeading" />
          </p>
          <p className="ld-guest iv-reveal">{guestName}</p>
          <p className="ld-inv-line iv-reveal">
            <Bi k="inviteLine" />
          </p>
          <div className="ld-trio iv-reveal">
            {(
              [
                [date?.dd, <T key="d" vi="Ngày" en="Day" />],
                [date?.mm, <T key="m" vi="Tháng" en="Month" />],
                [date?.y, <T key="y" vi="Năm" en="Year" />],
              ] as const
            ).map(([label, cap], i) => (
              <figure key={i}>
                <Gate src={highlights[i] ?? ""} alt={`Ảnh cưới ${i + 1}`} mono={mono} />
                {label && (
                  <figcaption>
                    <b>{label}</b>
                    <small>{cap}</small>
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ── events ── */}
      {show.events && d.events.length > 0 && (
        <section className="iv-sec ld-sky ld-events">
          <Stars count={26} offset={5} />
          <Heading kicker={<T vi="Lễ & Tiệc" en="Ceremony & reception" />}>
            <T vi="Hôn lễ" en="The ceremony" />
          </Heading>
          <div className="ld-event-list">
            {d.events.map((e) => (
              <Event key={e.id} e={e} title={title} mono={mono} />
            ))}
          </div>
        </section>
      )}

      {/* ── calendar + countdown ── */}
      {(show.calendar || show.countdown) && date && (
        <section className="iv-sec ld-parch ld-when">
          <Heading kicker={<T vi="Ngày chung đôi" en="Save the date" />}>
            <T vi="Ngày vui" en="Our day" />
          </Heading>
          <Ribbon className="ld-when-ribbon iv-reveal">
            Tháng {date.mm} · {date.y}
          </Ribbon>
          {show.calendar && (
            <div className="iv-reveal">
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

      {/* ── album ── */}
      {show.gallery && d.gallery.length > 0 && (
        <section className="iv-sec ld-sky ld-album">
          <Stars count={24} offset={8} />
          <Heading kicker={<T vi="Khoảnh khắc" en="Moments" />}>
            <T vi="Album cổ tích" en="Our fairy tale" />
          </Heading>
          <Gallery photos={d.gallery} mono={mono} />
        </section>
      )}

      {wishes}

      {/* ── gift ── */}
      {show.gift && d.gift.enabled && (
        <section className="iv-sec ld-parch ld-gift">
          <Divider className="iv-reveal" />
          <h2 className="ld-gift-title iv-reveal">
            <T vi="Hộp mừng cưới" en="Wedding gift" />
          </h2>
          <p className="ld-gift-note iv-reveal">
            <T vi="Gửi lời chúc phúc và quà mừng đến cô dâu chú rể" en="Send your blessings and a wedding gift" />
          </p>
          <div className="iv-reveal">
            <GiftReveal groom={d.gift.groom} bride={d.gift.bride} />
          </div>
        </section>
      )}

      {/* ── thanks ── */}
      {show.thanks && (
        <section className="iv-sec iv-thanks ld-thanks">
          <Photo src={d.thanksPhoto || d.cover} alt="" mono="" className="iv-thanks-bg" />
          <Stars count={16} offset={2} />
          <div className="iv-thanks-body">
            <Crown className="ld-thanks-crown iv-reveal" />
            <h2 className="iv-reveal">Thank you</h2>
            <p className="iv-reveal">
              <Bi k="thanks" />
            </p>
            <p className="ld-thanks-sign iv-reveal">{title}</p>
          </div>
          <Skyline className="ld-skyline" />
        </section>
      )}
    </>
  );
}
