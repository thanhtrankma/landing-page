"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { mapsLink, parseDate, type BankInfo, type InviteData, type InviteEvent, type PublicWish } from "@/lib/invites/types";

// Building blocks shared by every invitation theme. Themes arrange them and restyle them with CSS.

export const initials = (d: InviteData) => `${(d.groomName || "A").trim().split(/\s+/).pop()![0]} & ${(d.brideName || "B").trim().split(/\s+/).pop()![0]}`;

export function Photo({ src, alt, className = "", mono, children }: { src: string; alt: string; className?: string; mono: string; children?: ReactNode }) {
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

export const Flourish = ({ className = "" }: { className?: string }) => (
  <svg className={`iv-flourish ${className}`} viewBox="0 0 220 24" aria-hidden="true">
    <path d="M2 12h78M140 12h78" />
    <path d="M110 3l9 9-9 9-9-9z" />
    <path d="M84 12c6-8 14-8 18 0M136 12c-6-8-14-8-18 0M84 12c6 8 14 8 18 0M136 12c-6 8-14 8-18 0" />
  </svg>
);

export const SongHy = ({ size = 64 }: { size?: number }) => (
  <span className="iv-songhy" style={{ fontSize: size }} aria-hidden="true">
    囍
  </span>
);

export function Countdown({ date }: { date: string }) {
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

const VI_DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function Calendar({ date, days: labels = VI_DAYS }: { date: string; days?: string[] }) {
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
        {labels.map((d) => (
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

export const calendarLink = (e: InviteEvent, title: string) => {
  const p = parseDate(e.date);
  if (!p) return "";
  const [hh, mi] = (/^(\d{1,2}):(\d{2})/.exec(e.time) ?? [, "09", "00"]).slice(1).map((x) => String(x).padStart(2, "0"));
  const start = `${p.y}${p.mm}${p.dd}T${hh}${mi}00`;
  const endH = String(Math.min(23, Number(hh) + 3)).padStart(2, "0");
  const q = new URLSearchParams({ action: "TEMPLATE", text: `${e.title} – ${title}`, dates: `${start}/${p.y}${p.mm}${p.dd}T${endH}${mi}00`, ctz: "Asia/Ho_Chi_Minh", location: [e.venue, e.address].filter(Boolean).join(", ") });
  return `https://calendar.google.com/calendar/render?${q}`;
};

export function EventCard({ e, title }: { e: InviteEvent; title: string }) {
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

export function BankCard({ who, b }: { who: string; b: BankInfo }) {
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

export function Gallery({ photos, mono }: { photos: string[]; mono: string }) {
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

export function Wishes({ slug, initial, disabledNote }: { slug?: string | null; initial: PublicWish[]; disabledNote?: string }) {
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

export function Petals({ kind = "petals" }: { kind?: "petals" | "hearts" }) {
  const items = useMemo(
    () =>
      Array.from({ length: kind === "hearts" ? 18 : 14 }, (_, i) => ({
        left: (i * 37) % 100,
        delay: (i * 1.7) % 12,
        dur: 9 + ((i * 13) % 7),
        size: 10 + ((i * 7) % 9),
        hue: i % 3,
      })),
    [kind],
  );
  return (
    <div className={`iv-petals ${kind}`} aria-hidden="true">
      {items.map((p, i) =>
        kind === "hearts" ? (
          <span key={i} className={i % 3 === 0 ? "heart" : "snow"} style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.dur + 3}s`, fontSize: p.size + 4 }}>
            {i % 3 === 0 ? "❤" : "❅"}
          </span>
        ) : (
          <span key={i} className={`h${p.hue}`} style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, width: p.size, height: p.size }} />
        ),
      )}
    </div>
  );
}

export function GiftReveal({ groom, bride, label = "Gửi mừng cưới" }: { groom: BankInfo; bride: BankInfo; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="iv-gift-reveal">
      <button type="button" className="iv-gift-btn" onClick={() => setOpen(!open)} aria-expanded={open}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
        {label}
      </button>
      {open && (
        <div className="iv-banks">
          <BankCard who="Chú rể" b={groom} />
          <BankCard who="Cô dâu" b={bride} />
        </div>
      )}
    </div>
  );
}
