"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  FACEBOOK_URL,
  SHOW_SOCIALS,
  ZALO_URL,
  facebookPath,
} from "@/data/site";

export function ScrollToTop() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <button
      type="button"
      className="scroll-top-btn visible"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Lên đầu trang"
    >
      <svg
        className="scroll-top-progress"
        viewBox="0 0 56 56"
        aria-hidden="true"
      >
        <circle className="scroll-top-track" cx="28" cy="28" r="25" />
        <circle
          className="scroll-top-value"
          cx="28"
          cy="28"
          r="25"
          pathLength={100}
          style={{ strokeDasharray: `${progress * 100} 100` }}
        />
      </svg>
      <svg className="scroll-top-arrow" viewBox="0 0 24 24" aria-hidden="true">
        <path d="m7 14 5-5 5 5" />
      </svg>
    </button>
  );
}

const bubbleMessages = [
  "👋 Xin chào! Bạn đang cần Website hay Landing Page cho dự án nào?",
  "💬 Nhận tư vấn, kho giao diện mẫu và báo giá nhanh qua Zalo!",
  "🚀 Website chuẩn SEO, tải nhanh, bảo mật — sẵn sàng để tăng trưởng.",
  "🎁 Đang có ưu đãi tặng Hosting & Tên miền miễn phí khi đăng ký ngay!",
];

export function ZaloFloat() {
  const [index, setIndex] = useState(0);
  const [bubble, setBubble] = useState(false);
  const [typing, setTyping] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Cycle: typing dots (1.2s) -> message (7s) -> hidden (12s) -> next message.
  useEffect(() => {
    if (dismissed) return;
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    let t3: ReturnType<typeof setTimeout>;
    const cycle = () => {
      setTyping(true);
      setBubble(true);
      t1 = setTimeout(() => {
        setTyping(false);
        t2 = setTimeout(() => {
          setBubble(false);
          t3 = setTimeout(() => {
            setIndex((i) => (i + 1) % bubbleMessages.length);
            cycle();
          }, 12000);
        }, 7000);
      }, 1200);
    };
    const start = setTimeout(cycle, 4000);
    return () => {
      clearTimeout(start);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [dismissed, index]);

  return (
    <div className="contact-float-group">
      {SHOW_SOCIALS && (
        <div className="facebook-float-btn">
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <div className="icon-wrapper">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d={facebookPath} />
              </svg>
            </div>
          </a>
        </div>
      )}
      <div className="zalo-float-btn">
        {!dismissed && bubble && (
          <div className="zalo-bubble">
            <button
              className="zalo-bubble-close"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDismissed(true);
                setBubble(false);
              }}
              aria-label="Đóng thông báo"
            >
              ×
            </button>
            <div className="zalo-bubble-content">
              {typing ? (
                <div className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              ) : (
                <p>{bubbleMessages[index]}</p>
              )}
            </div>
          </div>
        )}
        <a
          href={ZALO_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat Zalo"
        >
          <span className="ping-glow" />
          <div className="icon-wrapper">
            <Image
              src="/images/zalo-icon.png"
              alt="Chat Zalo"
              width={48}
              height={48}
              className="zalo-icon-img"
            />
          </div>
          <div className="badge-count">1</div>
        </a>
      </div>
    </div>
  );
}

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
  external?: boolean;
};

const mobileItems: NavItem[] = [
  {
    id: "trang-chu",
    label: "Trang chủ",
    href: "/",
    icon: (
      <svg viewBox="0 0 24 24" className="nav-icon">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: "dich-vu",
    label: "Dịch vụ",
    href: "/dich-vu",
    icon: (
      <svg viewBox="0 0 24 24" className="nav-icon">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    id: "du-an",
    label: "Dự án",
    href: "/du-an",
    icon: (
      <svg viewBox="0 0 24 24" className="nav-icon">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    id: "bang-gia",
    label: "Bảng giá",
    href: "/bang-gia",
    icon: (
      <svg viewBox="0 0 24 24" className="nav-icon">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  {
    id: "tu-van",
    label: "Tư vấn",
    href: ZALO_URL,
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" className="nav-icon">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const update = () => setHash(window.location.hash);
    window.addEventListener("hashchange", update);
    update();
    return () => window.removeEventListener("hashchange", update);
  }, []);

  const active =
    pathname === "/" && hash === "#portfolio"
      ? "du-an"
      : pathname === "/"
        ? "trang-chu"
        : pathname.startsWith("/dich-vu")
          ? "dich-vu"
          : pathname.startsWith("/du-an")
            ? "du-an"
            : pathname.startsWith("/bang-gia")
              ? "bang-gia"
              : "";

  return (
    <div className="mobile-bottom-nav">
      {mobileItems.map((item) =>
        item.external ? (
          <a
            key={item.id}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-nav-item"
          >
            <div className="icon-wrapper">{item.icon}</div>
            <span className="nav-label">{item.label}</span>
          </a>
        ) : (
          <Link
            key={item.id}
            href={item.href}
            className={`mobile-nav-item ${active === item.id ? "active" : ""}`}
          >
            <div className="icon-wrapper">
              {item.icon}
              {active === item.id && <span className="active-dot" />}
            </div>
            <span className="nav-label">{item.label}</span>
          </Link>
        ),
      )}
    </div>
  );
}
