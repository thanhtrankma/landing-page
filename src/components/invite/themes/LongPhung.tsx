"use client";

import { lunarLabel } from "@/lib/invites/lunar";
import { mapsLink, parseDate, type InviteEvent } from "@/lib/invites/types";
import { calendarLink, Calendar, Countdown, Gallery, GiftReveal, Photo } from "../parts";
import { Announce, Bi, FamilyTitle, PersonTitle, T } from "../lang";
import type { ReactNode } from "react";
import type { ThemeCtx } from "./types";
import "./long-phung.css";

// "Long Phụng": a traditional Vietnamese wedding card. Dragon and phoenix face a gold 囍 medallion on a deep
// lacquer cover, auspicious cloud scrolls (mây), double gold line frames with key-fret corners, and cream paper
// sections alternating with deep-colour ones. Every ornament is drawn here as inline SVG coloured with
// var(--c1) / var(--c2), so the colour variants recolour the whole card. Styles: long-phung.css.

/* ───────────── geometry helpers (deterministic, rounded: identical on server and client) ───────────── */

const r2 = (n: number) => Math.round(n * 100) / 100;
type Pt = [number, number];
type Seg = [Pt, Pt, Pt, Pt];

const bez = ([a, b, c, d]: Seg, t: number): Pt => {
  const u = 1 - t;
  return [
    u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
    u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
  ];
};

const poly = (pts: Pt[], close = false) => `M${pts.map(([x, y]) => `${r2(x)} ${r2(y)}`).join(" L")}${close ? " Z" : ""}`;

/** An inward spiral (the curl at the end of a cloud scroll). */
const spiral = (cx: number, cy: number, r: number, turns = 1.35, start = 0, dir = 1) => {
  const n = 28;
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = start + dir * t * turns * Math.PI * 2;
    const rr = r * (1 - t * 0.82);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return poly(pts);
};

const gold = { fill: "var(--c2)" } as const;
const goldLine = { stroke: "var(--c2)", fill: "none" } as const;
const deep = { fill: "var(--c1)" } as const;

/* ───────────── ornaments ───────────── */

/** Auspicious cloud scroll (mây): a lobed cloud with curled ends and a trailing ribbon. */
function Cloud({ className = "", tail = true }: { className?: string; tail?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 124 50" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path
        d="M14 40 C4 40 2 28 10 24 C8 14 20 8 28 14 C32 4 48 2 54 12 C60 6 72 8 74 18 C82 14 94 20 90 30 C98 30 102 38 96 41 Z"
        style={{ fill: "var(--lp-cloud-fill, transparent)", stroke: "var(--c2)" }}
        strokeWidth="1.5"
      />
      <path d={spiral(24, 28, 8, 1.3, Math.PI, 1)} style={goldLine} strokeWidth="1.3" />
      <path d={spiral(48, 22, 9, 1.3, Math.PI * 1.1, 1)} style={goldLine} strokeWidth="1.3" />
      <path d={spiral(74, 28, 7, 1.25, 0, -1)} style={goldLine} strokeWidth="1.3" />
      {tail && <path d="M96 41 C106 42 110 36 118 38 C121 39 122 42 119 44" style={goldLine} strokeWidth="1.3" />}
    </svg>
  );
}

/** Double gold line corner with a key-fret hook and a small curl. Rotated into the four corners by CSS. */
function Corner({ className = "" }: { className?: string }) {
  return (
    <svg className={`lp-corner ${className}`} viewBox="0 0 64 64" aria-hidden="true" strokeLinecap="square">
      <path d="M2 62 V2 H62" style={goldLine} strokeWidth="1.6" />
      <path d="M9 62 V9 H62" style={goldLine} strokeWidth="0.9" />
      <path d="M9 30 H22 V16 H16 V24" style={goldLine} strokeWidth="1.3" />
      <path d="M30 9 V22 H16" style={goldLine} strokeWidth="1.3" />
      <path d={spiral(40, 20, 6, 1.2, Math.PI, 1)} style={goldLine} strokeWidth="1.1" />
      <path d={spiral(20, 40, 6, 1.2, -Math.PI / 2, -1)} style={goldLine} strokeWidth="1.1" />
      <rect x="0" y="0" width="5" height="5" style={gold} transform="rotate(45 2.5 2.5) translate(-0.5 -0.5)" />
    </svg>
  );
}

