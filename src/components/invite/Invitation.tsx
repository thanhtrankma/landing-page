"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { parseDate, type InviteData, type InviteTheme, type PublicWish } from "@/lib/invites/types";
import { initials, Petals, SongHy, Wishes } from "./parts";
import DongNoiTheme from "./themes/DongNoi";
import PhongBiHongTheme from "./themes/PhongBiHong";
import SongHyTheme from "./themes/SongHy";
import ToiGianTheme from "./themes/ToiGian";
import VangDoTheme from "./themes/VangDo";
import DoDoTheme from "./themes/DoDo";
import type { ThemeCtx } from "./themes/types";
import "./invitation.css";
import "./themes/themes.css";

// The online wedding invitation: a mobile-first page shared by link. This shell owns the intro screen, music,
// petals and scroll reveal; the chosen theme lays out the sections. Rendered by /thiep/[slug] and, with
// `preview`, inside the builder's phone frame.

export type InvitationProps = {
  data: InviteData;
  /** Public slug: enables the wishes form. Null for the builder preview and the demos. */
  slug?: string | null;
  guest?: string;
  initialWishes?: PublicWish[];
  preview?: boolean;
  demo?: boolean;
};

const THEMES: Record<InviteTheme, ComponentType<ThemeCtx>> = {
  "song-hy": SongHyTheme,
  "phong-bi-hong": PhongBiHongTheme,
  "toi-gian": ToiGianTheme,
  "dong-noi": DongNoiTheme,
  "vang-do": VangDoTheme,
  "do-do": DoDoTheme,
};

const Heart = () => (
  <svg className="iv-intro-heart" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 21s-7.5-4.6-9.6-9.3C1 8.4 3.2 5 6.6 5c2 0 3.6 1.1 5.4 3 1.8-1.9 3.4-3 5.4-3 3.4 0 5.6 3.4 4.2 6.7C19.5 16.4 12 21 12 21z" />
  </svg>
);

export default function Invitation({ data: d, slug, guest, initialWishes = [], preview = false, demo = false }: InvitationProps) {
  const root = useRef<HTMLDivElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  // Without the intro the card is open from the start (and music waits for the first tap).
  const [opened, setOpened] = useState(preview || !d.intro);
  const [playing, setPlaying] = useState(false);
  const Theme = THEMES[d.theme] ?? SongHyTheme;

  const date = parseDate(d.date);
  const title = `${d.groomName} & ${d.brideName}`;
  const names = (
    <>
      <span className="iv-nw">{d.groomName}</span> <span className="iv-amp">&amp;</span> <span className="iv-nw">{d.brideName}</span>
    </>
  );
  const ctx: ThemeCtx = {
    d,
    names,
    title,
    date,
    mono: initials(d),
    guestName: guest?.trim() || d.defaultGuest || "Quý khách",
    highlights: d.highlights.some(Boolean) ? d.highlights : [d.cover, d.couplePhoto, d.cover],
    mainEvent: d.events.find((e) => e.date === d.date) ?? d.events[0],
    wishes: d.rsvp.enabled ? (
      <Wishes slug={slug} initial={initialWishes} disabledNote={preview ? "Bản xem trước: form sẽ hoạt động khi thiệp được chia sẻ." : demo ? "Đây là thiệp mẫu, form chưa gửi được." : undefined} />
    ) : null,
  };

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
  }, [preview, opened, d.theme]);

  // Browsers only allow sound after a user gesture: with no "Mở thiệp" button, use the first tap anywhere.
  useEffect(() => {
    if (preview || d.intro || !d.music.src) return;
    const start = () => {
      const a = audio.current;
      if (a && a.paused) a.play().then(() => setPlaying(true)).catch(() => {});
    };
    window.addEventListener("pointerdown", start, { once: true });
    window.addEventListener("keydown", start, { once: true });
    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
  }, [preview, d.intro, d.music.src]);

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
    <div ref={root} className={`iv theme-${d.theme} ${preview ? "preview" : ""} ${opened ? "opened" : ""}`}>
      {!opened && d.intro && (
        <div className="iv-intro" role="dialog" aria-label="Thiệp mời cưới">
          <div className="iv-intro-card">
            {d.theme === "song-hy" ? <SongHy size={72} /> : <Heart />}
            <p className="iv-intro-kicker">Thiệp mời cưới</p>
            <h1 className="iv-script">{names}</h1>
            {date && (
              <p className="iv-intro-date">
                {date.dd} . {date.mm} . {date.y}
              </p>
            )}
            <p className="iv-intro-guest">
              Kính gửi
              <b>{ctx.guestName}</b>
            </p>
            <button type="button" onClick={open}>
              Mở thiệp
            </button>
          </div>
        </div>
      )}

      {d.petals && opened && <Petals kind={["song-hy", "vang-do", "do-do"].includes(d.theme) ? "hearts" : "petals"} />}
      {d.music.src && <audio ref={audio} src={d.music.src} loop preload="none" onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} />}
      {d.music.src && opened && (
        <button type="button" className={`iv-music ${playing ? "on" : ""}`} onClick={(e) => { e.stopPropagation(); toggleMusic(); }} onPointerDown={(e) => e.stopPropagation()} aria-label={playing ? "Tắt nhạc" : "Bật nhạc"} title={d.music.title || "Nhạc nền"}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
          </svg>
        </button>
      )}

      <main className="iv-page">
        <Theme {...ctx} />
        <footer className="iv-foot">
          Thiệp cưới online · <Link href="/cong-cu/thiep-cuoi-online">Tạo thiệp miễn phí tại SuperLanding</Link>
        </footer>
      </main>
    </div>
  );
}
