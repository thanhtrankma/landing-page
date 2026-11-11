"use client";

import { useMemo, useRef, useState } from "react";
import { uploadFile } from "@/lib/upload-client";
import { dmy, KIND_LABEL, lineKey, money, newId, qtyText, statusLabel, today, type Product } from "@/lib/shop/types";
import { Icon } from "./icons";
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
              <div key={p.id} className="sh-card">
                <button type="button" className="sh-card-open" onClick={() => open({ t: "product", id: p.id })}>
                  <span className="sh-thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.image ? <img src={p.image} alt="" loading="lazy" /> : <FlowerMark size={52} />}
                    <span className={`sh-stock ${stock <= 0 ? "out" : low ? "low" : ""}`}>
                      {stock <= 0 ? "Hết hàng" : `Tồn ${qtyText(stock)}`}
                    </span>
                  </span>
                  <span className="sh-card-body">
                    <small>{[p.code, p.category].filter(Boolean).join(" · ")}</small>
                    <b>{p.name}</b>
                    {(p.color || p.size) && <small>{[p.color, p.size].filter(Boolean).join(" · ")}</small>}
                    <span className="sh-prices">
                      <strong>{money(p.price)}</strong>
                      <span title={s?.estimated ? "Giá nhập dự kiến, chưa có phiếu nhập" : "Giá vốn bình quân, đã gồm ship nhập"}>
                        vốn {s?.estimated ? "~" : ""}
                        {money(s?.avgCost ?? p.cost)}
                      </span>
                    </span>
                    {supplier && <small className="sh-src">Nguồn: {supplier.name}</small>}
                  </span>
                </button>
                <div className="sh-card-actions">
                  <button type="button" onClick={() => open({ t: "voucher", kind: "in", productIds: [p.id] })}>
                    <Icon name="box" size={16} /> Nhập
                  </button>
                  <button type="button" className="out" onClick={() => open({ t: "voucher", kind: "out", productIds: [p.id] })} disabled={stock <= 0} title={stock <= 0 ? "Hết hàng" : undefined}>
                    <Icon name="cart" size={16} /> Bán
                  </button>
                </div>
              </div>
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
  const { book, stats, ledger, update, open, toast, undoable } = useShop();
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
    update((b) => ({ ...b, products: b.products.filter((x) => x.id !== existing.id) }));
    undoable(`Đã xoá mẫu “${existing.name}”.`, () => update((b) => ({ ...b, products: [existing, ...b.products] })));
    onClose();
  };

  // Before any purchase the expected price stands in for the cost; after, the moving average does.
  const bought = Boolean(s && !s.estimated);
  const unitCost = bought ? s!.avgCost : p.cost;
  const profit = p.price - unitCost;
  const lastSupplier = bought ? book.suppliers.find((x) => x.id === s!.lastSupplierId)?.name : "";
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
            <span>{bought ? "Giá vốn BQ" : "Giá vốn"}</span>
            <b title={bought ? "Bình quân sau mỗi lần nhập, đã gồm phí ship nhập" : undefined}>{bought ? money(s.avgCost) : "Chưa nhập"}</b>
          </div>
          {s.lost > 0 && (
            <div title="Giá vốn của hàng hỏng, mất đã ghi bằng phiếu điều chỉnh kho">
              <span>Hao hụt</span>
              <b className="bad">{money(s.lost)}</b>
            </div>
          )}
          {s.onOrder > 0 && (
            <div>
              <span>Đang đặt</span>
              <b>{qtyText(s.onOrder)}</b>
            </div>
          )}
          <div className="sh-pstats-actions">
            <button type="button" className="ce-btn sm" onClick={() => open({ t: "voucher", kind: "order", productIds: [existing.id] })}>
              + Đặt hàng
            </button>
            <button type="button" className="ce-btn sm" onClick={() => open({ t: "voucher", kind: "in", productIds: [existing.id] })}>
              + Nhập thêm
            </button>
            <button type="button" className="ce-btn primary sm" onClick={() => open({ t: "voucher", kind: "out", productIds: [existing.id] })}>
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
        {bought ? (
          <div className="sh-field sh-costbox">
            <span>Giá nhập & giá vốn</span>
            <dl>
              <dt>Nhập lần cuối</dt>
              <dd>
                <b>{money(s!.lastPrice)}</b>
                <small>
                  {dmy(s!.lastIn)}
                  {lastSupplier ? ` · ${lastSupplier}` : ""}
                </small>
              </dd>
              {s!.minPrice !== s!.maxPrice && (
                <>
                  <dt>Từng nhập</dt>
                  <dd>
                    {money(s!.minPrice)} – {money(s!.maxPrice)}
                  </dd>
                </>
              )}
              <dt>Giá vốn bình quân</dt>
              <dd>
                <b>{money(s!.avgCost)}</b>
                <small>đã gồm ship nhập</small>
              </dd>
            </dl>
            <small>Tự tính từ các phiếu nhập. Muốn sửa giá, mở phiếu nhập trong lịch sử bên dưới.</small>
          </div>
        ) : (
          <Field label="Giá nhập dự kiến (mỗi đơn vị)" hint="Chỉ để điền sẵn khi lên đơn và ước tính lãi. Có phiếu nhập rồi, giá vốn tự tính từ phiếu. Gõ 120k = 120.000đ">
            <MoneyInput value={p.cost} onChange={(n) => set("cost", n)} placeholder="0" />
          </Field>
        )}
        <Field label="Giá bán (mỗi đơn vị)" hint={p.price > 0 && (bought || p.cost > 0) ? `${bought ? "Lãi" : "Lãi dự kiến"} ${money(profit)} / ${p.unit || "đv"} (${Math.round((profit / p.price) * 100)}%)` : undefined}>
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
                const who = v.kind === "in" || v.kind === "order" ? book.suppliers.find((x) => x.id === v.supplierId)?.name : v.kind === "out" ? v.customer : v.note;
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
                          {v.kind === "in" && ledger.lines.get(lineKey(v.id, existing.id)) ? ` · vốn BQ sau: ${money(ledger.lines.get(lineKey(v.id, existing.id))!.avgAfter)}` : ""}
                          {v.kind === "out" && v.status === "cancelled" ? " · đã huỷ" : ""}
                          {v.kind === "order" ? ` · ${statusLabel(v).toLowerCase()}` : ""}
                        </small>
                      </span>
                      <strong className={v.kind === "out" || v.kind === "order" ? "" : qty < 0 ? "bad" : "good"}>
                        {v.kind === "order" ? "đặt " : v.kind === "out" ? "−" : qty > 0 ? "+" : ""}
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
