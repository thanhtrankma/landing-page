"use client";

import { useMemo, useState } from "react";
import { dmy, goodsTotal, KIND_LABEL, money, newId, qtyText, today, type Line, type OrderStatus, type Product, type ShopBook, type Voucher, type VoucherKind } from "@/lib/shop/types";
import { Icon } from "./icons";
import { Field, FlowerMark, fold, MoneyInput, Panel, Seg, type Sheet, Stepper, useShop } from "./ui";

// One voucher with several lines: a sale (bán), a purchase order to a supplier (đặt hàng), a purchase
// (nhập) or a stock correction (điều chỉnh). Works like a till: tap product tiles to fill the cart.
// A purchase order changes no stock; "Hàng đã về" turns it into a prefilled purchase.

const KIND_HINT: Record<VoucherKind, string> = {
  out: "Chạm vào mẫu để thêm vào đơn. Kho tự trừ khi lưu.",
  order: "Lên đơn gửi nguồn hàng. Kho chưa đổi; khi hàng về bấm “Hàng đã về” để tạo phiếu nhập.",
  in: "Chạm vào mẫu vừa lấy về. Kho tự cộng, giá vốn tự tính lại.",
  adjust: "Hàng hỏng, gãy, mất: bấm − để ghi số âm. Kiểm kho thấy dư: bấm +.",
};
const buying = (k: VoucherKind) => k === "in" || k === "order";

/** Writes the voucher, keeping its purchase order's status in step ("in" received from an order). */
function saveVoucher(b: ShopBook, v: Voucher, isNew: boolean): ShopBook {
  const vouchers = isNew ? [v, ...b.vouchers] : b.vouchers.map((x) => (x.id === v.id ? v : x));
  return { ...b, vouchers: v.orderId ? vouchers.map((x) => (x.id === v.orderId ? { ...x, status: "done" } : x)) : vouchers };
}

