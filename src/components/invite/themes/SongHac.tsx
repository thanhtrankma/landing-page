"use client";

import { useId, type ReactNode } from "react";
import { lunarLabel } from "@/lib/invites/lunar";
import { mapsLink, parseDate, type InviteEvent } from "@/lib/invites/types";
import { calendarLink, Calendar, Countdown, Gallery, GiftReveal, Photo } from "../parts";
import { Announce, Bi, FamilyTitle, PersonTitle, T } from "../lang";
import type { ThemeCtx } from "./types";
import "./song-hac.css";

// "Song Hạc": a classical card. A pair of red-crowned cranes glide over a full moon (the cover photo sits in
// the moon), stylised cloud banks drift below, fine gold double-line frames border deep main-colour panels
// that alternate with warm paper ones, and a square seal stamp carries the couple's monogram.
// All art is drawn here as inline SVG coloured with var(--c1) / var(--c2) + neutrals. Styles: song-hac.css.

/* ───────────── geometry helpers (deterministic, rounded → identical on server and client) ───────────── */

const r2 = (n: number) => Math.round(n * 100) / 100;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** A tapered feather from its root (bx, by) towards `deg`, slightly bent backwards. */
const feather = (bx: number, by: number, deg: number, len: number, w: number, bend = 0.18) => {
  const a = rad(deg);
  const tx = bx + Math.cos(a) * len;
  const ty = by + Math.sin(a) * len;
  const nx = -Math.sin(a);
  const ny = Math.cos(a);
  const mx = bx + Math.cos(a) * len * 0.55 - nx * len * bend * 0.5;
  const my = by + Math.sin(a) * len * 0.55 - ny * len * bend * 0.5;
  return `M${r2(bx)} ${r2(by)} Q${r2(mx + nx * w)} ${r2(my + ny * w)} ${r2(tx)} ${r2(ty)} Q${r2(mx - nx * w)} ${r2(my - ny * w)} ${r2(bx + 2)} ${r2(by)} Z`;
};

/** An inward spiral (cloud curl). */
const curl = (cx: number, cy: number, r: number, turns = 1.2, start = 0, dir = 1) => {
  const n = 24;
  let d = "";
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = start + dir * t * turns * Math.PI * 2;
    const rr = r * (1 - t * 0.8);
    d += `${i ? " L" : "M"}${r2(cx + Math.cos(a) * rr)} ${r2(cy + Math.sin(a) * rr)}`;
  }
  return d;
};

const gold = { fill: "var(--c2)" } as const;
const goldLine = { stroke: "var(--c2)", fill: "none" } as const;
const plume = { fill: "var(--shc-plume)" } as const;
const ink = { fill: "var(--shc-crane-ink)" } as const;

/* ───────────── the crane ───────────── */

type Pose = { lift: number; spread: number; far: number };

function craneGeometry({ lift, spread, far }: Pose) {
  const near = Array.from({ length: 9 }, (_, k) => {
    const deg = -74 - lift - k * spread;
    const len = 62 - Math.abs(k - 2.5) * 4.2;
    const bx = 112 - k * 3.4;
    return { dark: feather(bx, 56, deg, len, 7), light: feather(bx, 56, deg, len * 0.68, 7.2) };
  }).reverse();
  const back = Array.from({ length: 7 }, (_, k) => {
    const deg = far + k * 9;
    const len = 38 - Math.abs(k - 2) * 3.6;
    const bx = 104 - k * 3;
    return { dark: feather(bx, 60, deg, len, 6, -0.14), light: feather(bx, 60, deg, len * 0.64, 6.2, -0.14) };
  });
  return { near, back };
}

const POSES = {
  up: craneGeometry({ lift: 0, spread: 7.5, far: 112 }),
  glide: craneGeometry({ lift: -30, spread: 9, far: 128 }),
};

