"use client";

import { useRef, useState } from "react";
import { bookLedger, goodsTotal, KIND_LABEL, LIMITS, sanitizeBook, saleCost, saleRevenue, statusLabel, today, voucherTotal } from "@/lib/shop/types";
import { csv, download, Field, Panel, useShop } from "./ui";

// Shop name and pick lists, Excel exports, and JSON backup / restore.

const toLines = (s: string) => [...new Set(s.split(/\n|,/).map((x) => x.trim()).filter(Boolean))];

export default function Settings({ onClose }: { onClose: () => void }) {
  const { book, update, toast } = useShop();
  const [shopName, setShopName] = useState(book.shopName);
  const [categories, setCategories] = useState(book.categories.join("\n"));
  const [units, setUnits] = useState(book.units.join("\n"));
  const [channels, setChannels] = useState(book.channels.join("\n"));
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    update((b) => ({
      ...b,
      shopName: shopName.trim(),
      categories: toLines(categories).length ? toLines(categories) : b.categories,
      units: toLines(units).length ? toLines(units) : b.units,
      channels: toLines(channels).length ? toLines(channels) : b.channels,
    }));
    toast("Đã lưu cài đặt.");
    onClose();
  };

  const stamp = today();
  const exportProducts = () => {
    const { stats } = bookLedger(book);
    const supplier = (id: string) => book.suppliers.find((s) => s.id === id)?.name ?? "";
    download(
      csv([
        ["Mã mẫu", "Tên mẫu", "Loại", "Màu", "Kích thước", "Đơn vị", "Giá nhập lần cuối", "Giá vốn bình quân", "Giá bán", "Tồn kho", "Giá trị tồn", "Đã nhập", "Đã bán", "Nguồn hàng", "Ngừng bán", "Ghi chú"],
        ...book.products.map((p) => {
          const s = stats.get(p.id);
          return [p.code, p.name, p.category, p.color, p.size, p.unit, s?.lastPrice || p.cost, Math.round(s?.avgCost ?? p.cost), p.price, s?.stock ?? 0, Math.round(s?.value ?? 0), s?.inQty ?? 0, s?.soldQty ?? 0, supplier(p.supplierId), p.archived ? "x" : "", p.note];
        }),
      ]),
      `mau-hang-ton-kho-${stamp}.csv`,
    );
  };
  const exportVouchers = () => {
    const ledger = bookLedger(book);
    const product = (id: string) => book.products.find((p) => p.id === id);
    const supplier = (id: string) => book.suppliers.find((s) => s.id === id)?.name ?? "";
    const rows = [...book.vouchers]
      .sort((a, b) => a.date.localeCompare(b.date))
      .flatMap((v) =>
        v.lines.map((l, i) => [
          v.date.split("-").reverse().join("/"),
          KIND_LABEL[v.kind],
          v.kind === "in" || v.kind === "order" ? supplier(v.supplierId) : v.customer,
          v.phone,
          v.address,
          v.channel,
          product(l.productId)?.code ?? "",
          product(l.productId)?.name ?? "(đã xoá)",
          l.qty,
          l.price,
          l.qty * l.price,
          // Order-level money on the first line only, so column sums stay right.
          i === 0 ? v.discount : "",
          i === 0 ? v.fee : "",
          i === 0 && v.kind !== "adjust" ? voucherTotal(v) : "",
          i === 0 && v.kind === "out" && v.status !== "cancelled" ? Math.round(saleCost(v, ledger)) : "",
          i === 0 && v.kind === "out" && v.status !== "cancelled" ? Math.round(saleRevenue(v) - saleCost(v, ledger)) : "",
          v.kind === "out" || v.kind === "order" ? statusLabel(v) : "",
          v.kind === "out" || v.kind === "in" ? (v.paid ? "Rồi" : "Chưa") : "",
          v.note,
        ]),
      );
    download(
      csv([["Ngày", "Loại phiếu", "Khách / Nguồn", "SĐT", "Địa chỉ", "Kênh", "Mã mẫu", "Tên mẫu", "Số lượng", "Đơn giá", "Thành tiền", "Giảm giá", "Phí ship", "Tổng phiếu", "Giá vốn đơn", "Lãi gộp", "Trạng thái", "Thanh toán", "Ghi chú"], ...rows]),
      `so-nhap-ban-${stamp}.csv`,
    );
  };
  const backup = () => download(new Blob([JSON.stringify(book)], { type: "application/json" }), `sao-luu-so-hang-${stamp}.json`);

  const restore = async (file: File | undefined) => {
    if (!file) return;
    try {
      if (file.size > LIMITS.bytes) throw new Error("File sao lưu quá lớn.");
      const data = JSON.parse(await file.text());
      if (!data || typeof data !== "object" || !Array.isArray(data.products)) throw new Error("Đây không phải file sao lưu sổ hàng.");
      const next = sanitizeBook(data);
      const msg = `Khôi phục từ “${file.name}”: ${next.products.length} mẫu, ${next.vouchers.length} phiếu, ${next.suppliers.length} nguồn, ${next.notes.length} ghi chú.\n\nToàn bộ dữ liệu hiện tại sẽ bị thay thế. Tiếp tục?`;
      if (!confirm(msg)) return;
      update(() => next);
      toast("Đã khôi phục sổ hàng.");
      onClose();
    } catch (e) {
      toast(e instanceof SyntaxError ? "File không đọc được." : (e as Error).message, true);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const sold = book.vouchers.filter((v) => v.kind === "out").reduce((s, v) => s + goodsTotal(v), 0);
  return (
    <Panel
      title="Cài đặt & dữ liệu"
      onClose={onClose}
      foot={
        <>
          <span className="sh-grow" />
          <button type="button" className="ce-btn ghost" onClick={onClose}>
            Đóng
          </button>
          <button type="submit" form="sh-settings" className="ce-btn primary">
            Lưu cài đặt
          </button>
        </>
      }
    >
      <form id="sh-settings" className="sh-form" onSubmit={submit}>
        <Field label="Tên cửa hàng" wide>
          <input value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="Tiệm hoa sáp …" />
        </Field>
        <Field label="Loại hàng" hint="Mỗi dòng một loại.">
          <textarea rows={5} value={categories} onChange={(e) => setCategories(e.target.value)} />
        </Field>
        <Field label="Đơn vị tính" hint="Mỗi dòng một đơn vị.">
          <textarea rows={5} value={units} onChange={(e) => setUnits(e.target.value)} />
        </Field>
        <Field label="Kênh bán" hint="Mỗi dòng một kênh." wide>
          <textarea rows={3} value={channels} onChange={(e) => setChannels(e.target.value)} />
        </Field>
      </form>

      <div className="sh-history">
        <h3>Xuất Excel</h3>
        <div className="sh-row-actions">
          <button type="button" className="ce-btn sm" onClick={exportProducts} disabled={!book.products.length}>
            Mẫu hàng & tồn kho
          </button>
          <button type="button" className="ce-btn sm" onClick={exportVouchers} disabled={!book.vouchers.length}>
            Sổ nhập – bán
          </button>
        </div>
        <h3>Sao lưu</h3>
        <p className="sh-muted">
          Sổ hàng tự lưu theo tài khoản của bạn. Nên tải file sao lưu định kỳ để cất giữ riêng. Hiện có {book.products.length} mẫu, {book.vouchers.length} phiếu
          {sold > 0 && ` (tổng tiền hàng đã bán ${new Intl.NumberFormat("vi-VN").format(sold)}đ)`}.
        </p>
        <div className="sh-row-actions">
          <button type="button" className="ce-btn sm" onClick={backup}>
            Tải file sao lưu
          </button>
          <button type="button" className="ce-btn ghost sm danger" onClick={() => fileRef.current?.click()}>
            Khôi phục từ file…
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => restore(e.target.files?.[0])} />
        </div>
      </div>
    </Panel>
  );
}
