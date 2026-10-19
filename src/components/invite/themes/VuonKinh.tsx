"use client";

import { useId } from "react";
import { lunarLabel } from "@/lib/invites/lunar";
import { mapsLink, parseDate, type InviteEvent } from "@/lib/invites/types";
import { Calendar, calendarLink, Countdown, Gallery, GiftReveal, Photo } from "../parts";
import { Announce, Bi, FamilyTitle, PersonTitle, T } from "../lang";
import type { ThemeCtx } from "./types";
import "./vuon-kinh.css";

// "Vườn Kính": a Victorian glass greenhouse. Photos sit behind arched wrought-iron windows with mullions and a
// sunburst fanlight, a Wardian case holds the couple's portrait, ivy climbs the frames, potted ferns and blooms
// stand on the sill, and every heading is a little botanical label plate. All art is drawn here in SVG and coloured
// only through var(--c1) (blooms, accents), var(--c2) (foliage) and the --vk-* mixes defined in vuon-kinh.css.

/* ───────── deterministic helpers (identical on server and client) ───────── */

const rand = (seed: number) => ((seed * 9301 + 49297) % 233280) / 233280;
const r2 = (n: number) => Math.round(n * 100) / 100;
const mix = (c: "c1" | "c2", pct: number, base = "#fff") => `color-mix(in srgb, var(--${c}) ${pct}%, ${base})`;
const DEG = Math.PI / 180;
const IRON = "var(--vk-iron)";

/** SVG-safe unique id (React's ids contain characters that url(#…) does not like). */
function useSvgId(prefix: string) {
  return prefix + useId().replace(/[^a-zA-Z0-9_-]/g, "");
}

type Pt = [number, number];

/** Catmull-Rom → cubic Bézier through the points. */
function smooth(pts: Pt[]) {
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

/* ───────── botanicals ───────── */

/** Pointed ivy-like leaf growing up (-y) from its stalk. */
const leafPath = (s: number) =>
  `M0 0 C${r2(-s * 0.62)} ${r2(-s * 0.28)} ${r2(-s * 0.56)} ${r2(-s * 1.08)} 0 ${r2(-s * 1.5)} C${r2(s * 0.56)} ${r2(-s * 1.08)} ${r2(s * 0.62)} ${r2(-s * 0.28)} 0 0Z`;

/** Narrow fern leaflet. */
const pinna = (L: number) => `M0 0 Q${r2(-L * 0.2)} ${r2(-L * 0.5)} 0 ${r2(-L)} Q${r2(L * 0.2)} ${r2(-L * 0.5)} 0 0Z`;

function Leaf({ x, y, s, rot, pct = 60, vein = true }: { x: number; y: number; s: number; rot: number; pct?: number; vein?: boolean }) {
  return (
    <g transform={`translate(${r2(x)} ${r2(y)}) rotate(${r2(rot)})`}>
      <path d={leafPath(s)} style={{ fill: mix("c2", pct, "#2f3a30") }} />
      {vein && <path d={`M0 0 L0 ${r2(-s * 1.2)}`} style={{ stroke: "#fff" }} strokeOpacity="0.35" strokeWidth="0.5" />}
    </g>
  );
}

/** Five-petal climbing-rose bloom. */
function Flower({ x, y, s, rot = 0, pct = 70 }: { x: number; y: number; s: number; rot?: number; pct?: number }) {
  return (
    <g transform={`translate(${r2(x)} ${r2(y)}) rotate(${rot})`}>
      {[0, 1, 2, 3, 4].map((k) => (
        <ellipse key={k} cx="0" cy={r2(-s * 0.55)} rx={r2(s * 0.4)} ry={r2(s * 0.56)} transform={`rotate(${k * 72})`} style={{ fill: mix("c1", pct) }} />
      ))}
      {[0, 1, 2, 3, 4].map((k) => (
        <ellipse key={`i${k}`} cx="0" cy={r2(-s * 0.3)} rx={r2(s * 0.2)} ry={r2(s * 0.3)} transform={`rotate(${k * 72 + 36})`} style={{ fill: mix("c1", Math.min(100, pct + 18), "#fff") }} />
      ))}
      <circle r={r2(s * 0.2)} style={{ fill: mix("c2", 55, "#4a4030") }} />
    </g>
  );
}

/** A climbing vine along the given points: stem, alternating leaves, the odd bloom and a curling tendril. */
function Vine({ pts, seed, leaf = 9, bloomEvery = 4, bloom = 8 }: { pts: Pt[]; seed: number; leaf?: number; bloomEvery?: number; bloom?: number }) {
  const items = [];
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    const dir = Math.atan2(by - ay, bx - ax) / DEG;
    for (let k = 0; k < 2; k++) {
      const t = k ? 0.72 : 0.3;
      const side = (i + k) % 2 ? 1 : -1;
      const j = rand(seed * 37 + i * 3 + k);
      items.push(
        <Leaf key={`l${i}-${k}`} x={ax + (bx - ax) * t} y={ay + (by - ay) * t} s={leaf * (0.75 + j * 0.5)} rot={dir + side * (48 + j * 22) + 90} pct={50 + Math.round(j * 40)} />,
      );
    }
    if (i % bloomEvery === bloomEvery - 1) {
      const nx = -(by - ay);
      const ny = bx - ax;
      const n = Math.hypot(nx, ny) || 1;
      const off = (i % 2 ? 1 : -1) * bloom * 0.6;
      items.push(<Flower key={`f${i}`} x={bx + (nx / n) * off} y={by + (ny / n) * off} s={bloom * (0.85 + rand(seed + i) * 0.3)} rot={i * 23} pct={58 + (i % 3) * 10} />);
    } else if (i % 3 === 1) {
      items.push(
        <path
          key={`t${i}`}
          d="M0 0 c4 -5 11 -4 10 2 s-6 5 -6 1 s3 -2 3 0"
          transform={`translate(${r2(bx)} ${r2(by)}) rotate(${r2(dir + (i % 2 ? 60 : -120))})`}
          fill="none"
          style={{ stroke: mix("c2", 60, "#2f3a30") }}
          strokeWidth="0.7"
          strokeLinecap="round"
        />,
      );
    }
  }
  return (
    <g className="vk-vine">
      <path d={smooth(pts)} fill="none" style={{ stroke: mix("c2", 55, "#3b3226") }} strokeWidth="1.3" strokeLinecap="round" />
      {items}
    </g>
  );
}

