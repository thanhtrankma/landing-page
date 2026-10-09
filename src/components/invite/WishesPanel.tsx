"use client";

import { useCallback, useEffect, useState } from "react";
import type { Wish } from "@/lib/invites/types";

// The couple's list of wishes and RSVPs, with totals, hide/show and CSV export.

const ATTEND: Record<string, string> = { yes: "Sẽ đến", no: "Không đến", maybe: "Chưa chắc" };
const fmt = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });

export default function WishesPanel({ inviteId, onError }: { inviteId: string; onError: (m: string) => void }) {
  const [wishes, setWishes] = useState<Wish[] | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/invites/${inviteId}/wishes`, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Không tải được lời chúc.");
    return data.wishes as Wish[];
  }, [inviteId]);

  useEffect(() => {
    let alive = true;
    load()
      .then((w) => alive && setWishes(w))
      .catch((e) => alive && onError((e as Error).message));
    return () => {
      alive = false;
    };
  }, [load, onError]);

  const toggle = async (w: Wish) => {
    setWishes((list) => list?.map((x) => (x.id === w.id ? { ...x, hidden: !w.hidden } : x)) ?? null);
    const res = await fetch(`/api/invites/${inviteId}/wishes`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ wishId: w.id, hidden: !w.hidden }) });
    if (!res.ok) {
      onError("Không cập nhật được, vui lòng thử lại.");
      setWishes((list) => list?.map((x) => (x.id === w.id ? { ...x, hidden: w.hidden } : x)) ?? null);
    }
  };

  const exportCsv = () => {
    if (!wishes) return;
    const esc = (s: string | number) => `"${String(s).replace(/"/g, '""')}"`;
    const rows = [["Thời gian", "Tên", "Tham dự", "Số người", "Lời chúc", "Đang ẩn"], ...wishes.map((w) => [fmt.format(new Date(w.createdAt)), w.name, w.attend ? ATTEND[w.attend] : "", w.attend === "yes" ? w.guests : "", w.message, w.hidden ? "có" : ""])];
    const blob = new Blob(["﻿" + rows.map((r) => r.map(esc).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "loi-chuc-xac-nhan.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  };

  if (!wishes) return <p className="ib-muted">Đang tải lời chúc…</p>;
  const yes = wishes.filter((w) => w.attend === "yes");
  return (
    <div className="ib-wishes">
      <div className="ib-stats">
        <div>
          <b>{wishes.length}</b>
          <span>lượt gửi</span>
        </div>
        <div>
          <b>{yes.length}</b>
          <span>xác nhận đến</span>
        </div>
        <div>
          <b>{yes.reduce((n, w) => n + (w.guests || 1), 0)}</b>
          <span>khách dự kiến</span>
        </div>
      </div>
      <div className="ib-row">
        <button type="button" className="ib-btn sm" onClick={() => load().then(setWishes).catch((e) => onError(e.message))}>
          Tải lại
        </button>
        {wishes.length > 0 && (
          <button type="button" className="ib-btn sm" onClick={exportCsv}>
            Xuất Excel (CSV)
          </button>
        )}
      </div>
      {wishes.length === 0 ? (
        <p className="ib-muted">Chưa có ai gửi lời chúc. Hãy chia sẻ link thiệp cho bạn bè và người thân nhé!</p>
      ) : (
        <ul className="ib-wish-list">
          {wishes.map((w) => (
            <li key={w.id} className={w.hidden ? "hidden" : ""}>
              <div className="ib-wish-top">
                <b>{w.name}</b>
                {w.attend && <span className={`ib-tag ${w.attend}`}>{ATTEND[w.attend]}{w.attend === "yes" && w.guests > 1 ? ` · ${w.guests} người` : ""}</span>}
              </div>
              {w.message && <p>{w.message}</p>}
              <div className="ib-wish-foot">
                <small>{fmt.format(new Date(w.createdAt))}</small>
                {w.message && (
                  <button type="button" onClick={() => toggle(w)}>
                    {w.hidden ? "Hiện trên thiệp" : "Ẩn khỏi thiệp"}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
