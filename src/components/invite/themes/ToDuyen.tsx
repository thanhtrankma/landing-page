"use client";

import { useId, type ReactNode } from "react";
import { lunarLabel } from "@/lib/invites/lunar";
import { mapsLink, parseDate, type InviteEvent } from "@/lib/invites/types";
import { Calendar, calendarLink, Countdown, Gallery, GiftReveal, Photo } from "../parts";
import { Announce, Bi, FamilyTitle, PersonTitle, T } from "../lang";
import type { ThemeCtx } from "./types";
import "./to-duyen.css";

// "Tơ Duyên": ivory silk paper, a gathered silk drape over the cover, twisted silk ribbons running across the
// sections, calla lilies in fine line-art tied with a thread, and the red thread of fate (sợi tơ hồng) that
// knots the two names together. Every ornament is drawn here in SVG and coloured only through var(--c1) /
// var(--c2) (or neutrals mixed with them), so the colour variants recolour the whole card.

/* ───────── deterministic helpers (identical on server and client) ───────── */

const r2 = (n: number) => Math.round(n * 100) / 100;
const mix = (c: "c1" | "c2", pct: number, base = "#fff") => `color-mix(in srgb, var(--${c}) ${pct}%, ${base})`;
const LINE = "var(--td-line)";

/** SVG-safe unique id (React's ids contain characters that url(#…) does not like). */
function useSvgId(prefix: string) {
  return prefix + useId().replace(/[^a-zA-Z0-9_-]/g, "");
}

/** Catmull-Rom → cubic Bézier through the points; `move` starts a new sub-path, otherwise it continues with L. */
function smooth(pts: [number, number][], move = true) {
  if (pts.length < 2) return "";
  let d = `${move ? "M" : "L"}${r2(pts[0][0])} ${r2(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    d += ` C${r2(p1[0] + (p2[0] - p0[0]) / 6)} ${r2(p1[1] + (p2[1] - p0[1]) / 6)} ${r2(p2[0] - (p3[0] - p1[0]) / 6)} ${r2(p2[1] - (p3[1] - p1[1]) / 6)} ${r2(p2[0])} ${r2(p2[1])}`;
  }
  return d;
}

/* ───────── silk ───────── */

type SilkTone = "rich" | "pale" | "gold";

const SILK_STOPS: Record<SilkTone, { front: string[]; back: string[] }> = {
  rich: {
    front: [mix("c1", 42), mix("c1", 78), mix("c1", 88, "#000")],
    back: [mix("c1", 70, "#000"), mix("c1", 52, "#000")],
  },
  pale: {
    front: [mix("c1", 8), mix("c1", 22), mix("c1", 36)],
    back: [mix("c1", 40), mix("c1", 30)],
  },
  gold: {
    front: [mix("c2", 40), mix("c2", 85), mix("c2", 80, "#5a5a5a")],
    back: [mix("c2", 70, "#4a4a4a"), mix("c2", 60, "#3a3a3a")],
  },
};

/**
 * A twisted silk ribbon: a wavy centre line whose apparent width follows cos(), so it narrows to an edge at every
 * twist and shows its front (light, with a sheen line) and back (shaded) alternately.
 */
function Silk({ className = "", w = 400, h = 80, waves = 1.2, amp = 16, thick = 15, twists = 3, phase = 0.6, tone = "rich" }: { className?: string; w?: number; h?: number; waves?: number; amp?: number; thick?: number; twists?: number; phase?: number; tone?: SilkTone }) {
  const fid = useSvgId("tdsf");
  const bid = useSvgId("tdsb");
  const k = (Math.PI * twists) / w;
  const cy = (x: number) => h / 2 + amp * Math.sin((2 * Math.PI * waves * x) / w + phase * 0.7);
  const s = (x: number) => thick * (0.16 + 0.84 * Math.abs(Math.cos(k * x + phase))) * Math.sign(Math.cos(k * x + phase) || 1);
  const nodes = [0];
  for (let n = -3; n < twists + 4; n++) {
    const x = (Math.PI / 2 + n * Math.PI - phase) / k;
    if (x > 0.5 && x < w - 0.5) nodes.push(x);
  }
  nodes.push(w);
  nodes.sort((a, b) => a - b);
  const lobes = nodes.slice(0, -1).map((x0, i) => {
    const x1 = nodes[i + 1];
    const front = s((x0 + x1) / 2) > 0;
    const M = 12;
    const xs = Array.from({ length: M + 1 }, (_, j) => x0 + ((x1 - x0) * j) / M);
    // at a twist the two edges meet in a thin crease, not a point
    const half = (x: number) => Math.max(Math.abs(s(x)) * Math.min(1, Math.abs(Math.cos(k * x + phase)) * 3 + 0.08), 0.6);
    const top = xs.map((x): [number, number] => [x, cy(x) - half(x)]);
    const bot = xs.map((x): [number, number] => [x, cy(x) + half(x) * 0.92]).reverse();
    const sheen = xs.slice(2, -2).map((x): [number, number] => [x, cy(x) - half(x) * 0.38]);
    return { front, d: `${smooth(top)} ${smooth(bot, false)}Z`, sheen: front && sheen.length > 1 ? smooth(sheen) : "" };
  });
  const st = SILK_STOPS[tone];
  return (
    <svg className={className} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={fid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: st.front[0] }} />
          <stop offset="0.5" style={{ stopColor: st.front[1] }} />
          <stop offset="1" style={{ stopColor: st.front[2] }} />
        </linearGradient>
        <linearGradient id={bid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: st.back[0] }} />
          <stop offset="1" style={{ stopColor: st.back[1] }} />
        </linearGradient>
      </defs>
      {lobes.map((l, i) => (
        <path key={i} d={l.d} fill={`url(#${l.front ? fid : bid})`} />
      ))}
      {lobes.map((l, i) => l.sheen && <path key={`s${i}`} d={l.sheen} fill="none" stroke="#fff" strokeOpacity={tone === "pale" ? 0.8 : 0.42} strokeWidth="1.3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />)}
    </svg>
  );
}

