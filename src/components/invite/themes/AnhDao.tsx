"use client";

import { lunarLabel } from "@/lib/invites/lunar";
import { mapsLink, parseDate, type InviteEvent } from "@/lib/invites/types";
import { calendarLink, Calendar, Countdown, Gallery, GiftReveal, Photo } from "../parts";
import { Announce, Bi, FamilyTitle, PersonTitle, T } from "../lang";
import type { CSSProperties, ReactNode } from "react";
import type { ThemeCtx } from "./types";
import "./anh-dao.css";

// "Anh Đào": cherry-blossom romance on washi paper. Ink-brush branches (--c2) carry clusters of five-petal
// blossoms (--c1) across the cover, a round sun sits behind the names, thin vertical rules and vertical
// captions frame the page, and the cover photo hangs like a scroll. Every ornament is drawn here as inline
// SVG coloured through var(--c1) / var(--c2) (or CSS vars mixed from them), so the variants recolour it all.
// Styles: anh-dao.css.

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

const pts = (p: Pt[]) => p.map(([x, y]) => `${r2(x)} ${r2(y)}`).join(" L");

/** A tapered ink-brush stroke along a chain of cubic segments: thick at the start, a hair at the end, with a
 *  slight deterministic wobble in width so it reads as brushwork rather than a vector line. */
function brush(segs: Seg[], w0: number, w1: number, steps = 12) {
  const c: Pt[] = [];
  segs.forEach((s, si) => {
    for (let i = si ? 1 : 0; i <= steps; i++) c.push(bez(s, i / steps));
  });
  const n = c.length;
  const left: Pt[] = [];
  const right: Pt[] = [];
  const dry: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = c[Math.max(0, i - 1)];
    const b = c[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const [nx, ny] = [-dy / len, dx / len];
    const t = i / (n - 1);
    const w = ((w0 + (w1 - w0) * Math.pow(t, 0.75)) * (1 + 0.13 * Math.sin(i * 0.93) + 0.06 * Math.sin(i * 2.7))) / 2;
    left.push([c[i][0] + nx * w, c[i][1] + ny * w]);
    right.push([c[i][0] - nx * w, c[i][1] - ny * w]);
    if (t > 0.04 && t < 0.7) dry.push([c[i][0] + nx * w * 0.35, c[i][1] + ny * w * 0.35]);
  }
  return {
    body: `M${pts(left)} L${pts(right.reverse())} Z`,
    dry: dry.length > 1 ? `M${pts(dry)}` : "",
  };
}

/** One notched cherry petal pointing up from the flower centre. */
const petal = (r: number) =>
  `M0 0 C${r2(-0.6 * r)} ${r2(-0.22 * r)} ${r2(-0.56 * r)} ${r2(-0.86 * r)} ${r2(-0.2 * r)} ${r2(-r)} L0 ${r2(-0.84 * r)} L${r2(0.2 * r)} ${r2(-r)} C${r2(0.56 * r)} ${r2(-0.86 * r)} ${r2(0.6 * r)} ${r2(-0.22 * r)} 0 0 Z`;

const ink = { fill: "var(--ad-branch)" } as const;

/* ───────────── ornaments ───────────── */

/** Five-petal cherry blossom with a deep heart and a ring of stamens. */
function Blossom({ x, y, r, rot = 0, tone = 0 }: { x: number; y: number; r: number; rot?: number; tone?: number }) {
  const d = petal(r);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d={d} transform={`rotate(${a})`} style={{ fill: tone ? "var(--ad-petal-2)" : "var(--ad-petal)", stroke: "var(--ad-petal-edge)" }} strokeWidth="0.6" />
      ))}
      <circle r={r2(r * 0.26)} style={{ fill: "var(--ad-heart)" }} opacity="0.8" />
      {[0, 1, 2, 3, 4, 5, 6].map((k) => {
        const a = ((k * 51.4 + 18) * Math.PI) / 180;
        const ex = r2(Math.cos(a) * r * 0.5);
        const ey = r2(Math.sin(a) * r * 0.5);
        return (
          <g key={k}>
            <path d={`M0 0 L${ex} ${ey}`} style={{ stroke: "var(--ad-heart)" }} strokeWidth="0.55" />
            <circle cx={ex} cy={ey} r={r2(Math.max(0.6, r * 0.06))} style={{ fill: "var(--ad-stamen)" }} />
          </g>
        );
      })}
    </g>
  );
}

