"use client";

import type { ReactNode } from "react";
import { mapsLink, parseDate, type InviteEvent } from "@/lib/invites/types";
import { Calendar, calendarLink, Countdown, Gallery, GiftReveal, Photo } from "../parts";
import { Announce, Bi, FamilyTitle, PersonTitle, T } from "../lang";
import type { ThemeCtx } from "./types";
import "./baroque.css";

// "Baroque": European classic. Ivory parchment, acanthus C/S-scroll corners around photos like an antique
// picture frame, a rocaille shell crest, symmetric flourish headers, an oval beaded medallion, name cartouches,
// ribbon banners, Roman-numeral dates and deep (--c1) sections with a subtle damask. Gold is --c2.
// Every ornament is drawn here as inline SVG in currentColor, so colour variants recolour it.

const r2 = (n: number) => Math.round(n * 100) / 100;

const ROMAN: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
  [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];
const roman = (n: number) => {
  let out = "";
  let left = Math.max(0, Math.floor(n));
  for (const [v, s] of ROMAN) {
    while (left >= v) {
      out += s;
      left -= v;
    }
  }
  return out;
};

/* ───────── ornaments ───────── */

/** One arm of the acanthus corner (the other arm is this mirrored across the diagonal). */
const cornerArm = () => (
  <>
    <path d="M14 14C40 6 62 10 74 22C82 30 78 42 68 40C60 39 60 30 67 29" />
    <path d="M74 22C88 14 104 14 116 18" strokeWidth="1.3" />
    <path d="M22 22C34 26 40 34 36 44C33 50 26 48 27 42" />
    <path d="M44 12C52 4 62 4 66 8C58 12 50 14 44 12Z" fill="currentColor" stroke="none" />
    <path d="M84 20C90 12 98 10 104 12C98 16 92 18 84 20Z" fill="currentColor" stroke="none" />
    <circle cx="116" cy="18" r="2.4" fill="currentColor" stroke="none" />
  </>
);

/** Acanthus-scroll corner, drawn for the top-left; CSS flips it for the other three. */
function Corner({ className = "" }: { className?: string }) {
  return (
    <svg className={`bq-corner ${className}`} viewBox="0 0 120 120" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {cornerArm()}
        <g transform="matrix(0 1 1 0 0 0)">{cornerArm()}</g>
        <path d="M5 5C22 10 30 18 35 35C18 30 10 22 5 5Z" fill="currentColor" stroke="none" />
        <path d="M9 9L30 30" strokeWidth="0.9" style={{ stroke: "var(--bq-rib)" }} />
      </g>
    </svg>
  );
}

const Corners = () => (
  <>
    {["tl", "tr", "bl", "br"].map((p) => (
      <Corner key={p} className={p} />
    ))}
  </>
);

/** Rocaille shell crest with a C-scroll on each side (art in a 120×64 box). */
const SHELL_RIBS = [
  [34, 42], [40, 28], [49, 17], [60, 12], [71, 17], [80, 28], [86, 42],
];
const shellSide = () => (
  <>
    <path d="M30 52C18 55 8 48 11 39C13 32 22 33 21 39" />
    <path d="M26 54C18 58 10 58 3 55" strokeWidth="1.2" />
    <circle cx="3" cy="55" r="1.8" fill="currentColor" stroke="none" />
  </>
);
const shellArt = () => (
  <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    {shellSide()}
    <g transform="matrix(-1 0 0 1 120 0)">{shellSide()}</g>
    <path d="M30 52C26 24 44 6 60 6C76 6 94 24 90 52C80 46 70 46 60 52C50 46 40 46 30 52Z" fill="currentColor" stroke="none" />
    {SHELL_RIBS.map(([x, y]) => (
      <path key={x} d={`M60 50L${x} ${y}`} strokeWidth="1.1" style={{ stroke: "var(--bq-rib)" }} />
    ))}
    <circle cx="60" cy="56" r="3" fill="currentColor" stroke="none" />
  </g>
);

function Shell({ className = "" }: { className?: string }) {
  return (
    <svg className={`bq-shell ${className}`} viewBox="0 0 120 64" aria-hidden="true">
      {shellArt()}
    </svg>
  );
}

