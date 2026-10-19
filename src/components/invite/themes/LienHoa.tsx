"use client";

import { useId, type ReactNode } from "react";
import { lunarLabel } from "@/lib/invites/lunar";
import { mapsLink, parseDate, type InviteEvent } from "@/lib/invites/types";
import { Calendar, calendarLink, Countdown, Gallery, GiftReveal, Photo } from "../parts";
import { Announce, Bi, FamilyTitle, PersonTitle, T } from "../lang";
import type { ThemeCtx } from "./types";
import "./lien-hoa.css";

// "Liên Hoa": a still lotus pond painted in watercolour. Blooms and buds in --c1, round lotus leaves in --c2,
// water ripples and reflections, a dragonfly, and ink-wash brush strokes as dividers. Calm, Zen-like spacing.
// Every ornament is drawn here in SVG and coloured only through var(--c1) / var(--c2) mixed with neutrals.

/* ───────── deterministic helpers (identical on server and client) ───────── */

const rand = (seed: number) => ((seed * 9301 + 49297) % 233280) / 233280;
const r2 = (n: number) => Math.round(n * 100) / 100;
const mix = (c: "c1" | "c2", pct: number, base = "#fff") => `color-mix(in srgb, var(--${c}) ${pct}%, ${base})`;
const DEG = Math.PI / 180;
const INK = "#2b2b2b";

/** SVG-safe unique id (React ids contain ':' which url(#…) dislikes). */
function useSvgId(prefix: string) {
  return prefix + useId().replace(/[^a-zA-Z0-9_-]/g, "");
}

