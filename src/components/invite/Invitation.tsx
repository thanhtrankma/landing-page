"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { mapsLink, parseDate, type BankInfo, type InviteData, type InviteEvent, type PublicWish } from "@/lib/invites/types";
import "./invitation.css";

// The online wedding invitation ("Song Hỷ" theme): a mobile-first page shared by link.
// Rendered by /thiep/[slug] and, with `preview`, inside the builder's phone frame.

export type InvitationProps = {
  data: InviteData;
  /** Public slug: enables the wishes form. Null for the builder preview and the demo. */
  slug?: string | null;
  guest?: string;
  initialWishes?: PublicWish[];
  preview?: boolean;
  demo?: boolean;
};

const initials = (d: InviteData) => `${(d.groomName || "A").trim().split(/\s+/).pop()![0]} & ${(d.brideName || "B").trim().split(/\s+/).pop()![0]}`;

function Photo({ src, alt, className = "", mono, children }: { src: string; alt: string; className?: string; mono: string; children?: ReactNode }) {
  return (
    <div className={`iv-photo ${className} ${src ? "" : "empty"}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading="lazy" decoding="async" />
      ) : (
        <span className="iv-ph" aria-hidden="true">
          {mono && <i>{mono}</i>}
        </span>
      )}
      {children}
    </div>
  );
}

const Flourish = ({ className = "" }: { className?: string }) => (
  <svg className={`iv-flourish ${className}`} viewBox="0 0 220 24" aria-hidden="true">
    <path d="M2 12h78M140 12h78" />
    <path d="M110 3l9 9-9 9-9-9z" />
    <path d="M84 12c6-8 14-8 18 0M136 12c-6-8-14-8-18 0M84 12c6 8 14 8 18 0M136 12c-6 8-14 8-18 0" />
  </svg>
);

const SongHy = ({ size = 64 }: { size?: number }) => (
  <span className="iv-songhy" style={{ fontSize: size }} aria-hidden="true">
    囍
  </span>
);

function Countdown({ date }: { date: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);
  const target = Date.parse(`${date}T00:00:00+07:00`);
  const left = now === null || Number.isNaN(target) ? null : Math.max(0, target - now);
  const parts = left === null ? ["--", "--", "--", "--"] : [Math.floor(left / 864e5), Math.floor(left / 36e5) % 24, Math.floor(left / 6e4) % 60, Math.floor(left / 1e3) % 60].map((n) => String(n).padStart(2, "0"));
  return (
    <div className="iv-countdown" aria-label="Đếm ngược đến ngày cưới">
      {["Ngày", "Giờ", "Phút", "Giây"].map((label, i) => (
        <div key={label}>
          <b>{parts[i]}</b>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function Calendar({ date }: { date: string }) {
  const p = parseDate(date);
  if (!p) return null;
  const first = new Date(Date.UTC(p.y, p.m - 1, 1)).getUTCDay();
  const offset = (first + 6) % 7; // Monday first
  const days = new Date(Date.UTC(p.y, p.m, 0)).getUTCDate();
  const cells = [...Array(offset).fill(0), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <div className="iv-calendar">
      <div className="iv-cal-head">
        Tháng {p.mm} · {p.y}
      </div>
      <div className="iv-cal-grid">
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
          <span key={d} className="dow">
            {d}
          </span>
        ))}
        {cells.map((d, i) => (
          <span key={i} className={d === p.d ? "on" : ""}>
            {d === p.d ? (
              <>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 21s-7.5-4.6-9.6-9.3C1 8.4 3.2 5 6.6 5c2 0 3.6 1.1 5.4 3 1.8-1.9 3.4-3 5.4-3 3.4 0 5.6 3.4 4.2 6.7C19.5 16.4 12 21 12 21z" />
                </svg>
                <b>{d}</b>
              </>
            ) : d ? (
              d
            ) : (
              ""
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

const calendarLink = (e: InviteEvent, title: string) => {
  const p = parseDate(e.date);
  if (!p) return "";
  const [hh, mi] = (/^(\d{1,2}):(\d{2})/.exec(e.time) ?? [, "09", "00"]).slice(1).map((x) => String(x).padStart(2, "0"));
  const start = `${p.y}${p.mm}${p.dd}T${hh}${mi}00`;
  const endH = String(Math.min(23, Number(hh) + 3)).padStart(2, "0");
  const q = new URLSearchParams({ action: "TEMPLATE", text: `${e.title} – ${title}`, dates: `${start}/${p.y}${p.mm}${p.dd}T${endH}${mi}00`, ctz: "Asia/Ho_Chi_Minh", location: [e.venue, e.address].filter(Boolean).join(", ") });
  return `https://calendar.google.com/calendar/render?${q}`;
};

function EventCard({ e, title }: { e: InviteEvent; title: string }) {
  const p = parseDate(e.date);
  const map = mapsLink(e);
  return (
    <article className="iv-event iv-reveal">
      <h3>{e.title || "Sự kiện"}</h3>
      <p className="iv-event-time">
        {e.time}
        {p ? ` · ${p.weekday}` : ""}
      </p>
      {p && (
        <p className="iv-event-date">
          {p.dd}
          <i>.</i>
          {p.mm}
          <i>.</i>
          {p.y}
        </p>
      )}
      {e.lunar && <p className="iv-event-lunar">{e.lunar}</p>}
      {e.venue && <p className="iv-event-venue">{e.venue}</p>}
      {e.address && <p className="iv-event-address">{e.address}</p>}
      <div className="iv-event-actions">
        {map && (
          <a href={map} target="_blank" rel="noopener noreferrer">
            Chỉ đường
          </a>
        )}
        {p && (
          <a href={calendarLink(e, title)} target="_blank" rel="noopener noreferrer">
            Lưu vào lịch
          </a>
        )}
      </div>
    </article>
  );
}

function BankCard({ who, b }: { who: string; b: BankInfo }) {
  const [copied, setCopied] = useState(false);
  if (!b.account && !b.qr) return null;
  return (
    <div className="iv-bank iv-reveal">
      <h4>{who}</h4>
      {b.qr && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={b.qr} alt={`Mã QR mừng cưới ${who}`} loading="lazy" />
      )}
      {b.bank && <p className="iv-bank-name">{b.bank}</p>}
      {b.account && (
        <button
          type="button"
          className="iv-bank-acc"
          onClick={() => {
            navigator.clipboard?.writeText(b.account.replace(/\s/g, "")).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            });
          }}
        >
          {b.account} <small>{copied ? "Đã sao chép" : "Sao chép"}</small>
        </button>
      )}
      {b.holder && <p className="iv-bank-holder">{b.holder}</p>}
    </div>
  );
}

