"use client";

import { BankCard, Calendar, Countdown, EventCard, Gallery, Photo } from "../parts";
import { GiftBox, Rose } from "./decor";
import { Announce, Bi, FamilyTitle } from "../lang";
import type { ThemeCtx } from "./types";

// "Phong bì hồng": blush pink, two polaroids slipping out of an envelope, soft romantic script.
export default function PhongBiHongTheme({ d, names, title, date, mono, guestName, highlights, wishes, show }: ThemeCtx) {
  const dmy = date ? `${date.dd}.${date.mm}.${date.y}` : "";
  return (
    <>
      <section className="iv-sec pb-hero">
        <p className="pb-got iv-reveal">We got married</p>
        <div className="pb-env iv-reveal">
          <div className="pb-env-back" />
          <div className="pb-polaroid a">
            <Photo src={d.cover} alt={`Ảnh cưới ${title}`} mono={mono} />
          </div>
          <div className="pb-polaroid b">
            <Photo src={d.couplePhoto || d.cover} alt={`Ảnh cưới ${title}`} mono={mono} />
          </div>
          <div className="pb-ticket">
            <span>Ngày Chung Đôi</span>
            <b>{dmy}</b>
            <i>We&apos;re getting married</i>
          </div>
          <div className="pb-env-front" />
          <div className="pb-seal">Love</div>
          <Rose className="pb-rose" />
        </div>
        <h1 className="iv-script pb-names iv-reveal">{names}</h1>
        <p className="pb-date iv-reveal">{dmy}</p>
      </section>

      {show.calendar && (
      <section className="iv-sec pb-month">
        <div className="pb-polaroid single iv-reveal">
          <Photo src={highlights[0]} alt="" mono={mono} />
          <span className="iv-script">My Love</span>
        </div>
        <div className="iv-reveal">
          <Calendar date={d.date} />
        </div>
      </section>
      )}

      {show.families && (
      <section className="iv-sec pb-families">
        <Announce />
        <p className="iv-script pb-fam-names iv-reveal">{names}</p>
        <div className="pb-fam-grid">
          <div className="pb-fam iv-reveal">
            <Photo src={highlights[1]} alt="" mono={mono} />
            <h3><FamilyTitle which="groomFamily" /></h3>
            <p>{d.groomFamily.parents}</p>
            {d.groomFamily.address && <small>{d.groomFamily.address}</small>}
          </div>
          <p className="pb-vertical" aria-hidden="true">Trân trọng kính mời</p>
          <div className="pb-fam iv-reveal">
            <Photo src={highlights[2]} alt="" mono={mono} />
            <h3><FamilyTitle which="brideFamily" /></h3>
            <p>{d.brideFamily.parents}</p>
            {d.brideFamily.address && <small>{d.brideFamily.address}</small>}
          </div>
        </div>
      </section>
      )}

      {show.invite && (
      <section className="iv-sec pb-invite">
        <p className="pb-invite-heading iv-reveal"><Bi k="inviteHeading" /></p>
        <p className="iv-script pb-guest iv-reveal">{guestName}</p>
        <p className="pb-invite-line iv-reveal"><Bi k="inviteLine" /></p>
        {d.quote && <p className="pb-quote iv-reveal"><Bi k="quote" /></p>}
      </section>
      )}

      {show.events && d.events.length > 0 && (
        <section className="iv-sec iv-events pb-events">
          {d.events.map((e) => (
            <EventCard key={e.id} e={e} title={title} />
          ))}
        </section>
      )}

      {show.countdown && (
      <section className="iv-sec pb-count">
        <p className="iv-script iv-reveal">Đếm ngược ngày chung đôi</p>
        <div className="iv-reveal">
          <Countdown date={d.date} />
        </div>
      </section>
      )}

      {show.gallery && d.gallery.length > 0 && (
        <section className="iv-sec iv-album pb-album">
          <h2 className="iv-script iv-reveal">Khoảnh khắc yêu thương</h2>
          <Gallery photos={d.gallery} mono={mono} />
        </section>
      )}

      {wishes}

      {show.gift && d.gift.enabled && (
        <section className="iv-sec iv-gift pb-gift">
          <h2 className="pb-gift-title iv-reveal">Hộp quà yêu thương</h2>
          <GiftBox className="pb-giftbox iv-reveal" />
          <p className="iv-gift-sub iv-reveal">Cảm ơn tình cảm và lời chúc phúc của bạn dành cho chúng mình.</p>
          <div className="iv-banks">
            <BankCard who="Chú rể" b={d.gift.groom} />
            <BankCard who="Cô dâu" b={d.gift.bride} />
          </div>
        </section>
      )}

      {show.thanks && (
      <section className="iv-sec iv-thanks">
        <Photo src={d.thanksPhoto || d.cover} alt="" mono="" className="iv-thanks-bg" />
        <div className="iv-thanks-body">
          <h2 className="iv-script iv-reveal">Thank you</h2>
          <p className="iv-reveal"><Bi k="thanks" /></p>
        </div>
      </section>
      )}
    </>
  );
}
