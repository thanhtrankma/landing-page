"use client";

import type { ReactNode } from "react";
import { Calendar, Countdown, EventCard, Gallery, GiftReveal, Photo } from "../parts";
import { Announce, Bi, FamilyTitle, PersonTitle, T } from "../lang";
import type { ThemeCtx } from "./types";
import "./co-phuc.css";

// "Cổ phục": Vietnamese heritage (áo dài / Nhật Bình era). Cream rice paper, photos in moon-gate and temple-window
// arches, hanging couplet scrolls, a red seal (triện) with the couple's initials, lotus and bamboo line art,
// folding-screen panels for the two families and trellis-tile bands as dividers.
// Colours only come from --c1 (main) and --c2 (secondary) so every variant recolours the whole card.
// Styles: co-phuc.css (scoped under .theme-co-phuc).

/** Deterministic pseudo-random (integer maths only) so server and client draw identical shapes. */
const rand = (seed: number) => ((seed * 9301 + 49297) % 233280) / 233280;
const r2 = (n: number) => Math.round(n * 100) / 100;

/** A pointed petal / leaf from (bx, by) towards `deg` (0 = up, clockwise), as an SVG path. */
function petal(bx: number, by: number, deg: number, len: number, w: number) {
  const a = (deg * Math.PI) / 180;
  const [dx, dy, px, py] = [Math.sin(a), -Math.cos(a), Math.cos(a), Math.sin(a)];
  const P = (t: number, s: number) => `${r2(bx + dx * len * t + px * w * s)} ${r2(by + dy * len * t + py * w * s)}`;
  return `M${r2(bx)} ${r2(by)} C${P(0.3, -1)} ${P(0.78, -0.72)} ${P(1, 0)} C${P(0.78, 0.72)} ${P(0.3, 1)} ${r2(bx)} ${r2(by)}Z`;
}
const vein = (bx: number, by: number, deg: number, len: number) => {
  const a = (deg * Math.PI) / 180;
  return `M${r2(bx + Math.sin(a) * len * 0.12)} ${r2(by - Math.cos(a) * len * 0.12)} L${r2(bx + Math.sin(a) * len * 0.82)} ${r2(by - Math.cos(a) * len * 0.82)}`;
};

/** Line-drawn lotus resting on water ripples. */
function Lotus({ className = "" }: { className?: string }) {
  const [bx, by] = [60, 64];
  const back: [number, number, number][] = [
    [-66, 38, 11],
    [66, 38, 11],
    [-40, 48, 13],
    [40, 48, 13],
  ];
  const front: [number, number, number][] = [
    [-20, 46, 13],
    [20, 46, 13],
    [0, 56, 14],
  ];
  return (
    <svg className={`cp-lotus ${className}`} viewBox="0 0 120 86" aria-hidden="true">
      <g style={{ stroke: "var(--c1)", strokeWidth: 1.3, strokeLinejoin: "round" }}>
        {back.map(([deg, len, w]) => (
          <path key={deg} d={petal(bx, by, deg, len, w)} style={{ fill: "color-mix(in srgb, var(--c1) 16%, #fbf6ea)" }} />
        ))}
        {front.map(([deg, len, w]) => (
          <path key={deg} d={petal(bx, by, deg, len, w)} style={{ fill: "#fbf6ea" }} />
        ))}
        {front.map(([deg, len]) => (
          <path key={`v${deg}`} d={vein(bx, by, deg, len)} style={{ fill: "none", opacity: 0.45 }} />
        ))}
      </g>
      <g style={{ fill: "none", stroke: "var(--c2)", strokeWidth: 1.3, strokeLinecap: "round" }}>
        <path d="M12 70 Q36 62 60 70 T108 70" />
        <path d="M26 77 Q43 72 60 77 T94 77" style={{ opacity: 0.7 }} />
        <path d="M42 83 Q51 80 60 83 T78 83" style={{ opacity: 0.45 }} />
      </g>
    </svg>
  );
}