/** A fern frond: curved rachis with paired leaflets shrinking toward the tip. Grows along +x in its own frame. */
function Frond({ x, y, len, angle, bend, n, size, pct = 62 }: { x: number; y: number; len: number; angle: number; bend: number; n: number; size: number; pct?: number }) {
  const at = (t: number) => {
    const px = 2 * (1 - t) * t * (len / 2) + t * t * len;
    const py = 2 * (1 - t) * t * bend;
    const tx = len;
    const ty = 2 * (1 - t) * bend - 2 * t * bend;
    return { px, py, ang: Math.atan2(ty, tx) / DEG };
  };
  const leaflets = [];
  for (let k = 0; k < n; k++) {
    const t = (k + 1) / (n + 1);
    const { px, py, ang } = at(t);
    const L = size * (1 - t * 0.7);
    for (const side of [-1, 1]) {
      leaflets.push(
        <path key={`${k}${side}`} d={pinna(L)} transform={`translate(${r2(px)} ${r2(py)}) rotate(${r2(ang + side * 62 + 90)})`} style={{ fill: mix("c2", pct - (k % 2) * 8, "#2c3a2e") }} />,
      );
    }
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path d={`M0 0 Q${r2(len / 2)} ${r2(bend)} ${r2(len)} 0`} fill="none" style={{ stroke: mix("c2", 55, "#2c3a2e") }} strokeWidth="1" strokeLinecap="round" />
      {leaflets}
    </g>
  );
}

