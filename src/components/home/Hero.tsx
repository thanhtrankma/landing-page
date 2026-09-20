"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { heroBanners, heroTexts } from "@/data/site";
import Glyph from "../Glyph";
import { Button } from "../ui";

function Typewriter({ texts, delay = 100 }: { texts: string[]; delay?: number }) {
  const [text, setText] = useState(texts[0] || "");
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(texts[0]?.length || 0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = texts[index] || "";
    let timer: ReturnType<typeof setTimeout>;
    if (deleting) {
      if (length > 0) {
        timer = setTimeout(() => {
          setText(full.substring(0, length - 1));
          setLength((n) => n - 1);
        }, delay / 2);
      } else {
        timer = setTimeout(() => {
          setDeleting(false);
          setIndex((i) => (i + 1) % texts.length);
        }, 0);
      }
    } else if (length < full.length) {
      timer = setTimeout(() => {
        setText(full.substring(0, length + 1));
        setLength((n) => n + 1);
      }, delay);
    } else {
      timer = setTimeout(() => setDeleting(true), 2800);
    }
    return () => clearTimeout(timer);
  }, [length, deleting, index, texts, delay]);

  return (
    <span className="typewriter-text">
      {text || " "}
      <span className="typewriter-cursor">|</span>
    </span>
  );
}

function Carousel() {
  const [active, setActive] = useState(0);
  const [loadAll, setLoadAll] = useState(false);

  // Only the first banner is loaded up front; the rest join after the page has settled.
  useEffect(() => {
    const first = setTimeout(() => setLoadAll(true), 2500);
    const cycle = setInterval(() => {
      setLoadAll(true);
      setActive((a) => (a + 1) % heroBanners.length);
    }, 4500);
    return () => {
      clearTimeout(first);
      clearInterval(cycle);
    };
  }, []);

  return (
    <div className="hero-carousel">
      {heroBanners.map((src, i) =>
        i === 0 || loadAll ? (
          <Image
            key={src}
            src={src}
            alt={`Dịch vụ thiết kế Website và Landing Page chuẩn SEO WebLanding — Banner ${i + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 450px"
            preload={i === 0}
            fetchPriority={i === 0 ? "high" : "auto"}
            className={`hero-banner-img ${i === active ? "active" : ""}`}
            onClick={() => {
              setLoadAll(true);
              setActive((a) => (a + 1) % heroBanners.length);
            }}
          />
        ) : null,
      )}
      <div className="carousel-dots">
        {heroBanners.map((_, i) => (
          <span
            key={i}
            className={`carousel-dot ${i === active ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setLoadAll(true);
              setActive(i);
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="home-hero">
      <div className="hero-grid" />
      <div className="hero-glow" />
      <div className="gv-wrap hero-layout">
        <div className="hero-copy fade-in-left">
          <span className="hero-label">✦ DỊCH VỤ WEBSITE &amp; LANDING PAGE CHUYÊN NGHIỆP</span>
          <h1 style={{ minHeight: "3.3em" }}>
            Thiết kế Website &amp;
            <span className="typewriter-container" style={{ display: "block", minHeight: "2.2em" }}>
              <Typewriter texts={heroTexts} />
            </span>
          </h1>
          <p>
            Thiết kế Landing Page / Website chuyên nghiệp cho cá nhân, cửa hàng bán hàng, doanh nghiệp và dịch vụ kinh
            doanh. Tối ưu tỷ lệ chuyển đổi và tối ưu hóa tìm kiếm giúp thương hiệu của bạn tỏa sáng.
          </p>
          <div className="hero-actions">
            <Button href="/lien-he">Tư vấn miễn phí</Button>
            <Button href="#portfolio" light>
              Xem dự án
            </Button>
          </div>
        </div>
        <div className="hero-art fade-in-right">
          <div className="hero-banner-glow" />
          <div className="hero-banner-orbit-1" />
          <div className="hero-banner-orbit-2" />
          <div className="hero-banner-grid-dots" />
          <Carousel />
          <div className="hero-floating-badge top-left">
            <span className="badge-icon">
              <Glyph name="bolt" size={18} />
            </span>
            <div className="badge-content">
              <strong>SEO</strong>
              <span>Nền tảng kỹ thuật</span>
            </div>
          </div>
          <div className="hero-floating-badge bottom-right">
            <span className="badge-icon">
              <Glyph name="trend" size={18} />
            </span>
            <div className="badge-content">
              <strong>Tốc độ</strong>
              <span>Ưu tiên tối ưu</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