/** A red-crowned crane in flight facing right (viewBox 0 0 200 110). */
function Crane({ pose = "up" }: { pose?: keyof typeof POSES }) {
  const g = POSES[pose];
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      {/* far wing, behind the body */}
      <g className="shc-wing-far">
        {g.back.map((f, i) => (
          <g key={i}>
            <path d={f.dark} style={ink} />
            <path d={f.light} style={{ fill: "var(--shc-plume-far)" }} />
          </g>
        ))}
      </g>
      {/* legs trailing behind */}
      <path d="M76 64 L26 72 M78 66 L30 78" style={{ stroke: "var(--shc-crane-ink)", fill: "none" }} strokeWidth="1.6" />
      <path d="M26 72 l-5 -2 M26 72 l-5 2 M30 78 l-5 -1.5 M30 78 l-4 3" style={{ stroke: "var(--shc-crane-ink)", fill: "none" }} strokeWidth="1" />
      {/* tail bustle (the black tertials) */}
      <path d="M76 58 C64 54 52 58 44 66 C54 64 62 66 66 70 C60 68 54 70 50 74 C62 72 70 70 78 66 Z" style={ink} />
      {/* body */}
      <path d="M70 60 C80 51 104 49 119 55 C125 58 124 64 117 66 C103 71 82 70 70 64 Z" style={plume} />
      <path d="M78 64 C92 67 106 66 116 63" style={{ stroke: "var(--shc-plume-far)", fill: "none" }} strokeWidth="1" />
      {/* neck and head */}
      <path d="M113 56 C128 51 146 46 162 43 L165 48.5 C150 51 134 57 119 64 Z" style={ink} />
      <path d="M150 46.2 C154 45.2 158 44.4 162 43.6 L163.5 46.4 C159 47.4 155 48.2 151 49.6 Z" style={plume} />
      <circle cx="166" cy="45.6" r="4.4" style={ink} />
      <ellipse cx="166.4" cy="42.6" rx="3.4" ry="2" style={{ fill: "var(--shc-crown)" }} />
      <path d="M169.5 44 L190 47.2 L169.5 48.6 Z" style={{ fill: "var(--shc-beak)" }} />
      <circle cx="167.4" cy="45.2" r="0.9" style={plume} />
      {/* near wing: dark primaries under white coverts */}
      <g className="shc-wing-near">
        {g.near.map((f, i) => (
          <g key={i}>
            <path d={f.dark} style={ink} />
            <path d={f.light} style={plume} />
          </g>
        ))}
        <path d="M86 58 C88 46 100 40 110 44 C116 47 117 54 113 58 Z" style={plume} />
        <path d="M92 55 C96 49 102 47 108 48" style={{ stroke: "var(--shc-plume-far)", fill: "none" }} strokeWidth="0.9" />
      </g>
    </g>
  );
}

/* ───────────── clouds, moon, seal, frame ───────────── */

type Lobe = [number, number, number]; // x, baseline y, radius

/** A bank of overlapping half-disc clouds with inner arcs and a trailing ribbon. */
function Clouds({ lobes, className = "", ribbon = true, w = 400, h = 90 }: { lobes: Lobe[]; className?: string; ribbon?: boolean; w?: number; h?: number }) {
  const minX = Math.min(...lobes.map(([x, , r]) => x - r));
  const maxX = Math.max(...lobes.map(([x, , r]) => x + r));
  const baseY = Math.max(...lobes.map(([, y]) => y));
  return (
    <svg className={`shc-clouds ${className}`} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" strokeLinecap="round" preserveAspectRatio="xMidYMax meet">
      {lobes.map(([x, y, r], i) => (
        <g key={i}>
          <path d={`M${r2(x - r)} ${y} A${r} ${r} 0 0 1 ${r2(x + r)} ${y} Z`} style={{ fill: "var(--shc-cloud-fill)", stroke: "var(--c2)" }} strokeWidth="1.3" />
          <path d={`M${r2(x - r * 0.62)} ${y} A${r2(r * 0.62)} ${r2(r * 0.62)} 0 0 1 ${r2(x + r * 0.62)} ${y}`} style={goldLine} strokeWidth="0.9" opacity="0.8" />
          <path d={`M${r2(x - r * 0.28)} ${y} A${r2(r * 0.28)} ${r2(r * 0.28)} 0 0 1 ${r2(x + r * 0.28)} ${y}`} style={goldLine} strokeWidth="0.8" opacity="0.6" />
        </g>
      ))}
      <path d={`M${r2(minX - 6)} ${baseY} H${r2(maxX + 6)}`} style={goldLine} strokeWidth="1.3" />
      {ribbon && (
        <path d={`M${r2(maxX + 6)} ${baseY} C${r2(maxX + 26)} ${baseY} ${r2(maxX + 26)} ${baseY - 14} ${r2(maxX + 14)} ${baseY - 12} ${curl(maxX + 14, baseY - 7, 5, 1, -Math.PI / 2, -1).replace("M", "L")}`} style={goldLine} strokeWidth="1.2" />
      )}
    </svg>
  );
}