/** A bamboo stem with drooping leaves (secondary colour). */
function Bamboo({ className = "" }: { className?: string }) {
  const nodes = [176, 138, 102, 68, 36];
  const x = (y: number) => r2(26 + (200 - y) * 0.05);
  const leaves: [number, number, number, number][] = [
    // node index, angle, length, width
    [1, 128, 42, 7.5],
    [1, 152, 34, 6],
    [2, -116, 46, 8],
    [2, -142, 36, 6.5],
    [3, 110, 48, 8],
    [3, 134, 38, 6.5],
    [3, 158, 30, 5.5],
    [4, -102, 42, 7.5],
    [4, -128, 34, 6],
    [4, 62, 32, 6],
  ];
  return (
    <svg className={`cp-bamboo ${className}`} viewBox="0 0 64 200" aria-hidden="true">
      <path d={`M${x(200)} 200 L${x(6)} 6`} style={{ stroke: "var(--c2)", strokeWidth: 5, strokeLinecap: "round", opacity: 0.85 }} />
      {nodes.map((y) => (
        <path key={y} d={`M${r2(x(y) - 4.5)} ${y} h9`} style={{ stroke: "color-mix(in srgb, var(--c2) 70%, #000)", strokeWidth: 2.2, strokeLinecap: "round" }} />
      ))}
      {leaves.map(([n, deg, len, w], i) => (
        <path
          key={i}
          d={petal(x(nodes[n]), nodes[n], deg + r2((rand(i + 3) - 0.5) * 8), len, w)}
          style={{ fill: "var(--c2)", opacity: r2(0.55 + rand(i + 11) * 0.4) }}
        />
      ))}
    </svg>
  );
}

/** Red seal (triện) with the couple's initials, rough-edged like a stone stamp. */
function Seal({ mono, className = "" }: { mono: string; className?: string }) {
  const [a, b] = mono.split("&").map((s) => s.trim());
  const edge: string[] = [];
  const side = (i: number, t: number) => [
    [6 + t * 88, 6],
    [94, 6 + t * 88],
    [94 - t * 88, 94],
    [6, 94 - t * 88],
  ][i];
  for (let s = 0; s < 4; s++) {
    for (let k = 0; k < 9; k++) {
      const [px, py] = side(s, k / 9);
      const j = (rand(s * 9 + k + 1) - 0.5) * 3.2;
      edge.push(`${r2(px + (s % 2 ? j : 0))},${r2(py + (s % 2 ? 0 : j))}`);
    }
  }
  const worn = Array.from({ length: 7 }, (_, i) => ({ cx: r2(12 + rand(i + 40) * 76), cy: r2(12 + rand(i + 60) * 76), r: r2(0.6 + rand(i + 80) * 1.4) }));
  return (
    <svg className={`cp-seal ${className}`} viewBox="0 0 100 100" aria-hidden="true">
      <polygon points={edge.join(" ")} style={{ fill: "var(--c1)" }} />
      <rect x="14" y="14" width="72" height="72" rx="3" style={{ fill: "none", stroke: "#fbf3e2", strokeWidth: 2.4 }} />
      <path d="M26 50h48" style={{ stroke: "#fbf3e2", strokeWidth: 1.2, opacity: 0.8 }} />
      <path d="M50 45l5 5-5 5-5-5z" style={{ fill: "var(--c1)", stroke: "#fbf3e2", strokeWidth: 1.2 }} />
      <text x="50" y="42" textAnchor="middle" style={{ fill: "#fbf3e2", fontFamily: "var(--iv-display), Georgia, serif", fontSize: 26 }}>
        {a || "A"}
      </text>
      <text x="50" y="79" textAnchor="middle" style={{ fill: "#fbf3e2", fontFamily: "var(--iv-display), Georgia, serif", fontSize: 26 }}>
        {b || "B"}
      </text>
      {worn.map((w, i) => (
        <circle key={i} cx={w.cx} cy={w.cy} r={w.r} style={{ fill: "#fbf3e2", opacity: 0.55 }} />
      ))}
    </svg>
  );
}