/** Gathered silk swags hanging over the top of the cover, with pleated tails at both corners. viewBox 400×150. */
function Drape({ className = "" }: { className?: string }) {
  const ids = [useSvgId("tdd0"), useSvgId("tdd1"), useSvgId("tdd2")];
  const tid = useSvgId("tddt");
  const W = 400;
  const S = (x: number) => Math.pow(Math.sin((Math.PI * x) / W), 1.35);
  const curve = (base: number, sag: number, wob = 0, seed = 0) =>
    Array.from({ length: 21 }, (_, i): [number, number] => {
      const x = (W * i) / 20;
      return [x, base + sag * S(x) + wob * Math.sin(i * 1.7 + seed)];
    });
  const bands = [
    { base: 30, sag: 76, tone: [mix("c1", 70, "#000"), mix("c1", 92), mix("c1", 55), mix("c1", 75, "#000")] },
    { base: 18, sag: 60, tone: [mix("c1", 78, "#000"), mix("c1", 70), mix("c1", 36), mix("c1", 80)] },
    { base: 6, sag: 42, tone: [mix("c1", 92, "#000"), mix("c1", 55), mix("c1", 22), mix("c1", 70)] },
  ];
  const tail = (flip: boolean) => {
    const t = (x: number) => (flip ? W - x : x);
    return `M${t(0)} 0 L${t(78)} 0 C${t(64)} 34 ${t(54)} 78 ${t(50)} 132 L${t(40)} 120 L${t(30)} 140 L${t(19)} 124 L${t(9)} 144 L${t(0)} 128 Z`;
  };
  return (
    <svg className={className} viewBox="0 0 400 150" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        {bands.map((b, i) => (
          <linearGradient key={i} id={ids[i]} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: b.tone[0] }} />
            <stop offset="0.62" style={{ stopColor: b.tone[1] }} />
            <stop offset="0.88" style={{ stopColor: b.tone[2] }} />
            <stop offset="1" style={{ stopColor: b.tone[3] }} />
          </linearGradient>
        ))}
        <linearGradient id={tid} x1="0" y1="0" x2="1" y2="0">
          {[0, 0.16, 0.3, 0.45, 0.6, 0.76, 0.9, 1].map((o, i) => (
            <stop key={i} offset={o} style={{ stopColor: i % 2 ? mix("c1", 40) : mix("c1", 88, "#000") }} />
          ))}
        </linearGradient>
      </defs>
      {bands.map((b, i) => (
        <g key={i}>
          <path d={`M0 0 L${W} 0 ${smooth(curve(b.base, b.sag, 0.8, i).reverse(), false)}Z`} fill={`url(#${ids[i]})`} />
          {[0.45, 0.68, 0.84].map((f, j) => (
            <path key={j} d={smooth(curve(b.base * f, b.sag * f, 0.6, i + j))} fill="none" stroke="#fff" strokeOpacity={0.14 + j * 0.05} strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
        </g>
      ))}
      <path d={tail(false)} fill={`url(#${tid})`} />
      <path d={tail(true)} fill={`url(#${tid})`} />
      {/* the gathering knots at the corners, tied with the thread */}
      {[52, 348].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="8" rx="16" ry="9" style={{ fill: mix("c1", 80, "#000") }} />
          <path d={`M${x - 14} 8 Q${x} 0 ${x + 14} 8`} fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <path d={`M${x - 15} 11 Q${x} 18 ${x + 15} 11`} fill="none" style={{ stroke: "var(--c2)" }} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
        </g>
      ))}
    </svg>
  );
}