/** Closed smooth path through points (Catmull-Rom → cubic Bézier). */
function smoothClosed(pts: [number, number][]) {
  const n = pts.length;
  let d = `M${r2(pts[0][0])} ${r2(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    d += ` C${r2(p1[0] + (p2[0] - p0[0]) / 6)} ${r2(p1[1] + (p2[1] - p0[1]) / 6)} ${r2(p2[0] - (p3[0] - p1[0]) / 6)} ${r2(p2[1] - (p3[1] - p1[1]) / 6)} ${r2(p2[0])} ${r2(p2[1])}`;
  }
  return d + "Z";
}

/** Soft "wet edge" so the painted shapes never look vector-perfect. Kept light for phones. */
function WetEdge({ id, scale = 2.6, seed = 3 }: { id: string; scale?: number; seed?: number }) {
  return (
    <filter id={id} x="-6%" y="-6%" width="112%" height="112%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed={seed} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={scale} xChannelSelector="R" yChannelSelector="G" />
    </filter>
  );
}

/* ───────── lotus flowers ───────── */

/** A pointed lotus petal growing up (-y) from its base. */
const petal = (L: number, W: number) =>
  `M0 0 C${r2(W * 0.6)} ${r2(-L * 0.08)} ${r2(W * 1.05)} ${r2(-L * 0.45)} ${r2(W * 0.55)} ${r2(-L * 0.78)} Q${r2(W * 0.2)} ${r2(-L * 0.95)} 0 ${r2(-L)} Q${r2(-W * 0.2)} ${r2(-L * 0.95)} ${r2(-W * 0.55)} ${r2(-L * 0.78)} C${r2(-W * 1.05)} ${r2(-L * 0.45)} ${r2(-W * 0.6)} ${r2(-L * 0.08)} 0 0Z`;

/** [angle, length, width] for the back ring and the front ring of an open lotus (side view). */
const BACK: [number, number, number][] = [
  [-80, 0.55, 0.42],
  [-52, 0.78, 0.44],
  [-24, 0.93, 0.42],
  [24, 0.93, 0.42],
  [52, 0.78, 0.44],
  [80, 0.55, 0.42],
];
const FRONT: [number, number, number][] = [
  [-112, 0.42, 0.46],
  [112, 0.42, 0.46],
  [-62, 0.66, 0.5],
  [62, 0.66, 0.5],
  [-31, 0.86, 0.5],
  [31, 0.86, 0.5],
  [0, 1, 0.52],
];

function PetalGradient({ id, deep = 85 }: { id: string; deep?: number }) {
  return (
    <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" style={{ stopColor: mix("c1", 6) }} />
      <stop offset="0.5" style={{ stopColor: mix("c1", 34) }} />
      <stop offset="1" style={{ stopColor: mix("c1", deep) }} />
    </linearGradient>
  );
}

/** Open lotus seen from the side, base at (x, y), about `s` tall. */
function Lotus({ x, y, s, rot = 0, seed = 1 }: { x: number; y: number; s: number; rot?: number; seed?: number }) {
  const gid = useSvgId("lhg");
  const line = mix("c1", 62, INK);
  const draw = (ring: [number, number, number][], back: boolean) =>
    ring.map(([a, lf, wf], i) => {
      const j = rand(seed * 37 + i + (back ? 11 : 0));
      const L = s * lf * (0.94 + j * 0.12);
      const bx = r2(Math.sin(a * DEG) * s * 0.1);
      return (
        <g key={`${back ? "b" : "f"}${i}`} transform={`translate(${bx} 0) rotate(${r2(a + (j - 0.5) * 6)})`} opacity={back ? 0.62 : 0.95}>
          <path d={petal(L, L * wf)} fill={`url(#${gid})`} style={{ stroke: line }} strokeOpacity="0.32" strokeWidth="0.7" />
          <path d={`M0 ${r2(-L * 0.1)} Q${r2(L * wf * 0.1)} ${r2(-L * 0.5)} 0 ${r2(-L * 0.86)}`} fill="none" style={{ stroke: line }} strokeOpacity="0.2" strokeWidth="0.6" />
        </g>
      );
    });
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(1 0.94)`}>
      <defs>
        <PetalGradient id={gid} />
      </defs>
      <ellipse cx="0" cy={r2(-s * 0.45)} rx={r2(s * 0.75)} ry={r2(s * 0.55)} style={{ fill: "var(--c1)" }} opacity="0.07" />
      {draw(BACK, true)}
      {/* seed pod peeking between the petals */}
      <path d={`M${r2(-s * 0.14)} ${r2(-s * 0.36)} L${r2(s * 0.14)} ${r2(-s * 0.36)} L${r2(s * 0.08)} ${r2(-s * 0.2)} L${r2(-s * 0.08)} ${r2(-s * 0.2)}Z`} style={{ fill: mix("c2", 40) }} opacity="0.9" />
      {draw(FRONT, false)}
      {[-130, 130].map((a) => (
        <path key={a} d={petal(s * 0.22, s * 0.1)} transform={`rotate(${a})`} style={{ fill: mix("c2", 72, INK) }} opacity="0.8" />
      ))}
    </g>
  );
}

/** Closed lotus bud on top of its stem point (x, y). */
function Bud({ x, y, s, rot = 0 }: { x: number; y: number; s: number; rot?: number }) {
  const gid = useSvgId("lhb");
  const line = mix("c1", 62, INK);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <defs>
        <PetalGradient id={gid} deep={92} />
      </defs>
      <path d={`M0 0 C${r2(s * 0.66)} ${r2(-s * 0.25)} ${r2(s * 0.52)} ${r2(-s * 1.1)} 0 ${r2(-s * 1.6)} C${r2(-s * 0.52)} ${r2(-s * 1.1)} ${r2(-s * 0.66)} ${r2(-s * 0.25)} 0 0Z`} fill={`url(#${gid})`} style={{ stroke: line }} strokeOpacity="0.35" strokeWidth="0.7" />
      <path d={`M${r2(-s * 0.1)} ${r2(-s * 0.05)} C${r2(s * 0.36)} ${r2(-s * 0.45)} ${r2(s * 0.24)} ${r2(-s * 1.1)} 0 ${r2(-s * 1.56)}`} fill="none" style={{ stroke: line }} strokeOpacity="0.32" strokeWidth="0.7" />
      <path d={`M${r2(s * 0.12)} ${r2(-s * 0.05)} C${r2(-s * 0.3)} ${r2(-s * 0.5)} ${r2(-s * 0.26)} ${r2(-s * 0.95)} ${r2(-s * 0.1)} ${r2(-s * 1.3)}`} fill="none" style={{ stroke: line }} strokeOpacity="0.22" strokeWidth="0.6" />
      {[-140, 140].map((a) => (
        <path key={a} d={petal(s * 0.42, s * 0.16)} transform={`rotate(${a})`} style={{ fill: mix("c2", 70, INK) }} opacity="0.75" />
      ))}
    </g>
  );
}

