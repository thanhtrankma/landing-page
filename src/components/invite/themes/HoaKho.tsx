"use client";

import { useId, type ReactNode } from "react";
import { lunarLabel } from "@/lib/invites/lunar";
import { mapsLink, parseDate, type InviteEvent } from "@/lib/invites/types";
import { Calendar, calendarLink, Countdown, Gallery, GiftReveal, Photo } from "../parts";
import { Announce, Bi, FamilyTitle, PersonTitle, T } from "../lang";
import type { ThemeCtx } from "./types";
import "./hoa-kho.css";

// "Hoa Khô": boho dried flowers on kraft paper and linen. Pampas plumes, bunny tails, dried palm fans,
// ruscus and strawflowers are drawn here in SVG; a rattan arch holds the cover photo, a macramé hoop the couple,
// kraft tags hang from twine, and macramé fringes divide the sections. Colours come only from var(--c1) (dried
// terracotta: palm fans, strawflowers, accents) and var(--c2) (sage leaves), mixed with creams and greiges.

/* ───────── deterministic helpers (identical on server and client) ───────── */

const rand = (seed: number) => (((seed * 9301 + 49297) % 233280) + 233280) % 233280 / 233280;
const r2 = (n: number) => Math.round(n * 100) / 100;
const DEG = Math.PI / 180;
const mix = (c: "c1" | "c2", pct: number, base = "#fff") => `color-mix(in srgb, var(--${c}) ${pct}%, ${base})`;

// dried-material tones: creams and greiges lightly tinted by the main colour
const PLUME_A = mix("c1", 12, "#ece1cf");
const PLUME_B = mix("c1", 24, "#cfbea3");
const STEM = mix("c1", 18, "#8a7c6c");
const TWINE = mix("c1", 26, "#b8a68e");
const TWINE_DARK = mix("c1", 30, "#7d6b58");

function useSvgId(prefix: string) {
  return prefix + useId().replace(/[^a-zA-Z0-9_-]/g, "");
}

/** Catmull-Rom → cubic Bézier through the points (a soft, hand-drawn line). */
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

/** A stem as a quadratic curve (0,0) → (len/2, bend) → (len, 0) in its own frame: point + tangent angle at t. */
const stemAt = (len: number, bend: number) => (t: number) => ({
  x: 2 * (1 - t) * t * (len / 2) + t * t * len,
  y: 2 * (1 - t) * t * bend,
  ang: Math.atan2(2 * (1 - t) * bend - 2 * t * bend, len) / DEG,
});

type StemProps = { x: number; y: number; len: number; angle: number; bend?: number; seed: number };

/* ───────── dried botanicals ───────── */