/** A closed bud: a teardrop of petal colour held by a small ink calyx. */
function Bud({ x, y, r, rot = 0 }: { x: number; y: number; r: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={`M0 ${r2(r * 0.5)} C${r2(-r * 0.75)} ${r2(r * 0.1)} ${r2(-r * 0.45)} ${r2(-r)} 0 ${r2(-r * 1.05)} C${r2(r * 0.45)} ${r2(-r)} ${r2(r * 0.75)} ${r2(r * 0.1)} 0 ${r2(r * 0.5)} Z`} style={{ fill: "var(--ad-bud)", stroke: "var(--ad-petal-edge)" }} strokeWidth="0.6" />
      <path d={`M0 ${r2(r * 0.95)} C${r2(-r * 0.5)} ${r2(r * 0.7)} ${r2(-r * 0.45)} ${r2(r * 0.25)} ${r2(-r * 0.2)} ${r2(r * 0.15)} L0 ${r2(r * 0.42)} L${r2(r * 0.2)} ${r2(r * 0.15)} C${r2(r * 0.45)} ${r2(r * 0.25)} ${r2(r * 0.5)} ${r2(r * 0.7)} 0 ${r2(r * 0.95)} Z`} style={ink} />
    </g>
  );
}

type Bloom = [x: number, y: number, r: number, rot: number, kind: "b" | "u" | "c"];

function Flowers({ list }: { list: Bloom[] }) {
  return (
    <>
      {list.map(([x, y, r, rot, k], i) =>
        k === "u" ? <Bud key={i} x={x} y={y} r={r} rot={rot} /> : <Blossom key={i} x={x} y={y} r={r} rot={rot} tone={k === "c" ? 1 : 0} />,
      )}
    </>
  );
}

function Strokes({ list }: { list: { segs: Seg[]; w0: number; w1: number }[] }) {
  return (
    <>
      {list.map((s, i) => {
        const b = brush(s.segs, s.w0, s.w1);
        return (
          <g key={i}>
            <path d={b.body} style={ink} />
            {b.dry && <path d={b.dry} style={{ stroke: "var(--ad-dry)", fill: "none" }} strokeWidth={r2(Math.max(0.4, s.w0 * 0.12))} strokeLinecap="round" />}
          </g>
        );
      })}
    </>
  );
}

/* The cover branch: a long limb from the top left reaching right, a short one from the top right. */
const COVER_STROKES: { segs: Seg[]; w0: number; w1: number }[] = [
  {
    segs: [
      [[-14, 80], [40, 62], [92, 30], [150, 44]],
      [[150, 44], [200, 56], [228, 96], [288, 92]],
      [[288, 92], [314, 90], [330, 78], [352, 70]],
    ],
    w0: 12,
    w1: 0.6,
  },
  { segs: [[[92, 40], [100, 26], [110, 14], [124, 6]]], w0: 3.6, w1: 0.5 },
  { segs: [[[148, 46], [158, 66], [150, 90], [166, 112]]], w0: 3.8, w1: 0.5 },
  { segs: [[[224, 84], [236, 64], [248, 46], [266, 36]]], w0: 2.8, w1: 0.4 },
  { segs: [[[62, 60], [56, 80], [64, 100], [54, 126]]], w0: 3.2, w1: 0.5 },
  { segs: [[[194, 58], [200, 70], [214, 74], [222, 72]]], w0: 1.8, w1: 0.4 },
  { segs: [[[414, 20], [384, 26], [352, 10], [318, 16]]], w0: 6, w1: 0.5 },
  { segs: [[[376, 22], [366, 36], [374, 50], [360, 64]]], w0: 2.2, w1: 0.4 },
];

