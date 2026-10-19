"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { INVITE_THEMES, type InviteTheme } from "@/lib/invites/types";

// "Thiệp của tôi": every invitation the user owns or helps edit.

export type DashboardItem = {
  id: string;
  slug: string;
  title: string;
  theme: InviteTheme;
  cover: string;
  status: "draft" | "published";
  published: boolean;
  role: "owner" | "editor";
  updatedAt: string;
  viewCount: number;
  date: string;
};

const TOOL = "/cong-cu/thiep-cuoi-online";
const fmt = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" });

export default function Dashboard({ items }: { items: DashboardItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const remove = async (it: DashboardItem) => {
    if (!confirm(`Xoá thiệp "${it.title}"? Khách mời, xác nhận tham dự và lời chúc cũng bị xoá. Không thể hoàn tác.`)) return;
    setBusy(it.id);
    const res = await fetch(`/api/invites/${it.id}`, { method: "DELETE" });
    setBusy(null);
    if (res.ok) router.refresh();
    else alert("Không xoá được, vui lòng thử lại.");
  };

  if (!items.length) {
    return (
      <div className="db-empty">
        <h2>Bạn chưa có thiệp nào</h2>
        <p>Chọn một mẫu và bắt đầu, chỉ mất vài phút.</p>
        <Link className="ce-btn primary" href={`${TOOL}#mau-thiep`}>
          Chọn mẫu thiệp
        </Link>
      </div>
    );
  }

  return (
    <div className="db-grid">
      <Link className="db-new" href={`${TOOL}#mau-thiep`}>
        <span>+</span>
        Tạo thiệp mới
      </Link>
      {items.map((it) => {
        const theme = INVITE_THEMES.find((t) => t.id === it.theme) ?? INVITE_THEMES[0];
        const badge = it.status === "draft" ? ["Nháp", ""] : it.published ? ["Đang hiển thị", "live"] : ["Tạm ẩn", "hidden"];
        return (
          <article key={it.id} className="db-card">
            <Link className="db-thumb" href={`${TOOL}/sua/${it.id}`} aria-label={`Sửa ${it.title}`}>
              {it.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.cover} alt="" loading="lazy" />
              ) : (
                <>
                  <span className="db-thumb-swatch">
                    {theme.colors.map((c) => (
                      <i key={c} style={{ background: c }} />
                    ))}
                  </span>
                  <b>{it.title.replace("Thiệp cưới ", "")}</b>
                </>
              )}
              <span className={`db-badge ${badge[1]}`}>{badge[0]}</span>
            </Link>
            <div className="db-body">
              <h3>{it.title}</h3>
              <p>
                {theme.name}
                {it.status === "published" ? ` · ${it.viewCount} lượt xem` : ""}
                {it.role === "editor" ? " · Được mời cùng sửa" : ""}
              </p>
              <p>Cập nhật {fmt.format(new Date(it.updatedAt))}</p>
              <div className="db-actions">
                <Link className="ce-btn sm primary" href={`${TOOL}/sua/${it.id}`}>
                  Sửa thiệp
                </Link>
                <Link className="ce-btn sm" href={`${TOOL}/khach-moi/${it.id}`}>
                  Khách mời
                </Link>
                {it.status === "published" && (
                  <a className="ce-btn sm ghost" href={`/thiep/${it.slug}`} target="_blank" rel="noopener noreferrer">
                    Xem ↗
                  </a>
                )}
                {it.role === "owner" && (
                  <button type="button" className="ce-btn sm ghost danger" onClick={() => remove(it)} disabled={busy === it.id}>
                    Xoá
                  </button>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
