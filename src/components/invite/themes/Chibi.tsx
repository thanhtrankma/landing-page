"use client";

import { lunarLabel } from "@/lib/invites/lunar";
import { mapsLink, parseDate, type InviteEvent } from "@/lib/invites/types";
import { calendarLink, Calendar, Countdown, Gallery, GiftReveal, Photo } from "../parts";
import { Announce, Bi, FamilyTitle, PersonTitle, T } from "../lang";
import type { CSSProperties, ReactNode } from "react";
import type { ThemeCtx } from "./types";
import "./chibi.css";

// "Chibi": a cute, playful card. A hand-drawn chibi couple (big heads, suit and áo dài, holding hands) on the
// cover, sticker cards with thick ink outlines and offset shadows, chat-style speech bubbles for the couple,
// scalloped section edges, confetti and hearts. Every ornament is inline SVG coloured with var(--c1) / var(--c2)
// (plus neutrals) so the colour variants recolour the whole card. Styles: chibi.css.

/* ───────────── helpers (deterministic, rounded: identical on server and client) ───────────── */

const r2 = (n: number) => Math.round(n * 100) / 100;

/** A heart centred on (cx, cy), about 2·s wide. */
const heart = (cx: number, cy: number, s: number) => {
  const p = (x: number, y: number) => `${r2(cx + x * s)} ${r2(cy + y * s)}`;
  return `M${p(0, 0.9)} C${p(-1.2, 0.1)} ${p(-1.1, -0.9)} ${p(-0.5, -0.9)} C${p(-0.15, -0.9)} ${p(0, -0.6)} ${p(0, -0.35)} C${p(0, -0.6)} ${p(0.15, -0.9)} ${p(0.5, -0.9)} C${p(1.1, -0.9)} ${p(1.2, 0.1)} ${p(0, 0.9)} Z`;
};

const ink = { stroke: "var(--cb-ink)" } as const;
const outline = ink;
/** Applied on every <svg> root: children inherit it unless they set their own strokeWidth. */
const pen = { strokeWidth: 2.6, strokeLinejoin: "round", strokeLinecap: "round" } as const;
const skin = { ...outline, fill: "var(--cb-skin)" } as const;
const hair = { ...outline, fill: "var(--cb-hair)" } as const;
const main = { ...outline, fill: "var(--c1)" } as const;
const accent = { ...outline, fill: "var(--c2)" } as const;
const white = { ...outline, fill: "#fff" } as const;
const soft = { ...outline, fill: "color-mix(in srgb, var(--c1) 42%, #fff)" } as const;
const blush = { fill: "color-mix(in srgb, var(--c1) 55%, #fff)", opacity: 0.75 } as const;

/** A limb: a thick ink stroke with a thinner coloured stroke on top, so it reads as an outlined tube. */
function Limb({ d, fill, w = 10 }: { d: string; fill: string; w?: number }) {
  return (
    <>
      <path d={d} style={{ stroke: "var(--cb-ink)", fill: "none" }} strokeWidth={w + 5} strokeLinecap="round" />
      <path d={d} style={{ stroke: fill, fill: "none" }} strokeWidth={w} strokeLinecap="round" />
    </>
  );
}

function Eye({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx="4.4" ry="5.4" style={{ fill: "var(--cb-ink)" }} />
      <circle cx={x + 1.5} cy={y - 2} r="1.6" style={{ fill: "#fff" }} />
    </g>
  );
}

/* ───────────── chibi heads (drawn around their own centre, r = 40) ───────────── */