function Stem({ d, w = 1.6 }: { d: string; w?: number }) {
  return <path d={d} fill="none" style={{ stroke: mix("c2", 68, INK) }} strokeWidth={w} strokeLinecap="round" opacity="0.85" />;
}

/* ───────── lotus leaves ───────── */

/** Flat leaf floating on the water (seen from above at a slant), with its V-notch. */
function Pad({ x, y, rx, ry, notch = 30, seed = 1, pct = 58 }: { x: number; y: number; rx: number; ry: number; notch?: number; seed?: number; pct?: number }) {
  const half = 9;
  const pts: [number, number][] = [];
  for (let i = 0; i <= 22; i++) {
    const a = (notch + half + ((360 - 2 * half) * i) / 22) * DEG;
    const w = 1 + (rand(seed * 23 + i) - 0.5) * 0.06;
    pts.push([x + Math.cos(a) * rx * w, y + Math.sin(a) * ry * w]);
  }
  let d = `M${r2(x)} ${r2(y)} L${r2(pts[0][0])} ${r2(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1];
    const q = pts[i];
    d += ` Q${r2((p[0] + q[0]) / 2 + (q[1] - p[1]) * 0.08)} ${r2((p[1] + q[1]) / 2 - (q[0] - p[0]) * 0.08)} ${r2(q[0])} ${r2(q[1])}`;
  }
  d += "Z";
  return (
    <g>
      <path d={d} style={{ fill: mix("c2", pct), stroke: mix("c2", 75, INK) }} strokeOpacity="0.4" strokeWidth="0.8" opacity="0.88" />
      {Array.from({ length: 9 }, (_, i) => {
        const a = (notch + 30 + i * 37) * DEG;
        return <path key={i} d={`M${r2(x)} ${r2(y)} L${r2(x + Math.cos(a) * rx * 0.88)} ${r2(y + Math.sin(a) * ry * 0.88)}`} style={{ stroke: mix("c2", 22) }} strokeWidth="0.7" opacity="0.8" />;
      })}
    </g>
  );
}

/** Leaf held up above the water like a shallow cup: inner face (ellipse) over the lighter underside. */
function UpLeaf({ x, y, rx, ry, stem, seed = 1, lean = 0 }: { x: number; y: number; rx: number; ry: number; stem: number; seed?: number; lean?: number }) {
  const sx = x + lean;
  const sy = y + ry * 2.4;
  const rim = (a: number, k = 1) => {
    const w = 1 + (rand(seed * 19 + Math.round(a)) - 0.5) * 0.05;
    return [x + Math.cos(a * DEG) * rx * w * k, y + Math.sin(a * DEG) * ry * w * k] as [number, number];
  };
  const face = smoothClosed(Array.from({ length: 18 }, (_, i) => rim(i * 20)));
  return (
    <g>
      <Stem d={`M${r2(sx)} ${r2(sy)} Q${r2(sx - lean * 0.6)} ${r2(sy + stem * 0.5)} ${r2(sx - lean)} ${r2(sy + stem)}`} w={1.8} />
      <path
        d={`M${r2(x - rx)} ${r2(y)} Q${r2(x - rx * 0.32 + lean * 0.5)} ${r2(y + ry * 2.1)} ${r2(sx)} ${r2(sy)} Q${r2(x + rx * 0.32 + lean * 0.5)} ${r2(y + ry * 2.1)} ${r2(x + rx)} ${r2(y)} A${rx} ${ry} 0 0 1 ${r2(x - rx)} ${r2(y)}Z`}
        style={{ fill: mix("c2", 40), stroke: mix("c2", 70, INK) }}
        strokeOpacity="0.35"
        strokeWidth="0.7"
        opacity="0.9"
      />
      {[25, 55, 90, 125, 155].map((a) => {
        const [px, py] = rim(a);
        return <path key={a} d={`M${r2(sx)} ${r2(sy)} Q${r2((sx + px) / 2)} ${r2((sy + py) / 2 + ry * 0.2)} ${r2(px)} ${r2(py)}`} fill="none" style={{ stroke: mix("c2", 70, INK) }} strokeOpacity="0.25" strokeWidth="0.6" />;
      })}
      <path d={face} style={{ fill: mix("c2", 78, INK), stroke: mix("c2", 80, INK) }} strokeOpacity="0.4" strokeWidth="0.7" opacity="0.82" />
      {Array.from({ length: 8 }, (_, i) => {
        const [px, py] = rim(i * 45 + 10, 0.9);
        return <path key={i} d={`M${r2(x)} ${r2(y + ry * 0.15)} L${r2(px)} ${r2(py)}`} style={{ stroke: mix("c2", 45) }} strokeWidth="0.6" opacity="0.6" />;
      })}
    </g>
  );
}

/** Concentric broken rings on the water. */
function Ripples({ x, y, rx, ry, n = 3, seed = 1 }: { x: number; y: number; rx: number; ry: number; n?: number; seed?: number }) {
  return (
    <g fill="none" strokeLinecap="round">
      {Array.from({ length: n }, (_, i) => {
        const k = 1 + i * 0.55;
        const dash = r2(30 + rand(seed * 7 + i) * 50);
        return (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx={r2(rx * k)}
            ry={r2(ry * k)}
            style={{ stroke: mix("c2", 55, "#6b6b6b") }}
            strokeOpacity={r2(0.42 - i * 0.1)}
            strokeWidth="0.8"
            strokeDasharray={`${dash} ${r2(6 + rand(seed * 3 + i) * 10)}`}
          />
        );
      })}
    </g>
  );
}

/** Small dragonfly, head pointing up (-y) from (x, y). */
function Dragonfly({ x, y, s, rot = 0 }: { x: number; y: number; s: number; rot?: number }) {
  const wing = { fill: "#fff", stroke: mix("c2", 65, INK) };
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {[
        [-1, -0.14, -8],
        [1, -0.14, 8],
        [-1, 0.1, 14],
        [1, 0.1, -14],
      ].map(([side, wy, a], i) => (
        <g key={i} transform={`translate(${r2(side * s * 0.62)} ${r2(wy * s)}) rotate(${a})`}>
          <ellipse rx={r2(s * 0.62)} ry={r2(s * 0.13)} style={wing} fillOpacity="0.6" strokeOpacity="0.55" strokeWidth="0.6" />
          <path d={`M${r2(-s * 0.55)} 0 L${r2(s * 0.55)} 0`} style={{ stroke: mix("c2", 65, INK) }} strokeOpacity="0.3" strokeWidth="0.4" />
        </g>
      ))}
      <ellipse cy={r2(s * 0.72)} rx={r2(s * 0.045)} ry={r2(s * 0.82)} style={{ fill: mix("c1", 62, INK) }} />
      <ellipse cy={r2(-s * 0.06)} rx={r2(s * 0.08)} ry={r2(s * 0.17)} style={{ fill: mix("c1", 62, INK) }} />
      <circle cy={r2(-s * 0.28)} r={r2(s * 0.09)} style={{ fill: mix("c1", 70, INK) }} />
    </g>
  );
}

/* ───────── compositions ───────── */

/** The pond: raised leaves, floating pads, two blooms, buds and ripples. viewBox 400×200, water line near y≈178. */
function Pond({ className = "", seed = 1, flip = false }: { className?: string; seed?: number; flip?: boolean }) {
  const fid = useSvgId("lhp");
  return (
    <svg className={className} viewBox="0 0 400 200" aria-hidden="true" style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <defs>
        <WetEdge id={fid} seed={seed + 2} />
      </defs>
      <g filter={`url(#${fid})`}>
        <ellipse cx="200" cy="180" rx="190" ry="16" style={{ fill: "var(--c2)" }} opacity="0.08" />
        <UpLeaf x={58} y={98} rx={52} ry={13} stem={70} seed={seed} lean={6} />
        <UpLeaf x={356} y={126} rx={40} ry={10} stem={42} seed={seed + 1} lean={-4} />
        <Stem d="M300 42 Q296 120 304 186" />
        <Stem d="M254 128 Q262 160 258 186" w={1.4} />
        <Stem d="M152 96 Q160 140 154 186" w={1.9} />
        <Stem d="M226 122 Q214 160 222 186" w={1.5} />
        <Ripples x={154} y={184} rx={42} ry={6} seed={seed} />
        <Ripples x={330} y={188} rx={34} ry={5} n={2} seed={seed + 3} />
        <Pad x={70} y={182} rx={48} ry={11} notch={300} seed={seed + 2} pct={52} />
        <Pad x={326} y={186} rx={50} ry={10} notch={230} seed={seed + 3} pct={64} />
        <Pad x={226} y={192} rx={30} ry={6} notch={280} seed={seed + 4} pct={44} />
        <Bud x={300} y={42} s={22} rot={4} />
        <Bud x={254} y={128} s={14} rot={-12} />
        <Lotus x={226} y={124} s={40} rot={10} seed={seed + 5} />
        <Lotus x={152} y={98} s={74} rot={-4} seed={seed} />
      </g>
    </svg>
  );
}

