"use client";

import { useId, type ReactNode } from "react";
import { lunarLabel } from "@/lib/invites/lunar";
import { mapsLink, parseDate, type InviteEvent } from "@/lib/invites/types";
import { Calendar, calendarLink, Countdown, Gallery, GiftReveal, Photo } from "../parts";
import { Announce, Bi, FamilyTitle, PersonTitle, T } from "../lang";
import type { ThemeCtx } from "./types";
import "./ren-theu.css";

// "Ren Thêu": white lace and thread embroidery on deep silk. The card is draped silk (--c1) carrying lace pieces
// drawn here in SVG: a round doily around the cover photo, scalloped lace trims, quarter-doily corners, an
// embroidered monogram and lazy-daisy sprigs (--c2 thread). Some blocks sit on scallop-edged linen "handkerchiefs".
// Lace is cut with SVG masks so the silk really shows through the eyelets. Colours only via var(--c1) / var(--c2).

/* ───────── deterministic helpers (identical on server and client) ───────── */

const r2 = (n: number) => Math.round(n * 100) / 100;
const DEG = Math.PI / 180;
/** Point at `deg` (0 = up, clockwise) on a circle of radius R around (cx, cy). */
const pol = (R: number, deg: number, cx = 0, cy = 0): [number, number] => [r2(cx + Math.sin(deg * DEG) * R), r2(cy - Math.cos(deg * DEG) * R)];

/** SVG-safe unique id (React's ids contain characters that url(#…) does not like). */
function useSvgId(prefix: string) {
  return prefix + useId().replace(/[^a-zA-Z0-9_-]/g, "");
}

type Tone = "c1" | "c2";
const thread = (t: Tone) => `var(--${t})`;

/** Closed scalloped circle: n bulging scallops whose necks sit on radius R (from deg a0 to a0 + sweep). */
function scallops(n: number, R: number, a0 = 0, sweep = 360, cx = 0, cy = 0) {
  const step = sweep / n;
  const chord = 2 * R * Math.sin((step / 2) * DEG);
  const rr = r2(chord * 0.6);
  let d = "";
  for (let i = 0; i <= n; i++) {
    const [x, y] = pol(R, a0 + i * step, cx, cy);
    d += i ? ` A${rr} ${rr} 0 1 1 ${x} ${y}` : `M${x} ${y}`;
  }
  return d;
}

/** Teardrop pointing up (-y) from the origin: cutwork petal / lazy-daisy loop. */
const drop = (L: number, w: number) =>
  `M0 0 C${r2(-w)} ${r2(-L * 0.35)} ${r2(-w * 0.62)} ${r2(-L * 0.86)} 0 ${r2(-L)} C${r2(w * 0.62)} ${r2(-L * 0.86)} ${r2(w)} ${r2(-L * 0.35)} 0 0Z`;

/* ───────── lace pieces ───────── */