/** Symmetric header flourish: S-scrolls and leaves either side of a lozenge. */
function Flourish({ className = "" }: { className?: string }) {
  const half = (
    <>
      <path d="M10 20C34 20 50 20 64 20" strokeWidth="1.1" />
      <path d="M104 19C96 8 82 6 76 13C72 19 78 25 84 22C88 19 86 14 82 15" />
      <path d="M102 23C92 34 68 34 56 27C48 22 50 15 56 16C60 17 60 22 57 23" />
      <path d="M68 20C60 13 50 13 42 18C50 23 60 23 68 20Z" fill="currentColor" stroke="none" />
      <circle cx="8" cy="20" r="1.8" fill="currentColor" stroke="none" />
    </>
  );
  return (
    <svg className={`bq-flourish ${className}`} viewBox="0 0 240 40" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        {half}
        <g transform="matrix(-1 0 0 1 240 0)">{half}</g>
        <path d="M120 5C124 13 128 17 135 20C128 23 124 27 120 35C116 27 112 23 105 20C112 17 116 13 120 5Z" fill="currentColor" stroke="none" />
        <circle cx="120" cy="20" r="2.6" stroke="none" style={{ fill: "var(--bq-rib)" }} />
      </g>
    </svg>
  );
}

/** Oval medallion: beaded double ring, shell crest on top, acanthus leaves below. */
function MedallionRing() {
  const beads = Array.from({ length: 52 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 52;
    return { x: r2(120 + Math.cos(a) * 108), y: r2(164 + Math.sin(a) * 138) };
  });
  const leaf = (
    <>
      <path d="M120 298C104 300 92 306 82 316C98 315 112 309 120 298Z" fill="currentColor" stroke="none" />
      <path d="M116 300C106 296 98 290 96 282C104 284 112 290 116 300Z" fill="currentColor" stroke="none" />
    </>
  );
  return (
    <svg className="bq-medallion-ring" viewBox="0 0 240 320" aria-hidden="true">
      <g fill="none" stroke="currentColor">
        <ellipse cx="120" cy="164" rx="102" ry="132" strokeWidth="3" />
        <ellipse cx="120" cy="164" rx="114" ry="144" strokeWidth="1" />
        {beads.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r="1.9" fill="currentColor" stroke="none" />
        ))}
        {leaf}
        <g transform="matrix(-1 0 0 1 240 0)">{leaf}</g>
        <circle cx="120" cy="302" r="4.5" fill="currentColor" stroke="none" />
      </g>
      <g transform="translate(66 0) scale(0.9)">{shellArt()}</g>
    </svg>
  );
}