/** Lotus leaf seen from above: the round frame behind the hero photo. viewBox 200×200. */
function LeafRing({ className = "" }: { className?: string }) {
  const fid = useSvgId("lhr");
  const gid = useSvgId("lhrg");
  const notch = -58;
  const pts: [number, number][] = [];
  for (let i = 0; i <= 40; i++) {
    const a = (notch + 7 + (346 * i) / 40) * DEG;
    const w = 98 * (1 + Math.sin(i * 1.7) * 0.012);
    pts.push([100 + Math.cos(a) * w, 100 + Math.sin(a) * w]);
  }
  const d = `M100 100 ` + pts.map(([px, py]) => `L${r2(px)} ${r2(py)}`).join(" ") + "Z";
  return (
    <svg className={className} viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <WetEdge id={fid} scale={2.2} seed={7} />
        <radialGradient id={gid}>
          <stop offset="0.55" style={{ stopColor: mix("c2", 30) }} />
          <stop offset="0.9" style={{ stopColor: mix("c2", 62) }} />
          <stop offset="1" style={{ stopColor: mix("c2", 72, INK) }} />
        </radialGradient>
      </defs>
      <g filter={`url(#${fid})`}>
        <path d={d} fill={`url(#${gid})`} opacity="0.92" strokeLinejoin="round" />
        {Array.from({ length: 22 }, (_, i) => {
          const a = (notch + 14 + i * 15.2) * DEG;
          const c = Math.cos(a);
          const s = Math.sin(a);
          return <path key={i} d={`M${r2(100 + c * 60)} ${r2(100 + s * 60)} Q${r2(100 + c * 80 + s * 3)} ${r2(100 + s * 80 - c * 3)} ${r2(100 + c * 95)} ${r2(100 + s * 95)}`} fill="none" style={{ stroke: mix("c2", 18) }} strokeWidth="0.8" opacity="0.9" />;
        })}
        <path d={d} fill="none" style={{ stroke: mix("c2", 75, INK) }} strokeOpacity="0.4" strokeWidth="0.8" />
      </g>
    </svg>
  );
}