/** Pampas plume: a fine stem whose upper half bursts into hundreds of wispy strands sweeping toward the tip. */
function Pampas({ x, y, len, angle, bend = 0, w = 15, seed }: StemProps & { w?: number }) {
  const at = stemAt(len, bend);
  const n = Math.round(len * 0.62);
  let a = "";
  let b = "";
  for (let i = 0; i < n; i++) {
    const t = 0.4 + (0.6 * i) / (n - 1);
    const u = (t - 0.4) / 0.6;
    const env = Math.pow(Math.sin(Math.PI * Math.min(1, u * 0.9 + 0.1)), 0.75) * (1 - u * 0.25);
    const p = at(t);
    const side = i % 2 ? 1 : -1;
    const j = rand(seed * 53 + i * 7);
    const L = w * env * (0.65 + j * 0.55);
    const sa = (p.ang + side * (24 + j * 30)) * DEG;
    const fa = p.ang * DEG;
    const ex = p.x + Math.cos(sa) * L + Math.cos(fa) * L * 0.25;
    const ey = p.y + Math.sin(sa) * L + Math.sin(fa) * L * 0.25;
    const cx = p.x + Math.cos(sa) * L * 0.55;
    const cy = p.y + Math.sin(sa) * L * 0.55;
    const seg = `M${r2(p.x)} ${r2(p.y)}Q${r2(cx)} ${r2(cy)} ${r2(ex)} ${r2(ey)}`;
    if (j > 0.45) a += seg;
    else b += seg;
  }
  const body = smooth(Array.from({ length: 9 }, (_, i): [number, number] => {
    const p = at(0.5 + (0.46 * i) / 8);
    return [p.x, p.y];
  }));
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`} fill="none" strokeLinecap="round">
      <path d={`M0 0 Q${r2(len / 2)} ${r2(bend)} ${r2(len)} 0`} style={{ stroke: STEM }} strokeWidth="1" />
      <path d={body} style={{ stroke: PLUME_B }} strokeWidth={r2(w * 0.95)} opacity="0.45" />
      <path d={body} style={{ stroke: PLUME_A }} strokeWidth={r2(w * 0.5)} opacity="0.6" />
      <path d={b} style={{ stroke: PLUME_B }} strokeWidth="0.9" opacity="0.85" />
      <path d={a} style={{ stroke: PLUME_A }} strokeWidth="0.8" opacity="0.95" />
    </g>
  );
}

/** Bunny tail (Lagurus): a hair-thin stem topped by a soft, fuzzy oval. */
function Bunny({ x, y, len, angle, bend = 0, seed, s = 1 }: StemProps & { s?: number }) {
  const at = stemAt(len, bend);
  const tip = at(1);
  const rx = 4.2 * s;
  const ry = 8.5 * s;
  let fuzz = "";
  for (let i = 0; i < 22; i++) {
    const a = ((360 / 22) * i + rand(seed * 11 + i) * 10) * DEG;
    const px = Math.cos(a) * rx * 0.9;
    const py = Math.sin(a) * ry * 0.9;
    const k = 1.6 * s + rand(seed * 17 + i) * 1.4 * s;
    fuzz += `M${r2(px)} ${r2(py)}L${r2(px + Math.cos(a) * k)} ${r2(py + Math.sin(a) * k)}`;
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path d={`M0 0 Q${r2(len / 2)} ${r2(bend)} ${r2(len)} 0`} fill="none" style={{ stroke: STEM }} strokeWidth="0.7" />
      <g transform={`translate(${r2(tip.x + ry * 0.8)} ${r2(tip.y)}) rotate(${r2(tip.ang + 90)})`}>
        <ellipse rx={r2(rx * 1.25)} ry={r2(ry * 1.15)} style={{ fill: PLUME_B }} opacity="0.5" />
        <ellipse rx={rx} ry={ry} style={{ fill: PLUME_A }} />
        <path d={fuzz} fill="none" style={{ stroke: PLUME_A }} strokeWidth="0.7" strokeLinecap="round" />
        <ellipse cx={r2(-rx * 0.3)} cy={r2(-ry * 0.25)} rx={r2(rx * 0.35)} ry={r2(ry * 0.45)} fill="#fff" opacity="0.55" />
      </g>
    </g>
  );
}

/** Dried palm fan opening toward -y: pleated wedges with a ragged rim, on a short stem going down (+y). */
function Palm({ x, y, r, rot, seed, tone = "c1" }: { x: number; y: number; r: number; rot: number; seed: number; tone?: "c1" | "cream" }) {
  const K = 15;
  const span = 74;
  const pt = (a: number, R: number): [number, number] => [r2(Math.sin(a * DEG) * R), r2(-Math.cos(a * DEG) * R)];
  const rim = Array.from({ length: K + 1 }, (_, k) => r * (0.86 + rand(seed * 29 + k) * 0.16));
  const light = tone === "c1" ? mix("c1", 62, "#f3e9dc") : mix("c1", 8, "#efe6d6");
  const dark = tone === "c1" ? mix("c1", 88, "#5a4636") : mix("c1", 16, "#d6c7b0");
  const line = tone === "c1" ? mix("c1", 70, "#3b2e24") : mix("c1", 20, "#a8957c");
  const hub: [number, number] = [0, r2(-r * 0.1)];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={`M0 ${r2(-r * 0.1)} Q${r2(r * 0.06)} ${r2(r * 0.6)} ${r2(-r * 0.04)} ${r2(r * 1.2)}`} fill="none" style={{ stroke: line }} strokeWidth={r2(Math.max(1.2, r * 0.05))} strokeLinecap="round" />
      {Array.from({ length: K }, (_, k) => {
        const a0 = -span + ((2 * span) / K) * k;
        const a1 = a0 + (2 * span) / K;
        const am = (a0 + a1) / 2;
        const p0 = pt(a0, rim[k]);
        const p1 = pt(a1, rim[k + 1]);
        const pm = pt(am, ((rim[k] + rim[k + 1]) / 2) * 1.05);
        return (
          <path
            key={k}
            d={`M${hub[0]} ${hub[1]}L${p0[0]} ${p0[1]}L${pm[0]} ${pm[1]}L${p1[0]} ${p1[1]}Z`}
            style={{ fill: k % 2 ? light : dark }}
            opacity={k % 2 ? 0.95 : 0.9}
          />
        );
      })}
      <path
        d={Array.from({ length: K + 1 }, (_, k) => {
          const p = pt(-span + ((2 * span) / K) * k, rim[k] * 0.97);
          return `M${hub[0]} ${hub[1]}L${p[0]} ${p[1]}`;
        }).join("")}
        fill="none"
        style={{ stroke: line }}
        strokeOpacity="0.45"
        strokeWidth="0.5"
      />
      <ellipse cx="0" cy={r2(-r * 0.08)} rx={r2(r * 0.13)} ry={r2(r * 0.08)} style={{ fill: line }} opacity="0.8" />
    </g>
  );
}

/** Ruscus / willow-leaf stem in the accent green. */
function Ruscus({ x, y, len, angle, bend = 0, seed, n = 7, size = 9 }: StemProps & { n?: number; size?: number }) {
  const at = stemAt(len, bend);
  const leaf = (s: number) => `M0 0 C${r2(-s * 0.42)} ${r2(-s * 0.5)} ${r2(-s * 0.3)} ${r2(-s * 1.5)} 0 ${r2(-s * 2.1)} C${r2(s * 0.32)} ${r2(-s * 1.45)} ${r2(s * 0.42)} ${r2(-s * 0.5)} 0 0Z`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path d={`M0 0 Q${r2(len / 2)} ${r2(bend)} ${r2(len)} 0`} fill="none" style={{ stroke: mix("c2", 70, "#3c3a30") }} strokeWidth="0.9" strokeLinecap="round" />
      {Array.from({ length: n }, (_, k) => {
        const t = (k + 1) / (n + 0.5);
        const p = at(t);
        const j = rand(seed * 19 + k);
        const side = k % 2 ? 1 : -1;
        const s = size * (1 - t * 0.4) * (0.85 + j * 0.3);
        return (
          <g key={k} transform={`translate(${r2(p.x)} ${r2(p.y)}) rotate(${r2(p.ang + 90 + side * (50 + j * 20))})`}>
            <path d={leaf(s)} style={{ fill: mix("c2", 55 + Math.round(j * 35), "#e9e4d6") }} opacity="0.92" />
            <path d={`M0 0L0 ${r2(-s * 1.8)}`} style={{ stroke: mix("c2", 70, "#2e2c24") }} strokeOpacity="0.35" strokeWidth="0.5" />
          </g>
        );
      })}
      <g transform={`translate(${r2(at(1).x)} ${r2(at(1).y)}) rotate(${r2(at(1).ang + 90)})`}>
        <path d={leaf(size * 0.6)} style={{ fill: mix("c2", 80, "#e9e4d6") }} />
      </g>
    </g>
  );
}

/** Wild grass / dried wheat: grains along the top of the stem. */
function Grass({ x, y, len, angle, bend = 0, seed }: StemProps) {
  const at = stemAt(len, bend);
  let grains = "";
  for (let k = 0; k < 12; k++) {
    const t = 0.55 + k * 0.037;
    const p = at(t);
    const side = k % 2 ? 1 : -1;
    const a = (p.ang + side * 28) * DEG;
    const L = 6.5 - k * 0.3 + rand(seed + k) * 1.2;
    grains += `M${r2(p.x)} ${r2(p.y)}L${r2(p.x + Math.cos(a) * L)} ${r2(p.y + Math.sin(a) * L)}`;
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`} fill="none" strokeLinecap="round">
      <path d={`M0 0 Q${r2(len / 2)} ${r2(bend)} ${r2(len)} 0`} style={{ stroke: STEM }} strokeWidth="0.7" />
      <path d={grains} style={{ stroke: TWINE }} strokeWidth="2.4" />
      <path d={grains} style={{ stroke: PLUME_A }} strokeWidth="0.9" opacity="0.7" />
    </g>
  );
}

