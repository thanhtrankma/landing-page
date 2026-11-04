"use client";

import { useMemo, useState } from "react";
import { dmy, KIND_LABEL, money, qtyText, STATUS_LABEL, voucherTotal, type VoucherKind } from "@/lib/shop/types";
import { Empty, fold, useShop } from "./ui";

// Sổ nhập – bán: every voucher, newest first, filtered by kind, month, open status and free text.

type Filter = "all" | VoucherKind | "pending" | "unpaid";
const FILTERS: [Filter, string][] = [
  ["all", "Tất cả"],
  ["out", "Bán hàng"],
  ["in", "Nhập hàng"],
  ["adjust", "Điều chỉnh"],
  ["pending", "Chờ giao"],
  ["unpaid", "Chưa thu tiền"],
];
const PAGE = 60;

export default function Vouchers() {
  const { book, open } = useShop();
  const [filter, setFilter] = useState<Filter>("all");
  const [month, setMonth] = useState("");
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(PAGE);

  const months = useMemo(() => [...new Set(book.vouchers.map((v) => v.date.slice(0, 7)))].sort().reverse(), [book.vouchers]);
  const nameOf = useMemo(() => new Map(book.products.map((p) => [p.id, p])), [book.products]);
  const supplierOf = useMemo(() => new Map(book.suppliers.map((s) => [s.id, s.name])), [book.suppliers]);

  const shown = useMemo(() => {
    const needle = fold(q.trim());
    return book.vouchers
      .filter((v) => {
        if (filter === "pending") return v.kind === "out" && v.status === "pending";
        if (filter === "unpaid") return v.kind === "out" && !v.paid && v.status !== "cancelled";
        return filter === "all" || v.kind === filter;
      })
      .filter((v) => !month || v.date.startsWith(month))
      .filter((v) => {
        if (!needle) return true;
        const text = [v.customer, v.phone, v.address, v.note, v.channel, supplierOf.get(v.supplierId), ...v.lines.map((l) => `${nameOf.get(l.productId)?.name} ${nameOf.get(l.productId)?.code}`)].join(" ");
        return fold(text).includes(needle);
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }, [book.vouchers, filter, month, q, nameOf, supplierOf]);

  if (!book.vouchers.length) {
    return (
      <Empty title="Chưa có phiếu nào" text="Ghi phiếu nhập khi lấy hàng về để cộng kho, ghi đơn bán khi chốt đơn để trừ kho và tính lãi.">
        <div className="sh-row-actions">
          <button type="button" className="ce-btn" onClick={() => open({ t: "voucher", kind: "in" })}>
            + Nhập hàng
          </button>
          <button type="button" className="ce-btn primary" onClick={() => open({ t: "voucher", kind: "out" })}>
            + Bán hàng
          </button>
        </div>
      </Empty>
    );
  }

  const sales = shown.filter((v) => v.kind === "out" && v.status !== "cancelled");
  const buys = shown.filter((v) => v.kind === "in");
  return (
    <>
      <div className="sh-toolbar">
        <input className="sh-search" type="search" placeholder="Tìm khách, SĐT, mẫu hàng…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Tìm phiếu" />
        <select value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Tháng">
          <option value="">Mọi tháng</option>
          {months.map((m) => (
            <option key={m} value={m}>
              Tháng {Number(m.slice(5))}/{m.slice(0, 4)}
            </option>
          ))}
        </select>
        <button type="button" className="ce-btn" onClick={() => open({ t: "voucher", kind: "adjust" })}>
          Điều chỉnh kho
        </button>
      </div>
      <div className="sh-chips" role="group" aria-label="Lọc phiếu">
        {FILTERS.map(([id, label]) => (
          <button key={id} type="button" className={filter === id ? "on" : ""} onClick={() => setFilter(id)}>
            {label}
          </button>
        ))}
      </div>
      <p className="sh-muted sh-tally">
        {shown.length} phiếu
        {sales.length > 0 && ` · bán ${money(sales.reduce((s, v) => s + voucherTotal(v), 0))}`}
        {buys.length > 0 && ` · nhập ${money(buys.reduce((s, v) => s + voucherTotal(v), 0))}`}
      </p>

      {shown.length ? (
        <ul className="sh-list">
          {shown.slice(0, limit).map((v) => {
            const who = v.kind === "in" ? supplierOf.get(v.supplierId) || "Nhập hàng" : v.kind === "out" ? v.customer || "Khách lẻ" : v.note || "Điều chỉnh kho";
            const items = v.lines.map((l) => `${qtyText(l.qty)} ${nameOf.get(l.productId)?.name ?? "(đã xoá)"}`).join(", ");
            return (
              <li key={v.id}>
                <button type="button" className={v.status === "cancelled" && v.kind === "out" ? "cancelled" : ""} onClick={() => open({ t: "voucher", id: v.id })}>
                  <span className="sh-list-date">{dmy(v.date).slice(0, 5)}</span>
                  <span className="sh-list-main">
                    <b>
                      <i className={`sh-kind ${v.kind}`}>{KIND_LABEL[v.kind]}</i>
                      {who}
                    </b>
                    <small>{items}</small>
                    <span className="sh-tags">
                      {v.kind === "out" && v.channel && <em>{v.channel}</em>}
                      {v.kind === "out" && v.status !== "done" && <em className={v.status}>{STATUS_LABEL[v.status]}</em>}
                      {v.kind !== "adjust" && !v.paid && v.status !== "cancelled" && <em className="unpaid">{v.kind === "out" ? "Chưa thu" : "Chưa trả"}</em>}
                    </span>
                  </span>
                  {v.kind !== "adjust" && <strong className={v.kind}>{(v.kind === "in" ? "−" : "+") + money(voucherTotal(v))}</strong>}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="sh-muted sh-pad">Không có phiếu nào khớp.</p>
      )}
      {shown.length > limit && (
        <div className="sh-row-actions center">
          <button type="button" className="ce-btn" onClick={() => setLimit(limit + PAGE)}>
            Xem thêm {Math.min(PAGE, shown.length - limit)} phiếu
          </button>
        </div>
      )}
    </>
  );
}