/** Quatrefoil "hoa thị" emblem used above headings. */
function Emblem({ className = "" }: { className?: string }) {
  return (
    <svg className={`cp-emblem ${className}`} viewBox="0 0 40 40" aria-hidden="true">
      <g style={{ fill: "none", stroke: "var(--c1)", strokeWidth: 1.2 }}>
        <circle cx="20" cy="20" r="18" style={{ opacity: 0.5 }} />
        <circle cx="20" cy="13" r="6" />
        <circle cx="20" cy="27" r="6" />
        <circle cx="13" cy="20" r="6" />
        <circle cx="27" cy="20" r="6" />
      </g>
      <path d="M20 16l4 4-4 4-4-4z" style={{ fill: "var(--c1)" }} />
      {[45, 135, 225, 315].map((deg) => (
        <circle key={deg} cx={r2(20 + Math.cos((deg * Math.PI) / 180) * 13.5)} cy={r2(20 + Math.sin((deg * Math.PI) / 180) * 13.5)} r="1.4" style={{ fill: "var(--c2)" }} />
      ))}
    </svg>
  );
}

/** Trellis-tile band with a centred emblem. */
function Divider({ className = "" }: { className?: string }) {
  return (
    <div className={`cp-divider ${className}`} aria-hidden="true">
      <span className="cp-band" />
      <Emblem />
      <span className="cp-band" />
    </div>
  );
}

/** Hanging couplet scroll (câu đối): one word per line. */
function Couplet({ words }: { words: string[] }) {
  return (
    <div className="cp-couplet" aria-hidden="true">
      {words.map((w) => (
        <span key={w}>{w}</span>
      ))}
    </div>
  );
}

function Heading({ vi, en, children }: { vi: ReactNode; en: ReactNode; children?: ReactNode }) {
  return (
    <header className="cp-head iv-reveal">
      <Emblem />
      <h2>
        <T vi={vi} en={en} />
      </h2>
      {children}
    </header>
  );
}