/** Name plaque with concave corners, C-scroll ears, a shell on top and a pendant below. */
function Cartouche() {
  const ears = (
    <>
      <path d="M14 52C4 52 2 64 9 66C14 67 15 61 11 60" />
      <path d="M14 88C4 88 2 76 9 74C14 73 15 79 11 80" />
    </>
  );
  const ribs = [[146, 14], [152, 10], [160, 8], [168, 10], [174, 14]];
  return (
    <svg className="bq-cartouche" viewBox="0 0 320 140" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M40 22H280C284 34 294 40 306 42V98C294 100 284 106 280 118H40C36 106 26 100 14 98V42C26 40 36 34 40 22Z" strokeWidth="2" style={{ fill: "var(--bq-plaque)" }} />
        <path d="M47 29H273C277 39 287 45 299 48V92C287 95 277 101 273 111H47C43 101 33 95 21 92V48C33 45 43 39 47 29Z" strokeWidth="0.8" />
        {ears}
        <g transform="matrix(-1 0 0 1 320 0)">{ears}</g>
        <path d="M142 23C142 8 178 8 178 23Z" fill="currentColor" stroke="none" />
        {ribs.map(([x, y]) => (
          <path key={x} d={`M160 22L${x} ${y}`} strokeWidth="0.9" style={{ stroke: "var(--bq-rib)" }} />
        ))}
        <path d="M148 118C152 128 168 128 172 118" />
        <circle cx="160" cy="131" r="3" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

/** Banner ribbon with forked tails. */
const Ribbon = ({ children, as: Tag = "p", className = "" }: { children: ReactNode; as?: "p" | "h2" | "h3"; className?: string }) => (
  <Tag className={`bq-ribbon ${className}`}>
    <i aria-hidden="true" />
    <span>{children}</span>
    <i aria-hidden="true" />
  </Tag>
);

/** Section header: flourish, optional kicker, script title. */
const Heading = ({ kicker, children }: { kicker?: ReactNode; children: ReactNode }) => (
  <div className="bq-heading iv-reveal">
    <Flourish />
    {kicker && <p className="bq-kicker">{kicker}</p>}
    <h2 className="bq-title">{children}</h2>
  </div>
);

/* ───────── event card ───────── */

function Event({ e, title }: { e: InviteEvent; title: string }) {
  const p = parseDate(e.date);
  const map = mapsLink(e);
  const q = [e.venue, e.address].filter(Boolean).join(", ");
  return (
    <article className="bq-event iv-reveal">
      <Corners />
      <Ribbon as="h3">{e.title || "Sự kiện"}</Ribbon>
      {p && (
        <>
          <p className="bq-event-weekday">{p.weekday}</p>
          <div className="bq-event-date">
            <div>
              <small>
                <T vi="Vào lúc" en="At" />
              </small>
              <b>{e.time || "--:--"}</b>
            </div>
            <strong>{p.dd}</strong>
            <div>
              <small>
                <T vi={`Tháng ${p.mm}`} en={`Month ${p.mm}`} />
              </small>
              <b>{p.y}</b>
            </div>
          </div>
          <p className="bq-roman">
            {roman(p.d)} · {roman(p.m)} · {roman(p.y)}
          </p>
        </>
      )}
      {e.lunar && <p className="bq-event-lunar">{e.lunar}</p>}
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
      {e.venue && <p className="bq-event-venue">{e.venue}</p>}
      {e.address && <p className="bq-event-address">{e.address}</p>}
      {e.showMap && q && (
        <iframe
          className="iv-event-map"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`}
          title={`Bản đồ ${e.venue || e.title}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
      {(map || p) && (
        <div className="bq-event-actions">
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

/* ───────── layout ───────── */

export default function BaroqueTheme({ d, title, date, mono, guestName, highlights, wishes, show, labels, mainEvent }: ThemeCtx) {
  const people = [
    { name: d.groomFullName || d.groomName, label: labels.first, which: "groom" as const },
    { name: d.brideFullName || d.brideName, label: labels.second, which: "bride" as const },
  ];
  return (
    <>
      <section className="iv-sec bq-hero">
        <Flourish className="bq-hero-flourish iv-reveal" />
        <p className="bq-kicker iv-reveal">
          <T vi="Lễ thành hôn" en="The wedding of" />
        </p>
        <h1 className="bq-names iv-reveal">
          <span>{d.groomName}</span>
          <i>&amp;</i>
          <span>{d.brideName}</span>
        </h1>
        <div className="bq-frame bq-hero-frame iv-reveal">
          <Shell className="bq-crest" />
          <Photo src={d.cover} alt={`Ảnh cưới ${title}`} mono={mono} />
          <Corners />
        </div>
        {date && (
          <div className="bq-hero-date iv-reveal">
            <Ribbon>
              {roman(date.d)} · {roman(date.m)} · {roman(date.y)}
            </Ribbon>
            <p>
              {mainEvent?.time && <>{mainEvent.time} · </>}
              {date.weekday} · {date.dd}.{date.mm}.{date.y}
            </p>
          </div>
        )}
      </section>

      {show.couple && (
        <section className="iv-sec bq-couple">
          <Announce className="bq-announce" />
          <div className="bq-medallion iv-reveal">
            <Photo src={d.couplePhoto || d.cover} alt={`Ảnh cô dâu chú rể ${title}`} mono={mono} />
            <MedallionRing />
          </div>
          <div className="bq-pair">
            {people.map((p, i) => (
              <div key={p.which} className="bq-pair-item">
                {i === 1 && (
                  <p className="bq-amp iv-reveal" aria-hidden="true">
                    &amp;
                  </p>
                )}
                <div className="bq-person iv-reveal">
                  <Cartouche />
                  <div className="bq-person-text">
                    <em>{p.label}</em>
                    <b>{p.name}</b>
                    <PersonTitle which={p.which} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {show.families && (
        <section className="iv-sec bq-deep bq-families">
          <Shell className="bq-fam-shell iv-reveal" />
          <div className="bq-fam-grid">
            {[d.groomFamily, d.brideFamily].map((f, i) => (
              <div key={i} className={`bq-family iv-reveal ${i ? "second" : "first"}`}>
                <h3>
                  <FamilyTitle which={i ? "brideFamily" : "groomFamily"} />
                </h3>
                <p className="bq-parents">{f.parents}</p>
                {f.address && <p className="bq-addr">{f.address}</p>}
              </div>
            ))}
            <span className="bq-vrule" aria-hidden="true" />
          </div>
        </section>
      )}

      {show.invite && (
        <section className="iv-sec bq-invite">
          <Flourish className="iv-reveal" />
          <p className="bq-inv-heading iv-reveal">
            <Bi k="inviteHeading" />
          </p>
          <p className="bq-guest iv-reveal">{guestName}</p>
          <p className="bq-inv-line iv-reveal">
            <Bi k="inviteLine" />
          </p>
          <div className="bq-trio iv-reveal">
            {[date?.dd, date?.mm, date?.y].map((label, i) => (
              <figure key={i}>
                <Photo src={highlights[i] ?? ""} alt={`Ảnh cưới ${i + 1}`} mono={mono}>
                  <b>{label}</b>
                </Photo>
                {date && <figcaption>{roman([date.d, date.m, date.y][i])}</figcaption>}
              </figure>
            ))}
          </div>
          {d.quote && (
            <blockquote className="bq-quote iv-reveal">
              <Bi k="quote" />
            </blockquote>
          )}
        </section>
      )}

      {show.events && d.events.length > 0 && (
        <section className="iv-sec bq-events">
          <Heading kicker={<T vi="Trân trọng kính mời" en="You are invited" />}>
            <T vi="Lễ & Tiệc cưới" en="Ceremony & Reception" />
          </Heading>
          <div className="bq-event-list">
            {d.events.map((e) => (
              <Event key={e.id} e={e} title={title} />
            ))}
          </div>
        </section>
      )}

      {(show.calendar || show.countdown) && date && (
        <section className="iv-sec bq-deep bq-when">
          <div className="bq-heading iv-reveal">
            <Flourish />
            <h2 className="bq-title">Save the Date</h2>
            <p className="bq-kicker">
              Tháng {date.mm} · {date.y}
            </p>
          </div>
          {show.calendar && (
            <div className="bq-cal-frame iv-reveal">
              <Corners />
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
        <section className="iv-sec bq-album">
          <Heading kicker={<T vi="Album ảnh cưới" en="Wedding album" />}>Our Love Story</Heading>
          <Gallery photos={d.gallery} mono={mono} />
        </section>
      )}

      {wishes}

      {show.gift && d.gift.enabled && (
        <section className="iv-sec bq-gift">
          <Heading kicker={<T vi="Hộp mừng cưới" en="Wedding gift" />}>
            <T vi="Gửi lời chúc phúc" en="With love" />
          </Heading>
          <p className="bq-gift-sub iv-reveal">
            <T vi="Sự hiện diện của bạn là món quà quý giá nhất với chúng mình." en="Your presence is the greatest gift of all." />
          </p>
          <div className="iv-reveal">
            <GiftReveal groom={d.gift.groom} bride={d.gift.bride} />
          </div>
        </section>
      )}

      {show.thanks && (
        <section className="iv-sec iv-thanks bq-thanks">
          <Photo src={d.thanksPhoto || d.cover} alt="" mono="" className="iv-thanks-bg" />
          <div className="bq-thanks-frame" aria-hidden="true">
            <Corners />
          </div>
          <div className="iv-thanks-body">
            <Flourish className="iv-reveal" />
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
