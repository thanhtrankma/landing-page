"use client";

import { useId } from "react";
import { lunarLabel } from "@/lib/invites/lunar";
import { mapsLink, parseDate, type InviteEvent } from "@/lib/invites/types";
import { Calendar, calendarLink, Countdown, Gallery, GiftReveal, Photo } from "../parts";
import { Announce, Bi, FamilyTitle, PersonTitle, T } from "../lang";
import type { ThemeCtx } from "./types";
import "./mau-nuoc.css";

// "Hoa màu nước": white watercolour paper, soft pigment washes, loose painted peonies (--c1) with eucalyptus
// sprays (--c2) around an arch and an oval photo, airy script names and thin hand-drawn lines.
// Every ornament is drawn here in SVG and coloured only through var(--c1) / var(--c2), so the variants recolour it.

/* ───────── deterministic helpers (identical on server and client) ───────── */

const rand = (seed: number) => ((seed * 9301 + 49297) % 233280) / 233280;
const r2 = (n: number) => Math.round(n * 100) / 100;
const mix = (c: "c1" | "c2", pct: number, base = "#fff") => `color-mix(in srgb, var(--${c}) ${pct}%, ${base})`;
const DEG = Math.PI / 180;

/** SVG-safe unique id (React's ids contain characters that url(#…) does not like). */
function useSvgId(prefix: string) {
  return prefix + useId().replace(/[^a-zA-Z0-9_-]/g, "");
}

/** Catmull-Rom → cubic Bézier: a smooth, slightly wobbly "hand-drawn" line through the points. */
function smooth(pts: [number, number][]) {
  if (pts.length < 2) return "";
  let d = `M${r2(pts[0][0])} ${r2(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    d += ` C${r2(p1[0] + (p2[0] - p0[0]) / 6)} ${r2(p1[1] + (p2[1] - p0[1]) / 6)} ${r2(p2[0] - (p3[0] - p1[0]) / 6)} ${r2(p2[1] - (p3[1] - p1[1]) / 6)} ${r2(p2[0])} ${r2(p2[1])}`;
  }
  return d;
}

/** Light "wet edge" filter: displaces the painted shapes a little so they never look vector-perfect. */
function PaintFilter({ id, scale = 3.5, seed = 4 }: { id: string; scale?: number; seed?: number }) {
  return (
    <filter id={id} x="-8%" y="-8%" width="116%" height="116%">
      <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed={seed} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={scale} xChannelSelector="R" yChannelSelector="G" />
    </filter>
  );
}

/* ───────── painted botanicals ───────── */

/** A ruffled petal pointing up (-y) from the origin; the notch at the tip gives the peony look. */
const petal = (L: number, W: number) =>
  `M0 0 C${r2(-W)} ${r2(-L * 0.3)} ${r2(-W * 1.05)} ${r2(-L * 0.82)} ${r2(-W * 0.45)} ${r2(-L)} Q0 ${r2(-L * 0.88)} ${r2(W * 0.45)} ${r2(-L)} C${r2(W * 1.05)} ${r2(-L * 0.82)} ${r2(W)} ${r2(-L * 0.3)} 0 0Z`;

/** [petals, length, width, % of --c1, opacity] from the outer ring to the heart. */
const RINGS: [number, number, number, number, number][] = [
  [9, 1, 0.52, 30, 0.72],
  [7, 0.8, 0.5, 42, 0.72],
  [6, 0.58, 0.46, 60, 0.78],
  [5, 0.36, 0.42, 78, 0.85],
];

function Bloom({ x, y, r, seed, rot = 0, tilt = 1 }: { x: number; y: number; r: number; seed: number; rot?: number; tilt?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(1 ${tilt})`}>
      <circle r={r2(r * 1.22)} style={{ fill: "var(--c1)" }} opacity="0.09" />
      {RINGS.map(([n, lf, wf, pct, op], li) =>
        Array.from({ length: n }, (_, i) => {
          const j = rand(seed * 31 + li * 7 + i);
          const a = r2((360 / n) * i + li * 19 + (j - 0.5) * 16);
          const L = r * lf * (0.86 + j * 0.26);
          return (
            <path
              key={`${li}-${i}`}
              d={petal(L, L * wf)}
              transform={`rotate(${a})`}
              style={{ fill: mix("c1", pct), stroke: li === 0 ? mix("c1", 70, "#000") : "none" }}
              strokeOpacity="0.18"
              strokeWidth="0.6"
              opacity={op}
            />
          );
        }),
      )}
      {/* loose pencil strokes inside the cup */}
      <path d={`M${r2(-r * 0.22)} ${r2(-r * 0.05)} Q0 ${r2(-r * 0.28)} ${r2(r * 0.24)} ${r2(-r * 0.02)}`} fill="none" style={{ stroke: mix("c1", 70, "#000") }} strokeOpacity="0.35" strokeWidth="0.8" strokeLinecap="round" />
      <path d={`M${r2(-r * 0.14)} ${r2(r * 0.12)} Q0 ${r2(r * 0.22)} ${r2(r * 0.16)} ${r2(r * 0.1)}`} fill="none" style={{ stroke: mix("c1", 70, "#000") }} strokeOpacity="0.28" strokeWidth="0.7" strokeLinecap="round" />
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i * 60 + seed * 11) * DEG;
        return <circle key={i} cx={r2(Math.cos(a) * r * 0.1)} cy={r2(Math.sin(a) * r * 0.1)} r={r2(r * 0.03 + 0.5)} style={{ fill: mix("c1", 55, "#000") }} opacity="0.55" />;
      })}
    </g>
  );
}

