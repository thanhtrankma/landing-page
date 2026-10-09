"use client";

import { useEffect, useState } from "react";
import { mapsLink, parseDate, type InviteEvent } from "@/lib/invites/types";
import { Calendar, EventCard, Gallery, GiftReveal, Photo } from "../parts";
import { HeartLine } from "./decor";
import type { ThemeCtx } from "./types";

// "Đỏ rượu vang" (after LoveCard mẫu 32): a big cover photo fading to white, burgundy pages in white type,
// a large-date main event, an embedded map and the RSVP form in a pop-up.

const hoursLabel = (time: string) => {
  const m = /^(\d{1,2}):(\d{2})/.exec(time);
  return m ? `${m[1].padStart(2, "0")} GIỜ ${m[2]}` : time;
};

const mapEmbed = (e: InviteEvent) => {
  const q = [e.venue, e.address].filter(Boolean).join(", ");
  return q ? `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed` : "";
};

function BigDate({ e }: { e: InviteEvent }) {
  const p = parseDate(e.date);
  if (!p) return null;
  return (
    <div className="vd-main-event iv-reveal">
      <h3>{e.title || "Lễ thành hôn"}</h3>
      <p className="vd-at">Vào lúc</p>
      <div className="vd-bigdate">
        <span>{hoursLabel(e.time)}</span>
        <div>
          <small>{p.weekday}</small>
          <b>{p.dd}</b>
          <small>Tháng {p.mm}</small>
        </div>
        <span>Năm {p.y}</span>
      </div>
      {e.lunar && <p className="vd-lunar">{e.lunar}</p>}
      {e.venue && <p className="vd-venue">{e.venue}</p>}
    </div>
  );
}

export default function VangDoTheme({ d, names, title, date, mono, guestName, highlights, wishes, mainEvent }: ThemeCtx) {
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const others = d.events.filter((e) => e !== mainEvent);
  const place = mainEvent && (mainEvent.venue || mainEvent.address) ? mainEvent : d.events.find((e) => e.venue || e.address);
  const embed = place ? mapEmbed(place) : "";
  const trio = [d.couplePhoto, highlights[2], d.cover];

  useEffect(() => {
    if (!rsvpOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setRsvpOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rsvpOpen]);

  return (
    <>
      <section className="vd-hero">
        <Photo src={d.cover} alt={`Ảnh cưới ${title}`} mono="" className="vd-hero-photo" />
        <h1 className="vd-names iv-reveal">{names}</h1>
        <div className="vd-hero-foot iv-reveal">
          <p className="vd-letter">Thư mời tiệc cưới</p>
          {mainEvent && date && (
            <p className="vd-time">
              {mainEvent.time} - {parseDate(mainEvent.date)?.weekday ?? date.weekday}
            </p>
          )}
          {date && (
            <p className="vd-date">
              {date.dd}. {date.mm}. {date.y}
            </p>
          )}
        </div>
      </section>

      <section className="iv-sec vd-red vd-intro">
        {d.quote && <p className="vd-quote iv-reveal">“{d.quote}</p>}
        <div className="vd-families">
          {[d.groomFamily, d.brideFamily].map((f, i) => (
            <div key={i} className="iv-reveal">
              <h2>{f.title}</h2>
              <p className="vd-parents">{f.parents}</p>
              {f.address && <p className="vd-addr">{f.address}</p>}
            </div>
          ))}
        </div>
        <HeartLine className="vd-heart" />
      </section>

      <section className="iv-sec vd-red vd-couple">
        {[
          { label: "Chú rể", name: d.groomFullName || d.groomName, photo: highlights[0] },
          { label: "Cô dâu", name: d.brideFullName || d.brideName, photo: highlights[1] },
        ].map((p) => (
          <figure key={p.label} className="iv-reveal">
            <figcaption>
              <span>{p.label}</span>
              <b>{p.name}</b>
            </figcaption>
            <Photo src={p.photo} alt={`${p.label} ${p.name}`} mono={mono} />
          </figure>
        ))}
      </section>

      <section className="iv-sec vd-red vd-invite">
        <p className="vd-invite-heading iv-reveal">{d.inviteHeading}</p>
        <p className="vd-guest iv-reveal">{guestName}</p>
        <p className="vd-invite-heading iv-reveal">{d.inviteLine}</p>
        <div className="vd-trio iv-reveal">
          {trio.map((src, i) => (
            <Photo key={i} src={src} alt={`Ảnh cưới ${i + 1}`} mono={mono} />
          ))}
        </div>
      </section>

      <section className="iv-sec vd-red vd-events">
        {mainEvent && <BigDate e={mainEvent} />}
        {others.map((e) => (
          <EventCard key={e.id} e={e} title={title} />
        ))}
      </section>

      {date && (
        <section className="iv-sec vd-red vd-when">
          <div className="vd-cal-title iv-reveal">
            <span>Tháng {date.m}</span>
            <b>{date.y}</b>
          </div>
          <div className="iv-reveal">
            <Calendar date={d.date} />
          </div>
        </section>
      )}

      {place && (
        <section className="iv-sec vd-red vd-place">
          <h2 className="vd-script iv-reveal">Địa điểm tổ chức</h2>
          <div className="vd-place-card iv-reveal">
            <h3>{place.venue}</h3>
            {place.address && <p>Địa chỉ: {place.address}</p>}
            {embed && <iframe src={embed} title={`Bản đồ ${place.venue}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />}
            <a href={mapsLink(place)} target="_blank" rel="noopener noreferrer" className="vd-pill">
              Xem trên Google Maps
            </a>
          </div>
        </section>
      )}

      {d.gallery.length > 0 && (
        <section className="iv-sec vd-red vd-album">
          <h2 className="vd-script iv-reveal">Album ảnh cưới</h2>
          <Gallery photos={d.gallery} mono={mono} />
        </section>
      )}

      <section className="iv-sec iv-thanks vd-thanks">
        <Photo src={d.thanksPhoto || d.cover} alt="" mono="" className="iv-thanks-bg" />
        <div className="iv-thanks-body">
          <div className="vd-actions">
            {d.rsvp.enabled && (
              <button type="button" className="vd-pill light" onClick={() => setRsvpOpen(true)}>
                Xác nhận tham dự
              </button>
            )}
            {d.gift.enabled && <GiftReveal groom={d.gift.groom} bride={d.gift.bride} />}
          </div>
          <h2 className="iv-script iv-reveal">Thank you</h2>
          <p className="iv-reveal">{d.thanks}</p>
        </div>
      </section>

      {rsvpOpen && wishes && (
        <div className="vd-modal" role="dialog" aria-modal="true" aria-label="Xác nhận tham dự" onClick={(e) => e.target === e.currentTarget && setRsvpOpen(false)}>
          <div className="vd-modal-box">
            <button type="button" className="vd-modal-close" onClick={() => setRsvpOpen(false)} aria-label="Đóng">
              ×
            </button>
            {wishes}
          </div>
        </div>
      )}
    </>
  );
}
