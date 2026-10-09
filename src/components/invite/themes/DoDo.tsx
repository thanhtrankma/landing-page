"use client";

import { mapsLink, parseDate, type InviteEvent } from "@/lib/invites/types";
import { Calendar, Gallery, GiftReveal, Photo } from "../parts";
import { Wreath } from "./decor";
import type { ThemeCtx } from "./types";

// "Đỏ đô polaroid" (after LoveCard mẫu 37): cover photo fading into white, burgundy display serif,
// "SAVE the DATE" with tilted polaroids on textured paper, burgundy calendar and album, grey event cards
// with a moss-green "Xem vị trí" button, and a round photo in a leafy wreath.

function Event({ e }: { e: InviteEvent }) {
  const p = parseDate(e.date);
  const map = mapsLink(e);
  return (
    <article className="dd-event iv-reveal">
      <h3>{e.title || "Sự kiện"}</h3>
      {p && (
        <p className="dd-event-when">
          Được tổ chức vào lúc <b>{e.time}</b> | {p.weekday}
        </p>
      )}
      {p && (
        <p className="dd-event-date">
          {p.dd}. {p.mm}. {p.y}
        </p>
      )}
      {e.lunar && <p className="dd-event-lunar">{e.lunar}</p>}
      {e.venue && <p className="dd-event-venue">{e.venue}</p>}
      {e.address && <p className="dd-event-address">{e.address}</p>}
      {map && (
        <a className="dd-event-map" href={map} target="_blank" rel="noopener noreferrer">
          Xem vị trí
        </a>
      )}
    </article>
  );
}

export default function DoDoTheme({ d, title, date, mono, guestName, highlights, wishes }: ThemeCtx) {
  const monthLabel = date ? `Tháng ${date.mm} - ${date.y}` : "";
  return (
    <>
      <section className="dd-hero">
        <Photo src={d.cover} alt={`Ảnh cưới ${title}`} mono="" className="dd-hero-photo" />
        <div className="dd-hero-names">
          <p className="iv-reveal">{d.groomName}</p>
          <i className="iv-reveal">&amp;</i>
          <p className="iv-reveal">{d.brideName}</p>
        </div>
      </section>

      <section className="iv-sec dd-paper dd-std">
        <h2 className="dd-std-title iv-reveal">
          <span>Save</span>
          <em>the</em>
          <span className="date">Date</span>
        </h2>
        <div className="dd-polaroids iv-reveal">
          <div className="dd-polaroid a">
            <Photo src={highlights[0]} alt="" mono={mono} />
          </div>
          <div className="dd-polaroid b">
            <Photo src={highlights[1]} alt="" mono={mono} />
          </div>
        </div>
        <div className="dd-couple iv-reveal">
          <div>
            <em>Chú rể</em>
            <b>{d.groomName}</b>
          </div>
          <span className="dd-bar" aria-hidden="true" />
          <div>
            <em>Cô dâu</em>
            <b>{d.brideName}</b>
          </div>
        </div>
      </section>

      {date && (
        <section className="iv-sec dd-cal">
          <p className="dd-cal-title iv-reveal">{monthLabel}</p>
          <div className="iv-reveal">
            <Calendar date={d.date} days={["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]} />
          </div>
        </section>
      )}

      <section className="iv-sec dd-paper dd-invite">
        <p className="dd-inv-heading iv-reveal">{d.inviteHeading}</p>
        <p className="dd-guest iv-reveal">{guestName}</p>
        <p className="dd-inv-line iv-reveal">{d.inviteLine}</p>
        <div className="dd-families">
          {[d.groomFamily, d.brideFamily].map((f, i) => (
            <div key={i} className="iv-reveal">
              <h3>{f.title}</h3>
              <p className="dd-parents">{f.parents}</p>
              {f.address && <p className="dd-addr">{f.address}</p>}
            </div>
          ))}
        </div>
        <div className="dd-trio iv-reveal">
          {[date?.dd, date?.mm, date?.y].map((label, i) => (
            <Photo key={i} src={highlights[i] ?? ""} alt={`Ảnh cưới ${i + 1}`} mono={mono}>
              <b>{label}</b>
            </Photo>
          ))}
        </div>
      </section>

      {d.events.length > 0 && (
        <section className="iv-sec dd-paper dd-events">
          {d.events.map((e) => (
            <Event key={e.id} e={e} />
          ))}
        </section>
      )}

      {d.gallery.length > 0 && (
        <section className="iv-sec dd-album">
          <h2 className="dd-album-title iv-reveal">
            Album <em>of</em> <span>Love</span>
          </h2>
          <Gallery photos={d.gallery} mono={mono} />
        </section>
      )}

      {wishes}

      <section className="iv-sec dd-paper dd-round">
        <div className="dd-wreath iv-reveal">
          <Photo src={d.couplePhoto || d.cover} alt={`Ảnh cô dâu chú rể ${title}`} mono={mono} />
          <Wreath className="dd-wreath-leaves" />
        </div>
        {d.gift.enabled && <GiftReveal groom={d.gift.groom} bride={d.gift.bride} />}
      </section>

      <section className="iv-sec iv-thanks dd-thanks">
        <Photo src={d.thanksPhoto || d.cover} alt="" mono="" className="iv-thanks-bg" />
        <div className="iv-thanks-body">
          <h2 className="iv-reveal">Thank You</h2>
          <p className="iv-reveal">{d.thanks}</p>
        </div>
      </section>
    </>
  );
}