/** Round crochet doily with a round opening for the photo (opening = 60% of the width). */
function Doily({ className = "" }: { className?: string }) {
  const mid = useSvgId("rtdm");
  const N = 40;
  return (
    <svg className={className} viewBox="-100 -100 200 200" aria-hidden="true">
      <defs>
        <mask id={mid} maskUnits="userSpaceOnUse" x="-100" y="-100" width="200" height="200">
          <path d={scallops(N, 84) + "Z"} fill="white" />
          <circle r="60" fill="black" />
          {Array.from({ length: N }, (_, i) => {
            const [x, y] = pol(88, (i + 0.5) * (360 / N));
            const [sx, sy] = pol(78.5, i * (360 / N));
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="2.7" fill="black" />
                <circle cx={sx} cy={sy} r="1.25" fill="black" />
              </g>
            );
          })}
          {Array.from({ length: 20 }, (_, i) => {
            const a = i * 18;
            const [ex, ey] = pol(72.5, a + 9);
            const [tx, ty] = pol(66.5, a + 9);
            return (
              <g key={i}>
                <path d={drop(12.5, 4.6)} transform={`rotate(${a}) translate(0 -64)`} fill="black" />
                <circle cx={ex} cy={ey} r="2" fill="black" />
                <circle cx={tx} cy={ty} r="1" fill="black" />
              </g>
            );
          })}
          {Array.from({ length: 72 }, (_, i) => {
            const [x, y] = pol(62.4, i * 5);
            return <circle key={i} cx={x} cy={y} r="0.75" fill="black" />;
          })}
        </mask>
      </defs>
      <g mask={`url(#${mid})`}>
        <rect x="-100" y="-100" width="200" height="200" style={{ fill: "var(--c2)" }} />
        {/* thread relief: chain rounds of the crochet */}
        <circle r="81.5" fill="none" style={{ stroke: "var(--c1)" }} strokeOpacity="0.2" strokeWidth="0.5" />
        <circle r="75.5" fill="none" style={{ stroke: "var(--c1)" }} strokeOpacity="0.16" strokeWidth="0.6" strokeDasharray="1.4 1.6" />
        <circle r="64.5" fill="none" style={{ stroke: "var(--c1)" }} strokeOpacity="0.18" strokeWidth="0.45" />
        {Array.from({ length: 20 }, (_, i) => (
          <path key={i} d={drop(16, 7)} transform={`rotate(${i * 18}) translate(0 -62.5)`} fill="none" style={{ stroke: "var(--c1)" }} strokeOpacity="0.16" strokeWidth="0.5" />
        ))}
      </g>
      {/* picots: tiny loops in each notch and around the photo opening */}
      {Array.from({ length: N }, (_, i) => {
        const [x, y] = pol(97.6, i * (360 / N));
        return <circle key={i} cx={x} cy={y} r="1.25" style={{ fill: "var(--c2)" }} />;
      })}
      <circle r="60.4" fill="none" style={{ stroke: "var(--c2)" }} strokeWidth="1.3" />
      {Array.from({ length: 48 }, (_, i) => {
        const [x, y] = pol(59.6, i * 7.5);
        return <circle key={i} cx={x} cy={y} r="1.35" style={{ fill: "var(--c2)" }} />;
      })}
    </svg>
  );
}

/** Lace trim: straight heading on top, eyelet scallops below. viewBox 360×46. */
function LaceBand({ className = "" }: { className?: string }) {
  const mid = useSvgId("rtbm");
  const n = 15;
  const w = 24;
  let body = `M0 0 H${n * w} V22`;
  for (let i = n; i > 0; i--) body += ` A14.4 14.4 0 1 1 ${(i - 1) * w} 22`;
  body += " Z";
  return (
    <svg className={className} viewBox="0 0 360 46" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      <defs>
        <mask id={mid} maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="46">
          <path d={body} fill="white" />
          {Array.from({ length: 60 }, (_, i) => (
            <circle key={`l${i}`} cx={i * 6 + 3} cy="5.5" r="1.1" fill="black" />
          ))}
          {Array.from({ length: n + 1 }, (_, i) => (
            <path key={`d${i}`} d={`M${i * w} 11.5 l3.2 4 -3.2 4 -3.2 -4Z`} fill="black" />
          ))}
          {Array.from({ length: n }, (_, i) => {
            const cx = i * w + 12;
            return (
              <g key={`s${i}`}>
                <circle cx={cx} cy="15" r="1.5" fill="black" />
                <circle cx={cx} cy="30" r="4.3" fill="black" />
                {[0, 36, 72, 108, 144, 180].map((a) => (
                  <circle key={a} cx={r2(cx + Math.cos(a * DEG) * 9.4)} cy={r2(30 + Math.sin(a * DEG) * 9.4)} r="1.15" fill="black" />
                ))}
              </g>
            );
          })}
        </mask>
      </defs>
      <g mask={`url(#${mid})`}>
        <rect width="360" height="46" style={{ fill: "var(--c2)" }} />
        <path d="M0 10 H360" style={{ stroke: "var(--c1)" }} strokeOpacity="0.18" strokeWidth="0.6" strokeDasharray="2 1.5" />
        {Array.from({ length: n }, (_, i) => (
          <circle key={i} cx={i * w + 12} cy="30" r="6.6" fill="none" style={{ stroke: "var(--c1)" }} strokeOpacity="0.2" strokeWidth="0.5" />
        ))}
      </g>
      {Array.from({ length: n + 1 }, (_, i) => (
        <circle key={i} cx={i * w} cy="41" r="1.35" style={{ fill: "var(--c2)" }} />
      ))}
    </svg>
  );
}