function GroomHead() {
  return (
    <g>
      <circle cx="-40" cy="8" r="7" style={skin} />
      <circle cx="40" cy="8" r="7" style={skin} />
      <circle r="40" style={skin} />
      <path d="M-42 4 C-48 -32 -24 -46 2 -44 C26 -44 44 -26 40 4 C36 -10 30 -18 22 -20 C18 -14 6 -10 -6 -14 C-14 -8 -26 -8 -32 -10 C-36 -6 -40 -2 -42 4 Z" style={hair} />
      <path d="M-2 -44 C-4 -52 4 -56 8 -52" style={{ ...outline, fill: "none" }} />
      <Eye x={-13} y={6} />
      <Eye x={13} y={6} />
      <ellipse cx="-22" cy="18" rx="6.5" ry="3.6" style={blush} />
      <ellipse cx="22" cy="18" rx="6.5" ry="3.6" style={blush} />
      <path d="M-6 18 Q0 25 6 18" style={{ ...outline, fill: "none" }} />
    </g>
  );
}

const CROWN = Array.from({ length: 6 }, (_, i) => {
  const a = ((-160 + i * 28) * Math.PI) / 180;
  return { x: r2(Math.cos(a) * 39), y: r2(Math.sin(a) * 39), k: i % 3 };
});

function BrideHead({ veil = true }: { veil?: boolean }) {
  return (
    <g>
      {veil && <path d="M18 -38 C44 -32 58 10 62 72 C50 78 38 76 28 70 C34 40 30 2 18 -38 Z" style={{ ...white, opacity: 0.92 }} />}
      <path d="M-40 -2 C-44 -38 -14 -48 4 -44 C30 -42 46 -22 42 8 C44 32 36 50 30 56 C26 42 28 26 24 18 L-24 18 C-28 28 -24 44 -30 56 C-38 46 -42 26 -40 -2 Z" style={hair} />
      <circle r="40" style={skin} />
      <path d="M-38 0 C-40 -30 -16 -42 4 -40 C26 -40 42 -22 38 2 C32 -12 22 -20 12 -22 C6 -14 -8 -12 -18 -18 C-24 -12 -32 -8 -38 0 Z" style={hair} />
      {CROWN.map((f, i) => (
        <circle key={i} cx={f.x} cy={f.y} r={f.k === 1 ? 6 : 5} style={f.k === 0 ? accent : f.k === 1 ? white : soft} strokeWidth="2" />
      ))}
      <Eye x={-13} y={6} />
      <Eye x={13} y={6} />
      <ellipse cx="-22" cy="18" rx="6.5" ry="3.6" style={blush} />
      <ellipse cx="22" cy="18" rx="6.5" ry="3.6" style={blush} />
      <path d="M-6 18 Q0 27 6 18 Z" style={{ ...outline, fill: "color-mix(in srgb, var(--c1) 80%, #000)" }} strokeWidth="2" />
    </g>
  );
}

/** Round avatar for the chat bubbles. */
function Avatar({ who }: { who: "groom" | "bride" }) {
  return (
    <svg className="cb-avatar" viewBox="-52 -50 104 104" aria-hidden="true" {...pen}>
      <g transform="translate(0 8)">{who === "groom" ? <GroomHead /> : <BrideHead veil={false} />}</g>
    </svg>
  );
}

/* ───────────── the chibi couple ───────────── */

