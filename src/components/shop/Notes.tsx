"use client";

import { useMemo, useState } from "react";
import { dmy, newId, NOTE_COLORS, today, type Note } from "@/lib/shop/types";
import { Empty, Field, fold, Panel, type Sheet, useShop } from "./ui";

// Ghi chú: free notes for the shop (ideas, customer requests, to-dos), pinned ones first.

export default function Notes() {
  const { book, open } = useShop();
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const needle = fold(q.trim());
    return book.notes
      .filter((n) => !needle || fold(`${n.title} ${n.body}`).includes(needle))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));
  }, [book.notes, q]);

  if (!book.notes.length) {
    return (
      <Empty title="Chưa có ghi chú" text="Ghi lại ý tưởng mẫu mới, đơn đặt trước, việc cần làm, mẹo cắm hoa… mọi thứ bạn không muốn quên.">
        <button type="button" className="ce-btn primary" onClick={() => open({ t: "note" })}>
          + Viết ghi chú
        </button>
      </Empty>
    );
  }
  return (
    <>
      <div className="sh-toolbar">
        <input className="sh-search" type="search" placeholder="Tìm ghi chú…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Tìm ghi chú" />
        <button type="button" className="ce-btn primary" onClick={() => open({ t: "note" })}>
          + Ghi chú mới
        </button>
      </div>
      <div className="sh-notes">
        {shown.map((n) => (
          <button key={n.id} type="button" className="sh-note" style={{ background: n.color }} onClick={() => open({ t: "note", id: n.id })}>
            {n.pinned && <span className="sh-pin">📌</span>}
            {n.title && <b>{n.title}</b>}
            <p>{n.body}</p>
            <small>{dmy(today(new Date(n.updatedAt)))}</small>
          </button>
        ))}
      </div>
    </>
  );
}

export function NoteForm({ sheet, onClose }: { sheet: Extract<Sheet, { t: "note" }>; onClose: () => void }) {
  const { book, update } = useShop();
  const existing = book.notes.find((n) => n.id === sheet.id);
  const [n, setN] = useState<Note>(() => existing ?? { id: newId(), title: "", body: "", pinned: false, color: NOTE_COLORS[0], updatedAt: "" });
  const set = <K extends keyof Note>(k: K, v: Note[K]) => setN((x) => ({ ...x, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!n.title.trim() && !n.body.trim()) return onClose();
    const out = { ...n, updatedAt: new Date().toISOString() };
    update((b) => ({ ...b, notes: existing ? b.notes.map((x) => (x.id === out.id ? out : x)) : [out, ...b.notes] }));
    onClose();
  };
  const remove = () => {
    if (!existing || !confirm("Xoá ghi chú này?")) return;
    update((b) => ({ ...b, notes: b.notes.filter((x) => x.id !== existing.id) }));
    onClose();
  };

  return (
    <Panel
      title={existing ? "Sửa ghi chú" : "Ghi chú mới"}
      onClose={onClose}
      foot={
        <>
          {existing && (
            <button type="button" className="ce-btn ghost danger" onClick={remove}>
              Xoá
            </button>
          )}
          <span className="sh-grow" />
          <button type="button" className="ce-btn ghost" onClick={onClose}>
            Huỷ
          </button>
          <button type="submit" form="sh-note" className="ce-btn primary">
            Lưu
          </button>
        </>
      }
    >
      <form id="sh-note" className="sh-form" onSubmit={submit}>
        <Field label="Tiêu đề" wide>
          <input value={n.title} autoFocus onChange={(e) => set("title", e.target.value)} placeholder="Đơn đặt trước 20/11, ý tưởng mẫu Tết…" />
        </Field>
        <Field label="Nội dung" wide>
          <textarea rows={9} value={n.body} onChange={(e) => set("body", e.target.value)} />
        </Field>
        <div className="sh-colors wide" role="radiogroup" aria-label="Màu ghi chú">
          {NOTE_COLORS.map((c) => (
            <button key={c} type="button" role="radio" aria-checked={n.color === c} aria-label={`Màu ${c}`} className={n.color === c ? "on" : ""} style={{ background: c }} onClick={() => set("color", c)} />
          ))}
          <label className="sh-check">
            <input type="checkbox" checked={n.pinned} onChange={(e) => set("pinned", e.target.checked)} /> Ghim lên đầu
          </label>
        </div>
      </form>
    </Panel>
  );
}
