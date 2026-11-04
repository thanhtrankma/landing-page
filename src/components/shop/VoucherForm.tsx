"use client";

import { useState } from "react";
import { goodsTotal, KIND_LABEL, money, newId, qtyText, STATUS_LABEL, today, type Line, type OrderStatus, type Product, type Voucher, type VoucherKind } from "@/lib/shop/types";
import { Field, MoneyInput, Panel, type Sheet, useShop } from "./ui";

// One voucher with several lines: a purchase (nhập), a sale (bán) or a stock correction (điều chỉnh).

const blankLine = (): Line => ({ productId: "", qty: 1, price: 0 });

export default function VoucherForm({ sheet, onClose }: { sheet: Extract<Sheet, { t: "voucher" }>; onClose: () => void }) {
  const { book, stats, update, open, toast } = useShop();
  const existing = book.vouchers.find((v) => v.id === sheet.id);
  const [v, setV] = useState<Voucher>(() => {
    if (existing) return existing;
    const kind: VoucherKind = sheet.kind ?? "out";
    const p = book.products.find((x) => x.id === sheet.productId);
    return {
      id: newId(),
      kind,
      date: today(),
      lines: [p ? { productId: p.id, qty: 1, price: kind === "in" ? p.cost : kind === "out" ? p.price : 0 } : blankLine()],
      supplierId: kind === "in" ? (p?.supplierId ?? "") : "",
      customer: "",
      phone: "",
      address: "",
      channel: kind === "out" ? (book.channels[0] ?? "") : "",
      status: "done",
      paid: true,
      discount: 0,
      fee: 0,
      note: "",
      createdAt: new Date().toISOString(),
    };
  });
  const set = <K extends keyof Voucher>(k: K, val: Voucher[K]) => setV((x) => ({ ...x, [k]: val }));
  const setLine = (i: number, patch: Partial<Line>) => setV((x) => ({ ...x, lines: x.lines.map((l, j) => (j === i ? { ...l, ...patch } : l)) }));

  const priceFor = (p: Product | undefined, kind = v.kind) => (!p ? 0 : kind === "in" ? (stats.get(p.id)?.avgCost && !p.cost ? stats.get(p.id)!.avgCost : p.cost) : kind === "out" ? p.price : 0);
  const pick = (i: number, p: Product | undefined) => {
    setLine(i, { productId: p?.id ?? "", price: priceFor(p) });
    if (p && v.kind === "in" && !v.supplierId && p.supplierId) set("supplierId", p.supplierId);
  };
  const changeKind = (kind: VoucherKind) =>
    setV((x) => ({
      ...x,
      kind,
      lines: x.lines.map((l) => ({ ...l, qty: kind !== "adjust" ? Math.abs(l.qty) || 1 : l.qty, price: priceFor(book.products.find((p) => p.id === l.productId), kind) })),
      channel: kind === "out" ? x.channel || book.channels[0] || "" : x.channel,
    }));

  const products = book.products.filter((p) => !p.archived || v.lines.some((l) => l.productId === p.id));
  const groups = [...new Set(products.map((p) => p.category))];
  const goods = goodsTotal(v);
  const total = v.kind === "out" ? goods - v.discount + v.fee : v.kind === "in" ? goods + v.fee : 0;
  // Stock left before this voucher (excluding its own lines when editing a sale).
  const available = (productId: string) => (stats.get(productId)?.stock ?? 0) + (existing?.kind === "out" && existing.status !== "cancelled" ? existing.lines.filter((l) => l.productId === productId).reduce((n, l) => n + l.qty, 0) : 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = v.lines.filter((l) => l.productId && l.qty !== 0);
    if (!lines.length) return toast("Hãy chọn ít nhất một mẫu hàng và số lượng.", true);
    const out = { ...v, lines, discount: v.kind === "out" ? v.discount : 0, fee: v.kind === "adjust" ? 0 : v.fee };
    update((b) => ({ ...b, vouchers: existing ? b.vouchers.map((x) => (x.id === out.id ? out : x)) : [out, ...b.vouchers] }));
    toast(existing ? "Đã lưu phiếu." : v.kind === "out" ? "Đã ghi đơn bán, kho đã được trừ." : v.kind === "in" ? "Đã ghi phiếu nhập, kho đã được cộng." : "Đã điều chỉnh kho.");
    onClose();
  };

  const remove = () => {
    if (!existing || !confirm("Xoá phiếu này? Số tồn kho sẽ được tính lại.")) return;
    update((b) => ({ ...b, vouchers: b.vouchers.filter((x) => x.id !== existing.id) }));
    onClose();
  };

  const title = existing ? `${KIND_LABEL[v.kind]} · ${v.date.split("-").reverse().join("/")}` : v.kind === "out" ? "Đơn bán hàng" : v.kind === "in" ? "Phiếu nhập hàng" : "Điều chỉnh kho";
  return (
    <Panel
      title={title}
      onClose={onClose}
      wide
      foot={
        <>
          {existing && (
            <button type="button" className="ce-btn ghost danger" onClick={remove}>
              Xoá phiếu
            </button>
          )}
          <span className="sh-grow">{v.kind !== "adjust" && <b className="sh-total">Tổng: {money(total)}</b>}</span>
          <button type="button" className="ce-btn ghost" onClick={onClose}>
            Huỷ
          </button>
          <button type="submit" form="sh-voucher" className="ce-btn primary">
            {existing ? "Lưu phiếu" : v.kind === "out" ? "Ghi đơn bán" : v.kind === "in" ? "Ghi phiếu nhập" : "Lưu điều chỉnh"}
          </button>
        </>
      }
    >
      <form id="sh-voucher" className="sh-form" onSubmit={submit}>
        {!existing && (
          <div className="sh-seg wide" role="radiogroup" aria-label="Loại phiếu">
            {(["out", "in", "adjust"] as VoucherKind[]).map((k) => (
              <button key={k} type="button" role="radio" aria-checked={v.kind === k} className={`${v.kind === k ? "on" : ""} ${k}`} onClick={() => changeKind(k)}>
                {KIND_LABEL[k]}
              </button>
            ))}
          </div>
        )}

        <Field label="Ngày">
          <input type="date" required value={v.date} onChange={(e) => set("date", e.target.value || today())} />
        </Field>
        {v.kind === "in" && (
          <Field label="Nhập từ nguồn">
            <div className="sh-inline">
              <select value={v.supplierId} onChange={(e) => set("supplierId", e.target.value)}>
                <option value="">— Không ghi —</option>
                {book.suppliers.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
              <button type="button" className="ce-btn sm" onClick={() => open({ t: "supplier", onSaved: (id) => set("supplierId", id) })}>
                + Mới
              </button>
            </div>
          </Field>
        )}
        {v.kind === "out" && (
          <Field label="Kênh bán">
            <select value={v.channel} onChange={(e) => set("channel", e.target.value)}>
              {[...new Set([...book.channels, v.channel])].filter(Boolean).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        )}
        {v.kind === "adjust" && <p className="sh-muted">Ghi số dương khi kiểm kho thấy dư, số âm (−) khi hàng hỏng, mất hoặc dùng làm mẫu trưng bày.</p>}

        <div className="sh-lines wide">
          <div className="sh-lines-head" aria-hidden="true">
            <span>Mẫu hàng</span>
            <span>Số lượng</span>
            {v.kind !== "adjust" && <span>{v.kind === "in" ? "Giá nhập" : "Giá bán"}</span>}
            {v.kind !== "adjust" && <span>Thành tiền</span>}
            <span />
          </div>
          {v.lines.map((l, i) => {
            const p = book.products.find((x) => x.id === l.productId);
            const short = v.kind === "out" && p && l.qty > available(p.id);
            return (
              <div key={i} className={`sh-line ${v.kind}`}>
                <div className="sh-line-product">
                  <select aria-label="Mẫu hàng" value={l.productId} onChange={(e) => pick(i, book.products.find((x) => x.id === e.target.value))}>
                    <option value="">— Chọn mẫu —</option>
                    {groups.map((g) => (
                      <optgroup key={g} label={g || "Khác"}>
                        {products
                          .filter((x) => x.category === g)
                          .map((x) => (
                            <option key={x.id} value={x.id}>
                              {x.code ? `${x.code} · ` : ""}
                              {x.name} (tồn {qtyText(stats.get(x.id)?.stock ?? 0)})
                            </option>
                          ))}
                      </optgroup>
                    ))}
                  </select>
                  {short && <small className="bad">Vượt tồn kho: còn {qtyText(available(p.id))}</small>}
                </div>
                <label className="sh-line-qty">
                  <span className="sh-sm-label">SL</span>
                  {v.kind === "adjust" ? (
                    <MoneyInput aria-label="Số lượng" allowNegative value={l.qty} onChange={(n) => setLine(i, { qty: n })} />
                  ) : (
                    <input aria-label="Số lượng" type="number" min={1} step="any" inputMode="decimal" value={l.qty || ""} onChange={(e) => setLine(i, { qty: Math.max(0, Number(e.target.value)) })} />
                  )}
                  {p?.unit && <small>{p.unit}</small>}
                </label>
                {v.kind !== "adjust" && (
                  <label className="sh-line-price">
                    <span className="sh-sm-label">Giá</span>
                    <MoneyInput aria-label="Đơn giá" value={l.price} onChange={(n) => setLine(i, { price: n })} />
                  </label>
                )}
                {v.kind !== "adjust" && <b className="sh-line-sum">{money(l.qty * l.price)}</b>}
                <button type="button" className="sh-x" aria-label="Bỏ dòng" onClick={() => setV((x) => ({ ...x, lines: x.lines.length > 1 ? x.lines.filter((_, j) => j !== i) : [blankLine()] }))}>
                  ×
                </button>
              </div>
            );
          })}
          <div className="sh-row-actions">
            <button type="button" className="ce-btn sm" onClick={() => setV((x) => ({ ...x, lines: [...x.lines, blankLine()] }))}>
              + Thêm dòng
            </button>
            <button
              type="button"
              className="ce-btn ghost sm"
              onClick={() =>
                open({
                  t: "product",
                  onSaved: (p) =>
                    setV((x) => {
                      const line = { productId: p.id, qty: 1, price: x.kind === "in" ? p.cost : x.kind === "out" ? p.price : 0 };
                      const empty = x.lines.findIndex((l) => !l.productId);
                      return { ...x, lines: empty >= 0 ? x.lines.map((l, j) => (j === empty ? line : l)) : [...x.lines, line] };
                    }),
                })
              }
            >
              + Tạo mẫu mới
            </button>
          </div>
        </div>

        {v.kind === "out" && (
          <>
            <Field label="Tên khách">
              <input value={v.customer} onChange={(e) => set("customer", e.target.value)} placeholder="Chị Lan" list="sh-customers" />
              <datalist id="sh-customers">
                {[...new Set(book.vouchers.filter((x) => x.kind === "out" && x.customer).map((x) => x.customer))].slice(0, 200).map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <Field label="Số điện thoại">
              <input
                type="tel"
                value={v.phone}
                onChange={(e) => set("phone", e.target.value)}
                onBlur={() => {
                  // Returning customer: fill the address from their last order.
                  if (v.phone && !v.address) {
                    const last = book.vouchers.find((x) => x.kind === "out" && x.phone === v.phone && x.address);
                    if (last) setV((x) => ({ ...x, address: last.address, customer: x.customer || last.customer }));
                  }
                }}
                placeholder="09…"
              />
            </Field>
            <Field label="Địa chỉ giao" wide>
              <input value={v.address} onChange={(e) => set("address", e.target.value)} placeholder="Số nhà, đường, phường, quận…" />
            </Field>
            <Field label="Trạng thái">
              <select value={v.status} onChange={(e) => set("status", e.target.value as OrderStatus)}>
                {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Thanh toán">
              <select value={v.paid ? "1" : "0"} onChange={(e) => set("paid", e.target.value === "1")}>
                <option value="1">Đã thu tiền</option>
                <option value="0">Chưa thu (COD / nợ)</option>
              </select>
            </Field>
            <Field label="Giảm giá">
              <MoneyInput value={v.discount} onChange={(n) => set("discount", n)} placeholder="0" />
            </Field>
            <Field label="Phí ship khách trả">
              <MoneyInput value={v.fee} onChange={(n) => set("fee", n)} placeholder="0" />
            </Field>
          </>
        )}
        {v.kind === "in" && (
          <>
            <Field label="Phí vận chuyển">
              <MoneyInput value={v.fee} onChange={(n) => set("fee", n)} placeholder="0" />
            </Field>
            <Field label="Thanh toán">
              <select value={v.paid ? "1" : "0"} onChange={(e) => set("paid", e.target.value === "1")}>
                <option value="1">Đã trả tiền</option>
                <option value="0">Chưa trả (nợ nguồn)</option>
              </select>
            </Field>
          </>
        )}
        <Field label={v.kind === "adjust" ? "Lý do" : "Ghi chú"} wide>
          <textarea rows={2} value={v.note} onChange={(e) => set("note", e.target.value)} placeholder={v.kind === "adjust" ? "Kiểm kho cuối tháng, hoa bị gãy cành…" : v.kind === "out" ? "Thiệp ghi lời chúc, giao trước 10h…" : "Số đơn, hàng lỗi đổi trả…"} />
        </Field>
      </form>

      {v.kind === "out" && goods > 0 && (
        <dl className="sh-sum">
          <div>
            <dt>Tiền hàng</dt>
            <dd>{money(goods)}</dd>
          </div>
          {v.discount > 0 && (
            <div>
              <dt>Giảm giá</dt>
              <dd>−{money(v.discount)}</dd>
            </div>
          )}
          {v.fee > 0 && (
            <div>
              <dt>Phí ship</dt>
              <dd>+{money(v.fee)}</dd>
            </div>
          )}
          <div className="total">
            <dt>Khách cần trả</dt>
            <dd>{money(total)}</dd>
          </div>
          <div className="profit">
            <dt>Lãi ước tính</dt>
            <dd>{money(goods - v.discount - v.lines.reduce((s, l) => s + l.qty * (stats.get(l.productId)?.avgCost ?? 0), 0))}</dd>
          </div>
        </dl>
      )}
    </Panel>
  );
}
