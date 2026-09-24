"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Glyph from "./Glyph";

const STORAGE_KEY = "sl_promo_seen";
const SNOOZE_MS = 24 * 3600 * 1000; // reappears once a day, not on every single visit
const SHOW_DELAY_MS = 1600; // let the hero load first, then invite

const perks: [import("./Glyph").GlyphName, string][] = [
  ["bolt", "Bàn giao nhanh 3–5 ngày"],
  ["trend", "Chuẩn SEO, tốc độ tải hàng đầu"],
  ["check", "Bảo hành 4 tháng, hỗ trợ tận tình"],
];

const wasSeenRecently = () => {
  try {
    const t = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
    return Date.now() - t < SNOOZE_MS;
  } catch {
    return false;
  }
};

const markSeen = () => {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    /* private browsing or blocked storage: popup may reappear next visit, harmless */
  }
};

/** Homepage-only promo inviting new visitors to the pricing and project pages. Shows once a day at most. */
export default function PromoPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (pathname !== "/" || wasSeenRecently()) return;
    const t = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, [pathname]);

  const close = () => {
    markSeen();
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="promo-overlay" onClick={close}>
      <section
        className="promo-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeRef} type="button" className="promo-close" aria-label="Đóng thông báo" onClick={close}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        <div className="promo-art" aria-hidden="true">
          <span className="promo-dot promo-dot-1" />
          <span className="promo-dot promo-dot-2" />
          <span className="promo-dot promo-dot-3" />
          <div className="promo-art-badge">
            <Glyph name="rocket" size={30} />
          </div>
        </div>

        <div className="promo-body">
          <span className="promo-eyebrow">✦ ƯU ĐÃI DÀNH CHO KHÁCH MỚI</span>
          <h2 id="promo-title">
            Sở hữu website đẹp <span>chỉ từ 449.000đ</span>
          </h2>
          <p>
            Giao diện hiện đại, chuẩn SEO và tối ưu tốc độ — thiết kế riêng cho thương hiệu của bạn. Khám phá kho dự án thực tế và
            bảng giá minh bạch, không phát sinh chi phí ẩn.
          </p>

          <ul className="promo-perks">
            {perks.map(([icon, text]) => (
              <li key={text}>
                <Glyph name={icon} size={16} />
                {text}
              </li>
            ))}
          </ul>

          <div className="promo-actions">
            <Link href="/bang-gia" className="promo-btn primary" onClick={close}>
              Xem bảng giá ngay
              <Glyph name="trend" size={16} />
            </Link>
            <Link href="/du-an" className="promo-btn" onClick={close}>
              Khám phá dự án
            </Link>
          </div>
          <button type="button" className="promo-later" onClick={close}>
            Để sau
          </button>
        </div>
      </section>
    </div>
  );
}