/** Strawflower: a small papery bloom in the main colour. */
function Straw({ x, y, r, seed }: { x: number; y: number; r: number; seed: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: 12 }, (_, i) => {
        const a = r2(i * 30 + rand(seed * 7 + i) * 12);
        return <ellipse key={i} cx="0" cy={r2(-r * 0.55)} rx={r2(r * 0.28)} ry={r2(r * 0.5)} transform={`rotate(${a})`} style={{ fill: i % 2 ? mix("c1", 70, "#f3e8da") : mix("c1", 92, "#4a3a2e") }} />;
      })}
      <circle r={r2(r * 0.4)} style={{ fill: mix("c1", 55, "#3a2d22") }} />
      <circle r={r2(r * 0.2)} cx={r2(-r * 0.1)} cy={r2(-r * 0.1)} style={{ fill: mix("c1", 40, "#f3e8da") }} opacity="0.6" />
    </g>
  );
}

/** Lunaria (honesty) seed disc: a translucent paper moon. */
function Lunaria({ x, y, r, rot = 0 }: { x: number; y: number; r: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <ellipse rx={r} ry={r2(r * 0.86)} fill="#fff" opacity="0.62" style={{ stroke: TWINE }} strokeWidth="0.6" />
      <circle cx={r2(-r * 0.3)} cy={r2(-r * 0.1)} r={r2(r * 0.12)} style={{ fill: TWINE }} opacity="0.55" />
      <circle cx={r2(r * 0.1)} cy={r2(r * 0.2)} r={r2(r * 0.1)} style={{ fill: TWINE }} opacity="0.45" />
    </g>
  );
}

