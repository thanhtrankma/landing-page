"use client";

import { lunarLabel } from "@/lib/invites/lunar";
import { BankCard, Calendar, Countdown, EventCard, Gallery, Photo } from "../parts";
import { HeartLine, TornEdge, Wildflowers } from "./decor";
import type { ThemeCtx } from "./types";

// "Hoa đồng nội": full-bleed photo cover, torn paper, cream pages and hand-drawn wildflowers.
export default function DongNoiTheme({ d, names, title, date, mono, guestName, highlights, wishes }: ThemeCtx) {
  const dmy = date ? `${date.dd} . ${date.mm} . ${date.y}` : "";
  return (
    <>
      <section className="dn-hero">
        <Photo src={d.cover} alt={`Ảnh cưới ${title}`} mono="" className="dn-hero-photo" />
        <div className="dn-band iv-reveal">
          <span className="iv-script">{d.groomName}</span>
          <HeartLine className="dn-heart" />
          <span className="iv-script">{d.brideName}</span>
        </div>
        <p className="iv-script dn-wedding iv-reveal">Wedding</p>
        <TornEdge className="dn-torn" />
      </section>

      <section className="iv-sec dn-std">
        <Wildflowers className="dn-flowers right" />
        <Wildflowers className="dn-flowers left" flip />
        <div className="dn-arch iv-reveal">
          <p className="iv-script dn-arch-title">
            Save
            <small>the</small>
            Date
          </p>
          <p className="dn-arch-names">{names}</p>
          <p className="dn-arch-date">{dmy}</p>
          <p className="dn-arch-lunar">{lunarLabel(d.date)}</p>
        </div>
      </section>

      <section className="iv-sec iv-families dn-families">
        {[d.groomFamily, d.brideFamily].map((f, i) => (
          <div key={i} className="iv-family iv-reveal">
            <h2>{f.title}</h2>
            <p className="iv-parents">{f.parents}</p>
            {f.address && <p className="iv-addr">{f.address}</p>}
          </div>
        ))}
      </section>

      <section className="iv-sec dn-couple">
        <Photo src={d.couplePhoto || highlights[0]} alt={`Ảnh cô dâu chú rể ${title}`} mono={mono} className="dn-couple-photo iv-reveal" />
        <div className="dn-couple-names iv-reveal">
          <span className="iv-script">{d.groomFullName || d.groomName}</span>
          <i>&amp;</i>
          <span className="iv-script">{d.brideFullName || d.brideName}</span>
        </div>
      </section>

      <section className="iv-sec dn-invite">
        <p className="dn-invite-heading iv-reveal">{d.inviteHeading}</p>
        <p className="iv-script dn-guest iv-reveal">{guestName}</p>
        <p className="dn-invite-line iv-reveal">{d.inviteLine}</p>
        <div className="iv-trio iv-reveal">
          {[date?.dd, date?.mm, date?.y].map((label, i) => (
            <Photo key={i} src={highlights[i] ?? ""} alt={`Ảnh cưới ${i + 1}`} mono={mono}>
              <b>{label}</b>
            </Photo>
          ))}
        </div>
        {d.quote && <p className="iv-script dn-quote iv-reveal">{d.quote}</p>}
      </section>

      {d.events.length > 0 && (
        <section className="iv-sec iv-events dn-events">
          {d.events.map((e) => (
            <EventCard key={e.id} e={e} title={title} />
          ))}
        </section>
      )}

      <section className="iv-sec iv-when dn-when">
        <div className="iv-reveal">
          <Calendar date={d.date} />
        </div>
        <div className="iv-reveal">
          <Countdown date={d.date} />
        </div>
      </section>

      {d.gallery.length > 0 && (
        <section className="iv-sec iv-album dn-album">
          <h2 className="iv-script iv-reveal">Our Moments</h2>
          <Gallery photos={d.gallery} mono={mono} />
        </section>
      )}

      {d.gift.enabled && (
        <section className="iv-sec iv-gift dn-gift">
          <h2 className="iv-script iv-reveal">Gửi quà mừng</h2>
          <p className="iv-gift-sub iv-reveal">Cảm ơn tấm lòng của bạn dành cho chúng mình.</p>
          <div className="iv-banks">
            <BankCard who="Chú rể" b={d.gift.groom} />
            <BankCard who="Cô dâu" b={d.gift.bride} />
          </div>
        </section>
      )}

      {wishes}

      <section className="iv-sec iv-thanks">
        <Photo src={d.thanksPhoto || d.cover} alt="" mono="" className="iv-thanks-bg" />
        <div className="iv-thanks-body">
          <h2 className="iv-script iv-reveal">Thank you</h2>
          <p className="iv-reveal">{d.thanks}</p>
        </div>
      </section>
    </>
  );
}