const COVER_CLOUDS: Lobe[] = [[30, 70, 24], [78, 70, 34], [124, 70, 22], [54, 70, 16], [104, 70, 14]];
const SMALL_CLOUD: Lobe[] = [[30, 40, 16], [58, 40, 24], [86, 40, 14]];

/** Concentric moon disc (the halo behind the cover photo). */
function Moon({ className = "" }: { className?: string }) {
  const id = `shc-moon-${useId().replace(/:/g, "")}`;
  return (
    <svg className={className} viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <radialGradient id={id} cx="50%" cy="46%" r="50%">
          <stop offset="0" style={{ stopColor: "#fffaf0" }} />
          <stop offset="0.7" style={{ stopColor: "color-mix(in srgb, var(--c2) 38%, #fff8ea)" }} />
          <stop offset="1" style={{ stopColor: "color-mix(in srgb, var(--c2) 70%, #fff)" }} />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="99" style={{ fill: `url(#${id})` }} />
      <circle cx="100" cy="100" r="96" style={{ fill: "none", stroke: "color-mix(in srgb, var(--c1) 30%, transparent)" }} strokeWidth="0.6" />
    </svg>
  );
}

/** Square seal stamp with the couple's initials stacked. */
function Seal({ mono, className = "" }: { mono: string; className?: string }) {
  const [a = "", b = ""] = mono.split("&").map((s) => s.trim());
  return (
    <svg className={`shc-seal ${className}`} viewBox="0 0 60 60" role="img" aria-label={mono}>
      <rect x="1" y="1" width="58" height="58" rx="7" style={{ fill: "var(--shc-seal-bg)" }} />
      <rect x="5" y="5" width="50" height="50" rx="4" style={{ fill: "none", stroke: "var(--shc-seal-fg)" }} strokeWidth="1.2" />
      <path d="M12 30 H24 M36 30 H48" style={{ stroke: "var(--shc-seal-fg)" }} strokeWidth="0.9" />
      <circle cx="30" cy="30" r="2.2" style={{ fill: "var(--shc-seal-fg)" }} />
      <text x="30" y="20" textAnchor="middle" dominantBaseline="central" className="shc-seal-t" style={{ fill: "var(--shc-seal-fg)" }}>
        {a}
      </text>
      <text x="30" y="41" textAnchor="middle" dominantBaseline="central" className="shc-seal-t" style={{ fill: "var(--shc-seal-fg)" }}>
        {b}
      </text>
    </svg>
  );
}

/** Corner ornament of a gold double-line frame: a stepped line ending in a cloud curl. */
function Corner({ className }: { className: string }) {
  return (
    <svg className={`shc-corner ${className}`} viewBox="0 0 50 50" aria-hidden="true" strokeLinecap="round">
      <path d="M3 48 V14 C3 8 8 3 14 3 H48" style={goldLine} strokeWidth="1.2" />
      <path d={curl(16, 16, 8, 1.25, Math.PI * 0.75, 1)} style={goldLine} strokeWidth="1.1" />
      <circle cx="3" cy="48" r="1.8" style={gold} />
      <circle cx="48" cy="3" r="1.8" style={gold} />
    </svg>
  );
}

function Frame() {
  return (
    <div className="shc-frame" aria-hidden="true">
      <Corner className="tl" />
      <Corner className="tr" />
      <Corner className="bl" />
      <Corner className="br" />
    </div>
  );
}

/** Divider: gold rules, two cloud curls and a small moon. */
function Divider({ className = "" }: { className?: string }) {
  return (
    <div className={`shc-divider ${className}`} aria-hidden="true">
      <span />
      <svg viewBox="0 0 96 24" strokeLinecap="round">
        <path d={curl(20, 12, 7, 1.2, 0, -1)} style={goldLine} strokeWidth="1.1" />
        <path d={curl(76, 12, 7, 1.2, Math.PI, 1)} style={goldLine} strokeWidth="1.1" />
        <path d="M27 12 H36 M60 12 H69" style={goldLine} strokeWidth="1.1" />
        <circle cx="48" cy="12" r="9" style={goldLine} strokeWidth="0.9" />
        <circle cx="48" cy="12" r="5.6" style={{ fill: "var(--shc-div-moon, var(--c2))" }} />
      </svg>
      <span />
    </div>
  );
}