/** Ink-wash brush stroke: a tapered filled band along a gentle wave from x0 to x1. */
function brushBand(x0: number, x1: number, y: number, thick: number, seed: number, wave = 2) {
  const N = 16;
  const top: string[] = [];
  const bot: string[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x = x0 + (x1 - x0) * t;
    const cy = y + Math.sin(t * Math.PI * 1.4 + seed) * wave;
    const w = thick * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.15)), 0.7) * (0.85 + rand(seed * 13 + i) * 0.3) + 0.2;
    top.push(`${r2(x)} ${r2(cy - w / 2)}`);
    bot.unshift(`${r2(x)} ${r2(cy + w / 2)}`);
  }
  return `M${top.join(" L")} L${bot.join(" L")}Z`;
}

/** Divider: two ink brush strokes reaching toward a small lotus. */
function BrushRule({ className = "" }: { className?: string }) {
  const fid = useSvgId("lhd");
  return (
    <svg className={`lh-rule ${className}`} viewBox="0 0 240 40" aria-hidden="true">
      <defs>
        <filter id={fid} x="-5%" y="-40%" width="110%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency="0.09 0.5" numOctaves="2" seed="5" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter={`url(#${fid})`} style={{ fill: mix("c2", 45, "#3c3c3c") }} opacity="0.62">
        <path d={brushBand(6, 100, 30, 3.2, 1)} />
        <path d={brushBand(140, 234, 30, 3.2, 4)} />
      </g>
      <Ripples x={120} y={32} rx={20} ry={3} n={2} seed={2} />
      <Lotus x={120} y={31} s={22} seed={3} />
    </svg>
  );
}

