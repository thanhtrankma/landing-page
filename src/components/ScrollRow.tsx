"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const chevron = (points: string) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points={points} />
  </svg>
);

export default function ScrollRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      setCanLeft(el.scrollLeft > 10);
      setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    };
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const t = setTimeout(update, 350);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      clearTimeout(t);
    };
  }, [children]);

  const scroll = (dir: "left" | "right") => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".gv-card, .price-card, .service-card");
    const step = card ? card.clientWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  return (
    <div className={`swiper-parent-container ${className}`}>
      {canLeft && (
        <button className="swiper-nav-btn left" onClick={() => scroll("left")} aria-label="Scroll left">
          {chevron("15 18 9 12 15 6")}
        </button>
      )}
      <div className="swiper-scroll-container" ref={ref}>
        {children}
      </div>
      {canRight && (
        <button className="swiper-nav-btn right" onClick={() => scroll("right")} aria-label="Scroll right">
          {chevron("9 18 15 12 9 6")}
        </button>
      )}
    </div>
  );
}