const COVER_FLOWERS: Bloom[] = [
  [124, 8, 14, 10, "b"],
  [108, 22, 9, 40, "c"],
  [138, 26, 5, -20, "u"],
  [167, 112, 15, 4, "b"],
  [150, 94, 10, 30, "c"],
  [182, 96, 5, 40, "u"],
  [266, 34, 13, 20, "b"],
  [248, 50, 6, -10, "u"],
  [288, 96, 11, -10, "c"],
  [316, 84, 9, 30, "b"],
  [353, 69, 4.5, 60, "u"],
  [54, 128, 14, 15, "b"],
  [38, 108, 9, 50, "c"],
  [72, 98, 5, -30, "u"],
  [18, 70, 11, 0, "c"],
  [360, 66, 12, 10, "b"],
  [338, 18, 10, 30, "c"],
  [318, 15, 5, -70, "u"],
  [384, 42, 6, 20, "u"],
  [222, 72, 9, -30, "b"],
  [204, 60, 5, 0, "u"],
];

function CoverBranch({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 140" aria-hidden="true" preserveAspectRatio="xMidYMin meet">
      <Strokes list={COVER_STROKES} />
      <Flowers list={COVER_FLOWERS} />
    </svg>
  );
}

const SPRIG_STROKES: { segs: Seg[]; w0: number; w1: number }[] = [
  { segs: [[[-4, 84], [30, 72], [62, 42], [112, 20]]], w0: 5, w1: 0.5 },
  { segs: [[[50, 54], [58, 66], [70, 72], [86, 74]]], w0: 2.2, w1: 0.4 },
  { segs: [[[70, 40], [72, 30], [80, 22], [88, 18]]], w0: 1.6, w1: 0.4 },
];
const SPRIG_FLOWERS: Bloom[] = [
  [110, 20, 11, 10, "b"],
  [86, 74, 10, -10, "c"],
  [88, 17, 4.5, 50, "u"],
  [40, 62, 6, -20, "u"],
  [68, 56, 7, 30, "b"],
];

/** A small flowering twig for corners. */
function Sprig({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 124 92" aria-hidden="true">
      <Strokes list={SPRIG_STROKES} />
      <Flowers list={SPRIG_FLOWERS} />
    </svg>
  );
}

/** Divider: two hairlines meeting a blossom flanked by buds. */
function Divider({ className = "" }: { className?: string }) {
  return (
    <div className={`ad-divider ${className}`} aria-hidden="true">
      <span />
      <svg viewBox="0 0 60 30">
        <Bud x={11} y={17} r={4.5} rot={-70} />
        <Bud x={49} y={17} r={4.5} rot={70} />
        <Blossom x={30} y={15} r={12} rot={8} />
      </svg>
      <span />
    </div>
  );
}

/** A short brush swash under the guest name. */
function Swash({ className = "" }: { className?: string }) {
  const b = brush([[[6, 14], [60, 4], [150, 4], [214, 10]]], 5, 0.6, 16);
  return (
    <svg className={className} viewBox="0 0 220 20" aria-hidden="true" preserveAspectRatio="none">
      <path d={b.body} style={{ fill: "var(--ad-accent)" }} opacity="0.75" />
    </svg>
  );
}

/** Petals drifting across a section (positions fixed so server and client agree). */
const DRIFT = [
  [8, 6, 0, 11, 9],
  [22, 30, 3.5, 13, 7],
  [40, 12, 6.5, 12, 10],
  [58, 40, 1.8, 14, 8],
  [72, 4, 8.2, 11, 11],
  [86, 26, 4.6, 15, 7],
  [94, 52, 10.4, 13, 9],
  [30, 60, 12.1, 14, 8],
] as const;

function Drift() {
  return (
    <div className="ad-drift" aria-hidden="true">
      {DRIFT.map(([left, top, delay, dur, size], i) => (
        <svg key={i} viewBox="-6 -10 12 11" style={{ left: `${left}%`, top: `${top}%`, width: size, animationDelay: `${delay}s`, animationDuration: `${dur}s` } as CSSProperties}>
          <path d={petal(10)} style={{ fill: i % 2 ? "var(--ad-petal)" : "var(--ad-petal-2)" }} />
        </svg>
      ))}
    </div>
  );
}

