"use client";

import { useEffect, useState } from "react";
import { heroRotatingWords, industries } from "@/data/content";

export default function Hero() {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = heroRotatingWords[wordIndex];
    const speed = deleting ? 35 : 55;

    const timeout = setTimeout(() => {
      if (!deleting) {
        if (displayed.length < current.length) {
          setDisplayed(current.slice(0, displayed.length + 1));
        } else {
          setTimeout(() => setDeleting(true), 1400);
        }
      } else if (displayed.length > 0) {
        setDisplayed(current.slice(0, displayed.length - 1));
      } else {
        setDeleting(false);
        setWordIndex((i) => (i + 1) % heroRotatingWords.length);
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [displayed, deleting, wordIndex]);

  return (
    <section id="top" className="dot-grid relative overflow-hidden pb-20 pt-16 sm:pb-28 sm:pt-20">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-50/70 via-transparent to-transparent" aria-hidden="true" />
      <div className="relative mx-auto max-w-4xl px-4 text-center">
        <p className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-brand-700">
          <span aria-hidden="true">✦</span> Dịch vụ Website &amp; Landing Page chuyên nghiệp
        </p>

        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Thiết kế Website &amp;
          <br />
          <span className="text-brand-600">
            {displayed}
            <span className="animate-caret ml-0.5 inline-block w-[3px] translate-y-1 bg-brand-600 align-middle" style={{ height: "0.85em" }} aria-hidden="true" />
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Thiết kế Landing Page / Website chuyên nghiệp cho cá nhân, cửa hàng bán hàng, doanh
          nghiệp và dịch vụ kinh doanh — tối ưu tỉ lệ chuyển đổi và khả năng hiển thị trên công cụ
          tìm kiếm.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#contact"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-600 px-6 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
          >
            Tư vấn miễn phí
          </a>
          <a
            href="#work"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-background px-6 text-sm font-semibold text-foreground transition hover:border-brand-600 hover:text-brand-600"
          >
            Xem dự án
          </a>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-muted-foreground">
          {industries.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