function Corners() {
  return (
    <>
      <Corner className="tl" />
      <Corner className="tr" />
      <Corner className="bl" />
      <Corner className="br" />
    </>
  );
}

/* Dragon body: an S-shaped chain of cubic segments, tail at the bottom left, neck rising to the right. */
const DRAGON: Seg[] = [
  [[8, 104], [20, 118], [42, 114], [50, 96]],
  [[50, 96], [58, 76], [36, 62], [50, 46]],
  [[50, 46], [64, 30], [90, 42], [94, 62]],
  [[94, 62], [98, 84], [122, 90], [130, 70]],
  [[130, 70], [135, 58], [132, 50], [140, 42]],
];

function dragonGeometry() {
  const center: Pt[] = [];
  const steps = 16;
  DRAGON.forEach((s, si) => {
    for (let i = si ? 1 : 0; i <= steps; i++) center.push(bez(s, i / steps));
  });
  const n = center.length;
  const width = (i: number) => {
    const t = i / (n - 1);
    return 1 + 6.2 * Math.sin(Math.min(1, t * 1.25) * Math.PI * 0.62) - (t > 0.85 ? (t - 0.85) * 8 : 0);
  };
  const normal = (i: number): Pt => {
    const a = center[Math.max(0, i - 1)];
    const b = center[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    return [-dy / len, dx / len];
  };
  const left: Pt[] = [];
  const right: Pt[] = [];
  const fins: string[] = [];
  const scales: string[] = [];
  for (let i = 0; i < n; i++) {
    const [px, py] = center[i];
    const [nx, ny] = normal(i);
    const w = width(i);
    left.push([px + nx * w, py + ny * w]);
    right.push([px - nx * w, py - ny * w]);
    if (i > 4 && i < n - 6 && i % 3 === 0) {
      // dorsal fin: a small flame on the outer side, leaning back towards the tail
      const back = center[i - 2];
      const tip: Pt = [px + nx * (w + 6.5) + (back[0] - px) * 0.6, py + ny * (w + 6.5) + (back[1] - py) * 0.6];
      fins.push(poly([[px + nx * w, py + ny * w], tip, [back[0] + nx * width(i - 2), back[1] + ny * width(i - 2)]], true));
    }
    if (i > 3 && i < n - 4 && i % 2 === 1) {
      // scale: a shallow chevron across the body
      const a = center[i - 1];
      const ww = w * 0.62;
      scales.push(poly([[px + nx * ww, py + ny * ww], [a[0], a[1]], [px - nx * ww, py - ny * ww]]));
    }
  }
  // legs reach down and forward into the open space under the humps, ending in three curled claws
  const legAt = (i: number, dx: number, dy: number) => {
    const [px, py] = center[i];
    const knee: Pt = [px + dx, py + dy];
    const foot: Pt = [knee[0] + dx * 0.35, knee[1] + dy * 0.7];
    const [fx, fy] = foot;
    return {
      leg: poly([[px, py], knee, foot]),
      claws: [
        `M${r2(fx)} ${r2(fy)} q4 -3 6 0`,
        `M${r2(fx)} ${r2(fy)} q5 1 4 5`,
        `M${r2(fx)} ${r2(fy)} q1 4 -2 6`,
      ],
    };
  };
  return {
    body: `${poly(left)} L${right.reverse().map(([x, y]) => `${r2(x)} ${r2(y)}`).join(" L")} Z`,
    spine: poly(center.slice(3, n - 2)),
    fins,
    scales,
    legs: [legAt(22, 8, 7), legAt(57, 5, 9)],
  };
}

const DG = dragonGeometry();

/** Stylised dragon (long) facing right, ending at its head near x ≈ 172. */
function Dragon() {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      {DG.fins.map((f, i) => (
        <path key={`f${i}`} d={f} style={gold} />
      ))}
      {DG.legs.map((l, i) => (
        <g key={`l${i}`} style={goldLine}>
          <path d={l.leg} strokeWidth="3.2" />
          {l.claws.map((c, k) => (
            <path key={k} d={c} strokeWidth="1.5" />
          ))}
        </g>
      ))}
      <path d={DG.body} style={gold} />
      <path d={DG.spine} style={{ stroke: "var(--c1)", fill: "none" }} strokeWidth="0.8" strokeDasharray="1.5 2.5" />
      {DG.scales.map((s, i) => (
        <path key={`s${i}`} d={s} style={{ stroke: "var(--c1)", fill: "none" }} strokeWidth="0.7" opacity="0.75" />
      ))}
      {/* tail flame */}
      <path d="M8 104 C0 100 -2 92 4 88 C4 94 8 96 10 98 C8 92 10 86 16 84 C14 92 16 98 12 104 Z" style={gold} />
      {/* head */}
      <g transform="translate(140 42) rotate(-8)">
        <path d="M-2 -6 C-8 -14 -14 -10 -18 -18 C-16 -8 -12 -4 -18 0 C-12 2 -8 4 -14 10 C-6 8 -2 6 0 4 Z" style={gold} />
        <path d="M-2 -7 C4 -13 15 -14 22 -9 L31 -7 C34 -5 33 -1 29 -1 L21 0 L29 4 C28 8 20 9 15 6 C9 8 3 7 -2 5 Z" style={gold} />
        <circle cx="13" cy="-6" r="1.7" style={deep} />
        <path d="M17 -10 C14 -12 10 -11 8 -9" style={{ stroke: "var(--c1)", fill: "none" }} strokeWidth="0.9" />
        <path d="M21 1 H28" style={{ stroke: "var(--c1)", fill: "none" }} strokeWidth="0.9" />
        <g style={goldLine} strokeWidth="1.6">
          <path d="M6 -11 C2 -20 -6 -24 -12 -23" />
          <path d="M11 -12 C9 -21 3 -27 -3 -29" />
        </g>
        <g style={goldLine} strokeWidth="1">
          <path d="M30 -5 C37 -9 40 -16 36 -21 C34 -23 31 -22 32 -19" />
          <path d="M27 5 C34 9 37 16 32 21 C30 23 27 21 29 19" />
        </g>
      </g>
    </g>
  );
}