function Gallery({ photos, mono }: { photos: string[]; mono: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const touch = useRef<number | null>(null);
  const go = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length)), [photos.length]);
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);
  if (!photos.length) return null;
  return (
    <>
      <div className="iv-gallery">
        {photos.map((src, i) => (
          <button key={src + i} type="button" className={`iv-g${i % 5 === 0 ? " wide" : ""} iv-reveal`} onClick={() => setOpen(i)} aria-label={`Xem ảnh ${i + 1}`}>
            <Photo src={src} alt={`Ảnh cưới ${i + 1}`} mono={mono} />
          </button>
        ))}
      </div>
      {open !== null && (
        <div
          className="iv-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Album ảnh"
          onClick={(e) => e.target === e.currentTarget && setOpen(null)}
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touch.current === null) return;
            const dx = e.changedTouches[0].clientX - touch.current;
            if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
            touch.current = null;
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos[open]} alt={`Ảnh cưới ${open + 1}`} />
          <button type="button" className="iv-lb-close" onClick={() => setOpen(null)} aria-label="Đóng">
            ×
          </button>
          {photos.length > 1 && (
            <>
              <button type="button" className="iv-lb-nav prev" onClick={() => go(-1)} aria-label="Ảnh trước">
                ‹
              </button>
              <button type="button" className="iv-lb-nav next" onClick={() => go(1)} aria-label="Ảnh sau">
                ›
              </button>
            </>
          )}
          <span className="iv-lb-count">
            {open + 1} / {photos.length}
          </span>
        </div>
      )}
    </>
  );
}