function Couple({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 260 214" aria-hidden="true" {...pen}>
      <ellipse cx="130" cy="202" rx="104" ry="8" style={{ fill: "color-mix(in srgb, var(--c1) 16%, transparent)" }} />
      <g className="cb-bob">
        {/* groom: legs, jacket, shirt and bow tie */}
        <rect x="73" y="158" width="12" height="32" rx="5" style={{ ...outline, fill: "var(--cb-suit)" }} />
        <rect x="89" y="158" width="12" height="32" rx="5" style={{ ...outline, fill: "var(--cb-suit)" }} />
        <ellipse cx="77" cy="193" rx="9" ry="5" style={{ ...outline, fill: "var(--cb-ink)" }} />
        <ellipse cx="97" cy="193" rx="9" ry="5" style={{ ...outline, fill: "var(--cb-ink)" }} />
        <Limb d="M62 126 Q50 140 54 155" fill="var(--cb-suit)" />
        <circle cx="54" cy="159" r="6.5" style={skin} />
        <path d="M60 120 Q87 106 114 120 L118 166 Q87 173 56 166 Z" style={{ ...outline, fill: "var(--cb-suit)" }} />
        <path d="M77 113 L87 140 L97 113 Z" style={white} strokeWidth="2" />
        <path d="M77 114 L83 136 M97 114 L91 136" style={{ ...outline, fill: "none" }} strokeWidth="2" />
        <path d="M87 119 L78 114 L78 124 Z M87 119 L96 114 L96 124 Z" style={main} strokeWidth="2" />
        <circle cx="87" cy="119" r="2.8" style={main} strokeWidth="1.6" />
        <circle cx="87" cy="150" r="1.8" style={{ fill: "var(--cb-ink)" }} />
        <circle cx="87" cy="159" r="1.8" style={{ fill: "var(--cb-ink)" }} />
        <circle cx="105" cy="128" r="4.2" style={accent} strokeWidth="1.8" />
        <Limb d="M110 127 Q121 141 127 149" fill="var(--cb-suit)" />

        {/* bride: trousers, áo dài with front panel, bouquet */}
        <path d="M151 156 L147 194 H201 L197 156 Z" style={white} />
        <ellipse cx="152" cy="196" rx="8" ry="4.6" style={main} strokeWidth="2.2" />
        <ellipse cx="196" cy="196" rx="8" ry="4.6" style={main} strokeWidth="2.2" />
        <Limb d="M151 127 Q141 141 134 149" fill="var(--c1)" />
        <path d="M150 120 Q174 107 198 120 L202 160 H146 Z" style={main} />
        <path d="M154 156 H194 L187 198 Q174 202 161 198 Z" style={main} />
        <path d="M166 111 H182 V118 Q174 121 166 118 Z" style={accent} strokeWidth="2" />
        <path d="M174 121 V156" style={{ stroke: "color-mix(in srgb, var(--c1) 70%, #000)", fill: "none" }} strokeWidth="1.4" strokeDasharray="2 4" strokeLinecap="round" />
        {[
          [163, 136],
          [186, 142],
          [168, 176],
          [181, 186],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="3.4" style={{ fill: "var(--c2)" }} />
            <circle cx={x} cy={y} r="1.2" style={{ fill: "#fff" }} />
          </g>
        ))}
        <Limb d="M196 126 Q207 136 201 147" fill="var(--c1)" />
        <path d="M188 160 L196 150 L204 160" style={{ ...outline, fill: "none", stroke: "var(--cb-leaf)" }} strokeWidth="3" />
        <circle cx="193" cy="149" r="6.5" style={accent} strokeWidth="2.2" />
        <circle cx="205" cy="148" r="6.5" style={white} strokeWidth="2.2" />
        <circle cx="199" cy="140" r="6.5" style={soft} strokeWidth="2.2" />
        <circle cx="200" cy="150" r="2.4" style={{ fill: "var(--cb-skin)" }} />

        {/* held hands */}
        <circle cx="130.5" cy="151" r="7.5" style={skin} />
        <path d="M126 147 Q131 151 135 147" style={{ ...outline, fill: "none" }} strokeWidth="1.6" />

        {/* heads, leaning in */}
        <g transform="translate(87 78) rotate(6)">
          <GroomHead />
        </g>
        <g transform="translate(174 78) rotate(-6)">
          <BrideHead />
        </g>
      </g>
      <g className="cb-float">
        <path d={heart(130, 24, 13)} style={main} />
        <path d={heart(127, 20, 3)} style={{ fill: "#fff", opacity: 0.8 }} />
        <path d={heart(108, 10, 5)} style={soft} strokeWidth="2" />
        <path d={heart(153, 8, 4.4)} style={accent} strokeWidth="2" />
      </g>
    </svg>
  );
}

/* ───────────── small ornaments ───────────── */

