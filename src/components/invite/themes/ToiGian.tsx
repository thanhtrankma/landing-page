"use client";

import { lunarLabel } from "@/lib/invites/lunar";
import { BankCard, Calendar, Countdown, EventCard, Gallery, Photo } from "../parts";
import { Tulip } from "./decor";
import type { ThemeCtx } from "./types";

// "Tối giản trắng": white paper, black calligraphy, blush watercolour washes and a line-art tulip.
export default function ToiGianTheme({ d, names, title, date, mono, guestName, highlights, wishes, mainEvent }: ThemeCtx) {
  return (
    <>
      <section className="iv-sec tg-hero">
        <h1 className="tg-std iv-reveal">Save The Date</h1>
        <p className="iv-script tg-names iv-reveal">{names}</p>
        <div className="tg-photo iv-reveal">
          <Photo src={d.cover} alt={`Ảnh cưới ${title}`} mono={mono} />
        </div>
        {date && (
          <div className="tg-when iv-reveal">
            <div className="tg-when-side">
              <b>{mainEvent?.time || "--:--"}</b>
              <span>{date.weekday}</span>
            </div>
            <strong>
              {date.dd}-{date.mm}
            </strong>
            <div className="tg-when-side year">
              <b>{String(date.y).slice(0, 2)}</b>
              <b>{String(date.y).slice(2)}</b>
            </div>
          </div>
        )}
        <p className="tg-lunar iv-reveal">{lunarLabel(d.date)}</p>
        <Tulip className="tg-tulip" />
      </section>

      {d.quote && (
        <section className="iv-sec tg-quote">
          <p className="iv-script iv-reveal">{d.quote}</p>
        </section>
      )}

      <section className="iv-sec tg-couple">
        {[
          { label: "Chú rể", name: d.groomFullName || d.groomName, photo: highlights[0] },
          { label: "Cô dâu", name: d.brideFullName || d.brideName, photo: highlights[1] },
        ].map((p) => (
          <figure key={p.label} className="tg-person iv-reveal">
            <Photo src={p.photo} alt={`${p.label} ${p.name}`} mono={mono} />
            <figcaption>
              <span>{p.label}</span>
              <b className="iv-script">{p.name}</b>
            </figcaption>
          </figure>
        ))}
      </section>

      <section className="iv-sec iv-families tg-families">
        {[d.groomFamily, d.brideFamily].map((f, i) => (
          <div key={i} className="iv-family iv-reveal">
            <h2>{f.title}</h2>
            <p className="iv-parents">{f.parents}</p>
            {f.address && <p className="iv-addr">{f.address}</p>}
          </div>
        ))}
      </section>

      <section className="iv-sec tg-invite">
        <p className="tg-invite-heading iv-reveal">{d.inviteHeading}</p>
        <p className="iv-script tg-guest iv-reveal">{guestName}</p>
        <p className="tg-invite-line iv-reveal">{d.inviteLine}</p>
        <div className="tg-wide iv-reveal">
          <Photo src={d.couplePhoto || highlights[2]} alt={`Ảnh cưới ${title}`} mono={mono} />
        </div>
      </section>

      {d.events.length > 0 && (
        <section className="iv-sec iv-events tg-events">
          {d.events.map((e) => (
            <EventCard key={e.id} e={e} title={title} />
          ))}
        </section>
      )}

      <section className="iv-sec iv-when tg-when-sec">
        <p className="iv-kicker iv-reveal">Save the date</p>
        <div className="iv-reveal">
          <Calendar date={d.date} />
        </div>
        <div className="iv-reveal">
          <Countdown date={d.date} />
        </div>
      </section>

      {d.gallery.length > 0 && (
        <section className="iv-sec iv-album tg-album">
          <h2 className="iv-script iv-reveal">Album</h2>
          <Gallery photos={d.gallery} mono={mono} />
        </section>
      )}

      {d.gift.enabled && (
        <section className="iv-sec iv-gift tg-gift">
          <h2 className="iv-script iv-reveal">Mừng cưới</h2>
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
