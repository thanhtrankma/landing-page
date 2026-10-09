// Hand-drawn SVG ornaments for the invitation themes (no external images).

/** Deterministic pseudo-random from integer maths only, so server and client render identical shapes. */
const rand = (seed: number) => ((seed * 9301 + 49297) % 233280) / 233280;
const r2 = (n: number) => Math.round(n * 100) / 100;

const petals = (cx: number, cy: number, r: number, n: number, fill: string, rot = 0) =>
  Array.from({ length: n }, (_, i) => {
    const a = (360 / n) * i + rot;
    return <ellipse key={i} cx={cx} cy={cy - r} rx={r * 0.55} ry={r} fill={fill} transform={`rotate(${a} ${cx} ${cy})`} />;
  });

export function Rose({ className = "", tone = "#e98a9b" }: { className?: string; tone?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 170" aria-hidden="true">
      <path d="M60 78 C 57 108, 64 136, 57 168" stroke="#6f8f5e" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M59 120 C 38 104, 22 112, 16 126 C 34 132, 50 128, 59 120 Z" fill="#7fa06a" />
      <path d="M61 140 C 82 126, 98 132, 104 146 C 86 150, 70 148, 61 140 Z" fill="#8db07a" />
      <g opacity="0.95">
        {petals(60, 50, 26, 7, tone)}
        {petals(60, 50, 18, 6, "#f4b3bf", 25)}
        {petals(60, 50, 10, 5, "#fbd6dd", 10)}
        <circle cx="60" cy="50" r="5" fill="#d4687c" />
      </g>
    </svg>
  );
}