/** A twine bow with trailing ends, tied where the stems gather. */
function Bow({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" strokeLinecap="round" style={{ stroke: TWINE_DARK }}>
      <path d="M0 0 C-10 -12 -26 -8 -20 2 C-15 9 -6 4 0 0Z" strokeWidth="1.6" />
      <path d="M0 0 C10 -12 26 -8 20 2 C15 9 6 4 0 0Z" strokeWidth="1.6" />
      <path d="M0 0 C-4 10 -10 18 -16 28" strokeWidth="1.4" />
      <path d="M0 0 C4 12 6 20 12 30" strokeWidth="1.4" />
      <circle r="2.6" style={{ fill: TWINE_DARK }} stroke="none" />
    </g>
  );
}

/** The big dried bouquet: pampas, palm fans, bunny tails, grass, ruscus and strawflowers tied with twine.
 *  viewBox 300×250, stems gathered at (150, 236). */
function Bunch({ className = "", seed = 1 }: { className?: string; seed?: number }) {
  const gid = useSvgId("hkb");
  const gx = 150;
  const gy = 236;
  const hub = (a: number, d: number): [number, number] => [r2(gx + Math.cos(a * DEG) * d), r2(gy + Math.sin(a * DEG) * d)];
  const p1 = hub(-122, 104);
  const p2 = hub(-58, 86);
  const p3 = hub(-92, 64);
  return (
    <svg className={className} viewBox="0 0 300 250" aria-hidden="true">
      <defs>
        <radialGradient id={gid}>
          <stop offset="0" style={{ stopColor: "var(--c1)" }} stopOpacity="0.16" />
          <stop offset="1" style={{ stopColor: "var(--c1)" }} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="150" cy="150" rx="140" ry="90" fill={`url(#${gid})`} />
      <Pampas x={gx} y={gy} len={214} angle={-130} bend={-16} w={17} seed={seed} />
      <Pampas x={gx} y={gy} len={226} angle={-100} bend={10} w={18} seed={seed + 1} />
      <Pampas x={gx} y={gy} len={196} angle={-66} bend={-14} w={16} seed={seed + 2} />
      <Pampas x={gx} y={gy} len={150} angle={-34} bend={12} w={13} seed={seed + 3} />
      <Pampas x={gx} y={gy} len={140} angle={-156} bend={-10} w={12} seed={seed + 4} />
      <Grass x={gx} y={gy} len={176} angle={-146} bend={-8} seed={seed + 5} />
      <Grass x={gx} y={gy} len={190} angle={-80} bend={6} seed={seed + 6} />
      <Grass x={gx} y={gy} len={150} angle={-20} bend={-6} seed={seed + 7} />
      <Ruscus x={gx} y={gy} len={136} angle={-168} bend={-14} seed={seed + 8} n={8} size={9} />
      <Ruscus x={gx} y={gy} len={150} angle={-14} bend={16} seed={seed + 9} n={8} size={9} />
      <Ruscus x={gx} y={gy} len={120} angle={-108} bend={-10} seed={seed + 10} n={6} size={8} />
      <path d={`M${gx} ${gy}L${p1[0]} ${p1[1]}M${gx} ${gy}L${p2[0]} ${p2[1]}M${gx} ${gy}L${p3[0]} ${p3[1]}`} fill="none" style={{ stroke: STEM }} strokeWidth="1.3" />
      <Palm x={p1[0]} y={p1[1]} r={50} rot={-30} seed={seed + 11} />
      <Palm x={p2[0]} y={p2[1]} r={40} rot={34} seed={seed + 12} tone="cream" />
      <Palm x={p3[0]} y={p3[1]} r={30} rot={6} seed={seed + 13} />
      <Bunny x={gx} y={gy} len={160} angle={-140} bend={-8} seed={seed + 14} />
      <Bunny x={gx} y={gy} len={176} angle={-116} bend={6} seed={seed + 15} s={1.1} />
      <Bunny x={gx} y={gy} len={150} angle={-74} bend={-6} seed={seed + 16} />
      <Bunny x={gx} y={gy} len={128} angle={-46} bend={8} seed={seed + 17} s={0.9} />
      <Bunny x={gx} y={gy} len={112} angle={-160} bend={6} seed={seed + 18} s={0.85} />
      <Lunaria x={198} y={168} r={11} rot={20} />
      <Lunaria x={212} y={150} r={9} rot={-10} />
      <Lunaria x={98} y={176} r={10} rot={-20} />
      <Straw x={132} y={190} r={11} seed={seed + 19} />
      <Straw x={170} y={198} r={9} seed={seed + 20} />
      <Straw x={154} y={176} r={8} seed={seed + 21} />
      <Straw x={114} y={206} r={7} seed={seed + 22} />
      <Bow x={gx} y={gy - 6} s={0.9} />
    </svg>
  );
}