/** Stylised phoenix (phụng) facing right; mirrored into place by its parent group. */
function Phoenix() {
  const wing = Array.from({ length: 6 }, (_, k) => {
    const a = ((-104 - k * 11) * Math.PI) / 180;
    const len = 50 - k * 4;
    const bx = 106 - k * 2;
    const by = 62;
    const tx = bx + Math.cos(a) * len;
    const ty = by + Math.sin(a) * len;
    const ca = a + 0.32;
    const cb = a - 0.22;
    return `M${bx} ${by} Q${r2(bx + Math.cos(ca) * len * 0.62)} ${r2(by + Math.sin(ca) * len * 0.62)} ${r2(tx)} ${r2(ty)} Q${r2(bx + Math.cos(cb) * len * 0.55)} ${r2(by + Math.sin(cb) * len * 0.55)} ${bx + 6} ${by} Z`;
  });
  // tail: five long tapered plumes sweeping back, each ending in an "eye"
  const tail = Array.from({ length: 5 }, (_, k) => {
    const b: Pt = [84, 80];
    const e: Pt = [8 + k * 9, 30 + k * 20];
    const c1: Pt = [60 - k * 4, 82 + k * 6];
    const c2: Pt = [e[0] + 30, e[1] + 30 - k * 4];
    const len = Math.hypot(e[0] - b[0], e[1] - b[1]);
    const w = 5.2 - k * 0.4;
    const [ox, oy] = [(-(e[1] - b[1]) / len) * w, ((e[0] - b[0]) / len) * w];
    const f = (p: Pt, sx: number) => `${r2(p[0] + ox * sx)} ${r2(p[1] + oy * sx)}`;
    return {
      d: `M${b[0]} ${b[1]} C${f(c1, 1)} ${f(c2, 1)} ${e[0]} ${e[1]} C${f(c2, -1)} ${f(c1, -1)} ${b[0]} ${b[1]} Z`,
      vein: `M${b[0]} ${b[1]} C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${e[0]} ${e[1]}`,
      ex: e[0],
      ey: e[1],
    };
  });
  const crest = [0, 1, 2].map((k) => {
    const ex = 128 - k * 6;
    const ey = 16 - k * 3 + k * k * 2;
    return { d: `M141 31 C${138 - k * 2} ${24 - k} ${133 - k * 4} ${20 - k} ${ex} ${ey}`, ex, ey };
  });
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      {tail.map((t, k) => (
        <g key={`t${k}`}>
          <path d={t.d} style={gold} />
          <path d={t.vein} style={{ stroke: "var(--c1)", fill: "none", opacity: 0.5 }} strokeWidth="0.6" />
          <ellipse cx={t.ex} cy={t.ey} rx="6" ry="4.2" style={gold} transform={`rotate(${-30 + k * 14} ${t.ex} ${t.ey})`} />
          <ellipse cx={t.ex} cy={t.ey} rx="3.4" ry="2.2" style={{ fill: "none", stroke: "var(--c1)" }} strokeWidth="0.8" transform={`rotate(${-30 + k * 14} ${t.ex} ${t.ey})`} />
          <circle cx={t.ex} cy={t.ey} r="1.2" style={deep} />
        </g>
      ))}
      {wing.map((w, k) => (
        <path key={`w${k}`} d={w} style={{ fill: "var(--c2)", stroke: "var(--c1)", opacity: 1 - k * 0.07 }} strokeWidth="0.8" />
      ))}
      <path d="M78 80 C84 62 104 54 118 58 C128 60 132 68 128 76 C120 88 96 92 78 80 Z" style={gold} />
      <path d="M90 76 C98 70 110 68 120 72" style={{ stroke: "var(--c1)", fill: "none" }} strokeWidth="0.8" />
      <path d="M94 82 C102 77 112 76 118 79" style={{ stroke: "var(--c1)", fill: "none" }} strokeWidth="0.8" />
      <path d="M118 62 C124 52 128 44 135 37 C139 33 145 32 148 35 L157 38 L148 41 C144 45 140 49 137 55 C133 61 131 65 129 70 Z" style={gold} />
      <circle cx="143" cy="36.5" r="1.5" style={deep} />
      {crest.map((c, k) => (
        <g key={`c${k}`}>
          <path d={c.d} style={goldLine} strokeWidth="1.2" />
          <circle cx={c.ex} cy={c.ey} r="2.2" style={gold} />
        </g>
      ))}
      <path d="M146 41 C148 48 146 54 141 56" style={goldLine} strokeWidth="1" />
    </g>
  );
}