/** One long brush stroke under the guest's name. */
function Brush({ className = "" }: { className?: string }) {
  const fid = useSvgId("lhs");
  return (
    <svg className={className} viewBox="0 0 300 24" aria-hidden="true">
      <defs>
        <filter id={fid} x="-5%" y="-50%" width="110%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06 0.6" numOctaves="2" seed="9" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <path d={brushBand(14, 286, 12, 5, 2, 3)} filter={`url(#${fid})`} style={{ fill: "var(--c1)" }} opacity="0.55" />
      <path d={brushBand(70, 250, 17, 1.6, 6, 2)} style={{ fill: "var(--c2)" }} opacity="0.5" />
    </svg>
  );
}

/** Line-art lotus mark (stroke = currentColor): heads the section titles. */
function LotusMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 36" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round">
      {[
        [-64, 0.62, 0.5],
        [64, 0.62, 0.5],
        [-32, 0.86, 0.48],
        [32, 0.86, 0.48],
        [0, 1, 0.5],
      ].map(([a, lf, wf], i) => (
        <path key={i} d={petal(26 * lf, 26 * lf * wf)} transform={`translate(32 32) rotate(${a})`} />
      ))}
      <path d="M8 34 Q32 30 56 34" strokeLinecap="round" />
    </svg>
  );
}

/** Mirror of a photo in the pond: flipped, faded, with ripple lines across it. */
function Reflection({ src, mono }: { src: string; mono: string }) {
  return (
    <div className="lh-reflect" aria-hidden="true">
      <Photo src={src} alt="" mono={mono} className="lh-reflect-photo" />
      <svg className="lh-reflect-lines" viewBox="0 0 200 80" preserveAspectRatio="none">
        {Array.from({ length: 7 }, (_, i) => {
          const y = 6 + i * 11;
          const x0 = r2(10 + rand(i * 3 + 1) * 40);
          const x1 = r2(150 + rand(i * 5 + 2) * 40);
          return <path key={i} d={`M${x0} ${y} Q${r2((x0 + x1) / 2)} ${y + (i % 2 ? 2 : -2)} ${x1} ${y}`} fill="none" stroke="#fff" strokeOpacity={r2(0.75 - i * 0.06)} strokeWidth="1.2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />;
        })}
      </svg>
    </div>
  );
}

/* ───────── sections ───────── */

function Title({ kicker, children }: { kicker?: ReactNode; children: ReactNode }) {
  return (
    <h2 className="lh-title iv-reveal">
      <LotusMark className="lh-title-mark" />
      <span>{children}</span>
      {kicker && <small>{kicker}</small>}
    </h2>
  );
}

