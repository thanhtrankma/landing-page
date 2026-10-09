"use client";

import { useEffect, useRef, useState } from "react";
import type { CardJson } from "@/lib/cards/types";

// Template preview. Uses the stored thumbnail when there is one; otherwise renders the template in the browser
// once it scrolls into view (Fabric is loaded lazily, so the gallery page itself stays light).

const rendered = new Map<string, string>();

export default function TemplateThumb({ id, name, canvas, width, height, thumbUrl }: { id: string; name: string; canvas: CardJson; width: number; height: number; thumbUrl?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | undefined>(thumbUrl || rendered.get(id));

  useEffect(() => {
    if (src || !ref.current) return;
    let cancelled = false;
    const io = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        try {
          const { renderThumb } = await import("./export");
          const url = await renderThumb(canvas, { width, height }, 420, true);
          rendered.set(id, url);
          if (!cancelled) setSrc(url);
        } catch (e) {
          console.error("[thumb]", e);
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(ref.current);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [src, id, canvas, width, height]);

  return (
    <div ref={ref} className="card-thumb" style={{ aspectRatio: `${width} / ${height}` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src ? <img src={src} alt={`Mẫu thiệp cưới ${name}`} loading="lazy" /> : <span className="card-thumb-skeleton" aria-hidden="true" />}
    </div>
  );
}