/* ───────── calla lilies (line-art) ───────── */

/** One calla on a curved stem. Local frame: stem base at (0,0), growing up (-y). */
function Calla({ x, y, len, rot, s = 1, bend = 8, tilt = 0 }: { x: number; y: number; len: number; rot: number; s?: number; bend?: number; tilt?: number }) {
  const top = `0 ${-len}`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={`M0 0 Q${bend} ${r2(-len / 2)} ${top}`} fill="none" style={{ stroke: LINE }} strokeWidth="3.4" strokeLinecap="round" />
      <path d={`M0 0 Q${bend} ${r2(-len / 2)} ${top}`} fill="none" style={{ stroke: "var(--td-paper)" }} strokeWidth="1.6" strokeLinecap="round" />
      <g transform={`translate(0 ${-len + 2}) rotate(${tilt}) scale(${s})`}>
        <path
          d="M0 0 C-7 -8 -17 -20 -17 -34 C-17 -46 -10 -57 2 -68 C1 -60 6 -50 14 -44 C18 -41 19 -38 17 -36 C11 -22 5 -10 0 0Z"
          style={{ fill: "var(--td-paper)", stroke: LINE }}
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
        {/* the inner throat behind the front lip */}
        <path d="M-17 -34 C-12 -44 -4 -52 2 -68 C3 -58 8 -48 17 -36 C8 -30 -8 -29 -17 -34Z" style={{ fill: mix("c1", 10) }} />
        <path d="M-17 -34 C-8 -27 8 -28 17 -36" fill="none" style={{ stroke: LINE }} strokeWidth="1.1" />
        <path d="M0 -12 Q-2 -24 -1 -35" fill="none" style={{ stroke: "var(--c2)" }} strokeWidth="3.4" strokeLinecap="round" />
        <path d="M-2 -5 C-8 -14 -12 -22 -13 -30 M3 -6 C7 -15 10 -24 12 -32" fill="none" style={{ stroke: LINE }} strokeOpacity="0.45" strokeWidth="0.7" />
        <path d="M2 -68 C5 -66 6 -63 4 -60" fill="none" style={{ stroke: LINE }} strokeWidth="1" strokeLinecap="round" />
      </g>
    </g>
  );
}

function CallaLeaf({ x, y, rot, s = 1 }: { x: number; y: number; rot: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M0 0 C-15 -22 -17 -56 0 -88 C15 -58 13 -22 0 0Z" style={{ fill: mix("c2", 16), stroke: LINE }} strokeWidth="1" strokeLinejoin="round" />
      <path d="M0 -2 Q-2 -44 0 -84" fill="none" style={{ stroke: LINE }} strokeOpacity="0.6" strokeWidth="0.8" />
      <path d="M-1 -24 L-9 -34 M-1 -44 L-9 -56 M0 -34 L8 -46 M0 -56 L6 -66" fill="none" style={{ stroke: LINE }} strokeOpacity="0.35" strokeWidth="0.6" />
    </g>
  );
}

