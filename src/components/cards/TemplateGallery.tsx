"use client";

import Link from "next/link";
import { useState } from "react";
import { formatBySize, TEMPLATE_TAGS, type CardJson } from "@/lib/cards/types";
import TemplateThumb from "./TemplateThumb";

export type GalleryItem = { id: string; slug: string; name: string; tags: string[]; width: number; height: number; canvas: CardJson; thumbUrl: string };

export default function TemplateGallery({ templates }: { templates: GalleryItem[] }) {
  const [tag, setTag] = useState<string>("all");
  const used = TEMPLATE_TAGS.filter(([id]) => templates.some((t) => t.tags.includes(id)));
  const shown = tag === "all" ? templates : templates.filter((t) => t.tags.includes(tag));

  return (
    <>
      {used.length > 1 && (
        <div className="cards-filter" role="tablist" aria-label="Lọc mẫu thiệp">
          {[["all", "Tất cả"] as const, ...used].map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tag === id} className={tag === id ? "on" : ""} onClick={() => setTag(id)}>
              {label}
            </button>
          ))}
        </div>
      )}
      <div className="cards-grid">
        {shown.map((t) => (
          <Link key={t.id} href={`/cong-cu/anh-thiep-cuoi/tao?mau=${t.slug}`} className="cards-item">
            <div className="cards-item-frame">
              <TemplateThumb id={t.id} name={t.name} canvas={t.canvas} width={t.width} height={t.height} thumbUrl={t.thumbUrl} />
              <span className="cards-item-cta">Dùng mẫu này</span>
            </div>
            <h3>{t.name}</h3>
            <p>{formatBySize(t.width, t.height)?.label ?? `${t.width}×${t.height}`}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