/** Quarter doily for frame corners; drawn for the top-left corner, flipped with CSS. viewBox 80×80. */
function LaceCorner({ className = "" }: { className?: string }) {
  const mid = useSvgId("rtcm");
  const n = 8;
  return (
    <svg className={`rt-corner ${className}`} viewBox="0 0 80 80" aria-hidden="true">
      <defs>
        <mask id={mid} maskUnits="userSpaceOnUse" x="0" y="0" width="80" height="80">
          <path d={`M0 0 L62 0 ${scallops(n, 62, 90, 90).replace(/^M[^A]+/, "")} Z`} fill="white" />
          {Array.from({ length: n }, (_, i) => {
            const [x, y] = pol(65.6, 90 + (i + 0.5) * (90 / n));
            const [sx, sy] = pol(54, 90 + i * (90 / n) + (i ? 0 : 3));
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="2.4" fill="black" />
                {i > 0 && <circle cx={sx} cy={sy} r="1.3" fill="black" />}
              </g>
            );
          })}
          {[99, 117, 135, 153, 171].map((a) => (
            <path key={a} d={drop(13, 4.6)} transform={`rotate(${a}) translate(0 -34)`} fill="black" />
          ))}
          {Array.from({ length: 10 }, (_, i) => {
            const [x, y] = pol(26, 95 + i * 9);
            return <circle key={i} cx={x} cy={y} r="0.9" fill="black" />;
          })}
          {[0, 72, 144, 216, 288].map((a) => (
            <path key={a} d={drop(7, 3)} transform={`translate(13 13) rotate(${a + 45})`} fill="black" />
          ))}
        </mask>
      </defs>
      <g mask={`url(#${mid})`}>
        <rect width="80" height="80" style={{ fill: "var(--c2)" }} />
        <path d={`M0 47 A47 47 0 0 0 47 0`} fill="none" style={{ stroke: "var(--c1)" }} strokeOpacity="0.2" strokeWidth="0.5" strokeDasharray="1.4 1.4" />
      </g>
    </svg>
  );
}

/* ───────── embroidery ───────── */

/** A lazy-daisy flower: looped petals with a french-knot centre. */
function Daisy({ x, y, r, petals = 6, tone, rot = 0 }: { x: number; y: number; r: number; petals?: number; tone: Tone; rot?: number }) {
  const c = thread(tone);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {Array.from({ length: petals }, (_, i) => (
        <g key={i} transform={`rotate(${r2((360 / petals) * i)})`}>
          <path d={drop(r, r * 0.42)} transform={`translate(0 ${r2(-r * 0.22)})`} fill="none" style={{ stroke: c }} strokeWidth="1.1" strokeLinejoin="round" />
          <path d={`M0 ${r2(-r * 0.3)} L0 ${r2(-r * 0.8)}`} style={{ stroke: c }} strokeWidth="0.6" opacity="0.6" />
        </g>
      ))}
      {[0, 120, 240].map((a) => (
        <circle key={a} cx={r2(Math.sin(a * DEG) * r * 0.16)} cy={r2(-Math.cos(a * DEG) * r * 0.16)} r={r2(r * 0.13 + 0.4)} style={{ fill: c }} />
      ))}
    </g>
  );
}