/** Three callas and two leaves, their stems tied with a bow of the red thread. viewBox 140×260. */
function CallaSpray({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 140 260" aria-hidden="true">
      <CallaLeaf x={66} y={250} rot={-34} s={0.95} />
      <CallaLeaf x={74} y={252} rot={30} s={0.78} />
      <Calla x={66} y={254} len={176} rot={-13} s={1.05} bend={-10} tilt={-14} />
      <Calla x={70} y={254} len={206} rot={4} s={1.18} bend={6} tilt={6} />
      <Calla x={74} y={254} len={140} rot={20} s={0.92} bend={10} tilt={22} />
      <g fill="none" style={{ stroke: "var(--td-thread)" }} strokeWidth="1.3" strokeLinecap="round">
        <path d="M70 214 C56 200 44 211 57 220 C63 223 67 219 70 214 C73 209 85 199 90 210 C94 220 80 222 70 214" />
        <path d="M70 214 C66 228 60 236 52 248 M70 214 C76 226 81 238 90 244" />
      </g>
      <circle cx="70" cy="214" r="2.4" style={{ fill: "var(--td-thread)" }} />
    </svg>
  );
}

/** A single small calla for dividers and card corners. viewBox 60×120. */
function CallaSprig({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 120" aria-hidden="true">
      <CallaLeaf x={30} y={116} rot={-28} s={0.5} />
      <Calla x={30} y={118} len={84} rot={6} s={0.72} bend={5} tilt={10} />
    </svg>
  );
}

/* ───────── the red thread ───────── */

/** Thread running across with a loose knot in the middle (where the "&" sits). viewBox 320×64. */
function ThreadKnot({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 320 64" aria-hidden="true" fill="none" strokeLinecap="round">
      <path
        d="M4 14 C52 12 86 52 134 42 C150 38 156 26 160 18 C164 8 150 4 146 14 C142 24 156 36 170 38 C204 44 236 18 270 26 C292 31 306 44 316 52"
        style={{ stroke: "var(--td-thread)" }}
        strokeWidth="1.5"
      />
      <path d="M6 17 C54 15 88 54 136 45 M168 41 C204 47 236 21 270 29 C292 34 304 46 314 55" style={{ stroke: "var(--td-thread)" }} strokeOpacity="0.35" strokeWidth="0.8" />
      <circle cx="4" cy="14" r="2.2" style={{ fill: "var(--td-thread)" }} />
      <circle cx="316" cy="52" r="2.2" style={{ fill: "var(--td-thread)" }} />
    </svg>
  );
}

/** The same thread falling vertically between the two names, knotted midway. viewBox 40×170. */
function ThreadDrop({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 170" aria-hidden="true" fill="none" strokeLinecap="round">
      <path d="M20 2 C34 28 6 50 20 74 C26 84 34 92 28 98 C22 104 12 96 18 88 C24 80 30 96 22 108 C8 130 34 146 20 168" style={{ stroke: "var(--td-thread)" }} strokeWidth="1.4" />
      <path d="M22 4 C36 30 8 52 22 76 M24 110 C10 132 36 148 22 166" style={{ stroke: "var(--td-thread)" }} strokeOpacity="0.35" strokeWidth="0.7" />
    </svg>
  );
}

/** Small knot ornament under section titles. viewBox 140×20. */
function MiniKnot({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 140 20" aria-hidden="true" fill="none" strokeLinecap="round">
      <path d="M4 12 C30 12 48 6 62 9 C68 10 72 14 70 16 C67 18 64 10 70 6 C76 2 80 10 76 12 C92 16 112 8 136 10" style={{ stroke: "var(--td-thread)" }} strokeWidth="1.1" />
      <circle cx="4" cy="12" r="1.6" style={{ fill: "var(--c2)" }} />
      <circle cx="136" cy="10" r="1.6" style={{ fill: "var(--c2)" }} />
    </svg>
  );
}

