"use client";

import { useMemo, useState } from "react";
import { awaiting, dmy, money, newId, voucherTotal, type Supplier } from "@/lib/shop/types";
import { Icon } from "./icons";
import { Empty, Field, fold, Panel, type Sheet, useShop } from "./ui";

// Nguồn hàng: where each item is bought, with contact details and how much has been bought there.

export default function Suppliers() {
  const { book, open } = useShop();
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const needle = fold(q.trim());
    return book.suppliers
      .filter((s) => !needle || fold(`${s.name} ${s.phone} ${s.address} ${s.note}`).includes(needle))
      .map((s) => {
        const buys = book.vouchers.filter((v) => v.kind === "in" && v.supplierId === s.id);
        return {
          s,
          products: book.products.filter((p) => p.supplierId === s.id && !p.archived).length,
          spent: buys.reduce((n, v) => n + voucherTotal(v), 0),
          owed: buys.filter((v) => !v.paid).reduce((n, v) => n + voucherTotal(v), 0),
          last: buys.reduce((d, v) => (v.date > d ? v.date : d), ""),
          waiting: book.vouchers.filter((v) => awaiting(v) && v.supplierId === s.id).length,
        };
      })
      .sort((a, b) => b.last.localeCompare(a.last) || a.s.name.localeCompare(b.s.name, "vi"));
  }, [book, q]);

  if (!book.suppliers.length) {
    return (
      <Empty title="Chưa có nguồn hàng" text="Lưu lại xưởng, mối sỉ, shop online bạn hay lấy hàng: số điện thoại, địa chỉ, link và ghi chú về giá, chất lượng.">
        <button type="button" className="ce-btn primary" onClick={() => open({ t: "supplier" })}>
          + Thêm nguồn hàng
        </button>
      </Empty>
    );
  }

  return (
    <>
      <div className="sh-toolbar">
        <input className="sh-search" type="search" placeholder="Tìm nguồn hàng…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Tìm nguồn hàng" />
        <button type="button" className="ce-btn primary" onClick={() => open({ t: "supplier" })}>
          + Nguồn mới
        </button>
      </div>
      <div className="sh-suppliers">
        {rows.map(({ s, products, spent, owed, last, waiting }) => (
          <article key={s.id} className="sh-box">
            <button type="button" className="sh-supplier-head" onClick={() => open({ t: "supplier", id: s.id })}>
              <h3>{s.name}</h3>
              <span>Sửa</span>
            </button>
            <ul className="sh-contact">
              {s.phone && (
                <li>
                  <a href={`tel:${s.phone.replace(/[^\d+]/g, "")}`}>☎ {s.phone}</a>
                  {" · "}
                  <a href={`https://zalo.me/${s.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                    Zalo
                  </a>
                </li>
              )}
              {s.address && <li>📍 {s.address}</li>}
              {s.link && (
                <li>
                  <a href={s.link} target="_blank" rel="noopener noreferrer">
                    🔗 {s.link.replace(/^https?:\/\/(www\.)?/, "").slice(0, 40)}
                  </a>
                </li>
              )}
            </ul>
            {s.note && <p className="sh-note-text">{s.note}</p>}
            <div className="sh-row-actions">
              <button type="button" className="ce-btn sm primary" onClick={() => open({ t: "voucher", kind: "order", supplierId: s.id })}>
                <Icon name="receipt" size={16} /> Lên đơn đặt
              </button>
              {waiting > 0 && <span className="sh-muted">{waiting} đơn chờ hàng về</span>}
            </div>
            <p className="sh-muted">
              {products} mẫu · đã nhập {money(spent)}
              {last && ` · lần cuối ${dmy(last)}`}
              {owed > 0 && <b className="bad"> · còn nợ {money(owed)}</b>}
            </p>
          </article>
        ))}
      </div>
    </>
  );
}

export function SupplierForm({ sheet, onClose }: { sheet: Extract<Sheet, { t: "supplier" }>; onClose: () => void }) {
  const { book, update, toast, undoable } = useShop();
  const existing = book.suppliers.find((s) => s.id === sheet.id);
  const [s, setS] = useState<Supplier>(() => existing ?? { id: newId(), name: "", phone: "", address: "", link: "", note: "", createdAt: new Date().toISOString() });
  const set = <K extends keyof Supplier>(k: K, v: Supplier[K]) => setS((x) => ({ ...x, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!s.name.trim()) return toast("Hãy nhập tên nguồn hàng.", true);
    const link = s.link.trim() && !/^https?:\/\//i.test(s.link.trim()) ? `https://${s.link.trim()}` : s.link.trim();
    const out = { ...s, link };
    update((b) => ({ ...b, suppliers: existing ? b.suppliers.map((x) => (x.id === out.id ? out : x)) : [...b.suppliers, out] }));
    toast(existing ? "Đã lưu nguồn hàng." : "Đã thêm nguồn hàng.");
    sheet.onSaved?.(out.id);
    onClose();
  };

  const remove = () => {
    if (!existing) return;
    const linked = new Set(book.products.filter((p) => p.supplierId === existing.id).map((p) => p.id));
    update((b) => ({
      ...b,
      suppliers: b.suppliers.filter((x) => x.id !== existing.id),
      products: b.products.map((p) => (p.supplierId === existing.id ? { ...p, supplierId: "" } : p)),
    }));
    undoable(`Đã xoá nguồn “${existing.name}”.`, () =>
      update((b) => ({ ...b, suppliers: [...b.suppliers, existing], products: b.products.map((p) => (linked.has(p.id) && !p.supplierId ? { ...p, supplierId: existing.id } : p)) })),
    );
    onClose();
  };

  const items = existing ? book.products.filter((p) => p.supplierId === existing.id) : [];
  return (
    <Panel
      title={existing ? existing.name : "Thêm nguồn hàng"}
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
          <button type="submit" form="sh-supplier" className="ce-btn primary">
            {existing ? "Lưu" : "Thêm nguồn"}
          </button>
        </>
      }
    >
      <form id="sh-supplier" className="sh-form" onSubmit={submit}>
        <Field label="Tên nguồn hàng *" wide>
          <input required autoFocus={!existing} value={s.name} onChange={(e) => set("name", e.target.value)} placeholder="Xưởng hoa sáp Minh Anh, Chợ Đồng Xuân…" />
        </Field>
        <Field label="Số điện thoại / Zalo">
          <input type="tel" value={s.phone} onChange={(e) => set("phone", e.target.value)} placeholder="09…" />
        </Field>
        <Field label="Link (shop, Facebook, 1688…)">
          <input value={s.link} onChange={(e) => set("link", e.target.value)} placeholder="https://…" />
        </Field>
        <Field label="Địa chỉ lấy hàng" wide>
          <input value={s.address} onChange={(e) => set("address", e.target.value)} />
        </Field>
        <Field label="Ghi chú" wide>
          <textarea rows={4} value={s.note} onChange={(e) => set("note", e.target.value)} placeholder="Giá sỉ từ bao nhiêu cái, thời gian giao, chất lượng, chính sách đổi trả…" />
        </Field>
      </form>
      {items.length > 0 && (
        <div className="sh-history">
          <h3>Mẫu lấy từ nguồn này</h3>
          <p className="sh-muted">{items.map((p) => p.name).join(", ")}</p>
        </div>
      )}
    </Panel>
  );
}