/** Running-stitch rule with a lazy-daisy in the middle. */
function StitchRule({ tone = "c2", className = "" }: { tone?: Tone; className?: string }) {
  const c = thread(tone);
  return (
    <svg className={`rt-rule ${className}`} viewBox="0 0 240 30" aria-hidden="true" fill="none" strokeLinecap="round">
      <path d="M8 15 H90 M150 15 H232" style={{ stroke: c }} strokeWidth="1" strokeDasharray="5 3.5" opacity="0.75" />
      {[
        [98, -1],
        [142, 1],
      ].map(([x, s]) => (
        <g key={x} transform={`translate(${x} 15) rotate(${s * 90})`}>
          <path d={drop(9, 3.4)} transform="rotate(-30)" style={{ stroke: c }} strokeWidth="1" />
          <path d={drop(9, 3.4)} transform="rotate(-150)" style={{ stroke: c }} strokeWidth="1" />
        </g>
      ))}
      <Daisy x={120} y={15} r={10} tone={tone} rot={15} />
    </svg>
  );
}

/** Embroidered monogram: satin-stitched initials inside a wreath of lazy-daisy leaves. viewBox 240×150. */
function Monogram({ mono, tone = "c1", className = "" }: { mono: string; tone?: Tone; className?: string }) {
  const pid = useSvgId("rtmp");
  const c = thread(tone);
  const [a, b] = mono.split("&").map((s) => s.trim());
  // wreath branches: quadratic stems from the bottom centre up both sides
  const branch = (s: 1 | -1) => {
    const P0: [number, number] = [120 + s * 8, 136];
    const P1: [number, number] = [120 + s * 112, 138];
    const P2: [number, number] = [120 + s * 92, 34];
    const at = (t: number) => {
      const x = (1 - t) ** 2 * P0[0] + 2 * (1 - t) * t * P1[0] + t * t * P2[0];
      const y = (1 - t) ** 2 * P0[1] + 2 * (1 - t) * t * P1[1] + t * t * P2[1];
      const dx = 2 * (1 - t) * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]);
      const dy = 2 * (1 - t) * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1]);
      return { x: r2(x), y: r2(y), ang: Math.atan2(dy, dx) / DEG };
    };
    const leaves = Array.from({ length: 9 }, (_, k) => {
      const t = 0.08 + k * 0.1;
      const p = at(t);
      const side = k % 2 ? 1 : -1;
      const L = 12 - k * 0.6;
      return <path key={k} d={drop(L, L * 0.38)} transform={`translate(${p.x} ${p.y}) rotate(${r2(p.ang + 90 + side * 52)})`} fill="none" style={{ stroke: c }} strokeWidth="1.05" />;
    });
    const tip = at(1);
    return (
      <g key={s}>
        <path d={`M${P0[0]} ${P0[1]} Q${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`} fill="none" style={{ stroke: c }} strokeWidth="1.2" strokeDasharray="3.2 1.4" />
        {leaves}
        <Daisy x={tip.x} y={r2(tip.y - 4)} r={7} petals={5} tone={tone} />
        {[0.3, 0.62].map((t) => {
          const p = at(t);
          return <circle key={t} cx={r2(p.x - s * 10)} cy={r2(p.y - 8)} r="1.5" style={{ fill: c }} />;
        })}
      </g>
    );
  };
  return (
    <svg className={`rt-mono ${className}`} viewBox="0 0 240 150" aria-hidden="true">
      <defs>
        <pattern id={pid} patternUnits="userSpaceOnUse" width="2.1" height="2.1" patternTransform="rotate(-38)">
          <rect width="1.35" height="2.1" style={{ fill: c }} />
        </pattern>
      </defs>
      {branch(-1)}
      {branch(1)}
      <Daisy x={120} y={138} r={6} petals={6} tone={tone} />
      <text x="120" y="98" textAnchor="middle" fill={`url(#${pid})`} style={{ stroke: c, fontFamily: "var(--iv-script), cursive", fontSize: 66 }} strokeWidth="0.7">
        {a}
        <tspan dx="4" dy="-6" style={{ fontSize: 30, fontFamily: "var(--iv-thin), cursive" }}>
          &amp;
        </tspan>
        <tspan dx="4" dy="6">
          {b}
        </tspan>
      </text>
    </svg>
  );
}