/** Terracotta-style pot (colour from --vk-pot), centred on x, standing on y. */
function Pot({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const rim = h * 0.22;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M${r2(-w * 0.44)} ${r2(-h + rim)} L${r2(-w * 0.34)} 0 L${r2(w * 0.34)} 0 L${r2(w * 0.44)} ${r2(-h + rim)}Z`} style={{ fill: "var(--vk-pot)" }} />
      <rect x={r2(-w / 2)} y={r2(-h)} width={r2(w)} height={r2(rim)} rx="1.5" style={{ fill: "var(--vk-pot-rim)" }} />
      <path d={`M${r2(-w * 0.3)} ${r2(-h * 0.5)} L${r2(-w * 0.26)} ${r2(-h * 0.12)}`} style={{ stroke: "#fff" }} strokeOpacity="0.4" strokeWidth="1.4" strokeLinecap="round" />
    </g>
  );
}

/** Potted Boston fern. Origin = bottom centre of the pot. */
function FernPot({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const fronds: [number, number, number, number][] = [
    [-176, 60, -20, 13],
    [-156, 68, -22, 15],
    [-132, 62, -16, 14],
    [-108, 50, -8, 12],
    [-84, 48, 6, 11],
    [-58, 62, 16, 14],
    [-30, 68, 22, 15],
    [-6, 58, 20, 13],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {fronds.map(([a, len, bend, n], i) => (
        <Frond key={i} x={0} y={-34} len={len} angle={a} bend={bend} n={n} size={11} pct={56 + (i % 3) * 10} />
      ))}
      <Pot x={0} y={0} w={44} h={36} />
    </g>
  );
}

/** Round bloom head of small florets (hydrangea / pelargonium). */
function BloomHead({ x, y, r, seed }: { x: number; y: number; r: number; seed: number }) {
  const n = 16;
  return (
    <g transform={`translate(${r2(x)} ${r2(y)})`}>
      <circle r={r2(r * 1.05)} style={{ fill: mix("c1", 30) }} opacity="0.6" />
      {Array.from({ length: n }, (_, i) => {
        const a = i * 137.5 * DEG;
        const d = r * Math.sqrt((i + 0.5) / n) * 0.82;
        const j = rand(seed * 19 + i);
        return <circle key={i} cx={r2(Math.cos(a) * d)} cy={r2(Math.sin(a) * d)} r={r2(r * (0.22 + j * 0.08))} style={{ fill: mix("c1", 48 + Math.round(j * 45)) }} />;
      })}
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i * 72 + seed * 9) * DEG;
        return <circle key={`c${i}`} cx={r2(Math.cos(a) * r * 0.42)} cy={r2(Math.sin(a) * r * 0.42)} r={r2(r * 0.06 + 0.4)} style={{ fill: mix("c1", 70, "#3a2a2a") }} />;
      })}
    </g>
  );
}

/** Potted flowering plant: stems, leaves and three bloom heads. Origin = bottom centre of the pot. */
function BloomPot({ x, y, s = 1, seed = 3 }: { x: number; y: number; s?: number; seed?: number }) {
  const heads: [number, number, number][] = [
    [-16, -78, 13],
    [14, -88, 15],
    [-2, -106, 12],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {heads.map(([hx, hy], i) => (
        <path key={`s${i}`} d={`M0 -34 Q${r2(hx * 0.3)} ${r2((hy - 34) / 2)} ${hx} ${hy}`} fill="none" style={{ stroke: mix("c2", 55, "#2f3a30") }} strokeWidth="1.2" />
      ))}
      <Leaf x={-4} y={-38} s={14} rot={-62} pct={58} />
      <Leaf x={4} y={-40} s={15} rot={58} pct={72} />
      <Leaf x={-2} y={-52} s={12} rot={-28} pct={84} />
      <Leaf x={4} y={-58} s={11} rot={34} pct={62} />
      <Leaf x={-6} y={-66} s={10} rot={-50} pct={74} />
      {heads.map(([hx, hy, r], i) => (
        <BloomHead key={i} x={hx} y={hy} r={r} seed={seed + i} />
      ))}
      <Pot x={0} y={0} w={40} h={34} />
    </g>
  );
}

/* ───────── wrought iron & glass ───────── */

/** Greenhouse ridge cresting: a rail with spear finials and C-scrolls, a taller finial in the middle. viewBox 300×44. */
function Cresting({ className = "" }: { className?: string }) {
  const units = [];
  for (let k = 0; k < 15; k++) {
    const x = 10 + k * 20;
    if (Math.abs(x - 150) < 12) continue;
    const tall = k % 2;
    units.push(
      <g key={x}>
        <path d={`M${x} 38 V${tall ? 18 : 24}`} />
        <path d={`M${x} ${tall ? 12 : 19} l3 5 l-3 3 l-3 -3Z`} style={{ fill: IRON }} />
        <path d={`M${x} 34 c-5 -1 -8 -5 -6 -8 c1.6 -2.2 4.4 -1 3.6 1.2`} />
        <path d={`M${x} 34 c5 -1 8 -5 6 -8 c-1.6 -2.2 -4.4 -1 -3.6 1.2`} />
      </g>,
    );
  }
  return (
    <svg className={`vk-crest ${className}`} viewBox="0 0 300 44" aria-hidden="true" fill="none" style={{ stroke: IRON }} strokeWidth="1.2" strokeLinecap="round">
      <path d="M2 38.5 H298" strokeWidth="2.4" />
      <path d="M2 42 H298" strokeWidth="0.8" />
      {units}
      <path d="M150 38 V8" strokeWidth="1.6" />
      <circle cx="150" cy="22" r="3.4" style={{ fill: IRON }} />
      <path d="M150 0 l4 7 l-4 4 l-4 -4Z" style={{ fill: IRON }} />
      <path d="M150 34 c-10 -1 -15 -9 -11 -14 c3 -3.4 7.6 -1.2 6 2" />
      <path d="M150 34 c10 -1 15 -9 11 -14 c-3 -3.4 -7.6 -1.2 -6 2" />
      <circle cx="150" cy="22" r="7" style={{ stroke: "var(--c1)" }} strokeWidth="0.8" />
    </svg>
  );
}

/** Points for the vine that climbs the left post and over the arch (hero window). */
const heroVineA: Pt[] = (() => {
  const pts: Pt[] = [];
  for (let i = 0; i <= 5; i++) pts.push([r2(9 + Math.sin(i * 1.7) * 3), r2(412 - i * 52)]);
  for (let i = 1; i <= 9; i++) {
    const a = (180 + i * 14) * DEG;
    const R = 141 + Math.sin(i * 2.1) * 4;
    pts.push([r2(150 + Math.cos(a) * R), r2(150 + Math.sin(a) * R)]);
  }
  return pts;
})();
const heroVineB: Pt[] = [
  [292, 414],
  [294, 372],
  [290, 330],
  [294, 288],
  [291, 252],
  [282, 226],
];

/**
 * The hero's arched greenhouse window drawn over the photo. viewBox 0 -40 300 470; the glass opening is the arch
 * x 20…280, spring line y 150, top y 20, bottom y 400 (the CSS places the photo exactly there).
 */
function GreenhouseWindow({ className = "" }: { className?: string }) {
  const clip = useSvgId("vkc");
  const glare = useSvgId("vkg");
  const glass = "M20 400 V150 A130 130 0 0 1 280 150 V400 Z";
  const spokes = [1, 2, 3, 4, 5].map((k) => {
    const a = (180 + k * 30) * DEG;
    return `M${r2(150 + Math.cos(a) * 34)} ${r2(150 + Math.sin(a) * 34)} L${r2(150 + Math.cos(a) * 130)} ${r2(150 + Math.sin(a) * 130)}`;
  });
  const knots: Pt[] = [
    [106.67, 150],
    [193.33, 150],
    [106.67, 280],
    [193.33, 280],
  ];
  return (
    <svg className={className} viewBox="0 -40 300 470" aria-hidden="true" overflow="visible">
      <defs>
        <clipPath id={clip}>
          <path d={glass} />
        </clipPath>
        <linearGradient id={glare} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.42" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* daylight on the glass */}
      <g clipPath={`url(#${clip})`}>
        <g className="vk-glint">
          <path d="M40 0 L110 0 L-10 300 L-80 300Z" fill={`url(#${glare})`} />
          <path d="M140 0 L168 0 L48 300 L20 300Z" fill="#fff" opacity="0.12" />
        </g>
        <rect x="20" y="20" width="260" height="380" style={{ fill: "var(--c2)" }} opacity="0.06" />
      </g>

      {/* frame: outer iron band, bead, glazing bars */}
      <path d="M12 408 V150 A138 138 0 0 1 288 150 V408 Z M20 400 V150 A130 130 0 0 1 280 150 V400 Z" fillRule="evenodd" style={{ fill: IRON }} />
      <path d="M6 408 V150 A144 144 0 0 1 294 150 V408" fill="none" style={{ stroke: IRON }} strokeWidth="1" opacity="0.55" />
      <g fill="none" style={{ stroke: IRON }} strokeLinecap="round">
        <path d="M20 150 H280" strokeWidth="5" />
        <path d="M106.67 150 V400 M193.33 150 V400" strokeWidth="3.4" />
        <path d="M20 280 H280" strokeWidth="2.6" />
        <path d="M20 340 H106.67 M193.33 220 H280" strokeWidth="1.4" opacity="0.8" />
        <path d="M62 150 A88 88 0 0 1 238 150" strokeWidth="2.2" />
        {spokes.map((d, i) => (
          <path key={i} d={d} strokeWidth="2.2" />
        ))}
        <path d="M116 150 A34 34 0 0 1 184 150" strokeWidth="3" />
      </g>
      {/* sunburst hub */}
      <path d="M126 150 A24 24 0 0 1 174 150 Z" style={{ fill: IRON }} />
      {Array.from({ length: 9 }, (_, i) => {
        const a = (180 + 10 + i * 20) * DEG;
        return <path key={i} d={`M150 150 L${r2(150 + Math.cos(a) * 31)} ${r2(150 + Math.sin(a) * 31)}`} style={{ stroke: IRON }} strokeWidth="1.2" />;
      })}
      <circle cx="150" cy="150" r="8" style={{ fill: "var(--c1)" }} />
      <circle cx="150" cy="150" r="3" fill="#fff" opacity="0.8" />
      {knots.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="5.5" style={{ fill: IRON }} />
          <circle cx={x} cy={y} r="2" style={{ fill: mix("c1", 60) }} />
        </g>
      ))}
      {/* keystone + finial */}
      <path d="M140 9 L160 9 L156 26 L144 26Z" style={{ fill: IRON }} />
      <path d="M150 9 V-22" style={{ stroke: IRON }} strokeWidth="2" />
      <circle cx="150" cy="-8" r="4" style={{ fill: IRON }} />
      <path d="M150 -38 l5 9 l-5 6 l-5 -6Z" style={{ fill: IRON }} />
      <path d="M150 2 c-12 0 -18 -10 -13 -16 c3.6 -4 9 -1.4 7 2.4 M150 2 c12 0 18 -10 13 -16 c-3.6 -4 -9 -1.4 -7 2.4" fill="none" style={{ stroke: IRON }} strokeWidth="1.4" strokeLinecap="round" />
      {/* stone sill */}
      <rect x="0" y="404" width="300" height="14" rx="2" style={{ fill: "var(--vk-stone)", stroke: IRON }} strokeWidth="1" />
      <rect x="8" y="418" width="284" height="6" style={{ fill: "var(--vk-stone-dark)" }} />

      <Vine pts={heroVineA} seed={3} leaf={9.5} bloomEvery={3} bloom={9} />
      <Vine pts={heroVineB} seed={8} leaf={8.5} bloomEvery={3} bloom={8} />
      <g className="vk-pot-a">
        <FernPot x={58} y={404} s={1.15} />
      </g>
      <g className="vk-pot-b">
        <BloomPot x={244} y={404} s={1.05} seed={4} />
      </g>
    </svg>
  );
}