export default function CoPhucTheme({ d, title, date, mono, guestName, highlights, wishes, show, labels, mainEvent }: ThemeCtx) {
  const time = mainEvent?.time;
  return (
    <>
      {/* ── Cover: couplets either side of a moon-gate photo, seal and lotus ── */}
      <section className="iv-sec cp-hero">
        <span className="cp-band cp-band-edge" aria-hidden="true" />
        <p className="cp-kicker iv-reveal">
          <T vi="Lễ Thành Hôn" en="The Wedding of" />
        </p>
        <div className="cp-stage iv-reveal">
          <Couplet words={["Trăm", "Năm", "Hạnh", "Phúc"]} />
          <div className="cp-gate">
            <Photo src={d.cover} alt={`Ảnh cưới ${title}`} mono={mono} />
            <Seal mono={mono} className="cp-gate-seal" />
          </div>
          <Couplet words={["Bách", "Niên", "Giai", "Lão"]} />
        </div>
        <Lotus className="cp-hero-lotus" />
        <h1 className="cp-names iv-reveal">
          <span>{d.groomName}</span>
          <i>&amp;</i>
          <span>{d.brideName}</span>
        </h1>
        {date && (
          <div className="cp-date iv-reveal">
            <span>{date.weekday}</span>
            <b>
              {date.dd}
              <i>·</i>
              {date.mm}
              <small>{date.y}</small>
            </b>
            <span>{time ? <>{time}</> : <>Tháng {date.m}</>}</span>
          </div>
        )}
        {mainEvent?.lunar && <p className="cp-lunar iv-reveal">{mainEvent.lunar}</p>}
      </section>

      {/* ── The two families on a folding screen ── */}
      {show.families && (
        <section className="iv-sec cp-fam">
          <Divider />
          <div className="cp-screen iv-reveal">
            {[d.groomFamily, d.brideFamily].map((f, i) => (
              <div key={i} className="cp-panel">
                <span className="cp-lattice" aria-hidden="true" />
                <h2>
                  <FamilyTitle which={i ? "brideFamily" : "groomFamily"} />
                </h2>
                <p className="cp-parents">{f.parents}</p>
                {f.address && <p className="cp-addr">{f.address}</p>}
                <span className="cp-lattice low" aria-hidden="true" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── The couple: round moon gate between bamboo ── */}
      {show.couple && (
        <section className="iv-sec cp-couple">
          <Announce className="cp-announce" />
          <div className="cp-moon iv-reveal">
            <Bamboo className="left" />
            <div className="cp-moon-ring">
              <Photo src={d.couplePhoto || d.cover} alt={`Ảnh cô dâu chú rể ${title}`} mono={mono} />
            </div>
            <Bamboo className="right" />
          </div>
          <div className="cp-pair">
            <div className="cp-person iv-reveal">
              <span className="cp-role">{labels.first}</span>
              <b>{d.groomFullName || d.groomName}</b>
              <PersonTitle which="groom" />
            </div>
            <span className="cp-amp iv-reveal" aria-hidden="true">
              &amp;
            </span>
            <div className="cp-person iv-reveal">
              <span className="cp-role">{labels.second}</span>
              <b>{d.brideFullName || d.brideName}</b>
              <PersonTitle which="bride" />
            </div>
          </div>
        </section>
      )}

      {/* ── Invitation: guest name on an unrolled scroll, three temple windows ── */}
      {show.invite && (
        <section className="iv-sec cp-invite">
          {d.quote && (
            <blockquote className="cp-quote iv-reveal">
              <Bi k="quote" />
            </blockquote>
          )}
          <Divider />
          <p className="cp-inv-heading iv-reveal">
            <Bi k="inviteHeading" />
          </p>
          <div className="cp-scroll iv-reveal">
            <p className="cp-guest">{guestName}</p>
          </div>
          <p className="cp-inv-line iv-reveal">
            <Bi k="inviteLine" />
          </p>
          <div className="cp-trio iv-reveal">
            {[date?.dd, date?.mm, date?.y].map((label, i) => (
              <Photo key={i} src={highlights[i] ?? ""} alt={`Ảnh cưới ${i + 1}`} mono={mono}>
                <b>{label}</b>
              </Photo>
            ))}
          </div>
        </section>
      )}

      {/* ── Events ── */}
      {show.events && d.events.length > 0 && (
        <section className="iv-sec cp-events">
          <Heading vi="Hôn lễ" en="Wedding events" />
          <div className="cp-event-list">
            {d.events.map((e) => (
              <EventCard key={e.id} e={e} title={title} />
            ))}
          </div>
        </section>
      )}

      {/* ── Calendar + countdown on a lacquer band ── */}
      {(show.calendar || show.countdown) && (
        <section className="iv-sec cp-when">
          <span className="cp-band cp-band-edge" aria-hidden="true" />
          <p className="cp-when-kicker iv-reveal">
            <T vi="Ngày lành tháng tốt" en="Save the date" />
          </p>
          {date && (
            <p className="cp-month iv-reveal">
              Tháng {date.mm} · {date.y}
            </p>
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
          <span className="cp-band cp-band-edge bottom" aria-hidden="true" />
        </section>
      )}

      {/* ── Album ── */}
      {show.gallery && d.gallery.length > 0 && (
        <section className="iv-sec cp-album">
          <Heading vi="Khoảnh khắc" en="Our moments" />
          <Gallery photos={d.gallery} mono={mono} />
        </section>
      )}

      {wishes}

      {/* ── Wedding gift ── */}
      {show.gift && d.gift.enabled && (
        <section className="iv-sec cp-gift">
          <Heading vi="Mừng cưới" en="Wedding gift">
            <p className="cp-gift-sub">
              <T vi="Thay lời chúc phúc, gửi trao yêu thương" en="With love and blessings" />
            </p>
          </Heading>
          <div className="iv-reveal">
            <GiftReveal groom={d.gift.groom} bride={d.gift.bride} />
          </div>
        </section>
      )}

      {/* ── Thank you ── */}
      {show.thanks && (
        <section className="iv-sec iv-thanks cp-thanks">
          <Photo src={d.thanksPhoto || d.cover} alt="" mono="" className="iv-thanks-bg" />
          <div className="iv-thanks-body">
            <Seal mono={mono} className="cp-thanks-seal" />
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