/** A lighter spray growing from the bottom-left corner. viewBox 200×200. */
function Spray({ className = "", seed = 5 }: { className?: string; seed?: number }) {
  return (
    <svg className={className} viewBox="0 0 200 200" aria-hidden="true">
      <Pampas x={14} y={192} len={196} angle={-58} bend={-12} w={15} seed={seed} />
      <Pampas x={14} y={192} len={150} angle={-24} bend={10} w={12} seed={seed + 1} />
      <Grass x={14} y={192} len={170} angle={-74} bend={6} seed={seed + 2} />
      <Ruscus x={14} y={192} len={120} angle={-40} bend={-12} seed={seed + 3} n={7} size={8.5} />
      <path d="M14 192 L56 138" fill="none" style={{ stroke: STEM }} strokeWidth="1.2" />
      <Palm x={56} y={138} r={34} rot={22} seed={seed + 4} />
      <Bunny x={14} y={192} len={146} angle={-84} bend={-6} seed={seed + 5} />
      <Bunny x={14} y={192} len={120} angle={-10} bend={6} seed={seed + 6} s={0.9} />
      <Straw x={34} y={170} r={8} seed={seed + 7} />
      <Lunaria x={60} y={176} r={8} rot={10} />
    </svg>
  );
}

/** Small horizontal sprig: a pampas plume, a bunny tail and a ruscus stem lying on their side. viewBox 160×50. */
function Sprig({ className = "", seed = 9, flip = false }: { className?: string; seed?: number; flip?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 160 50" aria-hidden="true" style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <Ruscus x={18} y={34} len={92} angle={-18} bend={-6} seed={seed} n={6} size={6.5} />
      <Pampas x={14} y={36} len={142} angle={-6} bend={-5} w={10} seed={seed + 1} />
      <Bunny x={16} y={36} len={98} angle={8} bend={4} seed={seed + 2} s={0.75} />
      <Straw x={22} y={35} r={6} seed={seed + 3} />
    </svg>
  );
}

/* ───────── rattan, rope and paper ───────── */

/** Rattan arch (viewBox 220×300): a cane band wrapped with diagonal binding, open at the bottom. */
function RattanArch({ className = "" }: { className?: string }) {
  const x0 = 6;
  const x1 = 214;
  const top = 6;
  const bottom = 300;
  const R = (x1 - x0) / 2;
  const cx = x0 + R;
  const cy = top + R;
  const side = bottom - cy;
  const P = 2 * side + Math.PI * R;
  const at = (s: number) => {
    if (s < side) return { x: x0, y: bottom - s, tx: 0, ty: -1 };
    if (s < side + Math.PI * R) {
      const a = Math.PI + (s - side) / R;
      return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, tx: -Math.sin(a), ty: Math.cos(a) };
    }
    return { x: x1, y: cy + (s - side - Math.PI * R), tx: 0, ty: 1 };
  };
  const band = `M${x0} ${bottom}L${x0} ${cy}A${R} ${R} 0 0 1 ${x1} ${cy}L${x1} ${bottom}`;
  let wraps = "";
  const W = 5.4;
  for (let s = 3; s < P - 2; s += 4.2) {
    const p = at(s);
    const nx = -p.ty;
    const ny = p.tx;
    wraps += `M${r2(p.x - nx * W - p.tx * 1.6)} ${r2(p.y - ny * W - p.ty * 1.6)}L${r2(p.x + nx * W + p.tx * 1.6)} ${r2(p.y + ny * W + p.ty * 1.6)}`;
  }
  // a second, thinner cane wound loosely outside
  const outer = smooth(
    Array.from({ length: 41 }, (_, i): [number, number] => {
      const p = at((P * i) / 40);
      const off = 9 + Math.sin(i * 0.9) * 1.6;
      return [p.x + p.ty * off, p.y - p.tx * off];
    }),
  );
  return (
    <svg className={className} viewBox="0 0 220 300" aria-hidden="true" fill="none" strokeLinecap="round">
      <path d={outer} style={{ stroke: TWINE }} strokeWidth="1.3" opacity="0.8" />
      <path d={band} style={{ stroke: mix("c1", 30, "#6f5c48") }} strokeWidth="12" strokeOpacity="0.45" />
      <path d={band} style={{ stroke: mix("c1", 22, "#d3c2a6") }} strokeWidth="10" />
      <path d={wraps} style={{ stroke: mix("c1", 28, "#97805f") }} strokeWidth="1.5" opacity="0.85" />
    </svg>
  );
}