/** Two cranes in a small emblem (used in headings, the families seal row and the thanks panel). */
function CranePair({ className = "" }: { className?: string }) {
  return (
    <svg className={`shc-pair ${className}`} viewBox="0 0 220 96" aria-hidden="true">
      <g transform="translate(6 18) scale(0.52)">
        <Crane pose="glide" />
      </g>
      <g transform="translate(214 4) scale(-0.6 0.6)">
        <Crane pose="up" />
      </g>
    </svg>
  );
}

function Heading({ kicker, children }: { kicker: ReactNode; children: ReactNode }) {
  return (
    <header className="shc-heading iv-reveal">
      <p className="shc-kicker">{kicker}</p>
      <h2 className="shc-title">{children}</h2>
      <Divider />
    </header>
  );
}

/* ───────────── event card ───────────── */

function Event({ e, title }: { e: InviteEvent; title: string }) {
  const p = parseDate(e.date);
  const map = mapsLink(e);
  return (
    <article className="shc-event iv-reveal">
      <Clouds lobes={SMALL_CLOUD} className="shc-event-cloud l" w={124} h={44} ribbon={false} />
      <Clouds lobes={SMALL_CLOUD} className="shc-event-cloud r" w={124} h={44} ribbon={false} />
      <h3>{e.title || "Sự kiện"}</h3>
      {p && (
        <div className="shc-event-date">
          <span>
            {e.time || p.weekday}
            {e.time && <small>{p.weekday}</small>}
          </span>
          <b>{p.dd}</b>
          <span>
            Tháng {p.mm}
            <small>{p.y}</small>
          </span>
        </div>
      )}
      {e.lunar && <p className="shc-event-lunar">{e.lunar}</p>}
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
      {(e.venue || e.address) && <span className="shc-event-sep" aria-hidden="true" />}
      {e.venue && <p className="shc-event-venue">{e.venue}</p>}
      {e.address && <p className="shc-event-address">{e.address}</p>}
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
        <div className="shc-event-actions">
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

export default function SongHacTheme({ d, title, date, mono, guestName, highlights, wishes, show, labels, mainEvent }: ThemeCtx) {
  const lunar = date ? lunarLabel(d.date) : "";
  const when = mainEvent?.time && date ? `${mainEvent.time} · ${parseDate(mainEvent.date)?.weekday ?? date.weekday}` : date?.weekday;
  return (
    <>
      <section className="shc-cover shc-deep">
        <Frame />
        <div className="shc-cover-top iv-reveal">
          <Seal mono={mono} className="shc-cover-seal" />
          <p className="shc-cover-kicker">
            <T vi="Lễ Thành Hôn" en="The Wedding of" />
          </p>
        </div>
        <div className="shc-moon iv-reveal">
          <Moon className="shc-moon-disc" />
          <Photo src={d.cover} alt={`Ảnh cưới ${title}`} mono={mono} className="shc-moon-photo" />
          <svg className="shc-cover-cranes" viewBox="0 0 400 150" aria-hidden="true">
            <g className="shc-fly a" transform="translate(-14 34) scale(1.04)">
              <Crane pose="up" />
            </g>
            <g className="shc-fly b" transform="translate(412 4) scale(-0.84 0.84)">
              <Crane pose="glide" />
            </g>
          </svg>
          <Clouds lobes={COVER_CLOUDS} className="shc-cover-clouds l" w={180} h={76} />
          <Clouds lobes={COVER_CLOUDS} className="shc-cover-clouds r" w={180} h={76} />
        </div>
        <h1 className="shc-cover-names iv-reveal">
          <span>{d.groomName}</span>
          <i>&amp;</i>
          <span>{d.brideName}</span>
        </h1>
        {date && (
          <div className="shc-cover-date iv-reveal">
            <span>{when}</span>
            <b>
              {date.dd}
              <i />
              {date.mm}
              <i />
              {date.y}
            </b>
            {lunar && <span className="shc-lunar">{lunar}</span>}
          </div>
        )}
      </section>

      {show.families && (
        <section className="iv-sec shc-paper shc-families">
          <div className="shc-fam-grid">
            {[d.groomFamily, d.brideFamily].map((f, i) => (
              <div key={i} className="shc-fam iv-reveal">
                <h2>
                  <FamilyTitle which={i ? "brideFamily" : "groomFamily"} />
                </h2>
                <p className="shc-parents">{f.parents}</p>
                {f.address && <p className="shc-addr">{f.address}</p>}
              </div>
            ))}
            <div className="shc-fam-axis iv-reveal" aria-hidden="true">
              <span />
              <Seal mono={mono} />
              <span />
            </div>
          </div>
        </section>
      )}

      {show.couple && (
        <section className="iv-sec shc-deep shc-couple">
          <Frame />
          <Announce className="shc-announce" />
          <div className="shc-scroll iv-reveal">
            <span className="shc-rod" aria-hidden="true" />
            <div className="shc-scroll-paper">
              <Photo src={d.couplePhoto || d.cover} alt={`Ảnh cô dâu chú rể ${title}`} mono={mono} />
            </div>
            <span className="shc-rod" aria-hidden="true" />
          </div>
          <div className="shc-pair-names">
            <div className="shc-person iv-reveal">
              <em>{labels.first}</em>
              <b>{d.groomFullName || d.groomName}</b>
              <PersonTitle which="groom" />
            </div>
            <CranePair className="iv-reveal" />
            <div className="shc-person iv-reveal">
              <em>{labels.second}</em>
              <b>{d.brideFullName || d.brideName}</b>
              <PersonTitle which="bride" />
            </div>
          </div>
        </section>
      )}

      {show.invite && (
        <section className="iv-sec shc-paper shc-invite">
          {d.quote && (
            <div className="shc-quote iv-reveal">
              <Clouds lobes={SMALL_CLOUD} className="shc-quote-cloud" w={124} h={44} ribbon={false} />
              <p>
                <Bi k="quote" />
              </p>
            </div>
          )}
          <p className="shc-inv-heading iv-reveal">
            <Bi k="inviteHeading" />
          </p>
          <p className="shc-guest iv-reveal">{guestName}</p>
          <p className="shc-inv-line iv-reveal">
            <Bi k="inviteLine" />
          </p>
          <div className="shc-screen iv-reveal">
            {[date?.dd, date?.mm, date?.y].map((label, i) => (
              <div key={i} className="shc-panel">
                <Photo src={highlights[i] ?? ""} alt={`Ảnh cưới ${i + 1}`} mono={mono} />
                {label && <b>{label}</b>}
              </div>
            ))}
          </div>
        </section>
      )}

      {show.events && d.events.length > 0 && (
        <section className="iv-sec shc-deep shc-events">
          <Frame />
          <Heading kicker={<T vi="Trân trọng kính mời" en="Join us at" />}>
            <T vi="Hôn lễ" en="The ceremony" />
          </Heading>
          <div className="shc-event-list">
            {d.events.map((e) => (
              <Event key={e.id} e={e} title={title} />
            ))}
          </div>
        </section>
      )}

      {(show.calendar || show.countdown) && date && (
        <section className="iv-sec shc-paper shc-when">
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
        <section className="iv-sec shc-deep shc-album">
          <Frame />
          <Heading kicker={<T vi="Khoảnh khắc" en="Moments" />}>
            <T vi="Album ảnh cưới" en="Our album" />
          </Heading>
          <Gallery photos={d.gallery} mono={mono} />
        </section>
      )}

      {wishes}

      {show.gift && d.gift.enabled && (
        <section className="iv-sec shc-paper shc-gift">
          <Seal mono={mono} className="shc-gift-seal iv-reveal" />
          <h2 className="shc-title iv-reveal">
            <T vi="Hộp mừng cưới" en="Wedding gift" />
          </h2>
          <p className="shc-gift-note iv-reveal">
            <T vi="Gửi lời chúc phúc và quà mừng đến cô dâu chú rể" en="Send your blessings and a wedding gift" />
          </p>
          <div className="iv-reveal">
            <GiftReveal groom={d.gift.groom} bride={d.gift.bride} />
          </div>
        </section>
      )}

      {show.thanks && (
        <section className="iv-sec iv-thanks shc-thanks">
          <Photo src={d.thanksPhoto || d.cover} alt="" mono="" className="iv-thanks-bg" />
          <CranePair className="shc-thanks-pair" />
          <div className="iv-thanks-body">
            <h2 className="iv-reveal">Thank you</h2>
            <p className="iv-reveal">
              <Bi k="thanks" />
            </p>
            <Seal mono={mono} className="shc-thanks-seal iv-reveal" />
          </div>
        </section>
      )}
    </>
  );
}