function Wishes({ slug, initial, disabledNote }: { slug?: string | null; initial: PublicWish[]; disabledNote?: string }) {
  const [wishes, setWishes] = useState(initial);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [attend, setAttend] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!slug) return;
    const fd = new FormData(e.currentTarget);
    setState("sending");
    try {
      const res = await fetch(`/api/thiep/${slug}/wishes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(fd)),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Không gửi được, vui lòng thử lại.");
      if (data.wish?.message) setWishes((w) => [data.wish, ...w]);
      setState("done");
      (e.target as HTMLFormElement).reset();
      setAttend("");
    } catch (err) {
      setError((err as Error).message);
      setState("error");
    }
  };

  return (
    <section className="iv-sec iv-rsvp">
      <h2 className="iv-script iv-reveal">Gửi lời chúc &amp; xác nhận</h2>
      <p className="iv-rsvp-sub iv-reveal">Sự hiện diện của bạn là niềm vinh hạnh cho gia đình chúng mình.</p>
      {state === "done" ? (
        <div className="iv-rsvp-done" role="status">
          <b>Cảm ơn bạn!</b> Lời chúc của bạn đã được gửi tới cô dâu chú rể.
          <button type="button" onClick={() => setState("idle")}>
            Gửi thêm lời chúc
          </button>
        </div>
      ) : (
        <form className="iv-form iv-reveal" onSubmit={submit}>
          <input name="name" required maxLength={60} placeholder="Tên của bạn là gì?" aria-label="Tên của bạn" />
          <textarea name="message" maxLength={500} rows={3} placeholder="Gửi lời chúc cho cô dâu chú rể…" aria-label="Lời chúc" />
          <select name="attend" value={attend} onChange={(e) => setAttend(e.target.value)} aria-label="Xác nhận tham dự">
            <option value="">Bạn sẽ tham dự chứ?</option>
            <option value="yes">Có, mình sẽ đến</option>
            <option value="maybe">Mình chưa chắc chắn</option>
            <option value="no">Xin lỗi, mình không đến được</option>
          </select>
          {attend === "yes" && (
            <select name="guests" defaultValue="1" aria-label="Số người tham dự">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n === 1 ? "Mình đi một mình" : `Đi cùng ${n - 1} người (${n} người)`}
                </option>
              ))}
            </select>
          )}
          <input name="website" tabIndex={-1} autoComplete="off" className="iv-hp" aria-hidden="true" />
          <button type="submit" disabled={!slug || state === "sending"}>
            {state === "sending" ? "Đang gửi…" : "Gửi lời chúc"}
          </button>
          {state === "error" && <p className="iv-form-err">{error}</p>}
          {disabledNote && <p className="iv-form-note">{disabledNote}</p>}
        </form>
      )}
      {wishes.length > 0 && (
        <div className="iv-wishes" aria-label="Lời chúc">
          {wishes.map((w) => (
            <figure key={w.id}>
              <blockquote>{w.message}</blockquote>
              <figcaption>— {w.name}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}

function Petals() {
  const petals = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        left: (i * 37) % 100,
        delay: (i * 1.7) % 12,
        dur: 9 + ((i * 13) % 7),
        size: 10 + ((i * 7) % 9),
        hue: i % 3,
      })),
    [],
  );
  return (
    <div className="iv-petals" aria-hidden="true">
      {petals.map((p, i) => (
        <span key={i} className={`h${p.hue}`} style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, width: p.size, height: p.size }} />
      ))}
    </div>
  );
}

export default function Invitation({ data: d, slug, guest, initialWishes = [], preview = false, demo = false }: InvitationProps) {
  const root = useRef<HTMLDivElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const [opened, setOpened] = useState(preview);
  const [playing, setPlaying] = useState(false);
  const mono = initials(d);
  const date = parseDate(d.date);
  const title = `${d.groomName} & ${d.brideName}`;
  const names = (
    <>
      <span className="iv-nw">{d.groomName}</span> &amp; <span className="iv-nw">{d.brideName}</span>
    </>
  );
  const guestName = guest?.trim() || d.defaultGuest || "Quý khách";
  const highlights = d.highlights.some(Boolean) ? d.highlights : [d.cover, d.couplePhoto, d.cover];

  // Fade sections in as they scroll into view (skipped in the builder so edits show at once).
  useEffect(() => {
    if (preview || !opened) return;
    const els = root.current?.querySelectorAll(".iv-reveal") ?? [];
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [preview, opened]);

  const toggleMusic = () => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    else {
      a.pause();
      setPlaying(false);
    }
  };

  const open = () => {
    setOpened(true);
    const a = audio.current;
    if (a && d.music.src) a.play().then(() => setPlaying(true)).catch(() => {});
  };

  return (
    <div ref={root} className={`iv theme-song-hy ${preview ? "preview" : ""} ${opened ? "opened" : ""}`}>
      {!opened && (
        <div className="iv-intro" role="dialog" aria-label="Thiệp mời cưới">
          <div className="iv-intro-card">
            <SongHy size={72} />
            <p className="iv-intro-kicker">Thiệp mời cưới</p>
            <h1 className="iv-script">{names}</h1>
            {date && (
              <p className="iv-intro-date">
                {date.dd} . {date.mm} . {date.y}
              </p>
            )}
            <p className="iv-intro-guest">
              Kính gửi
              <b>{guestName}</b>
            </p>
            <button type="button" onClick={open}>
              Mở thiệp
            </button>
          </div>
        </div>
      )}

      {d.petals && opened && <Petals />}
      {d.music.src && <audio ref={audio} src={d.music.src} loop preload="none" onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} />}
      {d.music.src && opened && (
        <button type="button" className={`iv-music ${playing ? "on" : ""}`} onClick={toggleMusic} aria-label={playing ? "Tắt nhạc" : "Bật nhạc"} title={d.music.title || "Nhạc nền"}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
          </svg>
        </button>
      )}

      <main className="iv-page">
        {/* Hero */}
        <section className="iv-sec iv-hero">
          <p className="iv-kicker iv-reveal">Save the date</p>
          <h1 className="iv-script iv-hero-names iv-reveal">{names}</h1>
          <div className="iv-hero-mark iv-reveal">
            <Flourish className="left" />
            <SongHy size={54} />
            <Flourish className="right" />
          </div>
          {date && (
            <p className="iv-hero-date iv-reveal">
              {date.dd} . {date.mm} . {date.y}
            </p>
          )}
          <Photo src={d.cover} alt={`Ảnh cưới ${title}`} mono={mono} className="iv-frame iv-hero-photo iv-reveal" />
        </section>

        {/* Families */}
        <section className="iv-sec iv-families">
          {[d.groomFamily, d.brideFamily].map((f, i) => (
            <div key={i} className="iv-family iv-reveal">
              <h2>{f.title}</h2>
              <p className="iv-parents">{f.parents}</p>
              {f.address && <p className="iv-addr">{f.address}</p>}
            </div>
          ))}
        </section>

        {/* Couple */}
        <section className="iv-sec iv-couple">
          <p className="iv-kicker iv-reveal">Trân trọng báo tin lễ thành hôn của con chúng tôi</p>
          <div className="iv-couple-names iv-reveal">
            <span className="iv-script">{d.groomFullName || d.groomName}</span>
            <SongHy size={30} />
            <span className="iv-script">{d.brideFullName || d.brideName}</span>
          </div>
          <Photo src={d.couplePhoto} alt={`Ảnh cô dâu chú rể ${title}`} mono={mono} className="iv-frame iv-couple-photo iv-reveal" />
        </section>

        {/* Invitation */}
        <section className="iv-sec iv-invite">
          <p className="iv-invite-heading iv-reveal">{d.inviteHeading}</p>
          <p className="iv-script iv-guest iv-reveal">{guestName}</p>
          <p className="iv-invite-line iv-reveal">{d.inviteLine}</p>
          <div className="iv-trio iv-reveal">
            {[date?.dd, date?.mm, date?.y].map((label, i) => (
              <Photo key={i} src={highlights[i] ?? ""} alt={`Ảnh cưới ${i + 1}`} mono={mono}>
                <b>{label}</b>
              </Photo>
            ))}
          </div>
        </section>

        {/* Events */}
        {d.events.length > 0 && (
          <section className="iv-sec iv-events">
            {d.events.map((e) => (
              <EventCard key={e.id} e={e} title={title} />
            ))}
          </section>
        )}

        {/* Calendar + countdown */}
        <section className="iv-sec iv-when">
          <p className="iv-kicker iv-reveal">Save the date</p>
          <div className="iv-reveal">
            <Calendar date={d.date} />
          </div>
          <div className="iv-reveal">
            <Countdown date={d.date} />
          </div>
        </section>

        {/* Album */}
        {d.gallery.length > 0 && (
          <section className="iv-sec iv-album">
            <h2 className="iv-script iv-reveal">Album hình cưới</h2>
            <Gallery photos={d.gallery} mono={mono} />
          </section>
        )}

        {/* Gift */}
        {d.gift.enabled && (
          <section className="iv-sec iv-gift">
            <h2 className="iv-script iv-reveal">Hộp mừng cưới</h2>
            <p className="iv-gift-sub iv-reveal">Cảm ơn tấm lòng của bạn dành cho chúng mình.</p>
            <div className="iv-banks">
              <BankCard who="Chú rể" b={d.gift.groom} />
              <BankCard who="Cô dâu" b={d.gift.bride} />
            </div>
          </section>
        )}

        {/* Wishes & RSVP */}
        {d.rsvp.enabled && <Wishes slug={slug} initial={initialWishes} disabledNote={preview ? "Bản xem trước: form sẽ hoạt động khi thiệp được chia sẻ." : demo ? "Đây là thiệp mẫu, form chưa gửi được." : undefined} />}

        {/* Thank you */}
        <section className="iv-sec iv-thanks">
          <Photo src={d.thanksPhoto || d.cover} alt="" mono="" className="iv-thanks-bg" />
          <div className="iv-thanks-body">
            <h2 className="iv-script iv-reveal">Thank you</h2>
            <p className="iv-reveal">{d.thanks}</p>
          </div>
        </section>

        <footer className="iv-foot">
          Thiệp cưới online · <Link href="/cong-cu/thiep-cuoi-online">Tạo thiệp miễn phí tại SuperLanding</Link>
        </footer>
      </main>
    </div>
  );
}