/** Macramé hoop (viewBox 200×230): a rope ring wrapped in twine, hung from a loop, with a fringe on one side. */
function Hoop({ className = "" }: { className?: string }) {
  const R = 92;
  let wraps = "";
  for (let i = 0; i < 96; i++) {
    const a = ((360 / 96) * i) * DEG;
    const b = a + 2.4 * DEG;
    wraps += `M${r2(100 + Math.cos(a) * (R - 4.6))} ${r2(110 + Math.sin(a) * (R - 4.6))}L${r2(100 + Math.cos(b) * (R + 4.6))} ${r2(110 + Math.sin(b) * (R + 4.6))}`;
  }
  const fringe = Array.from({ length: 7 }, (_, i) => {
    const a = (118 + i * 6) * DEG;
    const px = r2(100 + Math.cos(a) * (R + 3));
    const py = r2(110 + Math.sin(a) * (R + 3));
    const L = 16 + rand(i * 5 + 3) * 14 + (i === 3 ? 8 : 0);
    return `M${px} ${py}q${r2(-1.5 + rand(i) * 3)} ${r2(L / 2)} ${r2(-1 + rand(i + 9) * 2)} ${r2(L)}`;
  }).join("");
  return (
    <svg className={className} viewBox="0 0 200 230" aria-hidden="true" fill="none" strokeLinecap="round">
      <path d="M100 18 C92 6 108 -2 100 -10" style={{ stroke: TWINE_DARK }} strokeWidth="1.4" />
      <path d="M100 18 L92 2 M100 18 L108 2" style={{ stroke: TWINE }} strokeWidth="1.2" />
      <circle cx="100" cy="110" r={R} style={{ stroke: mix("c1", 20, "#d2c2a8") }} strokeWidth="9" />
      <path d={wraps} style={{ stroke: mix("c1", 28, "#97805f") }} strokeWidth="1.3" opacity="0.8" />
      <circle cx="100" cy="110" r={R + 4.8} style={{ stroke: mix("c1", 30, "#6f5c48") }} strokeOpacity="0.3" strokeWidth="0.8" />
      <circle cx="100" cy="110" r={R - 4.8} style={{ stroke: mix("c1", 30, "#6f5c48") }} strokeOpacity="0.3" strokeWidth="0.8" />
      <path d={fringe} style={{ stroke: TWINE }} strokeWidth="1.3" />
      <circle cx={r2(100 + Math.cos(136 * DEG) * (R + 6))} cy={r2(110 + Math.sin(136 * DEG) * (R + 6))} r="3.4" style={{ fill: TWINE_DARK }} />
    </svg>
  );
}

/** Macramé divider (viewBox 320×74): a twisted rope with square knots and a row of tassels, some dyed. */
function Macrame({ className = "" }: { className?: string }) {
  const rope = (phase: number) =>
    smooth(Array.from({ length: 33 }, (_, i): [number, number] => {
      const x = 14 + i * 9;
      const sag = Math.sin((Math.PI * (x - 14)) / 292) * 7;
      return [x, 16 + sag + Math.sin(i * 1.4 + phase) * 1.6];
    }));
  const tassels = [40, 80, 120, 160, 200, 240, 280].map((x, i) => {
    const y = r2(16 + Math.sin((Math.PI * (x - 14)) / 292) * 7);
    const L = i === 3 ? 44 : i % 2 ? 30 : 36;
    const dyed = i === 1 || i === 3 || i === 5;
    const strands = [-3, -1.5, 0, 1.5, 3].map((o) => `M${x} ${r2(y + 9)}Q${r2(x + o * 0.6)} ${r2(y + L * 0.6)} ${r2(x + o * 1.4)} ${r2(y + L)}`).join("");
    return (
      <g key={x}>
        <path d={`M${x} ${y}L${x} ${r2(y + 6)}`} style={{ stroke: TWINE_DARK }} strokeWidth="1.4" />
        <ellipse cx={x} cy={r2(y + 7.5)} rx="3.2" ry="2.6" style={{ fill: dyed ? mix("c1", 85, "#4a3a2e") : TWINE_DARK }} />
        <path d={strands} style={{ stroke: dyed ? mix("c1", 70, "#efe4d4") : TWINE }} strokeWidth="1.1" />
      </g>
    );
  });
  const knot = (x: number, y: number, s: number) => `M${x} ${r2(y - s)}L${r2(x + s * 0.8)} ${y}L${x} ${r2(y + s)}L${r2(x - s * 0.8)} ${y}Z`;
  return (
    <svg className={`hk-macrame ${className}`} viewBox="0 0 320 74" aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={rope(0)} style={{ stroke: TWINE }} strokeWidth="2.2" />
      <path d={rope(Math.PI)} style={{ stroke: TWINE_DARK }} strokeWidth="1.1" opacity="0.7" />
      <circle cx="12" cy="16" r="3" style={{ fill: TWINE_DARK }} />
      <circle cx="308" cy="16" r="3" style={{ fill: TWINE_DARK }} />
      {tassels}
      <path d={`${knot(160, 18, 5.5)}`} style={{ fill: mix("c1", 80, "#efe4d4"), stroke: TWINE_DARK }} strokeWidth="0.8" />
    </svg>
  );
}

