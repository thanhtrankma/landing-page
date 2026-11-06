"use client";

import { useMemo, useState } from "react";
import { counts, dmy, money, qtyText, saleCost, saleRevenue, today, voucherTotal, type Voucher } from "@/lib/shop/types";
import type { Tab } from "./ShopApp";
import { Icon } from "./icons";
import { FlowerMark, type Sheet, useShop } from "./ui";

// Month at a glance: sales, profit, purchases, stock value, low stock, best sellers and open orders.

const monthOf = (d: string) => d.slice(0, 7);
const monthLabel = (m: string) => `Tháng ${Number(m.slice(5))}/${m.slice(0, 4)}`;
const shiftMonth = (m: string, by: number) => {
  const d = new Date(Number(m.slice(0, 4)), Number(m.slice(5)) - 1 + by, 1);
  return today(d).slice(0, 7);
};

export default function Overview({ go }: { go: (t: Tab) => void }) {
  const { book, stats, open, update, undoable } = useShop();
  const [month, setMonth] = useState(() => today().slice(0, 7));

  const sum = useMemo(() => {
    const sales = book.vouchers.filter((v) => v.kind === "out" && counts(v));
    const inMonth = (v: Voucher) => monthOf(v.date) === month;
    const monthSales = sales.filter(inMonth);
    const revenue = monthSales.reduce((s, v) => s + saleRevenue(v), 0);
    const cost = monthSales.reduce((s, v) => s + saleCost(v, stats), 0);
    const bought = book.vouchers.filter((v) => v.kind === "in" && inMonth(v)).reduce((s, v) => s + voucherTotal(v), 0);
    const stockValue = book.products.reduce((s, p) => s + Math.max(0, stats.get(p.id)?.stock ?? 0) * (stats.get(p.id)?.avgCost ?? p.cost), 0);
    const owed = sales.filter((v) => !v.paid);
    const pending = sales.filter((v) => v.status === "pending").sort((a, b) => a.date.localeCompare(b.date));
    const low = book.products
      .filter((p) => !p.archived && p.minStock > 0 && (stats.get(p.id)?.stock ?? 0) <= p.minStock)
      .sort((a, b) => (stats.get(a.id)?.stock ?? 0) - (stats.get(b.id)?.stock ?? 0));
    const sold = new Map<string, { qty: number; revenue: number }>();
    for (const v of monthSales) {
      const goods = v.lines.reduce((s, l) => s + l.qty * l.price, 0);
      for (const l of v.lines) {
        const r = sold.get(l.productId) ?? { qty: 0, revenue: 0 };
        r.qty += l.qty;
        r.revenue += goods ? l.qty * l.price * (1 - v.discount / goods) : 0;
        sold.set(l.productId, r);
      }
    }
    const best = [...sold.entries()].sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5);
    const months = Array.from({ length: 6 }, (_, i) => shiftMonth(month, i - 5)).map((m) => {
      const list = sales.filter((v) => monthOf(v.date) === m);
      const rev = list.reduce((s, v) => s + saleRevenue(v), 0);
      return { m, orders: list.length, revenue: rev, profit: rev - list.reduce((s, v) => s + saleCost(v, stats), 0) };
    });
    return { orders: monthSales.length, revenue, profit: revenue - cost, bought, stockValue, owed, owedTotal: owed.reduce((s, v) => s + voucherTotal(v), 0), pending, low, best, months };
  }, [book, stats, month]);

  const product = (id: string) => book.products.find((p) => p.id === id);
  const delivered = (v: Voucher) => {
    update((b) => ({ ...b, vouchers: b.vouchers.map((x) => (x.id === v.id ? { ...x, status: "done" } : x)) }));
    undoable(`Đơn của ${v.customer || "khách"}: đã giao.`, () => update((b) => ({ ...b, vouchers: b.vouchers.map((x) => (x.id === v.id ? { ...x, status: v.status } : x)) })));
  };

  const steps: [done: boolean, title: string, text: string, sheet: Sheet][] = [
    [book.products.length > 0, "Thêm mẫu hàng", "Ảnh, mã, giá nhập, giá bán của từng mẫu hoa.", { t: "product" }],
    [book.vouchers.some((v) => v.kind === "in"), "Ghi phiếu nhập", "Số lượng đang có hoặc vừa lấy về, để có tồn kho.", { t: "voucher", kind: "in" }],
    [book.vouchers.some((v) => v.kind === "out"), "Ghi đơn bán đầu tiên", "Chạm chọn mẫu, kho tự trừ, lãi tự tính.", { t: "voucher", kind: "out" }],
    [book.suppliers.length > 0, "Lưu nguồn hàng", "Số điện thoại, Zalo, link của chỗ lấy hàng (không bắt buộc).", { t: "supplier" }],
  ];
  const next = steps.findIndex(([done]) => !done);
  const checklist = steps.slice(0, 3).every(([done]) => done) ? null : (
    <div className="sh-start">
      <div className="sh-start-head">
        <FlowerMark size={40} />
        <div>
          <h2>Bắt đầu với sổ hàng</h2>
          <p>
            Xong {steps.filter(([d]) => d).length}/{steps.length} bước. Mỗi bước chỉ mất một phút.
          </p>
        </div>
      </div>
      <ol>
        {steps.map(([done, title, text, sheet], i) => (
          <li key={title} className={done ? "done" : i === next ? "next" : ""}>
            <span className="sh-start-dot">{done ? <Icon name="check" size={16} /> : i + 1}</span>
            <span>
              <b>{title}</b>
              <small>{text}</small>
            </span>
            {!done && (
              <button type="button" className={`ce-btn sm ${i === next ? "primary" : ""}`} onClick={() => open(sheet)}>
                Làm ngay
              </button>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
  if (!book.products.length && !book.vouchers.length) return checklist;

  const margin = sum.revenue ? Math.round((sum.profit / sum.revenue) * 100) : 0;
  return (
    <div className="sh-overview">
      {checklist}
      <div className="sh-month">
        <button type="button" className="ce-btn ghost sm" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Tháng trước">
          ‹
        </button>
        <b>{monthLabel(month)}</b>
        <button type="button" className="ce-btn ghost sm" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Tháng sau">
          ›
        </button>
      </div>

      <div className="sh-kpis">
        <div className="sh-kpi">
          <span>Doanh thu</span>
          <b>{money(sum.revenue)}</b>
          <small>{sum.orders} đơn bán</small>
        </div>
        <div className="sh-kpi good">
          <span>Lãi gộp</span>
          <b>{money(sum.profit)}</b>
          <small>{sum.revenue ? `${margin}% doanh thu` : "Chưa có đơn"}</small>
        </div>
        <div className="sh-kpi">
          <span>Tiền nhập hàng</span>
          <b>{money(sum.bought)}</b>
          <small>trong tháng</small>
        </div>
        <div className="sh-kpi">
          <span>Giá trị tồn kho</span>
          <b>{money(sum.stockValue)}</b>
          <small>theo giá vốn, hiện tại</small>
        </div>
        <div className={`sh-kpi ${sum.owedTotal ? "warn" : ""}`}>
          <span>Chưa thu tiền</span>
          <b>{money(sum.owedTotal)}</b>
          <small>{sum.owed.length} đơn, mọi thời điểm</small>
        </div>
      </div>

      <div className="sh-cols">
        <div className="sh-box">
          <h3>Đơn chờ giao {sum.pending.length > 0 && <em>{sum.pending.length}</em>}</h3>
          {sum.pending.length ? (
            <ul className="sh-mini">
              {sum.pending.slice(0, 8).map((v) => (
                <li key={v.id} className="sh-mini-act">
                  <button type="button" onClick={() => open({ t: "voucher", id: v.id })}>
                    <span>
                      <b>{v.customer || "Khách lẻ"}</b>
                      <small>
                        {dmy(v.date)} · {v.lines.map((l) => `${qtyText(l.qty)} ${product(l.productId)?.name ?? "?"}`).join(", ")}
                      </small>
                    </span>
                    <strong>{money(voucherTotal(v))}</strong>
                  </button>
                  <button type="button" className="ce-btn sm" onClick={() => delivered(v)} aria-label={`Đánh dấu đơn của ${v.customer || "khách lẻ"} đã giao`}>
                    <Icon name="check" size={16} /> Đã giao
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="sh-muted">Không có đơn nào đang chờ.</p>
          )}
        </div>

        <div className="sh-box">
          <h3>Sắp hết hàng {sum.low.length > 0 && <em className="warn">{sum.low.length}</em>}</h3>
          {sum.low.length ? (
            <ul className="sh-mini">
              {sum.low.slice(0, 8).map((p) => (
                <li key={p.id}>
                  <button type="button" onClick={() => open({ t: "product", id: p.id })}>
                    <span>
                      <b>{p.name}</b>
                      <small>
                        {p.code && `${p.code} · `}báo khi còn ≤ {qtyText(p.minStock)}
                      </small>
                    </span>
                    <strong className="bad">
                      còn {qtyText(stats.get(p.id)?.stock ?? 0)} {p.unit}
                    </strong>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="sh-muted">Chưa có mẫu nào dưới mức cảnh báo. Đặt mức cảnh báo trong từng mẫu hàng.</p>
          )}
        </div>

        <div className="sh-box">
          <h3>Bán chạy trong tháng</h3>
          {sum.best.length ? (
            <ul className="sh-mini">
              {sum.best.map(([id, r], i) => (
                <li key={id}>
                  <button type="button" onClick={() => open({ t: "product", id })}>
                    <span>
                      <b>
                        {i + 1}. {product(id)?.name ?? "(đã xoá)"}
                      </b>
                      <small>
                        {qtyText(r.qty)} {product(id)?.unit}
                      </small>
                    </span>
                    <strong>{money(r.revenue)}</strong>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="sh-muted">Chưa có đơn bán trong tháng này.</p>
          )}
        </div>

        <div className="sh-box">
          <h3>6 tháng gần nhất</h3>
          <table className="sh-table">
            <thead>
              <tr>
                <th>Tháng</th>
                <th>Đơn</th>
                <th>Doanh thu</th>
                <th>Lãi gộp</th>
              </tr>
            </thead>
            <tbody>
              {sum.months.map((r) => (
                <tr key={r.m} className={r.m === month ? "on" : ""}>
                  <td>
                    {r.m.slice(5)}/{r.m.slice(2, 4)}
                  </td>
                  <td>{r.orders}</td>
                  <td>{money(r.revenue)}</td>
                  <td>{money(r.profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className="ce-btn ghost sm" onClick={() => go("vouchers")}>
            Xem sổ nhập – bán →
          </button>
        </div>
      </div>
    </div>
  );
}