/** Cover crest: dragon (left) and phoenix (right) facing a 囍 medallion, over cloud scrolls. */
function Crest({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 360 160" aria-hidden="true">
      <g transform="translate(-2 8) scale(0.8)">
        <Dragon />
      </g>
      <g transform="translate(362 8) scale(-0.8 0.8)">
        <Phoenix />
      </g>
      <g transform="translate(180 72)">
        <circle r="38" style={{ fill: "color-mix(in srgb, var(--c1) 82%, #000)", stroke: "var(--c2)" }} strokeWidth="1.6" />
        <circle r="33" style={goldLine} strokeWidth="0.7" strokeDasharray="2 3" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * Math.PI) / 6;
          return <circle key={i} cx={r2(Math.cos(a) * 43)} cy={r2(Math.sin(a) * 43)} r="1.6" style={gold} />;
        })}
        <text className="lp-hy" textAnchor="middle" dominantBaseline="central" y="1" style={gold}>
          囍
        </text>
      </g>
      <g style={goldLine} strokeWidth="1.2" strokeLinecap="round">
        <path d={`${spiral(140, 136, 9, 1.3, 0, -1)}`} />
        <path d={`${spiral(220, 136, 9, 1.3, Math.PI, 1)}`} />
        <path d="M60 146 C90 146 110 128 140 136 M300 146 C270 146 250 128 220 136 M140 145 C160 152 200 152 220 145" />
      </g>
    </svg>
  );
}

/** Thin gold rule with clouds and a small 囍 in a diamond. */
function Divider({ className = "" }: { className?: string }) {
  return (
    <div className={`lp-divider ${className}`} aria-hidden="true">
      <span className="lp-rule" />
      <svg viewBox="0 0 120 30">
        <path d={spiral(22, 15, 8, 1.25, 0, -1)} style={goldLine} strokeWidth="1.2" />
        <path d={spiral(98, 15, 8, 1.25, Math.PI, 1)} style={goldLine} strokeWidth="1.2" />
        <path d="M30 15 H44 M76 15 H90" style={goldLine} strokeWidth="1.2" />
        <rect x="49" y="4" width="22" height="22" transform="rotate(45 60 15)" style={{ fill: "none", stroke: "var(--c2)" }} strokeWidth="1.2" />
        <text className="lp-hy" x="60" y="16" textAnchor="middle" dominantBaseline="central" fontSize="13" style={{ fill: "var(--lp-div-hy, var(--c2))" }}>
          囍
        </text>
      </svg>
      <span className="lp-rule" />
    </div>
  );
}