const caseVineA: Pt[] = [
  [24, 344],
  [22, 300],
  [25, 256],
  [21, 212],
  [24, 168],
  [22, 124],
  [44, 94],
  [72, 76],
  [100, 62],
  [122, 48],
];
const caseVineB: Pt[] = [
  [277, 344],
  [279, 304],
  [275, 266],
  [279, 228],
  [271, 200],
];

/**
 * A Wardian case (glass plant cabinet) framing the couple's portrait. viewBox 0 -24 300 384; glass: gable apex
 * (150,40), eaves y 110, sides x 30 / 270, floor y 320 (the CSS clip-path matches).
 */
function WardianCase({ className = "" }: { className?: string }) {
  const glass = "M30 320 V110 L150 40 L270 110 V320 Z";
  const clip = useSvgId("vkw");
  return (
    <svg className={className} viewBox="0 -24 300 384" aria-hidden="true" overflow="visible">
      <defs>
        <clipPath id={clip}>
          <path d={glass} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <g className="vk-glint">
          <path d="M60 30 L100 30 L10 330 L-30 330Z" fill="#fff" opacity="0.2" />
          <path d="M120 30 L136 30 L46 330 L30 330Z" fill="#fff" opacity="0.12" />
        </g>
      </g>
      <path d={glass} fill="none" style={{ stroke: IRON }} strokeWidth="6" strokeLinejoin="round" />
      <g fill="none" style={{ stroke: IRON }} strokeLinecap="round">
        <path d="M30 110 H270" strokeWidth="4" />
        <path d="M110 63.33 V320 M190 63.33 V320" strokeWidth="2.6" />
        <path d="M30 236 H270" strokeWidth="1.8" />
        <path d="M30 104 L150 34 L270 104" strokeWidth="1" opacity="0.6" />
      </g>
      {/* ridge cresting + finials */}
      <g fill="none" style={{ stroke: IRON }} strokeWidth="1.1" strokeLinecap="round">
        {[66, 90, 210, 234].map((x) => {
          const y = r2(110 - (Math.abs(150 - x) < 120 ? (120 - Math.abs(150 - x)) * (70 / 120) : 0));
          return <path key={x} d={`M${x} ${y} V${r2(y - 10)} M${x - 3} ${r2(y - 6)} c0 -4 6 -4 6 0`} />;
        })}
      </g>
      <path d="M150 40 V8" style={{ stroke: IRON }} strokeWidth="2" />
      <circle cx="150" cy="22" r="5" style={{ fill: IRON }} />
      <path d="M150 -8 l5 9 l-5 6 l-5 -6Z" style={{ fill: IRON }} />
      <circle cx="150" cy="22" r="2" style={{ fill: mix("c1", 70) }} />
      {/* plinth with feet */}
      <rect x="18" y="320" width="264" height="26" rx="2" style={{ fill: IRON }} />
      <rect x="30" y="326" width="240" height="14" rx="1" fill="none" style={{ stroke: mix("c1", 40) }} strokeWidth="0.8" />
      <circle cx="150" cy="333" r="3.4" style={{ fill: mix("c1", 60) }} />
      <path d="M28 346 h18 l-4 10 h-10Z M254 346 h18 l-4 10 h-10Z" style={{ fill: IRON }} />
      <Vine pts={caseVineA} seed={5} leaf={8} bloomEvery={3} bloom={8} />
      <Vine pts={caseVineB} seed={11} leaf={7.5} bloomEvery={3} bloom={7} />
      {/* ferns spilling at the corners */}
      <Frond x={34} y={318} len={56} angle={-160} bend={-14} n={10} size={10} />
      <Frond x={36} y={318} len={46} angle={-128} bend={-10} n={9} size={9} pct={74} />
      <Frond x={266} y={318} len={56} angle={-20} bend={14} n={10} size={10} />
      <Frond x={264} y={318} len={46} angle={-52} bend={10} n={9} size={9} pct={74} />
      <Flower x={46} y={300} s={9} pct={64} />
      <Flower x={256} y={302} s={8} rot={20} pct={74} />
    </svg>
  );
}