function Event({ e, title, i }: { e: InviteEvent; title: string; i: number }) {
  const p = parseDate(e.date);
  const map = mapsLink(e);
  const q = [e.venue, e.address].filter(Boolean).join(", ");
  return (
    <article className={`iv-event lh-event iv-reveal ${e.kind}`}>
      <svg className="lh-event-crown" viewBox="0 0 120 56" aria-hidden="true">
        <Pad x={34} y={48} rx={26} ry={6} notch={300} seed={i + 2} pct={50} />
        <Pad x={88} y={50} rx={22} ry={5} notch={240} seed={i + 5} pct={62} />
        <Lotus x={60} y={50} s={38} seed={i + 3} />
      </svg>
      <h3>{e.title || "Sự kiện"}</h3>
      {p && (
        <p className="lh-event-when">
          {e.time && <b>{e.time}</b>}
          {e.time && <i aria-hidden="true" />}
          {p.weekday}
        </p>
      )}
      {p && (
        <div className="lh-event-date">
          <span>
            <T vi="Tháng" en="Month" /> {p.mm}
          </span>
          <b>{p.dd}</b>
          <span>
            <T vi="Năm" en="Year" /> {p.y}
          </span>
        </div>
      )}
      {e.lunar && <p className="iv-event-lunar">{e.lunar}</p>}
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
      {e.venue && <p className="iv-event-venue">{e.venue}</p>}
      {e.address && <p className="iv-event-address">{e.address}</p>}
      {e.showMap && q && (
        <iframe
          className="iv-event-map"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`}
          title={`Bản đồ ${e.venue || e.title}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
      <div className="iv-event-actions">
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
    </article>
  );
}

export default function LienHoaTheme({ d, title, date, mono, guestName, highlights, wishes, show, labels, mainEvent }: ThemeCtx) {
  const lunar = date ? lunarLabel(d.date) : "";
  const mainDate = mainEvent ? parseDate(mainEvent.date) : null;
  const when = [mainEvent?.time, mainDate?.weekday ?? date?.weekday].filter(Boolean).join(" · ");
  const couplePhoto = d.couplePhoto || highlights[0] || d.cover;
  return (
    <>
      {/* ── cover: the photo inside a lotus leaf, the pond rising over its lower edge ── */}
      <section className="lh-hero">
        <svg className="lh-hero-fly" viewBox="0 0 60 60" aria-hidden="true">
          <Dragonfly x={30} y={26} s={20} rot={-38} />
        </svg>
        <p className="lh-kicker iv-reveal">
          <T vi="Thiệp mời cưới" en="Wedding invitation" />
        </p>
        <h1 className="lh-names iv-reveal">
          <span>{d.groomName}</span>
          <i>&amp;</i>
          <span>{d.brideName}</span>
        </h1>
        <div className="lh-leaf iv-reveal">
          <LeafRing className="lh-leaf-ring" />
          <Photo src={d.cover} alt={`Ảnh cưới ${title}`} mono={mono} className="lh-leaf-photo" />
          <Pond className="lh-leaf-pond" seed={1} />
        </div>
        {date && (
          <div className="lh-date iv-reveal">
            <span>{when}</span>
            <b>
              {date.dd}
              <i>·</i>
              {date.mm}
              <i>·</i>
              {date.y}
            </b>
            {lunar && <span className="lh-date-lunar">{lunar}</span>}
          </div>
        )}
      </section>

      {show.families && (
        <section className="iv-sec lh-families">
          <BrushRule className="iv-reveal" />
          <div className="lh-fam-grid">
            {[d.groomFamily, d.brideFamily].map((f, i) => (
              <div key={i} className={`lh-fam iv-reveal ${i ? "r" : "l"}`}>
                <h2>
                  <FamilyTitle which={i ? "brideFamily" : "groomFamily"} />
                </h2>
                <p className="lh-parents">{f.parents}</p>
                {f.address && <p className="lh-addr">{f.address}</p>}
              </div>
            ))}
            <svg className="lh-fam-stem" viewBox="0 0 30 160" preserveAspectRatio="xMidYMin meet" aria-hidden="true">
              <Stem d="M15 40 Q11 100 15 160" w={1.2} />
              <Bud x={15} y={40} s={18} />
            </svg>
          </div>
        </section>
      )}

      {show.couple && (
        <section className="iv-sec lh-couple">
          <Announce className="lh-announce" />
          <div className="lh-mirror iv-reveal">
            <Photo src={couplePhoto} alt={`Ảnh cô dâu chú rể ${title}`} mono={mono} className="lh-mirror-photo" />
            <Reflection src={couplePhoto} mono={mono} />
            <svg className="lh-mirror-pads" viewBox="0 0 400 60" aria-hidden="true">
              <Pad x={46} y={34} rx={42} ry={9} notch={320} seed={4} pct={56} />
              <Pad x={92} y={46} rx={22} ry={5} notch={210} seed={6} pct={44} />
              <Pad x={350} y={38} rx={40} ry={8} notch={220} seed={8} pct={64} />
              <Bud x={330} y={30} s={14} rot={14} />
              <Lotus x={70} y={32} s={30} seed={9} rot={-6} />
            </svg>
          </div>
          <div className="lh-pair">
            <div className="lh-person iv-reveal">
              <em>{labels.first}</em>
              <p>{d.groomFullName || d.groomName}</p>
              <PersonTitle which="groom" />
            </div>
            <LotusMark className="lh-pair-mark iv-reveal" />
            <div className="lh-person iv-reveal">
              <em>{labels.second}</em>
              <p>{d.brideFullName || d.brideName}</p>
              <PersonTitle which="bride" />
            </div>
          </div>
        </section>
      )}

      {show.invite && (
        <section className="iv-sec lh-invite">
          <p className="lh-inv-heading iv-reveal">
            <Bi k="inviteHeading" />
          </p>
          <div className="lh-guest iv-reveal">
            <p>{guestName}</p>
            <Brush className="lh-brush" />
          </div>
          <p className="lh-inv-line iv-reveal">
            <Bi k="inviteLine" />
          </p>
          <div className="lh-trio iv-reveal">
            {[date?.dd, date?.mm, date?.y].map((label, i) => (
              <div key={i} className={`lh-drop d${i}`}>
                <Photo src={highlights[i] ?? ""} alt={`Ảnh cưới ${i + 1}`} mono={mono} />
                <b>{label}</b>
              </div>
            ))}
          </div>
          {d.quote && (
            <blockquote className="lh-quote iv-reveal">
              <Bi k="quote" />
            </blockquote>
          )}
        </section>
      )}

      {show.events && d.events.length > 0 && (
        <section className="iv-sec lh-events">
          <Title kicker={<T vi="Trân trọng kính mời" en="Join us" />}>
            <T vi="Tiệc cưới" en="The celebration" />
          </Title>
          {d.events.map((e, i) => (
            <Event key={e.id} e={e} title={title} i={i} />
          ))}
        </section>
      )}

      {(show.calendar || show.countdown) && date && (
        <section className="iv-sec lh-when">
          <svg className="lh-when-fly" viewBox="0 0 60 60" aria-hidden="true">
            <Dragonfly x={30} y={30} s={18} rot={52} />
          </svg>
          <Title kicker="Save the date">
            <T vi={`Tháng ${date.m}`} en={`${date.mm} · ${date.y}`} />
          </Title>
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
        <section className="iv-sec lh-album">
          <Title kicker={<T vi="Album ảnh cưới" en="Wedding album" />}>Our moments</Title>
          <Gallery photos={d.gallery} mono={mono} />
        </section>
      )}

      {wishes}

      {show.gift && d.gift.enabled && (
        <section className="iv-sec lh-gift">
          <Title>
            <T vi="Hộp mừng cưới" en="Wedding gift" />
          </Title>
          <p className="lh-gift-sub iv-reveal">
            <T vi="Cảm ơn tấm lòng bạn dành cho chúng mình." en="Thank you for your love and kindness." />
          </p>
          <div className="iv-reveal">
            <GiftReveal groom={d.gift.groom} bride={d.gift.bride} />
          </div>
        </section>
      )}

      {show.thanks && (
        <section className="iv-sec iv-thanks lh-thanks">
          <Photo src={d.thanksPhoto || d.cover} alt="" mono="" className="iv-thanks-bg" />
          <div className="iv-thanks-body">
            <LotusMark className="lh-thanks-mark iv-reveal" />
            <h2 className="iv-reveal">Thank you</h2>
            <p className="iv-reveal">
              <Bi k="thanks" />
            </p>
          </div>
          <Pond className="lh-thanks-pond" seed={4} flip />
        </section>
      )}
    </>
  );
}