/** Hanging lantern (đèn lồng) in the main colour with gold caps and tassel. */
function Lantern({ className = "", defs = false }: { className?: string; defs?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 40 120" aria-hidden="true" strokeLinecap="round">
      <path d="M20 0 V30" style={goldLine} strokeWidth="1" />
      <rect x="12" y="28" width="16" height="5" rx="1.5" style={gold} />
      <ellipse cx="20" cy="50" rx="17" ry="18" style={deep} />
      <ellipse cx="20" cy="50" rx="17" ry="18" style={{ fill: "url(#lp-lantern-shine)" }} />
      <ellipse cx="20" cy="50" rx="8.5" ry="18" style={{ fill: "none", stroke: "var(--c2)", opacity: 0.6 }} strokeWidth="0.8" />
      <path d="M20 32 V68 M3 50 H37" style={{ stroke: "var(--c2)", opacity: 0.45 }} strokeWidth="0.8" />
      <text className="lp-hy" x="20" y="51" textAnchor="middle" dominantBaseline="central" fontSize="13" style={gold}>
        囍
      </text>
      <rect x="12" y="67" width="16" height="5" rx="1.5" style={gold} />
      <circle cx="20" cy="76" r="2.2" style={gold} />
      <path d="M20 78 V104 M17 79 L15 100 M23 79 L25 100" style={goldLine} strokeWidth="1.1" />
      {defs && <defs>
        <radialGradient id="lp-lantern-shine" cx="35%" cy="32%" r="70%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.32" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.3" />
        </radialGradient>
      </defs>}
    </svg>
  );
}

/** Section heading: small caps kicker over a large script title. */
function Heading({ kicker, children }: { kicker: ReactNode; children: ReactNode }) {
  return (
    <header className="lp-heading iv-reveal">
      <p className="lp-kicker">{kicker}</p>
      <h2 className="lp-title">{children}</h2>
    </header>
  );
}

/* ───────────── event card ───────────── */

