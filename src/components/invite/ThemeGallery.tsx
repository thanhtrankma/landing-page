"use client";

import Link from "next/link";
import { useState } from "react";
import { demoSlug, INVITE_THEMES, type InviteTheme } from "@/lib/invites/types";

// Template gallery: one live phone preview per layout, with colour dots that switch the variant.

function ThemeCard({ id, create }: { id: InviteTheme; create: string }) {
  const t = INVITE_THEMES.find((x) => x.id === id)!;
  const [color, setColor] = useState(t.variants[0].id);
  const v = t.variants.find((x) => x.id === color)!;
  const demo = `/thiep/${demoSlug(t.id, color)}`;
  return (
    <article className="invite-theme">
      <div className="invite-phone small">
        <iframe key={demo} src={`${demo}?khach=Bạn`} title={`Mẫu thiệp ${t.name} – ${v.name}`} loading="lazy" />
      </div>
      <h3>
        {t.name} <span>– {v.name}</span>
      </h3>
      <p>{t.note}</p>
      <div className="invite-dots" role="radiogroup" aria-label={`Màu của mẫu ${t.name}`}>
        {t.variants.map((x) => (
          <button
            key={x.id}
            type="button"
            role="radio"
            aria-checked={x.id === color}
            aria-label={x.name}
            title={x.name}
            className={x.id === color ? "on" : ""}
            style={{ background: x.c2 ? `linear-gradient(135deg, ${x.c1} 50%, ${x.c2} 50%)` : x.c1 }}
            onClick={() => setColor(x.id)}
          />
        ))}
      </div>
      <div className="invite-theme-actions">
        <Link href={`${create}?mau=${t.id}${color !== t.variants[0].id ? `&mau_sac=${color}` : ""}`} className="gv-btn">
          Dùng mẫu này
        </Link>
        <Link href={demo} target="_blank" className="invite-phone-link">
          Xem toàn màn hình ↗
        </Link>
      </div>
    </article>
  );
}

export default function ThemeGallery({ create }: { create: string }) {
  return (
    <div className="invite-themes">
      {INVITE_THEMES.map((t) => (
        <ThemeCard key={t.id} id={t.id} create={create} />
      ))}
    </div>
  );
}