function Bud({ x, y, s, rot }: { x: number; y: number; s: number; rot: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={`M0 0 C${r2(-s * 0.9)} ${r2(-s * 0.4)} ${r2(-s * 0.6)} ${r2(-s * 1.5)} 0 ${r2(-s * 1.7)} C${r2(s * 0.6)} ${r2(-s * 1.5)} ${r2(s * 0.9)} ${r2(-s * 0.4)} 0 0Z`} style={{ fill: mix("c1", 58) }} opacity="0.85" />
      <path d={`M0 ${r2(-s * 0.2)} C${r2(-s * 0.3)} ${r2(-s * 0.7)} ${r2(-s * 0.1)} ${r2(-s * 1.3)} 0 ${r2(-s * 1.55)}`} fill="none" style={{ stroke: mix("c1", 75, "#000") }} strokeOpacity="0.3" strokeWidth="0.7" />
      <path d={`M0 0 C${r2(-s * 0.7)} ${r2(-s * 0.1)} ${r2(-s * 0.8)} ${r2(-s * 0.6)} ${r2(-s * 0.55)} ${r2(-s * 0.85)} C${r2(-s * 0.4)} ${r2(-s * 0.4)} ${r2(-s * 0.2)} ${r2(-s * 0.2)} 0 0Z`} style={{ fill: mix("c2", 80, "#333") }} opacity="0.75" />
      <path d={`M0 0 C${r2(s * 0.7)} ${r2(-s * 0.1)} ${r2(s * 0.8)} ${r2(-s * 0.6)} ${r2(s * 0.55)} ${r2(-s * 0.85)} C${r2(s * 0.4)} ${r2(-s * 0.4)} ${r2(s * 0.2)} ${r2(-s * 0.2)} 0 0Z`} style={{ fill: mix("c2", 70) }} opacity="0.75" />
      <path d={`M0 0 L0 ${r2(s * 1.4)}`} style={{ stroke: mix("c2", 70, "#333") }} strokeWidth="1" strokeLinecap="round" />
    </g>
  );
}

/** Round "silver-dollar" eucalyptus leaf growing up (-y) from its stalk. */
const leaf = (s: number) => `M0 0 C${r2(-s * 0.95)} ${r2(-s * 0.15)} ${r2(-s * 0.9)} ${r2(-s * 1.8)} 0 ${r2(-s * 1.9)} C${r2(s * 0.9)} ${r2(-s * 1.8)} ${r2(s * 0.95)} ${r2(-s * 0.15)} 0 0Z`;