/* ───────── layout pieces ───────── */

function Title({ children, small }: { children: ReactNode; small?: ReactNode }) {
  return (
    <h2 className="rt-title iv-reveal">
      <span>{children}</span>
      {small && <small>{small}</small>}
    </h2>
  );
}

function Event({ e, title }: { e: InviteEvent; title: string }) {
  const p = parseDate(e.date);
  const map = mapsLink(e);
  const q = [e.venue, e.address].filter(Boolean).join(", ");
  return (
    <article className={`rt-event iv-event iv-reveal ${e.kind}`}>
      <LaceCorner className="tl" />
      <LaceCorner className="tr" />
      <h3>{e.title || "Sự kiện"}</h3>
      {p && (
        <p className="rt-event-when">
          {e.time && <b>{e.time}</b>}
          {e.time && <span aria-hidden="true">·</span>}
          {p.weekday}
        </p>
      )}
      {p && (
        <p className="rt-event-date">
          {p.dd}
          <i>/</i>
          {p.mm}
          <i>/</i>
          {p.y}
        </p>
      )}
      {e.lunar && <p className="rt-event-lunar">{e.lunar}</p>}
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
      <StitchRule className="rt-event-rule" />
      {e.venue && <p className="rt-event-venue">{e.venue}</p>}
      {e.address && <p className="rt-event-address">{e.address}</p>}
      {e.showMap && q && (
        <iframe
          className="iv-event-map"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`}
          title={`Bản đồ ${e.venue || e.title}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
      <div className="rt-event-actions">
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

export default function RenTheuTheme({ d, title, date, mono, guestName, highlights, wishes, show, labels, mainEvent }: ThemeCtx) {
  const lunar = lunarLabel(d.date);
  return (
    <>
      <section className="rt-hero">
        <LaceBand className="rt-valance" />
        <p className="rt-kicker iv-reveal">
          <T vi="Thiệp mời cưới" en="Wedding invitation" />
        </p>
        <div className="rt-doily iv-reveal">
          <Photo src={d.cover} alt={`Ảnh cưới ${title}`} mono={mono} className="rt-doily-photo" />
          <Doily className="rt-doily-lace" />
        </div>
        <h1 className="rt-names iv-reveal">
          <span>{d.groomName}</span>
          <i>&amp;</i>
          <span>{d.brideName}</span>
        </h1>
        {date && (
          <div className="rt-datebar iv-reveal">
            <span>
              {mainEvent?.time ? `${mainEvent.time} · ` : ""}
              {date.weekday}
            </span>
            <b>{date.dd}</b>
            <span>
              Tháng {date.mm} · {date.y}
            </span>
          </div>
        )}
        {lunar && <p className="rt-lunar iv-reveal">{lunar}</p>}
        <StitchRule className="iv-reveal rt-hero-rule" />
      </section>

      {show.families && (
        <section className="rt-panel rt-families">
          <div className="rt-hanky iv-reveal">
            <Monogram mono={mono} className="rt-hanky-mono" />
            <div className="rt-families-grid">
              {[d.groomFamily, d.brideFamily].map((f, i) => (
                <div key={i} className="rt-family">
                  <h2>
                    <FamilyTitle which={i ? "brideFamily" : "groomFamily"} />
                  </h2>
                  <p className="rt-parents">{f.parents}</p>
                  {f.address && <p className="rt-addr">{f.address}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {show.couple && (
        <section className="iv-sec rt-couple">
          <Announce className="rt-announce" />
          <div className="rt-frame iv-reveal">
            <Photo src={d.couplePhoto || highlights[0] || d.cover} alt={`Ảnh cô dâu chú rể ${title}`} mono={mono} className="rt-frame-photo" />
            <LaceCorner className="tl" />
            <LaceCorner className="tr" />
            <LaceCorner className="bl" />
            <LaceCorner className="br" />
          </div>
          <div className="rt-pair">
            <div className="iv-reveal">
              <em>{labels.first}</em>
              <p>{d.groomFullName || d.groomName}</p>
              <PersonTitle which="groom" />
            </div>
            <span className="rt-amp iv-reveal" aria-hidden="true">
              &amp;
            </span>
            <div className="iv-reveal">
              <em>{labels.second}</em>
              <p>{d.brideFullName || d.brideName}</p>
              <PersonTitle which="bride" />
            </div>
          </div>
        </section>
      )}

      {show.invite && (
        <section className="rt-panel rt-invite">
          <div className="rt-hanky iv-reveal">
            <p className="rt-inv-heading">
              <Bi k="inviteHeading" />
            </p>
            <p className="rt-guest">{guestName}</p>
            <StitchRule tone="c1" className="rt-guest-rule" />
            <p className="rt-inv-line">
              <Bi k="inviteLine" />
            </p>
          </div>
          <div className="rt-trio">
            {[
              [date?.dd, "Ngày", "Day"],
              [date?.mm, "Tháng", "Month"],
              [date?.y, "Năm", "Year"],
            ].map(([label, vi, en], i) => (
              <figure key={i} className="iv-reveal">
                <div className="rt-cameo">
                  <Photo src={highlights[i] ?? ""} alt={`Ảnh cưới ${i + 1}`} mono={mono} />
                </div>
                {label && <b>{label}</b>}
                <small>
                  <T vi={vi} en={en} />
                </small>
              </figure>
            ))}
          </div>
          {d.quote && (
            <p className="rt-quote iv-reveal">
              <Bi k="quote" />
            </p>
          )}
        </section>
      )}

      {show.events && d.events.length > 0 && (
        <section className="iv-sec rt-events">
          <Title small="Save the date">
            <T vi="Tiệc cưới" en="The celebration" />
          </Title>
          {d.events.map((e) => (
            <Event key={e.id} e={e} title={title} />
          ))}
        </section>
      )}

      {(show.calendar || show.countdown) && (
        <section className="rt-panel rt-when">
          {show.calendar && (
            <div className="rt-hanky iv-reveal">
              {date && (
                <h2 className="rt-title">
                  <span>Tháng {date.m}</span>
                  <small>{date.y}</small>
                </h2>
              )}
              <Calendar date={d.date} />
            </div>
          )}
          {show.countdown && (
            <div className="rt-count iv-reveal">
              {!show.calendar && date && (
                <h2 className="rt-title">
                  <span>
                    <T vi="Đếm ngược" en="Counting down" />
                  </span>
                </h2>
              )}
              <Countdown date={d.date} />
            </div>
          )}
        </section>
      )}

      {show.gallery && d.gallery.length > 0 && (
        <section className="iv-sec rt-album">
          <Title small={<T vi="Album ảnh cưới" en="Wedding album" />}>Our moments</Title>
          <Gallery photos={d.gallery} mono={mono} />
        </section>
      )}

      {wishes}

      {show.gift && d.gift.enabled && (
        <section className="rt-panel rt-gift">
          <div className="rt-hanky iv-reveal">
            <h2 className="rt-title">
              <span>
                <T vi="Hộp mừng cưới" en="Wedding gift" />
              </span>
            </h2>
            <p className="rt-gift-sub">
              <T vi="Cảm ơn tấm lòng bạn dành cho chúng mình." en="Thank you for your love and kindness." />
            </p>
            <GiftReveal groom={d.gift.groom} bride={d.gift.bride} />
          </div>
        </section>
      )}

      {show.thanks && (
        <section className="iv-sec iv-thanks rt-thanks">
          <Photo src={d.thanksPhoto || d.cover} alt="" mono="" className="iv-thanks-bg" />
          <LaceBand className="rt-valance" />
          <div className="iv-thanks-body">
            <Monogram mono={mono} tone="c2" className="rt-thanks-mono iv-reveal" />
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