/** The sash an event title sits on: a gently bowed band with notched, folded tails. viewBox 300×60. */
function Sash({ className = "" }: { className?: string }) {
  const gid = useSvgId("tdsh");
  return (
    <svg className={className} viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: mix("c1", 80) }} />
          <stop offset="0.35" style={{ stopColor: mix("c1", 92, "#000") }} />
          <stop offset="1" style={{ stopColor: mix("c1", 70, "#000") }} />
        </linearGradient>
      </defs>
      <path d="M34 20 L2 20 L16 35 L2 52 L44 52 Z" style={{ fill: mix("c1", 62, "#000") }} />
      <path d="M266 20 L298 20 L284 35 L298 52 L256 52 Z" style={{ fill: mix("c1", 62, "#000") }} />
      <path d="M34 46 L44 52 L44 44 Z M266 46 L256 52 L256 44 Z" style={{ fill: mix("c1", 45, "#000") }} />
      <path d="M30 10 Q150 2 270 10 L270 46 Q150 38 30 46 Z" fill={`url(#${gid})`} />
      <path d="M36 14 Q150 7 264 14" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <path d="M36 42 Q150 35 264 42" fill="none" style={{ stroke: "var(--c2)" }} strokeOpacity="0.8" strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* ───────── layout pieces ───────── */

function Title({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <h2 className="td-title iv-reveal">
      <span className="td-title-main">{children}</span>
      {sub && <small>{sub}</small>}
      <MiniKnot className="td-title-knot" />
    </h2>
  );
}