/** A loose pen scribble under the guest's name. */
function Scribble({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 260 26" aria-hidden="true" fill="none" strokeLinecap="round">
      <path d="M8 14 C 60 6, 120 20, 176 11 S 240 8, 252 13 C 236 18, 200 20, 168 19" style={{ stroke: mix("c1", 80, "#3a2d22") }} strokeWidth="1.3" />
      <path d="M40 19 C 90 15, 140 22, 196 17" style={{ stroke: "var(--c2)" }} strokeOpacity="0.7" strokeWidth="0.8" />
    </svg>
  );
}

/** Two strands of twine across a section (the tags hang from it). viewBox 360×40. */
function Twine({ className = "" }: { className?: string }) {
  const line = (dy: number, w: number) =>
    smooth(Array.from({ length: 13 }, (_, i): [number, number] => {
      const x = -4 + i * 30.67;
      return [x, 8 + Math.sin((Math.PI * i) / 12) * 18 + Math.sin(i * 2.1) * 0.8 + dy * w];
    }));
  return (
    <svg className={className} viewBox="0 0 360 40" preserveAspectRatio="none" aria-hidden="true" fill="none" strokeLinecap="round">
      <path d={line(0, 1)} style={{ stroke: TWINE_DARK }} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
      <path d={line(1.2, 1)} style={{ stroke: TWINE }} strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Section heading: a tiny handwritten note above a script title, with a sprig. */
function Title({ note, children, className = "" }: { note?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <h2 className={`hk-title iv-reveal ${className}`}>
      {note && <small>{note}</small>}
      <span>{children}</span>
      <Sprig className="hk-title-sprig" seed={12} />
    </h2>
  );
}

/* ───────── sections ───────── */

function Event({ e, title, i }: { e: InviteEvent; title: string; i: number }) {
  const p = parseDate(e.date);
  const map = mapsLink(e);
  const q = [e.venue, e.address].filter(Boolean).join(", ");
  return (
    <article className={`hk-event iv-reveal ${i % 2 ? "alt" : ""}`}>
      <svg className="hk-event-fan" viewBox="-60 -60 120 100" aria-hidden="true">
        <Palm x={0} y={14} r={44} rot={i % 2 ? -18 : 18} seed={i * 7 + 3} />
      </svg>
      <h3>{e.title || "Sự kiện"}</h3>
      {p && (
        <div className="hk-event-date">
          <b>{p.dd}</b>
          <div>
            <span>
              Tháng {p.mm} · {p.y}
            </span>
            <span>
              {e.time && <em>{e.time}</em>}
              {e.time && " · "}
              {p.weekday}
            </span>
          </div>
        </div>
      )}
      {e.lunar && <p className="hk-event-lunar">{e.lunar}</p>}
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
      {e.venue && <p className="hk-event-venue">{e.venue}</p>}
      {e.address && <p className="hk-event-address">{e.address}</p>}
      {e.showMap && q && (
        <iframe
          className="iv-event-map"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`}
          title={`Bản đồ ${e.venue || e.title}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
      <div className="hk-event-actions">
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

export default function HoaKhoTheme({ d, title, date, mono, guestName, highlights, wishes, show, labels, mainEvent }: ThemeCtx) {
  const lunar = lunarLabel(d.date);
  return (
    <>
      <section className="hk-hero">
        <p className="hk-kicker iv-reveal">
          <T vi="Thiệp mời cưới" en="Wedding invitation" />
        </p>
        <div className="hk-stage">
          <div className="hk-arch iv-reveal">
            <Photo src={d.cover} alt={`Ảnh cưới ${title}`} mono={mono} className="hk-arch-photo" />
            <RattanArch className="hk-arch-frame" />
          </div>
          <Spray className="hk-hero-spray" seed={4} />
          <Bunch className="hk-hero-bunch" seed={1} />
          {date && (
            <div className="hk-hang iv-reveal">
              <svg className="hk-hang-string" viewBox="0 0 40 60" aria-hidden="true" fill="none">
                <path d="M6 2 C 14 20, 26 34, 20 58" style={{ stroke: TWINE_DARK }} strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <div className="hk-tag">
                <small>Save the date</small>
                <b>
                  {date.dd}
                  <i>.</i>
                  {date.mm}
                </b>
                <span>{date.y}</span>
              </div>
            </div>
          )}
        </div>
        <h1 className="hk-names iv-reveal">
          <span className="hk-n1">{d.groomName}</span>
          <i>&amp;</i>
          <span className="hk-n2">{d.brideName}</span>
        </h1>
        {date && (
          <p className="hk-when iv-reveal">
            {mainEvent?.time && <b>{mainEvent.time}</b>}
            <span>{date.weekday}</span>
            <span>
              {date.dd}.{date.mm}.{date.y}
            </span>
          </p>
        )}
        {lunar && <p className="hk-lunar iv-reveal">{lunar}</p>}
      </section>

      {show.families && (
        <section className="iv-sec hk-families">
          <Macrame className="iv-reveal" />
          <div className="hk-line">
            <Twine className="hk-twine" />
            <div className="hk-families-grid">
              {[d.groomFamily, d.brideFamily].map((f, i) => (
                <div key={i} className={`hk-family iv-reveal ${i ? "r" : "l"}`}>
                  <h2>
                    <FamilyTitle which={i ? "brideFamily" : "groomFamily"} />
                  </h2>
                  <p className="hk-parents">{f.parents}</p>
                  {f.address && <p className="hk-addr">{f.address}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {show.couple && (
        <section className="iv-sec hk-couple">
          <Announce className="hk-announce" />
          <div className="hk-hoop iv-reveal">
            <Photo src={d.couplePhoto || highlights[0] || d.cover} alt={`Ảnh cô dâu chú rể ${title}`} mono={mono} className="hk-hoop-photo" />
            <Hoop className="hk-hoop-ring" />
            <Spray className="hk-hoop-spray" seed={8} />
          </div>
          <div className="hk-pair">
            <div className="hk-person a iv-reveal">
              <em>{labels.first}</em>
              <p>{d.groomFullName || d.groomName}</p>
              <PersonTitle which="groom" />
            </div>
            <i className="iv-reveal" aria-hidden="true">
              &amp;
            </i>
            <div className="hk-person b iv-reveal">
              <em>{labels.second}</em>
              <p>{d.brideFullName || d.brideName}</p>
              <PersonTitle which="bride" />
            </div>
          </div>
        </section>
      )}

      {show.invite && (
        <section className="iv-sec hk-invite">
          <div className="hk-note iv-reveal">
            <p className="hk-inv-heading">
              <Bi k="inviteHeading" />
            </p>
            <div className="hk-guest">
              <p>{guestName}</p>
              <Scribble className="hk-scribble" />
            </div>
            <p className="hk-inv-line">
              <Bi k="inviteLine" />
            </p>
          </div>
          <div className="hk-trio iv-reveal">
            {[date?.dd, date?.mm, date?.y].map((label, i) => (
              <Photo key={i} src={highlights[i] ?? ""} alt={`Ảnh cưới ${i + 1}`} mono={mono}>
                <b>{label}</b>
              </Photo>
            ))}
          </div>
          {d.quote && (
            <div className="hk-quote iv-reveal">
              <Sprig className="hk-quote-sprig" seed={21} />
              <p>
                <Bi k="quote" />
              </p>
            </div>
          )}
        </section>
      )}

      {show.events && d.events.length > 0 && (
        <section className="iv-sec hk-events">
          <Title note="Save the date">
            <T vi="Tiệc cưới" en="The celebration" />
          </Title>
          {d.events.map((e, i) => (
            <Event key={e.id} e={e} title={title} i={i} />
          ))}
        </section>
      )}

      {(show.calendar || show.countdown) && (
        <section className="iv-sec hk-when-sec">
          {date && <Title note={date.y}>Tháng {date.m}</Title>}
          {show.calendar && (
            <div className="hk-cal iv-reveal">
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
        <section className="iv-sec hk-album">
          <Title note={<T vi="Album ảnh cưới" en="Wedding album" />}>Our moments</Title>
          <Gallery photos={d.gallery} mono={mono} />
        </section>
      )}

      {(show.schedule || show.dressCode || show.rsvp || show.guestbook) && <Macrame className="hk-mid-macrame" />}
      {wishes}

      {show.gift && d.gift.enabled && (
        <section className="iv-sec hk-gift">
          <Title>
            <T vi="Hộp mừng cưới" en="Wedding gift" />
          </Title>
          <p className="hk-gift-sub iv-reveal">
            <T vi="Cảm ơn tấm lòng bạn dành cho chúng mình." en="Thank you for your love and kindness." />
          </p>
          <div className="iv-reveal">
            <GiftReveal groom={d.gift.groom} bride={d.gift.bride} />
          </div>
        </section>
      )}

      {show.thanks && (
        <section className="iv-sec iv-thanks hk-thanks">
          <Photo src={d.thanksPhoto || d.cover} alt="" mono="" className="iv-thanks-bg" />
          <div className="hk-thanks-hang" aria-hidden="true">
            <svg className="hk-thanks-string" viewBox="0 0 20 80" preserveAspectRatio="none">
              <path d="M10 0 C 7 30, 13 50, 10 80" fill="none" style={{ stroke: TWINE_DARK }} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
            </svg>
            <Bunch className="hk-thanks-bunch" seed={6} />
          </div>
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
