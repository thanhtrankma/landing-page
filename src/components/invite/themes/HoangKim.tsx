"use client";

import type { ReactNode } from "react";
import { mapsLink, parseDate, type InviteEvent } from "@/lib/invites/types";
import { calendarLink, Calendar, Countdown, Gallery, GiftReveal, Photo } from "../parts";
import { Announce, Bi, FamilyTitle, PersonTitle, T } from "../lang";
import type { ThemeCtx } from "./types";
import "./hoang-kim.css";

// "Hoàng Kim": a foil-stamped luxury card. Deep main-colour panels framed by metallic-gold double lines with
// art-deco corners, a gold monogram medallion, wide-tracked serif caps, arched photo frames and thin gold
// dividers with a diamond, alternating with ivory paper panels. Colours: --c1 (main) and --c2 (gold) only.

const r2 = (n: number) => Math.round(n * 100) / 100;
const rad = (deg: number) => (deg * Math.PI) / 180;
const pt = (cx: number, cy: number, r: number, deg: number) => [r2(cx + Math.cos(rad(deg)) * r), r2(cy + Math.sin(rad(deg)) * r)] as const;

/* ───────────── ornaments (hand-drawn, stroke/fill = currentColor so variants recolour) ───────────── */

/** Art-deco corner: stepped double L, quarter-circle fan with rays, a diamond on the diagonal. Drawn top-left. */
function Corner({ className = "" }: { className?: string }) {
  const rays = [15, 30, 45, 60, 75].map((a, i) => {
    const [x1, y1] = pt(11, 11, 19, a);
    const [x2, y2] = pt(11, 11, i % 2 ? 25 : 29, a);
    return <path key={a} d={`M${x1} ${y1}L${x2} ${y2}`} />;
  });
  return (
    <svg className={`hk-corner ${className}`} viewBox="0 0 60 60" aria-hidden="true" fill="none" stroke="currentColor">
      <path d="M1 59V1h58" strokeWidth="1.3" />
      <path d="M6 50V6h44" strokeWidth="0.7" />
      <path d="M11 38V11h27" strokeWidth="0.7" />
      <path d="M21 11A10 10 0 0 1 11 21M26 11A15 15 0 0 1 11 26" strokeWidth="0.8" />
      <g strokeWidth="0.7">{rays}</g>
      <path d="M33 29l3.5 3.5L33 36l-3.5-3.5z" fill="currentColor" stroke="none" transform="translate(-0.5 -0.5)" />
      <circle cx="50" cy="6" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="6" cy="50" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Corners() {
  return (
    <>
      <Corner className="tl" />
      <Corner className="tr" />
      <Corner className="bl" />
      <Corner className="br" />
    </>
  );
}

/** Thin gold rule with a diamond in the middle. */
function Divider({ className = "" }: { className?: string }) {
  return (
    <svg className={`hk-divider ${className}`} viewBox="0 0 240 16" aria-hidden="true" fill="none" stroke="currentColor">
      <path d="M0 8h100M140 8h100" strokeWidth="0.9" />
      <path d="M120 1l7 7-7 7-7-7z" strokeWidth="0.9" />
      <path d="M120 4.5l3.5 3.5-3.5 3.5-3.5-3.5z" fill="currentColor" stroke="none" />
      <circle cx="105" cy="8" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="135" cy="8" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Sunburst medallion: rays, double ring, cardinal diamonds and a laurel under the monogram. */
function Crest({ className = "" }: { className?: string }) {
  const rays = Array.from({ length: 60 }, (_, i) => {
    const a = i * 6 - 90;
    const [x1, y1] = pt(100, 100, 68, a);
    const [x2, y2] = pt(100, 100, i % 5 === 0 ? 96 : i % 2 ? 80 : 87, a);
    return <path key={i} d={`M${x1} ${y1}L${x2} ${y2}`} strokeWidth={i % 5 === 0 ? 1.1 : 0.6} />;
  });
  const diamonds = [0, 90, 180, 270].map((a) => {
    const [x, y] = pt(100, 100, 62, a);
    return <path key={a} d={`M${x} ${r2(y - 5)}l5 5-5 5-5-5z`} fill="currentColor" stroke="none" />;
  });
  const leaves: ReactNode[] = [];
  for (const side of [-1, 1]) {
    for (let k = 0; k < 6; k++) {
      const a = 90 + side * (22 + k * 11);
      const [x, y] = pt(100, 100, 45, a);
      const rot = r2(a + (side > 0 ? 60 : -60));
      leaves.push(<ellipse key={`${side}${k}`} cx={x} cy={y} rx="1.9" ry="4.6" fill="currentColor" stroke="none" transform={`rotate(${rot} ${x} ${y})`} />);
    }
  }
  const [lx1, ly1] = pt(100, 100, 45, 90 - 82);
  const [lx2, ly2] = pt(100, 100, 45, 90 + 82);
  return (
    <svg className={`hk-crest-svg ${className}`} viewBox="0 0 200 200" aria-hidden="true" fill="none" stroke="currentColor">
      <g className="hk-rays">{rays}</g>
      <circle cx="100" cy="100" r="62" strokeWidth="1.8" />
      <circle cx="100" cy="100" r="56.5" strokeWidth="0.7" />
      <circle cx="100" cy="100" r="53" className="hk-crest-core" stroke="none" />
      <circle cx="100" cy="100" r="50" strokeWidth="0.5" strokeDasharray="1.2 2.6" />
      {diamonds}
      <path d={`M${lx1} ${ly1}A45 45 0 0 1 ${lx2} ${ly2}`} strokeWidth="0.7" />
      {leaves}
    </svg>
  );
}

/** Rising-sun fan used above headings. */
function Fan({ className = "" }: { className?: string }) {
  const rays = Array.from({ length: 13 }, (_, i) => {
    const a = 180 + i * 15;
    const [x1, y1] = pt(60, 44, 18, a);
    const [x2, y2] = pt(60, 44, i % 2 ? 34 : 40, a);
    return <path key={i} d={`M${x1} ${y1}L${x2} ${y2}`} />;
  });
  return (
    <svg className={`hk-fan ${className}`} viewBox="0 0 120 46" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="0.8">
      <path d="M48 44A12 12 0 0 1 72 44M44 44A16 16 0 0 1 76 44" />
      {rays}
      <path d="M4 44h112" strokeWidth="1" />
    </svg>
  );
}

/** Photo in an arched gold double frame. */
function Arch({ src, alt, mono, className = "", children }: { src: string; alt: string; mono: string; className?: string; children?: ReactNode }) {
  return (
    <div className={`hk-arch ${className}`}>
      <div className="hk-arch-in">
        <Photo src={src} alt={alt} mono={mono}>
          {children}
        </Photo>
      </div>
    </div>
  );
}

function Heading({ vi, en, className = "" }: { vi: string; en: string; className?: string }) {
  return (
    <h2 className={`hk-heading iv-reveal ${className}`}>
      <T vi={vi} en={en} />
    </h2>
  );
}

/* ───────────── event card ───────────── */

function Event({ e, title }: { e: InviteEvent; title: string }) {
  const p = parseDate(e.date);
  const map = mapsLink(e);
  const q = [e.venue, e.address].filter(Boolean).join(", ");
  return (
    <article className="hk-event iv-reveal">
      <Corners />
      <h3>{e.title || "Sự kiện"}</h3>
      <Divider />
      {e.time && (
        <p className="hk-ev-time">
          <T vi="Vào lúc" en="At" /> <b>{e.time}</b>
        </p>
      )}
      {p && (
        <div className="hk-ev-date">
          <span>{p.weekday}</span>
          <b>{p.dd}</b>
          <span>
            Tháng {p.mm}
            <br />
            {p.y}
          </span>
        </div>
      )}
      {e.lunar && <p className="hk-ev-lunar">{e.lunar}</p>}
      {(e.welcomeTime || e.startTime) && (
        <p className="hk-ev-sub">
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
      {e.venue && <p className="hk-ev-venue">{e.venue}</p>}
      {e.address && <p className="hk-ev-address">{e.address}</p>}
      {e.showMap && q && (
        <iframe
          className="iv-event-map hk-ev-map"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`}
          title={`Bản đồ ${e.venue || e.title}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
      {(map || p) && (
        <div className="hk-ev-actions">
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

export default function HoangKimTheme({ d, title, date, mono, guestName, highlights, wishes, show, labels, mainEvent }: ThemeCtx) {
  const [m1, m2] = mono.split("&").map((s) => s.trim());
  return (
    <>
      {/* cover */}
      <section className="iv-sec hk-deep hk-framed hk-cover">
        <Corners />
        <p className="hk-kicker iv-reveal">
          <T vi="Lễ thành hôn" en="The wedding of" />
        </p>
        <div className="hk-crest iv-reveal">
          <Crest />
          <span className="hk-mono">
            <b>{m1}</b>
            <i>&amp;</i>
            <b>{m2}</b>
          </span>
        </div>
        <h1 className="hk-names iv-reveal">
          <span className="hk-foil-text">{d.groomName}</span>
          <i>&amp;</i>
          <span className="hk-foil-text">{d.brideName}</span>
        </h1>
        <Divider className="iv-reveal" />
        {date && (
          <div className="hk-cover-date iv-reveal">
            <span>{date.weekday}</span>
            <b>
              {date.dd}
              <i>·</i>
              {date.mm}
              <i>·</i>
              {date.y}
            </b>
            <span>{mainEvent?.time || " "}</span>
          </div>
        )}
        {mainEvent?.lunar && <p className="hk-cover-lunar iv-reveal">{mainEvent.lunar}</p>}
        <Arch src={d.cover} alt={`Ảnh cưới ${title}`} mono={mono} className="hk-cover-photo iv-reveal" />
      </section>

      {/* couple */}
      {show.couple && (
        <section className="iv-sec hk-paper hk-couple">
          <Fan className="iv-reveal" />
          <Announce className="hk-announce" />
          <div className="hk-person iv-reveal">
            <em>{labels.first}</em>
            <b>{d.groomFullName || d.groomName}</b>
            <PersonTitle which="groom" />
          </div>
          <p className="hk-amp iv-reveal">&amp;</p>
          <div className="hk-person iv-reveal">
            <em>{labels.second}</em>
            <b>{d.brideFullName || d.brideName}</b>
            <PersonTitle which="bride" />
          </div>
          <Arch src={d.couplePhoto || d.cover} alt={`Ảnh cô dâu chú rể ${title}`} mono={mono} className="hk-couple-photo iv-reveal" />
          {d.quote && (
            <blockquote className="hk-quote iv-reveal">
              <Bi k="quote" />
            </blockquote>
          )}
        </section>
      )}

      {/* invitation + families */}
      {(show.invite || show.families) && (
        <section className="iv-sec hk-deep hk-framed hk-invite">
          <Corners />
          {show.invite && (
            <>
              <p className="hk-inv-heading iv-reveal">
                <Bi k="inviteHeading" />
              </p>
              <p className="hk-guest iv-reveal">
                <span className="hk-foil-text">{guestName}</span>
              </p>
              <Divider className="iv-reveal" />
              <p className="hk-inv-line iv-reveal">
                <Bi k="inviteLine" />
              </p>
            </>
          )}
          {show.families && (
            <div className="hk-families">
              {[d.groomFamily, d.brideFamily].map((f, i) => (
                <div key={i} className="hk-family iv-reveal">
                  <h3>
                    <FamilyTitle which={i ? "brideFamily" : "groomFamily"} />
                  </h3>
                  <p className="hk-parents">{f.parents}</p>
                  {f.address && <p className="hk-addr">{f.address}</p>}
                </div>
              ))}
            </div>
          )}
          {show.invite && (
            <div className="hk-trio iv-reveal">
              {[date?.dd, date?.mm, date?.y].map((label, i) => (
                <Arch key={i} src={highlights[i] ?? ""} alt={`Ảnh cưới ${i + 1}`} mono={mono}>
                  <b>{label}</b>
                </Arch>
              ))}
            </div>
          )}
        </section>
      )}

      {/* events */}
      {show.events && d.events.length > 0 && (
        <section className="iv-sec hk-paper hk-events">
          <Heading vi="Sự kiện cưới" en="Wedding events" />
          <Divider className="iv-reveal" />
          {d.events.map((e) => (
            <Event key={e.id} e={e} title={title} />
          ))}
        </section>
      )}

      {/* calendar + countdown */}
      {(show.calendar || show.countdown) && date && (
        <section className="iv-sec hk-deep hk-framed hk-when">
          <Corners />
          <p className="hk-kicker iv-reveal">Save the date</p>
          <p className="hk-month iv-reveal">
            <span className="hk-foil-text">
              Tháng {date.mm} · {date.y}
            </span>
          </p>
          <Divider className="iv-reveal" />
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

      {/* album */}
      {show.gallery && d.gallery.length > 0 && (
        <section className="iv-sec hk-paper hk-album">
          <Fan className="iv-reveal" />
          <Heading vi="Album ảnh cưới" en="Our moments" />
          <Divider className="iv-reveal" />
          <Gallery photos={d.gallery} mono={mono} />
        </section>
      )}

      {wishes}

      {/* gift */}
      {show.gift && d.gift.enabled && (
        <section className="iv-sec hk-deep hk-framed hk-gift">
          <Corners />
          <Fan className="iv-reveal" />
          <Heading vi="Hộp mừng cưới" en="Wedding gift" />
          <p className="hk-gift-sub iv-reveal">
            <T vi="Gửi lời chúc phúc và chút quà mừng đến cô dâu chú rể" en="Send your blessings and a gift to the couple" />
          </p>
          <GiftReveal groom={d.gift.groom} bride={d.gift.bride} />
        </section>
      )}

      {/* thank you */}
      {show.thanks && (
        <section className="iv-sec iv-thanks hk-framed hk-thanks">
          <Photo src={d.thanksPhoto || d.cover} alt="" mono="" className="iv-thanks-bg" />
          <Corners />
          <div className="iv-thanks-body">
            <h2 className="iv-reveal">
              <span className="hk-foil-text">Thank You</span>
            </h2>
            <Divider className="iv-reveal" />
            <p className="iv-reveal">
              <Bi k="thanks" />
            </p>
            <p className="hk-thanks-names iv-reveal">
              <span className="iv-nw">{d.groomName}</span> &amp; <span className="iv-nw">{d.brideName}</span>
            </p>
          </div>
        </section>
      )}
    </>
  );
}