function Event({ e, title }: { e: InviteEvent; title: string }) {
  const p = parseDate(e.date);
  const map = mapsLink(e);
  const q = [e.venue, e.address].filter(Boolean).join(", ");
  return (
    <article className={`td-event iv-reveal ${e.kind}`}>
      <div className="td-sash">
        <Sash className="td-sash-bg" />
        <h3>{e.title || "Sự kiện"}</h3>
      </div>
      {p && (
        <div className="td-event-when">
          <span>{e.time || p.weekday}</span>
          <b>{p.dd}</b>
          <span>
            {e.time ? p.weekday : ""}
            {e.time ? <br /> : null}
            {p.mm} · {p.y}
          </span>
        </div>
      )}
      {e.lunar && <p className="td-event-lunar">{e.lunar}</p>}
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
      {e.venue && <p className="td-event-venue">{e.venue}</p>}
      {e.address && <p className="td-event-address">{e.address}</p>}
      {e.showMap && q && (
        <iframe
          className="iv-event-map"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`}
          title={`Bản đồ ${e.venue || e.title}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
      <div className="td-event-actions">
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
      <CallaSprig className="td-event-sprig" />
    </article>
  );
}

export default function ToDuyenTheme({ d, title, date, mono, guestName, highlights, wishes, show, labels, mainEvent }: ThemeCtx) {
  const lunar = lunarLabel(d.date);
  return (
    <>
      {/* ── cover: silk drape, framed photo crossed by a silk sash, callas, names knotted by the thread ── */}
      <section className="td-hero">
        <Drape className="td-drape" />
        <div className="td-cover iv-reveal">
          <div className="td-cover-frame">
            <Photo src={d.cover} alt={`Ảnh cưới ${title}`} mono={mono} className="td-cover-photo" />
          </div>
          <Silk className="td-cover-silk" w={420} h={90} waves={0.9} amp={14} thick={17} twists={3} phase={0.9} />
          <Silk className="td-cover-silk2" w={420} h={70} waves={1.1} amp={10} thick={6} twists={4} phase={2.1} tone="gold" />
          <CallaSpray className="td-cover-callas" />
        </div>
        <p className="td-kicker iv-reveal">
          <T vi="Thiệp mời cưới" en="Wedding invitation" />
        </p>
        <h1 className="td-names iv-reveal">
          <span className="td-name a">{d.groomName}</span>
          <span className="td-names-thread">
            <ThreadKnot className="td-thread" />
            <i>&amp;</i>
          </span>
          <span className="td-name b">{d.brideName}</span>
        </h1>
        {date && (
          <div className="td-date iv-reveal">
            <p className="td-date-when">
              {mainEvent?.time ? `${mainEvent.time} · ` : ""}
              {date.weekday}
            </p>
            <p className="td-date-num">
              {date.dd}
              <i />
              {date.mm}
              <i />
              {date.y}
            </p>
            {lunar && <p className="td-date-lunar">{lunar}</p>}
          </div>
        )}
      </section>

      {show.families && (
        <section className="iv-sec td-families">
          <CallaSprig className="td-families-sprig iv-reveal" />
          <div className="td-families-grid">
            {[d.groomFamily, d.brideFamily].map((f, i) => (
              <div key={i} className="td-family iv-reveal">
                <h2>
                  <FamilyTitle which={i ? "brideFamily" : "groomFamily"} />
                </h2>
                <p className="td-parents">{f.parents}</p>
                {f.address && <p className="td-addr">{f.address}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {show.couple && (
        <section className="iv-sec td-couple">
          <Silk className="td-couple-silk" w={420} h={120} waves={0.7} amp={22} thick={26} twists={2} phase={0.3} tone="pale" />
          <Announce className="td-announce" />
          <div className="td-petal iv-reveal">
            <div className="td-petal-back" aria-hidden="true" />
            <Photo src={d.couplePhoto || highlights[0] || d.cover} alt={`Ảnh cô dâu chú rể ${title}`} mono={mono} className="td-petal-photo" />
            <CallaSprig className="td-petal-sprig" />
          </div>
          <div className="td-pair">
            <div className="td-person iv-reveal">
              <em>{labels.first}</em>
              <p>{d.groomFullName || d.groomName}</p>
              <PersonTitle which="groom" />
            </div>
            <ThreadDrop className="td-pair-thread iv-reveal" />
            <div className="td-person iv-reveal">
              <em>{labels.second}</em>
              <p>{d.brideFullName || d.brideName}</p>
              <PersonTitle which="bride" />
            </div>
          </div>
        </section>
      )}

      {show.invite && (
        <section className="iv-sec td-invite">
          <p className="td-inv-heading iv-reveal">
            <Bi k="inviteHeading" />
          </p>
          <div className="td-guest iv-reveal">
            <Silk className="td-guest-silk" w={420} h={70} waves={1} amp={8} thick={20} twists={2.5} phase={1.2} tone="pale" />
            <p>{guestName}</p>
          </div>
          <p className="td-inv-line iv-reveal">
            <Bi k="inviteLine" />
          </p>
          <div className="td-trio iv-reveal">
            {[date?.dd, date?.mm, date?.y].map((label, i) => (
              <Photo key={i} src={highlights[i] ?? ""} alt={`Ảnh cưới ${i + 1}`} mono={mono}>
                <b>{label}</b>
              </Photo>
            ))}
          </div>
          {d.quote && (
            <p className="td-quote iv-reveal">
              <Bi k="quote" />
            </p>
          )}
        </section>
      )}

      {show.events && d.events.length > 0 && (
        <section className="iv-sec td-events">
          <Title sub="Save the date">
            <T vi="Tiệc cưới" en="The celebration" />
          </Title>
          {d.events.map((e) => (
            <Event key={e.id} e={e} title={title} />
          ))}
        </section>
      )}

      {(show.calendar || show.countdown) && (
        <section className="iv-sec td-when">
          <Silk className="td-when-silk" w={420} h={90} waves={0.8} amp={14} thick={14} twists={3} phase={2.4} />
          {date && <Title sub={String(date.y)}>Tháng {date.m}</Title>}
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
        <section className="iv-sec td-album">
          <Title sub={<T vi="Album ảnh cưới" en="Wedding album" />}>Our moments</Title>
          <Gallery photos={d.gallery} mono={mono} />
        </section>
      )}

      <div className="td-shared">{wishes}</div>

      {show.gift && d.gift.enabled && (
        <section className="iv-sec td-gift">
          <CallaSpray className="td-gift-callas" />
          <Title>
            <T vi="Hộp mừng cưới" en="Wedding gift" />
          </Title>
          <p className="td-gift-sub iv-reveal">
            <T vi="Cảm ơn tấm lòng bạn dành cho chúng mình." en="Thank you for your love and kindness." />
          </p>
          <div className="iv-reveal">
            <GiftReveal groom={d.gift.groom} bride={d.gift.bride} />
          </div>
        </section>
      )}

      {show.thanks && (
        <section className="iv-sec iv-thanks td-thanks">
          <Photo src={d.thanksPhoto || d.cover} alt="" mono="" className="iv-thanks-bg" />
          <Silk className="td-thanks-silk" w={420} h={90} waves={1} amp={16} thick={16} twists={3} phase={0.2} />
          <div className="iv-thanks-body">
            <ThreadKnot className="td-thanks-thread iv-reveal" />
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