/** Little house with a heart door (families). */
function House({ roof }: { roof: "c1" | "c2" }) {
  return (
    <svg className="cb-house" viewBox="0 0 64 58" aria-hidden="true" {...pen}>
      <rect x="40" y="8" width="8" height="14" rx="2" style={white} strokeWidth="2.2" />
      <rect x="12" y="26" width="40" height="28" rx="4" style={white} strokeWidth="2.4" />
      <path d="M5 29 L32 6 L59 29 Z" style={{ ...outline, fill: roof === "c1" ? "var(--c1)" : "var(--c2)" }} strokeWidth="2.4" />
      <path d={heart(32, 42, 6.5)} style={main} strokeWidth="2" />
      <rect x="16" y="33" width="8" height="8" rx="2" style={accent} strokeWidth="1.8" />
      <rect x="40" y="33" width="8" height="8" rx="2" style={accent} strokeWidth="1.8" />
    </svg>
  );
}

/** Gift box with a big bow and hearts popping out. */
function GiftBox() {
  return (
    <svg className="cb-giftbox iv-reveal" viewBox="0 0 120 112" aria-hidden="true" {...pen}>
      <path d={heart(26, 20, 7)} style={soft} strokeWidth="2" className="cb-pop a" />
      <path d={heart(96, 14, 6)} style={accent} strokeWidth="2" className="cb-pop b" />
      <path d={heart(60, 10, 4.5)} style={main} strokeWidth="2" className="cb-pop c" />
      <rect x="22" y="52" width="76" height="52" rx="7" style={main} />
      <rect x="16" y="38" width="88" height="18" rx="6" style={{ ...outline, fill: "color-mix(in srgb, var(--c1) 70%, #fff)" }} />
      <rect x="52" y="38" width="16" height="66" style={accent} />
      <path d="M60 38 C46 18 30 24 36 34 C40 40 52 40 60 38 Z M60 38 C74 18 90 24 84 34 C80 40 68 40 60 38 Z" style={accent} />
      <circle cx="60" cy="37" r="5" style={accent} />
      <path d="M30 70 h10 M30 80 h6 M82 88 h8" style={{ stroke: "#fff", fill: "none", opacity: 0.7 }} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Tiny sparkle (four-point star) used beside headings. */
function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg className={`cb-sparkle ${className}`} viewBox="0 0 24 24" aria-hidden="true" {...pen}>
      <path d="M12 1 C13 8 16 11 23 12 C16 13 13 16 12 23 C11 16 8 13 1 12 C8 11 11 8 12 1 Z" style={accent} strokeWidth="1.8" />
    </svg>
  );
}

/** Deterministic confetti scattered near the edges of a section. */
const CONFETTI = Array.from({ length: 16 }, (_, i) => ({
  left: i % 2 ? 3 + ((i * 37) % 13) : 84 + ((i * 29) % 13),
  top: 4 + ((i * 41) % 88),
  rot: (i * 47) % 360,
  k: i % 4,
  c: i % 3,
}));

function Confetti({ count = 16 }: { count?: number }) {
  return (
    <div className="cb-confetti" aria-hidden="true">
      {CONFETTI.slice(0, count).map((p, i) => (
        <span key={i} className={`k${p.k} c${p.c}`} style={{ left: `${p.left}%`, top: `${p.top}%`, "--r": `${p.rot}deg` } as CSSProperties} />
      ))}
    </div>
  );
}

/** Section heading: a tilted pill sticker over a bold title with a marker highlight. */
function Heading({ kicker, children, light = false }: { kicker: ReactNode; children: ReactNode; light?: boolean }) {
  return (
    <header className={`cb-heading iv-reveal${light ? " light" : ""}`}>
      <p className="cb-kicker">{kicker}</p>
      <h2 className="cb-title">
        <Sparkle className="l" />
        <span>{children}</span>
        <Sparkle className="r" />
      </h2>
    </header>
  );
}

/* ───────────── event card ───────────── */