function Event({ e, title }: { e: InviteEvent; title: string }) {
  const p = parseDate(e.date);
  const map = mapsLink(e);
  return (
    <article className="lp-event iv-reveal">
      <Cloud className="lp-event-cloud l" tail={false} />
      <Cloud className="lp-event-cloud r" tail={false} />
      <h3>{e.title || "Sự kiện"}</h3>
      {p && (
        <div className="lp-event-date">
          <span>{e.time || p.weekday}</span>
          <b>{p.dd}</b>
          <span>
            Tháng {p.mm}
            <br />
            {p.y}
          </span>
        </div>
      )}
      {p && <p className="lp-event-weekday">{p.weekday}</p>}
      {e.lunar && <p className="lp-event-lunar">{e.lunar}</p>}
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
      {(e.venue || e.address) && <span className="lp-event-sep" aria-hidden="true" />}
      {e.venue && <p className="lp-event-venue">{e.venue}</p>}
      {e.address && <p className="lp-event-address">{e.address}</p>}
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
        <div className="lp-event-actions">
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

export default function LongPhungTheme({ d, title, date, mono, guestName, highlights, wishes, show, labels, mainEvent }: ThemeCtx) {
  const lunar = date ? lunarLabel(d.date) : "";
  const when = mainEvent?.time && date ? `${mainEvent.time} · ${parseDate(mainEvent.date)?.weekday ?? date.weekday}` : date?.weekday;
  return (
    <>
      <section className="lp-cover lp-deep">
        <Corners />
        <Crest className="lp-crest iv-reveal" />
        <p className="lp-cover-kicker iv-reveal">
          <T vi="Lễ Thành Hôn" en="The Wedding of" />
        </p>
        <h1 className="lp-cover-names iv-reveal">
          <span>{d.groomName}</span>
          <i>&amp;</i>
          <span>{d.brideName}</span>
        </h1>
        {date && (
          <div className="lp-cover-date iv-reveal">
            <span>{when}</span>
            <b>
              {date.dd}
              <i>·</i>
              {date.mm}
              <i>·</i>
              {date.y}
            </b>
            {lunar && <span>{lunar}</span>}
          </div>
        )}
        <div className="lp-arch iv-reveal">
          <Photo src={d.cover} alt={`Ảnh cưới ${title}`} mono={mono} className="lp-arch-photo" />
        </div>
        <div className="lp-cover-clouds" aria-hidden="true">
          <Cloud className="l" />
          <Cloud className="r" />
        </div>
      </section>

      {show.families && (
        <section className="iv-sec lp-paper lp-families">
          <Divider className="iv-reveal" />
          <div className="lp-fam-grid">
            {[d.groomFamily, d.brideFamily].map((f, i) => (
              <div key={i} className="lp-fam iv-reveal">
                <h2>
                  <FamilyTitle which={i ? "brideFamily" : "groomFamily"} />
                </h2>
                <p className="lp-parents">{f.parents}</p>
                {f.address && <p className="lp-addr">{f.address}</p>}
              </div>
            ))}
            <span className="lp-fam-bar" aria-hidden="true">
              囍
            </span>
          </div>
        </section>
      )}

      {show.couple && (
        <section className="iv-sec lp-deep lp-couple">
          <Corners />
          <Announce className="lp-announce" />
          <div className="lp-couple-grid">
            <div className="lp-person iv-reveal">
              <em>{labels.first}</em>
              <b>{d.groomFullName || d.groomName}</b>
              <PersonTitle which="groom" />
            </div>
            <span className="lp-couple-amp iv-reveal" aria-hidden="true">
              &amp;
            </span>
            <div className="lp-person iv-reveal">
              <em>{labels.second}</em>
              <b>{d.brideFullName || d.brideName}</b>
              <PersonTitle which="bride" />
            </div>
          </div>
          <div className="lp-medal iv-reveal">
            <Photo src={d.couplePhoto || d.cover} alt={`Ảnh cô dâu chú rể ${title}`} mono={mono} />
          </div>
        </section>
      )}

      {show.invite && (
        <section className="iv-sec lp-paper lp-invite">
          <Lantern className="lp-lantern l" defs />
          <Lantern className="lp-lantern r" />
          {d.quote && (
            <p className="lp-quote iv-reveal">
              <Bi k="quote" />
            </p>
          )}
          <p className="lp-inv-heading iv-reveal">
            <Bi k="inviteHeading" />
          </p>
          <p className="lp-guest iv-reveal">{guestName}</p>
          <p className="lp-inv-line iv-reveal">
            <Bi k="inviteLine" />
          </p>
          <div className="lp-trio iv-reveal">
            {[date?.dd, date?.mm, date?.y].map((label, i) => (
              <Photo key={i} src={highlights[i] ?? ""} alt={`Ảnh cưới ${i + 1}`} mono={mono}>
                <b>{label}</b>
              </Photo>
            ))}
          </div>
        </section>
      )}

      {show.events && d.events.length > 0 && (
        <section className="iv-sec lp-deep lp-events">
          <Corners />
          <Heading kicker={<T vi="Trân trọng kính mời" en="Join us at" />}>
            <T vi="Hôn lễ" en="The ceremony" />
          </Heading>
          <div className="lp-event-list">
            {d.events.map((e) => (
              <Event key={e.id} e={e} title={title} />
            ))}
          </div>
        </section>
      )}

      {(show.calendar || show.countdown) && date && (
        <section className="iv-sec lp-paper lp-when">
          <Heading kicker={<T vi="Ngày chung đôi" en="Save the date" />}>
            Tháng {date.mm} · {date.y}
          </Heading>
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

      {show.gallery && d.gallery.length > 0 && (
        <section className="iv-sec lp-deep lp-album">
          <Corners />
          <Heading kicker={<T vi="Khoảnh khắc" en="Moments" />}>Album ảnh cưới</Heading>
          <Gallery photos={d.gallery} mono={mono} />
        </section>
      )}

      {wishes}

      {show.gift && d.gift.enabled && (
        <section className="iv-sec lp-paper lp-gift">
          <Divider className="iv-reveal" />
          <p className="lp-gift-note iv-reveal">
            <T vi="Gửi lời chúc phúc và quà mừng đến cô dâu chú rể" en="Send your blessings and a wedding gift" />
          </p>
          <div className="iv-reveal">
            <GiftReveal groom={d.gift.groom} bride={d.gift.bride} />
          </div>
        </section>
      )}

      {show.thanks && (
        <section className="iv-sec iv-thanks lp-thanks">
          <Photo src={d.thanksPhoto || d.cover} alt="" mono="" className="iv-thanks-bg" />
          <div className="iv-thanks-body">
            <span className="lp-thanks-hy iv-reveal" aria-hidden="true">
              囍
            </span>
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
