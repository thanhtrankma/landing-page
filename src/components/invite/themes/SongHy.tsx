"use client";

import { Calendar, EventCard, Gallery, GiftReveal, Photo, SongHy } from "../parts";
import { Knot, Lanterns, RingHy } from "./decor";
import { Announce, Bi, FamilyTitle, PersonTitle } from "../lang";
import type { ThemeCtx } from "./types";

// "Song Hỷ" (after LoveCard thiepso01): white paper, pale-gold key-fret borders, black display serif,
// hairline calligraphy, red 囍 with Chinese knots, hanging lanterns and deep-red event cards.
// Styles: invitation.css (shared base) + the "SONG HỶ" block in themes.css.

/** "Ông Nguyễn Văn A" → "Bố: Nguyễn Văn A"; other lines are shown as typed. */
const parentLine = (line: string) => {
  const m = /^(ông|bà)\s+(.+)$/i.exec(line.trim());
  return m ? `${m[1].toLowerCase() === "ông" ? "Bố" : "Mẹ"}: ${m[2]}` : line.trim();
};

export default function SongHyTheme({ d, names, title, date, mono, guestName, highlights, wishes, show }: ThemeCtx) {
  const dmy = date ? `${date.dd}. ${date.mm} . ${date.y}` : "";
  return (
    <>
      <section className="iv-sec iv-hero">
        <p className="sh-std iv-reveal">Save the date</p>
        <h1 className="sh-names iv-reveal">{names}</h1>
        <div className="sh-mark iv-reveal">
          <Knot className="sh-knot" />
          <SongHy size={66} />
          <Knot className="sh-knot" />
        </div>
        {date && <p className="sh-date iv-reveal">{dmy}</p>}
        <div className="sh-hero-photo-wrap iv-reveal">
          <Photo src={d.cover} alt={`Ảnh cưới ${title}`} mono={mono} className="iv-frame iv-hero-photo" />
          <Lanterns className="sh-lanterns" />
        </div>
      </section>

      <section className="iv-sec sh-divider">
        <RingHy />
        <Knot className="sh-knot small" />
      </section>

      {show.families && <section className="iv-sec iv-families sh-families">
        {[d.groomFamily, d.brideFamily].map((f, i) => (
          <div key={i} className="iv-family iv-reveal">
            <h2><FamilyTitle which={i ? "brideFamily" : "groomFamily"} /></h2>
            <p className="sh-parents">
              {f.parents
                .split("\n")
                .filter(Boolean)
                .map((l) => (
                  <span key={l}>{parentLine(l)}</span>
                ))}
            </p>
            {f.address && <p className="iv-addr">{f.address}</p>}
          </div>
        ))}
      </section>}

      {show.couple && <section className="iv-sec sh-couple">
        <Announce />
        <p className="sh-fullname iv-reveal">{d.groomFullName || d.groomName}<PersonTitle which="groom" /></p>
        <p className="sh-fullname amp iv-reveal">&amp;</p>
        <p className="sh-fullname iv-reveal">{d.brideFullName || d.brideName}<PersonTitle which="bride" /></p>
        <Photo src={d.couplePhoto} alt={`Ảnh cô dâu chú rể ${title}`} mono={mono} className="iv-frame sh-couple-photo iv-reveal" />
      </section>}

      {show.invite && <section className="iv-sec iv-invite sh-invite">
        <p className="iv-invite-heading iv-reveal"><Bi k="inviteHeading" /></p>
        <p className="iv-script iv-guest iv-reveal">{guestName}</p>
        <p className="iv-invite-line iv-reveal"><Bi k="inviteLine" /></p>
        <div className="iv-trio iv-reveal">
          {[date?.dd, date?.mm, date?.y].map((label, i) => (
            <Photo key={i} src={highlights[i] ?? ""} alt={`Ảnh cưới ${i + 1}`} mono={mono}>
              <b>{label}</b>
            </Photo>
          ))}
        </div>
      </section>}

      {show.events && d.events.length > 0 && (
        <section className="iv-sec iv-events">
          {d.events.map((e) => (
            <EventCard key={e.id} e={e} title={title} />
          ))}
        </section>
      )}

      {show.calendar && <section className="iv-sec iv-when sh-when">
        <p className="sh-std red iv-reveal">Save the date</p>
        {date && (
          <p className="sh-month iv-reveal">
            Tháng {date.m} - {date.y}
          </p>
        )}
        <div className="iv-reveal">
          <Calendar date={d.date} />
        </div>
      </section>}

      {wishes}

      {show.gift && d.gift.enabled && (
        <section className="iv-sec sh-gift iv-reveal">
          <GiftReveal groom={d.gift.groom} bride={d.gift.bride} />
        </section>
      )}

      {show.gallery && d.gallery.length > 0 && (
        <section className="iv-sec iv-album sh-album">
          <Gallery photos={d.gallery} mono={mono} />
        </section>
      )}

      {show.thanks && <section className="iv-sec iv-thanks">
        <Photo src={d.thanksPhoto || d.cover} alt="" mono="" className="iv-thanks-bg" />
        <div className="iv-thanks-body">
          <h2 className="iv-script iv-reveal">Thank you</h2>
          <p className="iv-reveal"><Bi k="thanks" /></p>
        </div>
      </section>}
    </>
  );
}