export function Wildflowers({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  const stems = [
    { x: 40, top: 30, color: "#b9a0d9", kind: "lav" },
    { x: 62, top: 60, color: "#f2b5a0", kind: "flower" },
    { x: 84, top: 18, color: "#f6d27a", kind: "flower" },
    { x: 104, top: 70, color: "#e9a7c0", kind: "flower" },
    { x: 124, top: 40, color: "#c9b7e8", kind: "lav" },
    { x: 140, top: 90, color: "#ffffff", kind: "daisy" },
  ];
  return (
    <svg className={className} viewBox="0 0 180 240" aria-hidden="true" style={flip ? { transform: "scaleX(-1)" } : undefined}>
      {stems.map((s, i) => {
        const bend = r2((rand(i + 1) - 0.5) * 30);
        const d = `M${r2(s.x + bend * 0.2)} 240 C ${r2(s.x - bend)} 180, ${r2(s.x + bend)} ${s.top + 70}, ${s.x} ${s.top}`;
        return (
          <g key={i}>
            <path d={d} stroke="#7d9467" strokeWidth="1.6" fill="none" />
            <path d={`M${r2(s.x + bend * 0.1)} ${s.top + 110} q ${r2(10 + bend * 0.3)} -12 20 -8 q -8 10 -20 8z`} fill="#93ab7c" />
            {s.kind === "lav" &&
              Array.from({ length: 7 }, (_, k) => <ellipse key={k} cx={s.x + (k % 2 ? 3 : -3)} cy={s.top + k * 7} rx="3.2" ry="4.6" fill={s.color} />)}
            {s.kind === "flower" && (
              <g>
                {petals(s.x, s.top, 7, 5, s.color, i * 13)}
                <circle cx={s.x} cy={s.top} r="3" fill="#c98b4b" />
              </g>
            )}
            {s.kind === "daisy" && (
              <g>
                {petals(s.x, s.top, 8, 9, s.color)}
                <circle cx={s.x} cy={s.top} r="3.5" fill="#e7b84a" />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function Tulip({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 90 220" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M45 220 C 44 170, 47 120, 45 78" />
      <path d="M45 78 C 30 74, 22 56, 26 34 C 34 42, 40 46, 45 40 C 50 46, 56 42, 64 34 C 68 56, 60 74, 45 78 Z" />
      <path d="M45 40 C 42 30, 42 22, 45 14 C 48 22, 48 30, 45 40" />
      <path d="M44 160 C 26 150, 14 128, 12 104 C 30 114, 40 132, 44 160" />
      <path d="M46 140 C 62 128, 74 108, 76 86 C 60 96, 50 116, 46 140" />
      <path d="M44 186 C 34 176, 22 172, 10 174" />
    </svg>
  );
}

/** Ragged paper edge; the fill is the colour of the section below. */
export function TornEdge({ className = "", fill = "currentColor" }: { className?: string; fill?: string }) {
  const pts: string[] = [];
  for (let x = 0; x <= 400; x += 10) pts.push(`${x},${r2(8 + rand(x + 3) * 14)}`);
  return (
    <svg className={className} viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true">
      <path d={`M0,40 L${pts.join(" L")} L400,40 Z`} fill={fill} />
    </svg>
  );
}

export function HeartLine({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M12 20s-7-4.4-9-9C1.6 7.8 3.8 5 7 5c2 0 3.4 1 5 2.8C13.6 6 15 5 17 5c3.2 0 5.4 2.8 4 6-2 4.6-9 9-9 9z" />
    </svg>
  );
}

export function GiftBox({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 160 150" aria-hidden="true">
      <rect x="22" y="62" width="116" height="80" rx="6" fill="#f3a3b2" />
      <rect x="14" y="46" width="132" height="26" rx="5" fill="#f7b9c5" />
      <rect x="72" y="46" width="16" height="96" fill="#fbe2a6" />
      <path d="M80 46 C 60 18, 34 22, 42 40 C 48 50, 66 48, 80 46 Z" fill="#fbe2a6" stroke="#e9c77a" strokeWidth="2" />
      <path d="M80 46 C 100 18, 126 22, 118 40 C 112 50, 94 48, 80 46 Z" fill="#fbe2a6" stroke="#e9c77a" strokeWidth="2" />
      <circle cx="80" cy="46" r="7" fill="#f2cf80" />
      <path d="M30 100 h20 M110 120 h18" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

/** Chinese endless knot with a tassel (gold-orange cord). */
export function Knot({ className = "" }: { className?: string }) {
  const c = 30, cy = 40, h = 17; // rotated-square half diagonal
  return (
    <svg className={className} viewBox="0 0 60 124" aria-hidden="true" fill="none" stroke="#e0893a" strokeWidth="1.5" strokeLinecap="round">
      <path d={`M${c} 0 V${cy - h - 9}`} />
      <path d={`M${c} ${cy - h} L${c + h} ${cy} L${c} ${cy + h} L${c - h} ${cy} Z`} />
      {[-0.5, 0, 0.5].map((t) => (
        <g key={t}>
          <path d={`M${c - h / 2 + t * h} ${cy - h / 2 - t * h} L${c + h / 2 + t * h} ${cy + h / 2 - t * h}`} />
          <path d={`M${c + h / 2 - t * h} ${cy - h / 2 - t * h} L${c - h / 2 - t * h} ${cy + h / 2 - t * h}`} />
        </g>
      ))}
      <circle cx={c} cy={cy - h - 4.5} r="4.5" />
      <circle cx={c - h - 4.5} cy={cy} r="4.5" />
      <circle cx={c + h + 4.5} cy={cy} r="4.5" />
      <path d={`M${c} ${cy + h} V${cy + h + 9}`} />
      <circle cx={c} cy={cy + h + 12} r="3" fill="#e0893a" />
      <path d={`M${c} ${cy + h + 15} V122 M${c - 3} ${cy + h + 16} L${c - 5} 118 M${c + 3} ${cy + h + 16} L${c + 5} 118`} stroke="#d9532f" strokeWidth="1.2" />
    </svg>
  );
}

function Lantern({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M20 -60 V30" stroke="#c9a04a" strokeWidth="1.2" />
      <rect x="12" y="28" width="16" height="6" rx="1.5" fill="#d9ad52" />
      <ellipse cx="20" cy="52" rx="18" ry="19" fill="url(#lantern-red)" />
      <ellipse cx="20" cy="52" rx="9" ry="19" fill="none" stroke="#9e1218" strokeWidth="1" opacity="0.7" />
      <path d="M20 33 V71" stroke="#9e1218" strokeWidth="1" opacity="0.7" />
      <rect x="12" y="69" width="16" height="6" rx="1.5" fill="#d9ad52" />
      <path d="M20 75 V96 M16 76 L14 94 M24 76 L26 94" stroke="#d93a2f" strokeWidth="1.3" />
    </g>
  );
}

/** A pair of red lanterns hanging from above. */
export function Lanterns({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 90 190" aria-hidden="true">
      <defs>
        <radialGradient id="lantern-red" cx="35%" cy="35%" r="70%">
          <stop offset="0" stopColor="#ff5a4a" />
          <stop offset="0.6" stopColor="#e1251d" />
          <stop offset="1" stopColor="#a4100f" />
        </radialGradient>
      </defs>
      <Lantern x={6} y={80} s={1.15} />
      <Lantern x={52} y={50} s={0.8} />
    </svg>
  );
}

/** 囍 in a thin red ring: the small divider between sections. */
export function RingHy({ className = "" }: { className?: string }) {
  return (
    <span className={`iv-ringhy ${className}`} aria-hidden="true">
      囍
    </span>
  );
}

/** Two leafy branches curving up around a circle (frames a round photo). */
export function Wreath({ className = "" }: { className?: string }) {
  const leaves = [];
  for (let side = -1; side <= 1; side += 2) {
    for (let k = 0; k < 11; k++) {
      const a = (90 + side * (18 + k * 12)) * (Math.PI / 180);
      const cx = r2(100 + Math.cos(a) * 92);
      const cy = r2(100 + Math.sin(a) * 92);
      const rot = r2((a * 180) / Math.PI + (side > 0 ? 50 : -50));
      leaves.push(<ellipse key={`${side}-${k}`} cx={cx} cy={cy} rx="4.5" ry="10" fill={k % 2 ? "#5d7a52" : "#7c9a6b"} transform={`rotate(${rot} ${cx} ${cy})`} />);
    }
  }
  return (
    <svg className={className} viewBox="0 0 200 200" aria-hidden="true">
      <path d="M100 192 A92 92 0 0 1 14 66 M100 192 A92 92 0 0 0 186 66" fill="none" stroke="#5d7a52" strokeWidth="1.4" />
      {leaves}
    </svg>
  );
}