function Eucalyptus({ x, y, len, angle, bend, n, size, seed }: { x: number; y: number; len: number; angle: number; bend: number; n: number; size: number; seed: number }) {
  // stem = quadratic Bézier (0,0) → (len/2, bend) → (len, 0) in the branch's own frame
  const at = (t: number) => {
    const px = 2 * (1 - t) * t * (len / 2) + t * t * len;
    const py = 2 * (1 - t) * t * bend;
    const tx = 2 * (1 - t) * (len / 2) + 2 * t * (len - len / 2);
    const ty = 2 * (1 - t) * bend - 2 * t * bend;
    return { px, py, ang: Math.atan2(ty, tx) / DEG };
  };
  const leaves = [];
  for (let k = 0; k < n; k++) {
    const t = (k + 1) / (n + 0.6);
    const { px, py, ang } = at(t);
    const side = k % 2 ? 1 : -1;
    const j = rand(seed * 17 + k);
    const s = size * (1 - t * 0.45) * (0.85 + j * 0.3);
    const rot = r2(ang + side * (58 + j * 18) + 90);
    leaves.push(
      <g key={k} transform={`translate(${r2(px)} ${r2(py)}) rotate(${rot})`}>
        <path d={leaf(s)} style={{ fill: mix("c2", 42 + Math.round(j * 40)) }} opacity="0.8" />
        <path d={`M0 0 L0 ${r2(-s * 1.55)}`} style={{ stroke: mix("c2", 70, "#2b2b2b") }} strokeOpacity="0.32" strokeWidth="0.55" />
      </g>,
    );
  }
  const tip = at(1);
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path d={`M0 0 Q${r2(len / 2)} ${r2(bend)} ${r2(len)} 0`} fill="none" style={{ stroke: mix("c2", 72, "#3a3a3a") }} strokeWidth="1.1" strokeLinecap="round" />
      {leaves}
      <g transform={`translate(${r2(tip.px)} ${r2(tip.py)}) rotate(${r2(tip.ang + 90)})`}>
        <path d={leaf(size * 0.5)} style={{ fill: mix("c2", 70) }} opacity="0.85" />
      </g>
    </g>
  );
}

/** Fine filler stems with seed dots (wax flower / baby's breath). */
function Filler({ x, y, len, angle, seed }: { x: number; y: number; len: number; angle: number; seed: number }) {
  const twigs = Array.from({ length: 4 }, (_, k) => {
    const t = 0.35 + k * 0.2;
    const side = k % 2 ? 1 : -1;
    const j = rand(seed * 13 + k);
    const bx = len * t;
    const ex = r2(bx + 10 + j * 8);
    const ey = r2(side * (9 + j * 8));
    return (
      <g key={k}>
        <path d={`M${r2(bx)} 0 Q${r2(bx + 4)} ${r2(ey * 0.4)} ${ex} ${ey}`} fill="none" style={{ stroke: mix("c2", 60, "#444") }} strokeWidth="0.6" />
        <circle cx={ex} cy={ey} r={r2(1.6 + j)} style={{ fill: k % 2 ? mix("c1", 70) : mix("c1", 45) }} />
      </g>
    );
  });
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`} opacity="0.9">
      <path d={`M0 0 Q${r2(len / 2)} -4 ${len} 0`} fill="none" style={{ stroke: mix("c2", 60, "#444") }} strokeWidth="0.7" />
      {twigs}
      <circle cx={len} cy="0" r="2" style={{ fill: mix("c1", 70) }} />
    </g>
  );
}

/** Long willow-like leaf painted in one stroke (fills the gaps between the blooms). */
function BigLeaf({ x, y, len, rot, pct = 55 }: { x: number; y: number; len: number; rot: number; pct?: number }) {
  const w = len * 0.24;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={`M0 0 C${r2(-w)} ${r2(-len * 0.3)} ${r2(-w * 0.7)} ${r2(-len * 0.75)} 0 ${r2(-len)} C${r2(w * 0.9)} ${r2(-len * 0.7)} ${r2(w * 0.8)} ${r2(-len * 0.28)} 0 0Z`} style={{ fill: mix("c2", pct) }} opacity="0.72" />
      <path d={`M0 0 Q${r2(w * 0.15)} ${r2(-len * 0.5)} 0 ${r2(-len * 0.92)}`} fill="none" style={{ stroke: mix("c2", 70, "#2b2b2b") }} strokeOpacity="0.35" strokeWidth="0.6" />
    </g>
  );
}

/** The main painted spray: three peonies, buds, eucalyptus, leaves and fillers. viewBox 320×220, centred. */
function Bouquet({ className = "", seed = 1 }: { className?: string; seed?: number }) {
  const fid = useSvgId("mnp");
  return (
    <svg className={className} viewBox="0 0 320 220" aria-hidden="true">
      <defs>
        <PaintFilter id={fid} seed={seed + 2} />
      </defs>
      <g filter={`url(#${fid})`}>
        <ellipse cx="160" cy="122" rx="92" ry="44" style={{ fill: "var(--c1)" }} opacity="0.07" />
        <ellipse cx="196" cy="104" rx="70" ry="34" style={{ fill: "var(--c2)" }} opacity="0.08" />
        <Eucalyptus x={160} y={124} len={156} angle={194} bend={-30} n={9} size={13} seed={seed} />
        <Eucalyptus x={164} y={120} len={150} angle={-14} bend={26} n={9} size={12.5} seed={seed + 1} />
        <Eucalyptus x={156} y={114} len={100} angle={236} bend={18} n={6} size={10} seed={seed + 2} />
        <Eucalyptus x={168} y={116} len={92} angle={-64} bend={-14} n={5} size={9} seed={seed + 3} />
        <Eucalyptus x={158} y={130} len={74} angle={126} bend={-12} n={4} size={9} seed={seed + 4} />
        <Filler x={160} y={118} len={92} angle={-40} seed={seed + 4} />
        <Filler x={154} y={124} len={96} angle={212} seed={seed + 5} />
        <Filler x={166} y={128} len={70} angle={30} seed={seed + 6} />
        <Filler x={156} y={118} len={70} angle={262} seed={seed + 7} />
        <BigLeaf x={150} y={134} len={52} rot={-118} pct={60} />
        <BigLeaf x={176} y={130} len={48} rot={112} pct={48} />
        <BigLeaf x={196} y={110} len={44} rot={58} pct={66} />
        <BigLeaf x={118} y={124} len={40} rot={-70} pct={52} />
        <Bud x={246} y={84} s={14} rot={52} />
        <Bud x={72} y={98} s={12} rot={-58} />
        <Bud x={206} y={150} s={10} rot={140} />
        <Bloom x={106} y={136} r={24} seed={seed + 3} rot={12} tilt={0.9} />
        <Bloom x={214} y={106} r={32} seed={seed + 2} rot={30} tilt={0.88} />
        <Bloom x={156} y={124} r={44} seed={seed} tilt={0.92} />
      </g>
    </svg>
  );
}