/** Small arched window overlay (mullion cross + fanlight) for the date photos. viewBox 100×150, arch r 50. */
function MiniWindow({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 150" preserveAspectRatio="none" aria-hidden="true" fill="none" style={{ stroke: IRON }} strokeLinecap="round">
      <path d="M2 150 V50 A48 48 0 0 1 98 50 V150" strokeWidth="4" vectorEffect="non-scaling-stroke" />
      <path d="M2 50 H98 M50 50 V150 M2 104 H98" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      <path d="M50 50 L16 16 M50 50 L50 2 M50 50 L84 16 M28 50 A22 22 0 0 1 72 50" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Semicircular sunburst fanlight used as a card header. viewBox 120×64. */
function Fanlight({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 64" aria-hidden="true" fill="none" style={{ stroke: IRON }} strokeLinecap="round">
      <path d="M4 60 A56 56 0 0 1 116 60" strokeWidth="2.4" />
      <path d="M24 60 A36 36 0 0 1 96 60" strokeWidth="1.2" />
      {[1, 2, 3, 4, 5, 6].map((k) => {
        const a = (180 + k * (180 / 7)) * DEG;
        return <path key={k} d={`M${r2(60 + Math.cos(a) * 14)} ${r2(60 + Math.sin(a) * 14)} L${r2(60 + Math.cos(a) * 56)} ${r2(60 + Math.sin(a) * 56)}`} strokeWidth="1.2" />;
      })}
      <path d="M46 60 A14 14 0 0 1 74 60Z" style={{ fill: IRON }} />
      <circle cx="60" cy="60" r="4" style={{ fill: "var(--c1)", stroke: "none" }} />
      <path d="M0 61 H120" strokeWidth="2" />
    </svg>
  );
}

/** Thin rule with a sprig of leaves and a bloom: divider between blocks. */
function Sprig({ className = "" }: { className?: string }) {
  return (
    <svg className={`vk-sprig ${className}`} viewBox="0 0 200 28" aria-hidden="true">
      <path d="M4 15 H76 M124 15 H196" style={{ stroke: IRON }} strokeWidth="0.8" opacity="0.6" />
      <circle cx="4" cy="15" r="1.6" style={{ fill: IRON }} />
      <circle cx="196" cy="15" r="1.6" style={{ fill: IRON }} />
      <path d="M80 16 Q100 9 120 16" fill="none" style={{ stroke: mix("c2", 55, "#3b3226") }} strokeWidth="1" />
      <Leaf x={86} y={15} s={6} rot={-70} pct={60} vein={false} />
      <Leaf x={93} y={13} s={6.5} rot={-20} pct={80} vein={false} />
      <Leaf x={114} y={15} s={6} rot={70} pct={60} vein={false} />
      <Leaf x={107} y={13} s={6.5} rot={20} pct={80} vein={false} />
      <Flower x={100} y={12} s={6} pct={66} />
    </svg>
  );
}

/** Pressed fern specimen (event cards). viewBox 90×130, stem from the bottom. */
function PressedFern({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 90 130" aria-hidden="true">
      <Frond x={46} y={128} len={120} angle={-96} bend={-10} n={16} size={17} pct={58} />
      <path d="M40 120 h14" style={{ stroke: "var(--vk-tape)" }} strokeWidth="7" opacity="0.9" />
    </svg>
  );
}

/** Watering can with a drip of water: gift illustration. viewBox 120×90. */
function WateringCan({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 90" aria-hidden="true">
      <path d="M30 34 Q60 22 82 34" fill="none" style={{ stroke: IRON }} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M26 40 H86 L82 84 H30Z" style={{ fill: "var(--vk-iron)" }} />
      <path d="M32 50 H80" style={{ stroke: mix("c1", 55) }} strokeWidth="1" />
      <path d="M32 74 H80" style={{ stroke: mix("c1", 55) }} strokeWidth="1" />
      <path d="M84 50 L110 26" style={{ stroke: IRON }} strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="111" cy="24" rx="6" ry="3.4" transform="rotate(-42 111 24)" style={{ fill: IRON }} />
      <path d="M28 46 Q12 50 16 64 Q20 74 30 70" fill="none" style={{ stroke: IRON }} strokeWidth="3" />
      {[
        [114, 36],
        [118, 46],
        [110, 48],
      ].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y} q2 4 0 6 q-2 -2 0 -6Z`} style={{ fill: mix("c2", 70) }} />
      ))}
      <Leaf x={8} y={86} s={10} rot={-40} pct={62} vein={false} />
      <Leaf x={12} y={86} s={12} rot={-8} pct={78} vein={false} />
      <Flower x={20} y={70} s={7} pct={66} />
    </svg>
  );
}

/** Mullion grid laid over the thank-you photo: looking out through the greenhouse glass. */
function Panes({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" fill="none" style={{ stroke: "#fff" }}>
      <path d="M33.33 0 V100 M66.67 0 V100" strokeWidth="5" strokeOpacity="0.5" vectorEffect="non-scaling-stroke" />
      <path d="M0 36 H100 M0 72 H100" strokeWidth="3" strokeOpacity="0.4" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* ───────── sections ───────── */

function Title({ no, vi, en, sub }: { no?: string; vi: string; en: string; sub?: string }) {
  return (
    <h2 className="vk-title iv-reveal">
      {no && <small>Nº {no}</small>}
      <span>
        <T vi={vi} en={en} />
      </span>
      {sub && <em>{sub}</em>}
    </h2>
  );
}

function Event({ e, title, i }: { e: InviteEvent; title: string; i: number }) {
  const p = parseDate(e.date);
  const map = mapsLink(e);
  const q = [e.venue, e.address].filter(Boolean).join(", ");
  return (
    <article className={`vk-event iv-reveal ${e.kind} ${i % 2 ? "alt" : ""}`}>
      <span className="vk-tape a" aria-hidden="true" />
      <span className="vk-tape b" aria-hidden="true" />
      <PressedFern className="vk-event-fern" />
      <Fanlight className="vk-event-fan" />
      <h3>{e.title || "Sự kiện"}</h3>
      {p && (
        <p className="vk-event-when">
          {e.time && <b>{e.time}</b>}
          {e.time && <span aria-hidden="true">·</span>}
          {p.weekday}
        </p>
      )}
      {p && (
        <p className="vk-event-date">
          {p.dd}
          <i>/</i>
          {p.mm}
          <i>/</i>
          {p.y}
        </p>
      )}
      {e.lunar && <p className="vk-event-lunar">{e.lunar}</p>}
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
      {(e.venue || e.address) && (
        <div className="vk-event-place">
          <small>
            <T vi="Địa điểm" en="Venue" />
          </small>
          {e.venue && <p className="vk-event-venue">{e.venue}</p>}
          {e.address && <p className="vk-event-address">{e.address}</p>}
        </div>
      )}
      {e.showMap && q && (
        <iframe
          className="iv-event-map"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`}
          title={`Bản đồ ${e.venue || e.title}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
      <div className="vk-event-actions">
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

export default function VuonKinhTheme({ d, title, date, mono, guestName, highlights, wishes, show, labels, mainEvent }: ThemeCtx) {
  const lunar = lunarLabel(d.date);
  // Plate numbers ("Nº 01"…) follow the sections that are actually shown.
  const order = [
    show.families && "families",
    show.couple && "couple",
    show.invite && "invite",
    show.events && d.events.length > 0 && "events",
    (show.calendar || show.countdown) && "when",
    show.gallery && d.gallery.length > 0 && "album",
    show.gift && d.gift.enabled && "gift",
  ].filter(Boolean);
  const no = (k: string) => String(order.indexOf(k) + 1).padStart(2, "0");

  return (
    <>
      <section className="vk-hero">
        <div className="vk-sun" aria-hidden="true" />
        <Cresting className="vk-crest-top iv-reveal" />
        <p className="vk-kicker iv-reveal">
          <T vi="Thiệp mời cưới" en="Wedding invitation" />
        </p>
        <div className="vk-window iv-reveal">
          <Photo src={d.cover} alt={`Ảnh cưới ${title}`} mono={mono} className="vk-window-photo" />
          <GreenhouseWindow className="vk-window-art" />
        </div>
        <h1 className="vk-names iv-reveal">
          <span>{d.groomName}</span>
          <i>&amp;</i>
          <span>{d.brideName}</span>
        </h1>
        {date && (
          <div className="vk-plate iv-reveal">
            <small>
              <T vi="Ngày thành hôn" en="Wedding day" />
            </small>
            <p className="vk-plate-date">
              {date.dd}
              <i>·</i>
              {date.mm}
              <i>·</i>
              {date.y}
            </p>
            <p className="vk-plate-when">
              {mainEvent?.time ? `${mainEvent.time} · ` : ""}
              {date.weekday}
            </p>
            {lunar && <p className="vk-plate-lunar">{lunar}</p>}
          </div>
        )}
      </section>

      {show.families && (
        <section className="iv-sec vk-families">
          <Sprig className="iv-reveal" />
          <div className="vk-tags">
            {[d.groomFamily, d.brideFamily].map((f, i) => (
              <div key={i} className={`vk-tag iv-reveal ${i ? "b" : "a"}`}>
                <h2>
                  <FamilyTitle which={i ? "brideFamily" : "groomFamily"} />
                </h2>
                <p className="vk-parents">{f.parents}</p>
                {f.address && <p className="vk-addr">{f.address}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {show.couple && (
        <section className="iv-sec vk-couple">
          <Title no={no("couple")} vi={`${labels.first} & ${labels.second}`} en="The couple" />
          <Announce className="vk-announce" />
          <div className="vk-case iv-reveal">
            <Photo src={d.couplePhoto || highlights[0] || d.cover} alt={`Ảnh cô dâu chú rể ${title}`} mono={mono} className="vk-case-photo" />
            <WardianCase className="vk-case-art" />
          </div>
          <div className="vk-pair">
            <div className="vk-person iv-reveal">
              <em>{labels.first}</em>
              <p>{d.groomFullName || d.groomName}</p>
              <PersonTitle which="groom" />
            </div>
            <i className="iv-reveal" aria-hidden="true">
              &amp;
            </i>
            <div className="vk-person iv-reveal">
              <em>{labels.second}</em>
              <p>{d.brideFullName || d.brideName}</p>
              <PersonTitle which="bride" />
            </div>
          </div>
        </section>
      )}

      {show.invite && (
        <section className="iv-sec vk-invite">
          <Cresting className="vk-crest-sec iv-reveal" />
          <p className="vk-inv-heading iv-reveal">
            <Bi k="inviteHeading" />
          </p>
          <div className="vk-guest iv-reveal">
            <p>{guestName}</p>
            <Sprig />
          </div>
          <p className="vk-inv-line iv-reveal">
            <Bi k="inviteLine" />
          </p>
          <div className="vk-trio iv-reveal">
            {[date?.dd, date?.mm, date?.y].map((label, i) => (
              <figure key={i}>
                <div className="vk-mini">
                  <Photo src={highlights[i] ?? ""} alt={`Ảnh cưới ${i + 1}`} mono={mono} />
                  <MiniWindow className="vk-mini-art" />
                </div>
                <figcaption>{label}</figcaption>
              </figure>
            ))}
          </div>
          {d.quote && (
            <p className="vk-quote iv-reveal">
              <Bi k="quote" />
            </p>
          )}
        </section>
      )}

      {show.events && d.events.length > 0 && (
        <section className="iv-sec vk-events">
          <Title no={no("events")} vi="Tiệc cưới" en="The celebration" sub="Save the date" />
          {d.events.map((e, i) => (
            <Event key={e.id} e={e} title={title} i={i} />
          ))}
        </section>
      )}

      {(show.calendar || show.countdown) && (
        <section className="iv-sec vk-when">
          <Title no={no("when")} vi="Lịch ngày cưới" en="Mark the calendar" />
          {show.calendar && (
            <div className="vk-cal iv-reveal">
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
        <section className="iv-sec vk-album">
          <Title no={no("album")} vi="Album ảnh cưới" en="Wedding album" sub="Our moments" />
          <Gallery photos={d.gallery} mono={mono} />
        </section>
      )}

      <div className="vk-shared">{wishes}</div>

      {show.gift && d.gift.enabled && (
        <section className="iv-sec vk-gift">
          <WateringCan className="vk-gift-can iv-reveal" />
          <Title no={no("gift")} vi="Hộp mừng cưới" en="Wedding gift" />
          <p className="vk-gift-sub iv-reveal">
            <T vi="Cảm ơn tấm lòng bạn dành cho chúng mình." en="Thank you for your love and kindness." />
          </p>
          <div className="iv-reveal">
            <GiftReveal groom={d.gift.groom} bride={d.gift.bride} />
          </div>
        </section>
      )}

      {show.thanks && (
        <section className="iv-sec iv-thanks vk-thanks">
          <Photo src={d.thanksPhoto || d.cover} alt="" mono="" className="iv-thanks-bg" />
          <Panes className="vk-thanks-panes" />
          <Cresting className="vk-thanks-crest" />
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