function Event({ e, title }: { e: InviteEvent; title: string }) {
  const p = parseDate(e.date);
  const map = mapsLink(e);
  return (
    <article className="cb-event iv-reveal">
      <h3 className="cb-event-tab">{e.title || "Sự kiện"}</h3>
      {p && (
        <div className="cb-event-date">
          <span className="cb-event-side">
            <small>
              <T vi="Thời gian" en="Time" />
            </small>
            <b>{e.time || "--:--"}</b>
          </span>
          <span className="cb-event-day">
            <b>{p.dd}</b>
          </span>
          <span className="cb-event-side">
            <small>Tháng {p.mm}</small>
            <b>{p.y}</b>
          </span>
        </div>
      )}
      {p && <p className="cb-event-weekday">{p.weekday}</p>}
      {e.lunar && <p className="cb-event-lunar">{e.lunar}</p>}
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
      {(e.venue || e.address) && <span className="cb-event-perf" aria-hidden="true" />}
      {e.venue && <p className="cb-event-venue">{e.venue}</p>}
      {e.address && <p className="cb-event-address">{e.address}</p>}
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
        <div className="cb-event-actions">
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

export default function ChibiTheme({ d, title, date, mono, guestName, highlights, wishes, show, labels, mainEvent }: ThemeCtx) {
  const lunar = date ? lunarLabel(d.date) : "";
  const when = mainEvent?.time && date ? `${mainEvent.time} · ${parseDate(mainEvent.date)?.weekday ?? date.weekday}` : date?.weekday;
  // groom* fields hold whoever is shown first (the bride when she comes first), so the avatars follow the labels
  const firstIsBride = labels.first === "Cô dâu";
  return (
    <>
      <section className="cb-cover cb-sec">
        <Confetti />
        <p className="cb-cover-bubble iv-reveal">
          <T vi="Tụi mình cưới nhau rồi!" en="We're getting married!" />
        </p>
        <Couple className="cb-couple iv-reveal" />
        <p className="cb-cover-kicker iv-reveal">
          <T vi="Lễ thành hôn" en="The wedding of" />
        </p>
        <h1 className="cb-names iv-reveal">
          <span>{d.groomName}</span>
          <i>&amp;</i>
          <span>{d.brideName}</span>
        </h1>
        {date && (
          <div className="cb-cover-date iv-reveal">
            <div className="cb-dots">
              <b>{date.dd}</b>
              <b>{date.mm}</b>
              <b>{date.y}</b>
            </div>
            {when && <p>{when}</p>}
            {lunar && <p className="cb-lunar">{lunar}</p>}
          </div>
        )}
        <div className="cb-polaroid iv-reveal">
          <span className="cb-tape" aria-hidden="true" />
          <Photo src={d.cover} alt={`Ảnh cưới ${title}`} mono={mono} className="cb-cover-photo" />
          <svg className="cb-polaroid-heart" viewBox="0 0 40 40" aria-hidden="true" {...pen}>
            <path d={heart(20, 21, 15)} style={main} />
          </svg>
        </div>
      </section>

      {show.families && (
        <section className="iv-sec cb-sec cb-families">
          <div className="cb-fam-grid">
            {[d.groomFamily, d.brideFamily].map((f, i) => (
              <div key={i} className="cb-fam iv-reveal">
                <House roof={i ? "c2" : "c1"} />
                <h2>
                  <FamilyTitle which={i ? "brideFamily" : "groomFamily"} />
                </h2>
                <p className="cb-parents">{f.parents}</p>
                {f.address && <p className="cb-addr">{f.address}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {show.couple && (
        <section className="iv-sec cb-sec cb-tint cb-couple-sec">
          <Announce className="cb-announce" />
          <div className="cb-blob iv-reveal">
            <Photo src={d.couplePhoto || d.cover} alt={`Ảnh cô dâu chú rể ${title}`} mono={mono} />
            <svg className="cb-blob-heart" viewBox="0 0 40 40" aria-hidden="true" {...pen}>
              <path d={heart(20, 21, 15)} style={accent} />
            </svg>
          </div>
          <div className="cb-chat">
            <div className="cb-msg iv-reveal">
              <Avatar who={firstIsBride ? "bride" : "groom"} />
              <div className="cb-bubble">
                <em>{labels.first}</em>
                <b>{d.groomFullName || d.groomName}</b>
                <PersonTitle which="groom" />
              </div>
            </div>
            <div className="cb-msg me iv-reveal">
              <div className="cb-bubble">
                <em>{labels.second}</em>
                <b>{d.brideFullName || d.brideName}</b>
                <PersonTitle which="bride" />
              </div>
              <Avatar who={firstIsBride ? "groom" : "bride"} />
            </div>
            <p className="cb-typing iv-reveal" aria-hidden="true">
              <span />
              <span />
              <span />
            </p>
          </div>
        </section>
      )}

      {show.invite && (
        <section className="iv-sec cb-sec cb-invite">
          {d.quote && (
            <p className="cb-quote iv-reveal">
              <Bi k="quote" />
            </p>
          )}
          <p className="cb-inv-heading iv-reveal">
            <Bi k="inviteHeading" />
          </p>
          <p className="cb-guest iv-reveal">
            <span>{guestName}</span>
          </p>
          <p className="cb-inv-line iv-reveal">
            <Bi k="inviteLine" />
          </p>
          <div className="cb-trio iv-reveal">
            {[date?.dd, date?.mm, date?.y].map((label, i) => (
              <div key={i} className="cb-trio-item">
                <Photo src={highlights[i] ?? ""} alt={`Ảnh cưới ${i + 1}`} mono={mono} />
                {label && <b>{label}</b>}
              </div>
            ))}
          </div>
        </section>
      )}

      {show.events && d.events.length > 0 && (
        <section className="iv-sec cb-sec cb-deep cb-events">
          <Confetti count={8} />
          <Heading light kicker={<T vi="Trân trọng kính mời" en="Join us at" />}>
            <T vi="Tiệc cưới" en="The party" />
          </Heading>
          <div className="cb-event-list">
            {d.events.map((e) => (
              <Event key={e.id} e={e} title={title} />
            ))}
          </div>
        </section>
      )}

      {(show.calendar || show.countdown) && date && (
        <section className="iv-sec cb-sec cb-when">
          <Heading kicker="Save the date">
            Tháng {date.mm} · {date.y}
          </Heading>
          {show.calendar && (
            <div className="cb-cal iv-reveal">
              <span className="cb-rings" aria-hidden="true" />
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
        <section className="iv-sec cb-sec cb-sun cb-album">
          <Heading kicker={<T vi="Khoảnh khắc" en="Moments" />}>
            <T vi="Album ảnh cưới" en="Our album" />
          </Heading>
          <Gallery photos={d.gallery} mono={mono} />
        </section>
      )}

      {wishes}

      {show.gift && d.gift.enabled && (
        <section className="iv-sec cb-sec cb-gift">
          <GiftBox />
          <Heading kicker={<T vi="Gửi yêu thương" en="With love" />}>
            <T vi="Hộp mừng cưới" en="Wedding gift" />
          </Heading>
          <p className="cb-gift-note iv-reveal">
            <T vi="Cảm ơn tấm lòng bạn dành cho tụi mình!" en="Thank you for your love and kindness!" />
          </p>
          <div className="iv-reveal">
            <GiftReveal groom={d.gift.groom} bride={d.gift.bride} />
          </div>
        </section>
      )}

      {show.thanks && (
        <section className="iv-sec cb-sec cb-deep cb-thanks">
          <Confetti count={10} />
          <h2 className="cb-thanks-title iv-reveal">Thank you</h2>
          <div className="cb-thanks-photo iv-reveal">
            <Photo src={d.thanksPhoto || d.cover} alt={`Ảnh cưới ${title}`} mono={mono} />
          </div>
          <p className="cb-thanks-bubble iv-reveal">
            <Bi k="thanks" />
          </p>
          <p className="cb-thanks-sign iv-reveal">
            <span>{d.groomName}</span>
            <svg viewBox="0 0 40 40" aria-hidden="true" {...pen}>
              <path d={heart(20, 21, 14)} style={accent} />
            </svg>
            <span>{d.brideName}</span>
          </p>
        </section>
      )}
    </>
  );
}