/** A lighter corner spray: eucalyptus, a peony and a bud. viewBox 200×200, grows from the bottom-left corner. */
function Spray({ className = "", seed = 5 }: { className?: string; seed?: number }) {
  const fid = useSvgId("mns");
  return (
    <svg className={className} viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <PaintFilter id={fid} seed={seed} />
      </defs>
      <g filter={`url(#${fid})`}>
        <Eucalyptus x={18} y={182} len={182} angle={-50} bend={-22} n={10} size={12} seed={seed} />
        <Eucalyptus x={22} y={178} len={124} angle={-18} bend={14} n={7} size={10} seed={seed + 1} />
        <Eucalyptus x={20} y={178} len={116} angle={-82} bend={10} n={6} size={9.5} seed={seed + 2} />
        <Filler x={20} y={180} len={100} angle={-36} seed={seed + 3} />
        <Filler x={20} y={180} len={80} angle={-66} seed={seed + 5} />
        <BigLeaf x={30} y={176} len={44} rot={64} pct={58} />
        <BigLeaf x={34} y={170} len={40} rot={8} pct={48} />
        <Bud x={84} y={138} s={12} rot={34} />
        <Bloom x={40} y={164} r={26} seed={seed + 4} tilt={0.9} />
      </g>
    </svg>
  );
}