/** Section heading: a hairline drops to a blossom, then a small-caps kicker over a script title. */
function Heading({ kicker, children, className = "" }: { kicker: ReactNode; children: ReactNode; className?: string }) {
  return (
    <header className={`ad-heading iv-reveal ${className}`}>
      <span className="ad-heading-line" aria-hidden="true" />
      <svg className="ad-heading-flower" viewBox="-14 -14 28 28" aria-hidden="true">
        <Blossom x={0} y={0} r={12} rot={12} />
      </svg>
      <p className="ad-kicker">{kicker}</p>
      <h2 className="ad-title">{children}</h2>
    </header>
  );
}

/* ───────────── event card ───────────── */

function Event({ e, title, i }: { e: InviteEvent; title: string; i: number }) {
  const p = parseDate(e.date);
  const map = mapsLink(e);
  return (
    <article className="ad-event iv-reveal">
      <Sprig className={`ad-event-sprig ${i % 2 ? "l" : "r"}`} />
      <h3>{e.title || "Sự kiện"}</h3>
      {p && (
        <div className="ad-event-date">
          <span>
            <small>
              <T vi="Thời gian" en="Time" />
            </small>
            {e.time || "—"}
          </span>
          <b>
            <i>{p.dd}</i>
          </b>
          <span>
            <small>Tháng {p.mm}</small>
            {p.y}
          </span>
        </div>
      )}
      {p && <p className="ad-event-weekday">{p.weekday}</p>}
      {e.lunar && <p className="ad-event-lunar">{e.lunar}</p>}
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
      {(e.venue || e.address) && <span className="ad-event-sep" aria-hidden="true" />}
      {e.venue && <p className="ad-event-venue">{e.venue}</p>}
      {e.address && <p className="ad-event-address">{e.address}</p>}
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
        <div className="ad-event-actions">
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

export default function AnhDaoTheme({ d, title, date, mono, guestName, highlights, wishes, show, labels, mainEvent }: ThemeCtx) {
  const lunar = date ? lunarLabel(d.date) : "";
  const when = mainEvent?.time && date ? `${mainEvent.time} · ${parseDate(mainEvent.date)?.weekday ?? date.weekday}` : date?.weekday;
  return (
    <>
      <section className="ad-cover">
        <Drift />
        <CoverBranch className="ad-cover-branch" />
        <p className="ad-vert l iv-reveal" aria-hidden="true">
          Lễ Thành Hôn
        </p>
        {date && (
          <p className="ad-vert r iv-reveal" aria-hidden="true">
            {date.dd} · {date.mm} · {date.y}
          </p>
        )}
        <div className="ad-stage">
          <span className="ad-sun" aria-hidden="true" />
          <div className="ad-stage-text">
            <p className="ad-cover-kicker iv-reveal">
              <T vi="Thiệp mời cưới" en="The Wedding of" />
            </p>
            <h1 className="ad-names iv-reveal">
              <span>{d.groomName}</span>
              <i>&amp;</i>
              <span>{d.brideName}</span>
            </h1>
          </div>
        </div>
        {date && (
          <div className="ad-cover-date iv-reveal">
            {when && <p className="ad-cover-when">{when}</p>}
            <div className="ad-datebar">
              <span>Tháng {date.mm}</span>
              <b>{date.dd}</b>
              <span>{date.y}</span>
            </div>
            {lunar && <p className="ad-lunar">{lunar}</p>}
          </div>
        )}
        <div className="ad-scroll iv-reveal">
          <span className="ad-rod" aria-hidden="true" />
          <div className="ad-scroll-paper">
            <Photo src={d.cover} alt={`Ảnh cưới ${title}`} mono={mono} className="ad-scroll-photo" />
          </div>
          <span className="ad-rod b" aria-hidden="true" />
          <Sprig className="ad-scroll-sprig" />
          {mono && (
            <span className="ad-seal" aria-hidden="true">
              {mono}
            </span>
          )}
        </div>
      </section>

      {show.families && (
        <section className="iv-sec ad-families">
          <Divider className="iv-reveal" />
          <div className="ad-fam-grid">
            {[d.groomFamily, d.brideFamily].map((f, i) => (
              <div key={i} className="ad-fam iv-reveal">
                <h2>
                  <FamilyTitle which={i ? "brideFamily" : "groomFamily"} />
                </h2>
                <p className="ad-parents">{f.parents}</p>
                {f.address && <p className="ad-addr">{f.address}</p>}
              </div>
            ))}
            <span className="ad-fam-bar" aria-hidden="true">
              <svg viewBox="-12 -12 24 24">
                <Blossom x={0} y={0} r={10} rot={-8} tone={1} />
              </svg>
            </span>
          </div>
        </section>
      )}

      {show.couple && (
        <section className="iv-sec ad-couple">
          <Announce className="ad-announce" />
          <div className="ad-person a iv-reveal">
            <em>{labels.first}</em>
            <div>
              <b>{d.groomFullName || d.groomName}</b>
              <PersonTitle which="groom" />
            </div>
          </div>
          <div className="ad-moon iv-reveal">
            <Photo src={d.couplePhoto || d.cover} alt={`Ảnh cô dâu chú rể ${title}`} mono={mono} />
            <Sprig className="ad-moon-sprig" />
          </div>
          <div className="ad-person b iv-reveal">
            <em>{labels.second}</em>
            <div>
              <b>{d.brideFullName || d.brideName}</b>
              <PersonTitle which="bride" />
            </div>
          </div>
        </section>
      )}

      {show.invite && (
        <section className="iv-sec ad-invite">
          {d.quote && (
            <p className="ad-quote iv-reveal">
              <Bi k="quote" />
            </p>
          )}
          <p className="ad-inv-heading iv-reveal">
            <Bi k="inviteHeading" />
          </p>
          <div className="ad-guest iv-reveal">
            <p>{guestName}</p>
            <Swash className="ad-swash" />
          </div>
          <p className="ad-inv-line iv-reveal">
            <Bi k="inviteLine" />
          </p>
          <div className="ad-screen iv-reveal">
            {[date?.dd, date?.mm, date?.y].map((label, i) => (
              <Photo key={i} src={highlights[i] ?? ""} alt={`Ảnh cưới ${i + 1}`} mono={mono}>
                {label && <b>{label}</b>}
              </Photo>
            ))}
          </div>
        </section>
      )}

      {show.events && d.events.length > 0 && (
        <section className="iv-sec ad-events">
          <Heading kicker={<T vi="Trân trọng kính mời" en="Join us at" />}>
            <T vi="Hôn lễ" en="The ceremony" />
          </Heading>
          <div className="ad-event-list">
            {d.events.map((e, i) => (
              <Event key={e.id} e={e} title={title} i={i} />
            ))}
          </div>
        </section>
      )}

      {(show.calendar || show.countdown) && date && (
        <section className="iv-sec ad-when">
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
        <section className="iv-sec ad-album">
          <Heading kicker={<T vi="Khoảnh khắc" en="Moments" />}>Album ảnh cưới</Heading>
          <Gallery photos={d.gallery} mono={mono} />
        </section>
      )}

      {wishes}

      {show.gift && d.gift.enabled && (
        <section className="iv-sec ad-gift">
          <Divider className="iv-reveal" />
          <p className="ad-gift-note iv-reveal">
            <T vi="Gửi lời chúc phúc và quà mừng đến cô dâu chú rể" en="Send your blessings and a wedding gift" />
          </p>
          <div className="iv-reveal">
            <GiftReveal groom={d.gift.groom} bride={d.gift.bride} />
          </div>
        </section>
      )}

      {show.thanks && (
        <section className="iv-sec iv-thanks ad-thanks">
          <Photo src={d.thanksPhoto || d.cover} alt="" mono="" className="iv-thanks-bg" />
          <CoverBranch className="ad-thanks-branch" />
          <div className="iv-thanks-body">
            <span className="ad-thanks-sun iv-reveal" aria-hidden="true" />
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