export default function VoucherForm({ sheet, onClose }: { sheet: Extract<Sheet, { t: "voucher" }>; onClose: () => void }) {
  const { book, stats, update, open, toast, undoable } = useShop();
  const existing = book.vouchers.find((v) => v.id === sheet.id);
  const priceFor = (p: Product | undefined, kind: VoucherKind) => (!p ? 0 : buying(kind) ? p.cost || Math.round(stats.get(p.id)?.avgCost ?? 0) : kind === "out" ? p.price : 0);

  const [v, setV] = useState<Voucher>(() => {
    if (existing) return existing;
    const base: Voucher = {
      id: newId(),
      kind: sheet.kind ?? "out",
      date: today(),
      lines: [],
      supplierId: "",
      customer: "",
      phone: "",
      address: "",
      channel: "",
      status: "done",
      paid: true,
      discount: 0,
      fee: 0,
      note: "",
      orderId: "",
      createdAt: new Date().toISOString(),
    };
    const order = book.vouchers.find((x) => x.id === sheet.fromOrder && x.kind === "order");
    if (order) {
      return { ...base, kind: "in", lines: order.lines.map((l) => ({ ...l })), supplierId: order.supplierId, orderId: order.id, note: order.note };
    }
    const kind = base.kind;
    const picks = (sheet.productIds ?? []).map((id) => book.products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p));
    return {
      ...base,
      lines: picks.map((p) => ({ productId: p.id, qty: kind === "adjust" ? -1 : 1, price: priceFor(p, kind) })),
      supplierId: buying(kind) ? (sheet.supplierId ?? picks.find((p) => p.supplierId)?.supplierId ?? "") : "",
      channel: kind === "out" ? (book.channels[0] ?? "") : "",
      status: kind === "order" ? "pending" : "done",
    };
  });
  const set = <K extends keyof Voucher>(k: K, val: Voucher[K]) => setV((x) => ({ ...x, [k]: val }));
  const setLine = (i: number, patch: Partial<Line>) => setV((x) => ({ ...x, lines: x.lines.map((l, j) => (j === i ? { ...l, ...patch } : l)) }));
  const removeLine = (i: number) => setV((x) => ({ ...x, lines: x.lines.filter((_, j) => j !== i) }));

  /** Adds the product, or one more of it when it is already in the cart. */
  const add = (p: Product) =>
    setV((x) => {
      const step = x.kind === "adjust" ? -1 : 1;
      const i = x.lines.findIndex((l) => l.productId === p.id);
      const lines = i >= 0 ? x.lines.map((l, j) => (j === i ? { ...l, qty: l.qty + step } : l)) : [...x.lines, { productId: p.id, qty: step, price: priceFor(p, x.kind) }];
      const supplierId = buying(x.kind) && !x.supplierId && p.supplierId ? p.supplierId : x.supplierId;
      return { ...x, lines, supplierId };
    });

  const changeKind = (kind: VoucherKind) =>
    setV((x) => ({
      ...x,
      kind,
      lines: x.lines.map((l) => ({ ...l, qty: kind === "adjust" ? -Math.abs(l.qty) : Math.abs(l.qty) || 1, price: priceFor(book.products.find((p) => p.id === l.productId), kind) })),
      channel: kind === "out" ? x.channel || book.channels[0] || "" : x.channel,
      status: kind === "order" ? "pending" : "done",
    }));

  const goods = goodsTotal(v);
  const total = v.kind === "out" ? goods - v.discount + v.fee : v.kind === "in" ? goods + v.fee : v.kind === "order" ? goods : 0;
  const cost = v.lines.reduce((s, l) => s + l.qty * (stats.get(l.productId)?.avgCost ?? 0), 0);
  // Stock before this voucher (adding back its own lines when editing a sale).
  const available = (productId: string) => (stats.get(productId)?.stock ?? 0) + (existing?.kind === "out" && existing.status !== "cancelled" ? existing.lines.filter((l) => l.productId === productId).reduce((n, l) => n + l.qty, 0) : 0);
  const productOf = (id: string) => book.products.find((p) => p.id === id);
  const supplier = book.suppliers.find((s) => s.id === v.supplierId);
  const sourceOrder = v.orderId ? book.vouchers.find((x) => x.id === v.orderId) : undefined;
  const receipt = v.kind === "order" ? book.vouchers.find((x) => x.kind === "in" && x.orderId === v.id) : undefined;

  /** The cleaned voucher, or null (after telling the user) when it has nothing in it. */
  const finished = (): Voucher | null => {
    const lines = v.lines.filter((l) => l.productId && l.qty !== 0);
    if (!lines.length) {
      toast("Hãy chọn ít nhất một mẫu hàng.", true);
      return null;
    }
    return { ...v, lines, discount: v.kind === "out" ? v.discount : 0, fee: v.kind === "out" || v.kind === "in" ? v.fee : 0 };
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const out = finished();
    if (!out) return;
    update((b) => saveVoucher(b, out, !existing));
    toast(
      existing
        ? "Đã lưu phiếu."
        : out.kind === "out"
          ? `Đã ghi đơn ${money(total)}, kho đã được trừ.`
          : out.kind === "order"
            ? "Đã lưu đơn đặt hàng. Khi hàng về, bấm “Hàng về” để nhập kho."
            : out.kind === "in"
              ? out.orderId
                ? "Đã nhập kho, đơn đặt hàng chuyển sang “Đã nhập kho”."
                : "Đã ghi phiếu nhập, kho đã được cộng."
              : "Đã điều chỉnh kho.",
    );
    onClose();
  };

  /** Saves the order as it stands, then opens the purchase voucher prefilled from it. */
  const receive = () => {
    const out = finished();
    if (!out) return;
    update((b) => saveVoucher(b, out, !existing));
    onClose();
    open({ t: "voucher", kind: "in", fromOrder: out.id });
  };

  const remove = () => {
    if (!existing) return;
    const orderId = existing.orderId;
    // Deleting the receipt puts its order back to waiting.
    const reopen = (b: ShopBook, status: OrderStatus) => (orderId ? b.vouchers.map((x) => (x.id === orderId ? { ...x, status } : x)) : b.vouchers);
    update((b) => ({ ...b, vouchers: reopen(b, "pending").filter((x) => x.id !== existing.id) }));
    undoable("Đã xoá phiếu.", () => update((b) => ({ ...b, vouchers: [existing, ...reopen(b, "done")] })));
    onClose();
  };

  /** Text for Zalo / Messenger: the order for the supplier, or the bill for the customer. */
  const message = (withPrices = true) => {
    const lines = v.lines.filter((l) => l.productId);
    if (v.kind === "order") {
      return [
        `ĐƠN ĐẶT HÀNG${book.shopName ? ` – ${book.shopName}` : ""} (${dmy(v.date)})`,
        supplier ? `Gửi: ${supplier.name}` : "",
        "",
        ...lines.map((l, i) => {
          const p = productOf(l.productId);
          const name = [p?.code, p?.name, p?.color, p?.size].filter(Boolean).join(" · ");
          return `${i + 1}. ${name}: ${qtyText(l.qty)} ${p?.unit ?? ""}${withPrices && l.price ? ` × ${money(l.price)} = ${money(l.qty * l.price)}` : ""}`.trim();
        }),
        "",
        withPrices && goods ? `Tổng tạm tính: ${money(goods)}` : "",
        `Tổng số lượng: ${qtyText(lines.reduce((n, l) => n + l.qty, 0))}`,
        v.note ? `Ghi chú: ${v.note}` : "",
        "Nhờ anh/chị xác nhận đơn và báo ngày giao giúp em. Cảm ơn ạ!",
      ]
        .filter((x, i, a) => x || (a[i - 1] && a[i + 1]))
        .join("\n");
    }
    return [
      `Đơn hàng${v.customer ? ` của ${v.customer}` : ""}${book.shopName ? ` – ${book.shopName}` : ""} (${dmy(v.date)})`,
      ...lines.map((l) => `• ${qtyText(l.qty)} ${productOf(l.productId)?.unit ?? ""} ${productOf(l.productId)?.name ?? ""} × ${money(l.price)} = ${money(l.qty * l.price)}`.replace(/\s+/g, " ")),
      v.discount ? `Giảm giá: −${money(v.discount)}` : "",
      v.fee ? `Phí ship: ${money(v.fee)}` : "",
      `Tổng cộng: ${money(total)}`,
      v.address ? `Giao tới: ${v.address}${v.phone ? ` – ${v.phone}` : ""}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  };
  const copy = async (text: string, done: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(done);
    } catch {
      toast("Không sao chép được.", true);
    }
  };
  const [withPrices, setWithPrices] = useState(true);
  const canShare = typeof navigator !== "undefined" && "share" in navigator;
  const zaloPhone = supplier?.phone.replace(/\D/g, "") ?? "";

  const title = existing ? `${KIND_LABEL[v.kind]} · ${dmy(v.date)}` : { out: "Đơn bán hàng", order: "Đơn đặt hàng gửi nguồn", in: "Phiếu nhập hàng", adjust: "Điều chỉnh kho" }[v.kind];
  const saveLabel = existing ? "Lưu" : { out: "Ghi đơn", order: "Lưu đơn đặt", in: v.orderId ? "Nhập kho" : "Ghi phiếu", adjust: "Lưu" }[v.kind];
  return (
    <Panel
      title={title}
      onClose={onClose}
      wide
      foot={
        <>
          {existing && (
            <button type="button" className="ce-btn ghost danger" onClick={remove}>
              Xoá
            </button>
          )}
          <span className="sh-grow">
            {v.kind !== "adjust" && (
              <b className="sh-total">
                {v.kind === "out" ? "Khách trả" : v.kind === "order" ? "Tạm tính" : "Tổng"} {money(total)}
              </b>
            )}
          </span>
          <button type="button" className="ce-btn ghost" onClick={onClose}>
            Huỷ
          </button>
          {v.kind === "order" && v.status === "pending" && (
            <button type="button" className="ce-btn sh-receive" onClick={receive}>
              <Icon name="box" size={18} /> Hàng đã về
            </button>
          )}
          <button type="submit" form="sh-voucher" className="ce-btn primary sh-save-btn">
            <Icon name="check" size={18} />
            {saveLabel}
          </button>
        </>
      }
    >
      <form id="sh-voucher" className="sh-form" onSubmit={submit}>
        {!existing && !v.orderId && (
          <div className="wide">
            <Seg
              label="Loại phiếu"
              value={v.kind}
              onChange={changeKind}
              options={[
                ["out", "Bán hàng", "out"],
                ["order", "Đặt hàng", "order"],
                ["in", "Nhập hàng", "in"],
                ["adjust", "Điều chỉnh"],
              ]}
            />
            <p className="sh-hint">{KIND_HINT[v.kind]}</p>
          </div>
        )}
        {v.orderId && (
          <p className="sh-banner wide">
            <Icon name="receipt" size={18} />
            <span>
              Nhập theo đơn đặt ngày {sourceOrder ? dmy(sourceOrder.date) : "?"}
              {supplier ? ` của ${supplier.name}` : ""}. Sửa số lượng, giá nếu hàng về thiếu hoặc khác đơn, rồi bấm “{saveLabel}”.
            </span>
          </p>
        )}
        {v.kind === "order" && v.status === "done" && (
          <p className="sh-banner ok wide">
            <Icon name="check" size={18} />
            <span>
              Đơn đã nhập kho{receipt ? ` ngày ${dmy(receipt.date)}` : ""}.{" "}
              {receipt && (
                <button type="button" className="lg-link" onClick={() => open({ t: "voucher", id: receipt.id })}>
                  Xem phiếu nhập
                </button>
              )}
            </span>
          </p>
        )}

        <div className="sh-cart wide">
          {v.lines.length ? (
            v.lines.map((l, i) => {
              const p = productOf(l.productId);
              const short = v.kind === "out" && p && l.qty > available(p.id);
              const onOrder = p ? (stats.get(p.id)?.onOrder ?? 0) : 0;
              return (
                <div key={l.productId || i} className={`sh-cart-row ${v.kind}`}>
                  <span className="sh-cart-thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p?.image ? <img src={p.image} alt="" /> : <FlowerMark size={26} />}
                  </span>
                  <span className="sh-cart-name">
                    <b>{p?.name ?? "(mẫu đã xoá)"}</b>
                    <small className={short ? "bad" : ""}>
                      {short
                        ? `Vượt tồn: kho còn ${qtyText(available(p.id))}`
                        : `${p?.code ? `${p.code} · ` : ""}tồn ${qtyText(p ? available(p.id) : 0)} ${p?.unit ?? ""}${v.kind === "order" && onOrder && !existing ? ` · đang đặt ${qtyText(onOrder)}` : ""}`}
                    </small>
                  </span>
                  <Stepper label="Số lượng" value={l.qty} min={v.kind === "adjust" ? -1e6 : 1} onChange={(n) => setLine(i, { qty: n })} />
                  {v.kind !== "adjust" && (
                    <label className="sh-cart-price">
                      <span>{buying(v.kind) ? "Giá nhập" : "Giá bán"}</span>
                      <MoneyInput aria-label="Đơn giá" value={l.price} onChange={(n) => setLine(i, { price: n })} />
                    </label>
                  )}
                  {v.kind !== "adjust" && <b className="sh-cart-sum">{money(l.qty * l.price)}</b>}
                  <button type="button" className="sh-x" aria-label={`Bỏ ${p?.name ?? "dòng"}`} onClick={() => removeLine(i)}>
                    ×
                  </button>
                </div>
              );
            })
          ) : (
            <p className="sh-cart-empty">
              <Icon name="cart" size={22} /> Chưa có mẫu nào. Chạm vào mẫu bên dưới để thêm.
            </p>
          )}
        </div>

        <ProductPicker
          kind={v.kind}
          supplierId={v.supplierId}
          inCart={new Map(v.lines.map((l) => [l.productId, l.qty]))}
          onPick={add}
          onCreate={() => open({ t: "product", onSaved: (p) => add(p) })}
        />

        <Field label={v.kind === "order" ? "Ngày đặt" : "Ngày"}>
          <input type="date" required value={v.date} onChange={(e) => set("date", e.target.value || today())} />
        </Field>
        {buying(v.kind) && (
          <Field label={v.kind === "order" ? "Đặt của nguồn" : "Nhập từ nguồn"}>
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
        {v.kind === "order" && v.status !== "done" && (
          <div className="sh-field">
            <span>Trạng thái</span>
            <Seg<OrderStatus> label="Trạng thái đơn đặt" value={v.status} onChange={(s) => set("status", s)} options={[["pending", "Chờ hàng về"], ["cancelled", "Huỷ đơn", "bad"]]} />
          </div>
        )}

        {v.kind === "out" && (
          <>
            <h3 className="sh-form-title wide">Khách hàng</h3>
            <Field label="Tên khách">
              <input value={v.customer} onChange={(e) => set("customer", e.target.value)} placeholder="Chị Lan" list="sh-customers" autoComplete="off" />
              <datalist id="sh-customers">
                {[...new Set(book.vouchers.filter((x) => x.kind === "out" && x.customer).map((x) => x.customer))].slice(0, 200).map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <Field label="Số điện thoại" hint="Khách cũ: địa chỉ tự điền theo đơn trước.">
              <input
                type="tel"
                value={v.phone}
                onChange={(e) => set("phone", e.target.value)}
                onBlur={() => {
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
            <h3 className="sh-form-title wide">Giao hàng & thanh toán</h3>
            <div className="sh-field">
              <span>Trạng thái</span>
              <Seg<OrderStatus> label="Trạng thái" value={v.status} onChange={(s) => set("status", s)} options={[["pending", "Chờ giao"], ["done", "Đã giao", "ok"], ["cancelled", "Huỷ", "bad"]]} />
            </div>
            <div className="sh-field">
              <span>Tiền hàng</span>
              <Seg label="Thanh toán" value={v.paid ? "1" : "0"} onChange={(x) => set("paid", x === "1")} options={[["1", "Đã thu", "ok"], ["0", "Chưa thu (COD)", "warn"]]} />
            </div>
            <Field label="Giảm giá" hint="Gõ 20k = 20.000đ">
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
            <div className="sh-field">
              <span>Thanh toán</span>
              <Seg label="Thanh toán" value={v.paid ? "1" : "0"} onChange={(x) => set("paid", x === "1")} options={[["1", "Đã trả", "ok"], ["0", "Còn nợ", "warn"]]} />
            </div>
          </>
        )}
        <Field label={v.kind === "adjust" ? "Lý do" : v.kind === "order" ? "Ghi chú cho nguồn" : "Ghi chú"} wide>
          <textarea
            rows={2}
            value={v.note}
            onChange={(e) => set("note", e.target.value)}
            placeholder={
              v.kind === "adjust" ? "Kiểm kho cuối tháng, hoa bị gãy cành…" : v.kind === "out" ? "Thiệp ghi lời chúc, giao trước 10h…" : v.kind === "order" ? "Cần trước ngày 20/11, gói kỹ giúp em…" : "Số đơn, hàng lỗi đổi trả…"
            }
          />
        </Field>
      </form>

      {v.kind === "order" && v.lines.length > 0 && (
        <div className="sh-send">
          <h3>Gửi đơn cho {supplier?.name ?? "nguồn hàng"}</h3>
          <p className="sh-muted">Sao chép rồi dán vào Zalo/Messenger của nguồn hàng{canShare ? ", hoặc bấm Chia sẻ để chọn ứng dụng" : ""}.</p>
          <pre>{message(withPrices)}</pre>
          <label className="sh-check">
            <input type="checkbox" checked={withPrices} onChange={(e) => setWithPrices(e.target.checked)} /> Kèm giá nhập
          </label>
          <div className="sh-row-actions">
            <button type="button" className="ce-btn primary sm" onClick={() => copy(message(withPrices), "Đã sao chép đơn, dán vào Zalo/Messenger để gửi nguồn.")}>
              <Icon name="copy" size={16} /> Sao chép đơn
            </button>
            {canShare && (
              <button type="button" className="ce-btn sm" onClick={() => navigator.share({ text: message(withPrices) }).catch(() => {})}>
                Chia sẻ…
              </button>
            )}
            {zaloPhone && (
              <a className="ce-btn sm" href={`https://zalo.me/${zaloPhone}`} target="_blank" rel="noopener noreferrer">
                Mở Zalo {supplier?.name}
              </a>
            )}
          </div>
        </div>
      )}

      {v.kind === "out" && goods > 0 && (
        <div className="sh-sum-wrap">
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
              <dd>{money(goods - v.discount - cost)}</dd>
            </div>
          </dl>
          <button type="button" className="ce-btn sm" onClick={() => copy(message(), "Đã sao chép, dán vào Zalo/Messenger để gửi khách.")}>
            <Icon name="copy" size={16} /> Sao chép tin nhắn gửi khách
          </button>
        </div>
      )}
    </Panel>
  );
}

