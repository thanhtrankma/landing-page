"use client";

import Image from "next/image";
import { useState } from "react";
import { categories, projects } from "@/data/projects";
import { ZALO_URL } from "@/data/site";
import Tilt from "../Tilt";
import { Icon } from "../ui";

const PAGE_SIZE = 8;
const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export default function Portfolio() {
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = projects.filter((p) => category === "all" || p.category === category);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const current = Math.min(page, Math.max(1, totalPages));
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const goTo = (n: number) => {
    setPage(n);
    document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" });
  };

  const labelOf = (id: string) => categories.find((c) => c.id === id)?.label || id;

  return (
    <section id="portfolio" className="template-section">
      <div className="template-glow" />
      <div className="gv-wrap">
        <div className="animate-on-scroll">
          <h2>
            Dự án tiêu biểu và <span>kho giao diện mẫu</span>
          </h2>
          <p className="subtitle">Chọn ngành bạn quan tâm, chuyên viên sẽ tư vấn mẫu phù hợp qua Zalo</p>
        </div>
        <div className="template-tabs animate-on-scroll">
          {categories.map((c) => (
            <button
              key={c.id}
              className={`template-tab-btn ${category === c.id ? "active" : ""}`}
              onClick={() => {
                setCategory(c.id);
                setPage(1);
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="template-grid">
          {visible.map((p, i) => (
            <div key={p.title} className="animate-on-scroll" style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
              <Tilt maxRotation={8}>
                <article className="template-card">
                  {p.demoUrl ? (
                    <>
                      <a href={p.demoUrl} {...external} className="template-img-link">
                        <div className="template-img-container" style={{ borderRadius: "18px 18px 0 0" }}>
                          <Image
                            src={p.img}
                            alt={p.title}
                            width={360}
                            height={200}
                            className="template-img"
                            style={{ objectFit: "cover" }}
                          />
                          <div className="template-badge">{p.sample ? "Mẫu Web" : "Dự Án Thực Tế"}</div>
                          <div className="demo-overlay">
                            <span className="demo-btn-primary">Xem Live Demo</span>
                          </div>
                        </div>
                      </a>
                      <div className="template-info">
                        <span className="category-lbl">{labelOf(p.category)}</span>
                        <a href={ZALO_URL} {...external} className="template-title-link">
                          <h3>{p.title}</h3>
                        </a>
                        <div className="template-footer">
                          <span className="template-code">{p.code}</span>
                          <a href={ZALO_URL} {...external} className="template-action-btn">
                            Tư vấn Zalo <Icon name="arrow" size={12} />
                          </a>
                        </div>
                      </div>
                    </>
                  ) : (
                    <a href={ZALO_URL} {...external} className="template-card-global-link">
                      <div className="template-img-container" style={{ borderRadius: "18px 18px 0 0" }}>
                        <Image
                          src={p.img}
                          alt={p.title}
                          width={360}
                          height={200}
                          className="template-img"
                          style={{ objectFit: "cover" }}
                        />
                        <div className="template-badge">Mẫu Web</div>
                      </div>
                      <div className="template-info">
                        <span className="category-lbl">{labelOf(p.category)}</span>
                        <h3>{p.title}</h3>
                        <div className="template-footer">
                          <span className="template-code">{p.code}</span>
                          <span className="template-action-btn">
                            Tư vấn Zalo <Icon name="arrow" size={12} />
                          </span>
                        </div>
                      </div>
                    </a>
                  )}
                </article>
              </Tilt>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="pagination-container">
            <button className="pagination-btn" onClick={() => goTo(current - 1)} disabled={current === 1} aria-label="Trang trước">
              <span style={{ display: "inline-flex", transform: "rotate(180deg)" }}>
                <Icon name="arrow" size={12} />
              </span>
            </button>
            {Array.from({ length: totalPages }, (_, idx) => {
              const n = idx + 1;
              if (totalPages <= 7 || n === 1 || n === totalPages || (n >= current - 1 && n <= current + 1)) {
                return (
                  <button key={n} className={`pagination-btn ${current === n ? "active" : ""}`} onClick={() => goTo(n)}>
                    {n}
                  </button>
                );
              }
              if ((n === 2 && current > 3) || (n === totalPages - 1 && current < totalPages - 2)) {
                return (
                  <span key={n} className="pagination-ellipsis">
                    ...
                  </span>
                );
              }
              return null;
            })}
            <button
              className="pagination-btn"
              onClick={() => goTo(current + 1)}
              disabled={current === totalPages}
              aria-label="Trang sau"
            >
              <Icon name="arrow" size={12} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
