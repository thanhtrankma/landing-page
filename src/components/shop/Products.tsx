"use client";

import { useMemo, useRef, useState } from "react";
import { uploadFile } from "@/lib/upload-client";
import { dmy, KIND_LABEL, money, newId, qtyText, today, type Product } from "@/lib/shop/types";
import { Empty, Field, FlowerMark, fold, MoneyInput, Panel, type Sheet, useShop } from "./ui";

// Mẫu hàng: catalogue with photo, prices, source and live stock; the form also shows the item's history.

type Sort = "new" | "name" | "stock" | "sold";

export default function Products() {
  const { book, stats, open } = useShop();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [sort, setSort] = useState<Sort>("new");
  const [archived, setArchived] = useState(false);

  const shown = useMemo(() => {
    const needle = fold(q.trim());
    const list = book.products.filter(
      (p) => p.archived === archived && (!cat || p.category === cat) && (!needle || fold(`${p.code} ${p.name} ${p.color} ${p.size} ${p.note}`).includes(needle)),
    );
    const st = (p: Product) => stats.get(p.id);
    const by: Record<Sort, (a: Product, b: Product) => number> = {
      new: (a, b) => b.createdAt.localeCompare(a.createdAt),
      name: (a, b) => a.name.localeCompare(b.name, "vi"),
      stock: (a, b) => (st(a)?.stock ?? 0) - (st(b)?.stock ?? 0),
      sold: (a, b) => (st(b)?.soldQty ?? 0) - (st(a)?.soldQty ?? 0),
    };
    return list.sort(by[sort]);
  }, [book.products, stats, q, cat, sort, archived]);

  if (!book.products.length) {
    return (
      <Empty title="Chưa có mẫu hàng" text="Thêm từng mẫu hoa sáp, hoa lụa bạn bán: ảnh, mã mẫu, giá nhập, giá bán và nơi lấy hàng.">
        <button type="button" className="ce-btn primary" onClick={() => open({ t: "product" })}>
          + Thêm mẫu hàng
        </button>
      </Empty>
    );
  }

  const archivedCount = book.products.filter((p) => p.archived).length;
  return (
    <>
      <div className="sh-toolbar">
        <input className="sh-search" type="search" placeholder="Tìm mã, tên, màu…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Tìm mẫu hàng" />
        <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sắp xếp">
          <option value="new">Mới thêm</option>
          <option value="name">Tên A–Z</option>
          <option value="stock">Tồn ít nhất</option>
          <option value="sold">Bán nhiều nhất</option>
        </select>
        <button type="button" className="ce-btn primary" onClick={() => open({ t: "product", category: cat || undefined })}>
          + Mẫu mới
        </button>
      </div>
      <div className="sh-chips" role="group" aria-label="Lọc theo loại">
        <button type="button" className={!cat ? "on" : ""} onClick={() => setCat("")}>
          Tất cả
        </button>
        {book.categories.map((c) => (
          <button key={c} type="button" className={cat === c ? "on" : ""} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
        {archivedCount > 0 && (
          <button type="button" className={archived ? "on" : ""} onClick={() => setArchived(!archived)}>
            Ngừng bán ({archivedCount})
          </button>
        )}
      </div>

      {shown.length ? (
        <div className="sh-grid">
          {shown.map((p) => {
            const s = stats.get(p.id);
            const stock = s?.stock ?? 0;
            const low = p.minStock > 0 && stock <= p.minStock;
            const supplier = book.suppliers.find((x) => x.id === p.supplierId);
            return (
              <button key={p.id} type="button" className="sh-card" onClick={() => open({ t: "product", id: p.id })}>
                <div className="sh-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.image ? <img src={p.image} alt="" loading="lazy" /> : <FlowerMark size={52} />}
                  <span className={`sh-stock ${stock <= 0 ? "out" : low ? "low" : ""}`}>
                    {stock <= 0 ? "Hết hàng" : `Tồn ${qtyText(stock)}`}
                  </span>
                </div>
                <div className="sh-card-body">
                  <small>{[p.code, p.category].filter(Boolean).join(" · ")}</small>
                  <b>{p.name}</b>
                  {(p.color || p.size) && <small>{[p.color, p.size].filter(Boolean).join(" · ")}</small>}
                  <div className="sh-prices">
                    <strong>{money(p.price)}</strong>
                    <span>vốn {money(s?.avgCost ?? p.cost)}</span>
                  </div>
                  {supplier && <small className="sh-src">Nguồn: {supplier.name}</small>}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="sh-muted sh-pad">Không có mẫu nào khớp.</p>
      )}
    </>
  );
}

/** Next free code for a category: "Hoa sáp" → HS-001, HS-002… */
function suggestCode(products: Product[], category: string) {
  const prefix =
    fold(category)
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 3) || "SP";
  const re = new RegExp(`^${prefix}-(\\d+)$`);
  const max = products.reduce((m, p) => Math.max(m, Number(re.exec(p.code)?.[1] ?? 0)), 0);
  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

export function ProductForm({ sheet, onClose }: { sheet: Extract<Sheet, { t: "product" }>; onClose: () => void }) {
  const { book, stats, update, open, toast } = useShop();
  const existing = book.products.find((p) => p.id === sheet.id);
  const [p, setP] = useState<Product>(() => {
    if (existing) return existing;
    const category = sheet.category ?? book.categories[0] ?? "";
    return {
      id: newId(),
      code: suggestCode(book.products, category),
      name: "",
      category,
      color: "",
      size: "",
      unit: book.units[0] ?? "",
      cost: 0,
      price: 0,
      supplierId: "",
      image: "",
      note: "",
      minStock: 0,
      archived: false,
      createdAt: new Date().toISOString(),
    };
  });
  const [uploading, setUploading] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((x) => ({ ...x, [k]: v }));

  const s = existing ? stats.get(existing.id) : undefined;
  const history = existing
    ? book.vouchers
        .filter((v) => v.lines.some((l) => l.productId === existing.id))
        .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    : [];

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    setUploading(0.01);
    try {
      const r = await uploadFile(file, "image", { onProgress: (x) => setUploading(Math.max(0.01, x)) });
      set("image", r.url);
    } catch (e) {
      toast((e as Error).message || "Không tải được ảnh.", true);
    } finally {
      setUploading(0);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!p.name.trim()) return toast("Hãy nhập tên mẫu.", true);
    const clash = book.products.find((x) => x.id !== p.id && p.code.trim() && x.code.trim().toLowerCase() === p.code.trim().toLowerCase());
    if (clash) return toast(`Mã ${p.code} đã dùng cho “${clash.name}”.`, true);
    update((b) => ({ ...b, products: existing ? b.products.map((x) => (x.id === p.id ? p : x)) : [p, ...b.products] }));
    toast(existing ? "Đã lưu mẫu hàng." : "Đã thêm mẫu hàng.");
    sheet.onSaved?.(p);
    onClose();
  };

  const remove = () => {
    if (!existing) return;
    if (history.length) return toast("Mẫu đã có phiếu nhập/bán nên không xoá được. Hãy chọn “Ngừng bán” để ẩn mẫu.", true);
    if (!confirm(`Xoá mẫu “${existing.name}”?`)) return;
    update((b) => ({ ...b, products: b.products.filter((x) => x.id !== existing.id) }));
    onClose();
  };

  const profit = p.price - (s?.avgCost ?? p.cost);
  return (
    <Panel
      title={existing ? existing.name : "Thêm mẫu hàng"}
      onClose={onClose}
      wide={Boolean(existing)}
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
          <button type="submit" form="sh-product" className="ce-btn primary" disabled={uploading > 0}>
            {existing ? "Lưu" : "Thêm mẫu"}
          </button>
        </>
      }
    >
      {existing && s && (
        <div className="sh-pstats">
          <div>
            <span>Tồn kho</span>
            <b className={s.stock <= 0 ? "bad" : ""}>
              {qtyText(s.stock)} {p.unit}
            </b>
          </div>
          <div>
            <span>Đã nhập</span>
            <b>{qtyText(s.inQty)}</b>
          </div>
          <div>
            <span>Đã bán</span>
            <b>{qtyText(s.soldQty)}</b>
          </div>
          <div>
            <span>Giá vốn TB</span>
            <b>{money(s.avgCost)}</b>
          </div>
          <div className="sh-pstats-actions">
            <button type="button" className="ce-btn sm" onClick={() => open({ t: "voucher", kind: "in", productId: existing.id })}>
              + Nhập thêm
            </button>
            <button type="button" className="ce-btn primary sm" onClick={() => open({ t: "voucher", kind: "out", productId: existing.id })}>
              + Bán
            </button>
          </div>
        </div>
      )}

      <form id="sh-product" className="sh-form" onSubmit={submit}>
        <div className="sh-photo wide">
          <button type="button" className="sh-photo-box" onClick={() => fileRef.current?.click()} disabled={uploading > 0}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {p.image ? <img src={p.image} alt="Ảnh mẫu" /> : <FlowerMark size={40} />}
            {uploading > 0 && <span className="sh-photo-progress">{Math.round(uploading * 100)}%</span>}
          </button>
          <div>
            <button type="button" className="ce-btn sm" onClick={() => fileRef.current?.click()} disabled={uploading > 0}>
              {p.image ? "Đổi ảnh" : "Thêm ảnh mẫu"}
            </button>
            {p.image && (
              <button type="button" className="ce-btn ghost sm" onClick={() => set("image", "")}>
                Bỏ ảnh
              </button>
            )}
            <small>Ảnh chụp mẫu giúp tìm nhanh và gửi khách. Ảnh được nén tự động.</small>
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onPhoto(e.target.files?.[0])} />
        </div>

        <Field label="Tên mẫu *" wide>
          <input required value={p.name} onChange={(e) => set("name", e.target.value)} placeholder="VD: Bó hồng sáp 9 bông" autoFocus={!existing} />
        </Field>
        <Field label="Loại">
          <select
            value={p.category}
            onChange={(e) => {
              const category = e.target.value;
              // Keep a hand-typed code; refresh the suggested one.
              setP((x) => ({ ...x, category, code: !existing && x.code === suggestCode(book.products, x.category) ? suggestCode(book.products, category) : x.code }));
            }}
          >
            {[...new Set([...book.categories, p.category])].filter(Boolean).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Mã mẫu">
          <input value={p.code} onChange={(e) => set("code", e.target.value)} placeholder="HS-001" />
        </Field>
        <Field label="Màu sắc">
          <input value={p.color} onChange={(e) => set("color", e.target.value)} placeholder="Hồng phấn, trắng kem…" />
        </Field>
        <Field label="Kích thước">
          <input value={p.size} onChange={(e) => set("size", e.target.value)} placeholder="Cao 45cm, size M…" />
        </Field>
        <Field label="Đơn vị tính">
          <input list="sh-units" value={p.unit} onChange={(e) => set("unit", e.target.value)} placeholder="bó, cành…" />
          <datalist id="sh-units">
            {book.units.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
        </Field>
        <Field label="Báo sắp hết khi tồn ≤" hint="Để 0 nếu không cần cảnh báo.">
          <MoneyInput value={p.minStock} onChange={(n) => set("minStock", n)} />
        </Field>
        <Field label="Giá nhập (mỗi đơn vị)">
          <MoneyInput value={p.cost} onChange={(n) => set("cost", n)} placeholder="0" />
        </Field>
        <Field label="Giá bán (mỗi đơn vị)" hint={p.price > 0 ? `Lãi ${money(profit)} / ${p.unit || "đv"} (${Math.round((profit / p.price) * 100)}%)` : undefined}>
          <MoneyInput value={p.price} onChange={(n) => set("price", n)} placeholder="0" />
        </Field>
        <Field label="Nguồn hàng (chỗ lấy hàng)" wide>
          <div className="sh-inline">
            <select value={p.supplierId} onChange={(e) => set("supplierId", e.target.value)}>
              <option value="">— Chưa chọn —</option>
              {book.suppliers.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
            <button type="button" className="ce-btn sm" onClick={() => open({ t: "supplier", onSaved: (id) => set("supplierId", id) })}>
              + Nguồn mới
            </button>
          </div>
        </Field>
        <Field label="Ghi chú" wide>
          <textarea rows={3} value={p.note} onChange={(e) => set("note", e.target.value)} placeholder="Chất liệu, cách bảo quản, mẫu hay bị hỏng ở đâu, khách hay hỏi gì…" />
        </Field>
        {existing && (
          <label className="sh-check wide">
            <input type="checkbox" checked={p.archived} onChange={(e) => set("archived", e.target.checked)} />
            Ngừng bán (ẩn khỏi danh sách chọn, vẫn giữ lịch sử)
          </label>
        )}
      </form>

      {existing && (
        <div className="sh-history">
          <h3>Lịch sử nhập – bán</h3>
          {history.length ? (
            <ul className="sh-mini">
              {history.slice(0, 30).map((v) => {
                const qty = v.lines.filter((l) => l.productId === existing.id).reduce((n, l) => n + l.qty, 0);
                const line = v.lines.find((l) => l.productId === existing.id);
                const who = v.kind === "in" ? book.suppliers.find((x) => x.id === v.supplierId)?.name : v.kind === "out" ? v.customer : v.note;
                return (
                  <li key={v.id}>
                    <button type="button" onClick={() => open({ t: "voucher", id: v.id })}>
                      <span>
                        <b>
                          <i className={`sh-kind ${v.kind}`}>{KIND_LABEL[v.kind]}</i> {who || ""}
                        </b>
                        <small>
                          {dmy(v.date)}
                          {v.kind !== "adjust" && line ? ` · ${money(line.price)}/${p.unit || "đv"}` : ""}
                          {v.kind === "out" && v.status === "cancelled" ? " · đã huỷ" : ""}
                        </small>
                      </span>
                      <strong className={v.kind === "out" ? "" : qty < 0 ? "bad" : "good"}>
                        {v.kind === "out" ? "−" : qty > 0 ? "+" : ""}
                        {qtyText(qty)}
                      </strong>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="sh-muted">Chưa có phiếu nào. Bấm “Nhập thêm” để ghi số lượng đầu tiên.</p>
          )}
          <p className="sh-muted">Thêm vào sổ ngày {dmy(today(new Date(existing.createdAt)))}</p>
        </div>
      )}
    </Panel>
  );
}