/**
 * Searchable tiles of the catalogue. Best sellers first; when buying, the chosen supplier's items come
 * first. A badge shows how many are already in the cart.
 */
function ProductPicker({ kind, supplierId, inCart, onPick, onCreate }: { kind: VoucherKind; supplierId: string; inCart: Map<string, number>; onPick: (p: Product) => void; onCreate: () => void }) {
  const { book, stats } = useShop();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const list = useMemo(() => {
    const needle = fold(q.trim());
    const mine = (p: Product) => (buying(kind) && supplierId && p.supplierId === supplierId ? 1 : 0);
    return book.products
      .filter((p) => !p.archived && (!cat || p.category === cat) && (!needle || fold(`${p.code} ${p.name} ${p.color}`).includes(needle)))
      .sort((a, b) => mine(b) - mine(a) || (stats.get(b.id)?.soldQty ?? 0) - (stats.get(a.id)?.soldQty ?? 0) || a.name.localeCompare(b.name, "vi"));
  }, [book.products, stats, q, cat, kind, supplierId]);
  const cats = book.categories.filter((c) => book.products.some((p) => p.category === c && !p.archived));

  return (
    <div className="sh-picker wide">
      <div className="sh-picker-search">
        <Icon name="search" size={18} />
        <input type="search" placeholder="Tìm mẫu theo tên, mã, màu…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Tìm mẫu hàng" />
      </div>
      {cats.length > 1 && (
        <div className="sh-chips">
          <button type="button" className={!cat ? "on" : ""} onClick={() => setCat("")}>
            Tất cả
          </button>
          {cats.map((c) => (
            <button key={c} type="button" className={cat === c ? "on" : ""} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>
      )}
      <div className="sh-picker-grid">
        {list.map((p) => {
          const s = stats.get(p.id);
          const stock = s?.stock ?? 0;
          const low = p.minStock > 0 && stock <= p.minStock;
          const n = inCart.get(p.id);
          return (
            <button key={p.id} type="button" className={`sh-tile ${n ? "on" : ""}`} onClick={() => onPick(p)} aria-label={`Thêm ${p.name}`}>
              <span className="sh-tile-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.image ? <img src={p.image} alt="" loading="lazy" /> : <FlowerMark size={30} />}
                {n ? <em>{qtyText(n)}</em> : null}
              </span>
              <b>{p.name}</b>
              <small>
                {kind === "adjust" ? "" : `${money(buying(kind) ? p.cost : p.price)} · `}
                <span className={stock <= 0 || (buying(kind) && low) ? "bad" : ""}>tồn {qtyText(stock)}</span>
                {kind === "order" && s?.onOrder ? ` · đặt ${qtyText(s.onOrder)}` : ""}
              </small>
            </button>
          );
        })}
        <button type="button" className="sh-tile sh-tile-new" onClick={onCreate}>
          <span className="sh-tile-img">
            <Icon name="plus" size={26} />
          </span>
          <b>Tạo mẫu mới</b>
          <small>rồi thêm vào phiếu</small>
        </button>
      </div>
      {!list.length && q && <p className="sh-muted">Không thấy mẫu “{q}”.</p>}
    </div>
  );
}