/** Soft pigment wash with a darker dried edge, like a wet brush pooled on paper. */
function Wash({ className = "", tone = "c1", seed = 3 }: { className?: string; tone?: "c1" | "c2"; seed?: number }) {
  const fid = useSvgId("mnw");
  const gid = useSvgId("mng");
  const c = `var(--${tone})`;
  const blobs = [0, 1, 2].map((i) => ({
    cx: r2(100 + (rand(seed * 5 + i) - 0.5) * 40),
    cy: r2(80 + (rand(seed * 7 + i) - 0.5) * 24),
    rx: r2(40 + rand(seed * 3 + i) * 20),
    ry: r2(28 + rand(seed * 11 + i) * 14),
  }));
  return (
    <svg className={className} viewBox="0 0 200 160" aria-hidden="true">
      <defs>
        <filter id={fid} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.024" numOctaves="3" seed={seed} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
        <radialGradient id={gid}>
          <stop offset="0" style={{ stopColor: c }} stopOpacity="0.08" />
          <stop offset="0.75" style={{ stopColor: c }} stopOpacity="0.16" />
          <stop offset="1" style={{ stopColor: c }} stopOpacity="0.24" />
        </radialGradient>
      </defs>
      <g filter={`url(#${fid})`}>
        {blobs.map((b, i) => (
          <ellipse key={i} {...b} fill={`url(#${gid})`} />
        ))}
        <ellipse {...blobs[0]} fill="none" style={{ stroke: c }} strokeOpacity="0.22" strokeWidth="1.2" />
      </g>
    </svg>
  );
}

/* ───────── hand-drawn lines ───────── */

/** Points around an arch (straight sides, round top) from fraction t0 to t1 of its perimeter, with a little wobble. */
function archPts(x0: number, x1: number, top: number, bottom: number, t0: number, t1: number, seed: number, wob: number) {
  const r = (x1 - x0) / 2;
  const cx = x0 + r;
  const cy = top + r;
  const side = bottom - cy;
  const P = 2 * side + Math.PI * r;
  const N = 36;
  const pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const s = (t0 + ((t1 - t0) * i) / N) * P;
    let x: number, y: number;
    if (s < side) [x, y] = [x0, bottom - s];
    else if (s < side + Math.PI * r) {
      const a = Math.PI + (s - side) / r;
      [x, y] = [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    } else [x, y] = [x1, cy + (s - side - Math.PI * r)];
    pts.push([x + (rand(seed * 41 + i) - 0.5) * wob, y + (rand(seed * 43 + i) - 0.5) * wob]);
  }
  return pts;
}

