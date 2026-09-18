"use client";

import { useState } from "react";
import { portfolioCategories, portfolioItems } from "@/data/content";

export default function Portfolio() {
  const [active, setActive] = useState("Tất cả");

  const filtered =
    active === "Tất cả" ? portfolioItems : portfolioItems.filter((item) => item.category === active);

  return (
    <section id="work" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-brand-600">Dự án tiêu biểu</p>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Kho dự án đã triển khai</h2>
          <p className="mt-3 text-muted-foreground">
            Một số ví dụ minh hoạ — thay bằng dự án và hình ảnh thật của bạn.
          </p>
        </div>

        <div role="tablist" aria-label="Lọc dự án theo ngành" className="mb-10 flex flex-wrap justify-center gap-2">
          {portfolioCategories.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={active === category}
              onClick={() => setActive(category)}
              className={`min-h-10 cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition ${
                active === category
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-brand-600 hover:text-brand-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-border bg-background transition hover:-translate-y-1 hover:shadow-lg">
              <div className={`aspect-[16/10] bg-gradient-to-br ${item.gradient}`} aria-hidden="true" />
              <div className="p-5">
                <span className="text-xs font-bold uppercase tracking-wide text-brand-600">{item.category}</span>
                <h3 className="mt-1.5 font-bold">{item.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