function ArchLines({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 220 300" preserveAspectRatio="none" aria-hidden="true" fill="none" strokeLinecap="round">
      <path d={smooth(archPts(3, 217, 3, 300, 0, 1, 1, 1.6))} style={{ stroke: mix("c1", 60, "#555") }} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
      <path d={smooth(archPts(-2, 222, -1, 286, 0.04, 0.82, 2, 2.2))} style={{ stroke: mix("c2", 70, "#555") }} strokeOpacity="0.7" strokeWidth="0.7" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Hand-drawn loop around an oval photo (overshoots where it closes, like a pen stroke). */
function OvalLines({ className = "" }: { className?: string }) {
  const loop = (rx: number, ry: number, a0: number, sweep: number, seed: number, wob: number) =>
    smooth(
      Array.from({ length: 41 }, (_, i): [number, number] => {
        const a = (a0 + (sweep * i) / 40) * DEG;
        return [100 + Math.cos(a) * rx + (rand(seed * 29 + i) - 0.5) * wob, 130 + Math.sin(a) * ry + (rand(seed * 31 + i) - 0.5) * wob];
      }),
    );
  return (
    <svg className={className} viewBox="0 0 200 260" preserveAspectRatio="none" aria-hidden="true" fill="none" strokeLinecap="round">
      <path d={loop(97, 127, 100, 372, 3, 1.6)} style={{ stroke: mix("c1", 60, "#555") }} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
      <path d={loop(101, 131, 300, 250, 4, 2)} style={{ stroke: mix("c2", 70, "#555") }} strokeOpacity="0.7" strokeWidth="0.7" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Thin pen line with a small leaf sprig in the middle: the divider between blocks. */
function Rule({ className = "" }: { className?: string }) {
  const line = (x0: number, x1: number, seed: number) => smooth(Array.from({ length: 7 }, (_, i): [number, number] => [x0 + ((x1 - x0) * i) / 6, 15 + (rand(seed * 19 + i) - 0.5) * 2.4]));
  return (
    <svg className={`mn-rule ${className}`} viewBox="0 0 200 30" aria-hidden="true" fill="none" strokeLinecap="round">
      <path d={line(4, 78, 1)} style={{ stroke: mix("c1", 55, "#666") }} strokeWidth="0.8" />
      <path d={line(122, 196, 2)} style={{ stroke: mix("c1", 55, "#666") }} strokeWidth="0.8" />
      <path d="M84 16 Q100 10 116 16" style={{ stroke: mix("c2", 70, "#444") }} strokeWidth="0.8" />
      {[
        [90, 14, -40],
        [100, 12, 0],
        [110, 14, 40],
        [95, 15, -130],
        [105, 15, 130],
      ].map(([x, y, a], i) => (
        <path key={i} d={leaf(i < 3 ? 4.2 : 3.4)} transform={`translate(${x} ${y}) rotate(${a})`} style={{ fill: i === 1 ? mix("c1", 70) : mix("c2", 55 + i * 6) }} opacity="0.85" />
      ))}
    </svg>
  );
}

/** Brush-pen swash under the guest's name. */
function Swash({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 300 30" aria-hidden="true" fill="none" strokeLinecap="round">
      <path d="M12 18 C 70 6, 130 26, 190 14 S 268 8, 288 16" style={{ stroke: mix("c1", 70, "#555") }} strokeWidth="1.1" />
      <path d="M40 22 C 100 14, 170 26, 236 18" style={{ stroke: mix("c2", 70, "#555") }} strokeOpacity="0.6" strokeWidth="0.7" />
      <path d={leaf(4.5)} transform="translate(288 16) rotate(60)" style={{ fill: mix("c2", 60) }} />
      <path d={leaf(3.6)} transform="translate(286 16) rotate(130)" style={{ fill: mix("c1", 55) }} />
    </svg>
  );
}

/* ───────── sections ───────── */

function Event({ e, title }: { e: InviteEvent; title: string }) {
  const p = parseDate(e.date);
  const map = mapsLink(e);
  const q = [e.venue, e.address].filter(Boolean).join(", ");
  return (
    <article className={`mn-event iv-reveal ${e.kind}`}>
      <Spray className="mn-event-spray" seed={e.title.length + 3} />
      <h3>{e.title || "Sự kiện"}</h3>
      {p && (
        <p className="mn-event-when">
          {e.time && <b>{e.time}</b>}
          {e.time && <span aria-hidden="true">·</span>}
          {p.weekday}
        </p>
      )}
      {p && (
        <p className="mn-event-date">
          {p.dd}
          <i>.</i>
          {p.mm}
          <i>.</i>
          {p.y}
        </p>
      )}
      {e.lunar && <p className="mn-event-lunar">{e.lunar}</p>}
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
      {e.venue && <p className="mn-event-venue">{e.venue}</p>}
      {e.address && <p className="mn-event-address">{e.address}</p>}
      {e.showMap && q && (
        <iframe
          className="iv-event-map"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`}
          title={`Bản đồ ${e.venue || e.title}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
      <div className="mn-event-actions">
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

export default function MauNuocTheme({ d, title, date, mono, guestName, highlights, wishes, show, labels, mainEvent }: ThemeCtx) {
  const lunar = lunarLabel(d.date);
  return (
    <>
      <section className="mn-hero">
        <Wash className="mn-wash mn-wash-a" tone="c1" seed={3} />
        <Wash className="mn-wash mn-wash-b" tone="c2" seed={7} />
        <p className="mn-kicker iv-reveal">
          <T vi="Thiệp mời cưới" en="Wedding invitation" />
        </p>
        <div className="mn-arch iv-reveal">
          <Photo src={d.cover} alt={`Ảnh cưới ${title}`} mono={mono} className="mn-arch-photo" />
          <ArchLines className="mn-arch-lines" />
          <Spray className="mn-arch-spray" seed={2} />
          <Bouquet className="mn-arch-bouquet" seed={1} />
        </div>
        <h1 className="mn-names iv-reveal">
          <span>{d.groomName}</span>
          <i>&amp;</i>
          <span>{d.brideName}</span>
        </h1>
        {date && (
          <div className="mn-datebar iv-reveal">
            <span>{mainEvent?.time ? `${mainEvent.time} · ` : ""}{date.weekday}</span>
            <b>{date.dd}</b>
            <span>Tháng {date.mm} · {date.y}</span>
          </div>
        )}
        {lunar && <p className="mn-lunar iv-reveal">{lunar}</p>}
      </section>

      {show.families && (
        <section className="iv-sec mn-families">
          <Rule className="iv-reveal" />
          <div className="mn-families-grid">
            {[d.groomFamily, d.brideFamily].map((f, i) => (
              <div key={i} className="mn-family iv-reveal">
                <h2>
                  <FamilyTitle which={i ? "brideFamily" : "groomFamily"} />
                </h2>
                <p className="mn-parents">{f.parents}</p>
                {f.address && <p className="mn-addr">{f.address}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {show.couple && (
        <section className="iv-sec mn-couple">
          <Wash className="mn-wash mn-wash-c" tone="c1" seed={11} />
          <Announce className="mn-announce" />
          <div className="mn-oval iv-reveal">
            <Photo src={d.couplePhoto || highlights[0] || d.cover} alt={`Ảnh cô dâu chú rể ${title}`} mono={mono} className="mn-oval-photo" />
            <OvalLines className="mn-oval-lines" />
            <Bouquet className="mn-oval-bouquet" seed={4} />
            <Spray className="mn-oval-spray" seed={9} />
          </div>
          <div className="mn-pair">
            <div className="iv-reveal">
              <em>{labels.first}</em>
              <p>{d.groomFullName || d.groomName}</p>
              <PersonTitle which="groom" />
            </div>
            <i className="iv-reveal" aria-hidden="true">
              &amp;
            </i>
            <div className="iv-reveal">
              <em>{labels.second}</em>
              <p>{d.brideFullName || d.brideName}</p>
              <PersonTitle which="bride" />
            </div>
          </div>
        </section>
      )}

      {show.invite && (
        <section className="iv-sec mn-invite">
          <p className="mn-inv-heading iv-reveal">
            <Bi k="inviteHeading" />
          </p>
          <div className="mn-guest iv-reveal">
            <p>{guestName}</p>
            <Swash className="mn-swash" />
          </div>
          <p className="mn-inv-line iv-reveal">
            <Bi k="inviteLine" />
          </p>
          <div className="mn-trio iv-reveal">
            {[date?.dd, date?.mm, date?.y].map((label, i) => (
              <Photo key={i} src={highlights[i] ?? ""} alt={`Ảnh cưới ${i + 1}`} mono={mono}>
                <b>{label}</b>
              </Photo>
            ))}
          </div>
          {d.quote && (
            <p className="mn-quote iv-reveal">
              <Bi k="quote" />
            </p>
          )}
        </section>
      )}

      {show.events && d.events.length > 0 && (
        <section className="iv-sec mn-events">
          <h2 className="mn-title iv-reveal">
            <span>
              <T vi="Tiệc cưới" en="The celebration" />
            </span>
            <small>Save the date</small>
          </h2>
          {d.events.map((e) => (
            <Event key={e.id} e={e} title={title} />
          ))}
        </section>
      )}

      {(show.calendar || show.countdown) && (
        <section className="iv-sec mn-when">
          <Wash className="mn-wash mn-wash-d" tone="c2" seed={13} />
          {date && (
            <h2 className="mn-title iv-reveal">
              <span>Tháng {date.m}</span>
              <small>{date.y}</small>
            </h2>
          )}
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
        <section className="iv-sec mn-album">
          <h2 className="mn-title iv-reveal">
            <span>Our moments</span>
            <small>
              <T vi="Album ảnh cưới" en="Wedding album" />
            </small>
          </h2>
          <Gallery photos={d.gallery} mono={mono} />
        </section>
      )}

      {wishes}

      {show.gift && d.gift.enabled && (
        <section className="iv-sec mn-gift">
          <Spray className="mn-gift-spray" seed={6} />
          <h2 className="mn-title iv-reveal">
            <span>
              <T vi="Hộp mừng cưới" en="Wedding gift" />
            </span>
          </h2>
          <p className="mn-gift-sub iv-reveal">
            <T vi="Cảm ơn tấm lòng bạn dành cho chúng mình." en="Thank you for your love and kindness." />
          </p>
          <div className="iv-reveal">
            <GiftReveal groom={d.gift.groom} bride={d.gift.bride} />
          </div>
        </section>
      )}

      {show.thanks && (
        <section className="iv-sec iv-thanks mn-thanks">
          <Photo src={d.thanksPhoto || d.cover} alt="" mono="" className="iv-thanks-bg" />
          <Bouquet className="mn-thanks-bouquet" seed={7} />
          <div className="iv-thanks-body">
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
