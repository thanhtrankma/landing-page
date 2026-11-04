// Shared by the browser app and the server: the shape of a shop's book, its sanitizer and the stock math.
// A book is one JSON document per account (table shop_books), saved whole on every change.

export type Product = {
  id: string;
  /** Mã mẫu, e.g. "HS-012". */
  code: string;
  name: string;
  category: string;
  color: string;
  size: string;
  unit: string;
  /** Default purchase price per unit (giá nhập). */
  cost: number;
  /** Default selling price per unit (giá bán). */
  price: number;
  supplierId: string;
  image: string;
  note: string;
  /** Warn when stock falls to this level or below. 0 = no warning. */
  minStock: number;
  /** Ngừng bán: hidden from pickers, kept for history. */
  archived: boolean;
  createdAt: string;
};

export type Supplier = {
  id: string;
  name: string;
  phone: string;
  address: string;
  /** Shop page, Facebook, Zalo, 1688… */
  link: string;
  note: string;
  createdAt: string;
};

export type Line = { productId: string; qty: number; price: number };

/** in = nhập hàng, out = bán hàng, adjust = kiểm kho / hàng hỏng (signed quantities). */
export type VoucherKind = "in" | "out" | "adjust";
export type OrderStatus = "pending" | "done" | "cancelled";

export type Voucher = {
  id: string;
  kind: VoucherKind;
  /** YYYY-MM-DD */
  date: string;
  lines: Line[];
  supplierId: string;
  customer: string;
  phone: string;
  address: string;
  channel: string;
  status: OrderStatus;
  /** Sale: money collected from the customer. Purchase: paid to the supplier. */
  paid: boolean;
  discount: number;
  /** Sale: shipping charged to the customer. Purchase: shipping paid for the goods. */
  fee: number;
  note: string;
  createdAt: string;
};

export type Note = { id: string; title: string; body: string; pinned: boolean; color: string; updatedAt: string };

export type ShopBook = {
  v: 1;
  shopName: string;
  categories: string[];
  units: string[];
  channels: string[];
  products: Product[];
  suppliers: Supplier[];
  vouchers: Voucher[];
  notes: Note[];
};

export const NOTE_COLORS = ["#fff7d6", "#fde7ef", "#e5f4ea", "#e8f5fc", "#efe9fb"];

export const emptyBook = (): ShopBook => ({
  v: 1,
  shopName: "",
  categories: ["Hoa sáp", "Hoa lụa", "Phụ kiện", "Bao bì"],
  units: ["cành", "bó", "giỏ", "hộp", "lọ", "chậu", "cái"],
  channels: ["Facebook", "Zalo", "Shopee", "TikTok Shop", "Tại shop", "Khác"],
  products: [],
  suppliers: [],
  vouchers: [],
  notes: [],
});

export const LIMITS = { products: 3000, suppliers: 500, vouchers: 20000, lines: 60, notes: 1000, bytes: 4_000_000 };

// ───────────── sanitizing ─────────────

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {});
const str = (v: unknown, max = 200) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "").slice(0, max).trim();
const num = (v: unknown, min = 0, max = 1e12) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n * 100) / 100)) : 0;
};
const arr = (v: unknown, max: number): unknown[] => (Array.isArray(v) ? v.slice(0, max) : []);
const id = (v: unknown) => (typeof v === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(v) ? v : "");
const date = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : today());
const iso = (v: unknown) => (typeof v === "string" && !Number.isNaN(Date.parse(v)) ? v.slice(0, 40) : new Date().toISOString());
const list = (v: unknown, fallback: string[]) => {
  const out = [...new Set(arr(v, 40).map((x) => str(x, 40)).filter(Boolean))];
  return out.length ? out : fallback;
};
/** Only our own uploads or plain web links; anything else (data:, javascript:) is dropped. */
const imageUrl = (v: unknown) => {
  const s = str(v, 500);
  return /^(https?:\/\/|\/(?!\/))[^\s"'<>]+$/.test(s) ? s : "";
};
const webLink = (v: unknown) => {
  const s = str(v, 500);
  return /^https?:\/\/[^\s"'<>]+$/.test(s) ? s : "";
};

/** Coerces anything (request body, restored backup) into a valid book, dropping what does not fit. */
export function sanitizeBook(input: unknown): ShopBook {
  const b = obj(input);
  const base = emptyBook();
  const products = arr(b.products, LIMITS.products).map((x): Product => {
    const p = obj(x);
    return {
      id: id(p.id) || newId(),
      code: str(p.code, 40),
      name: str(p.name, 160) || "Chưa đặt tên",
      category: str(p.category, 40),
      color: str(p.color, 60),
      size: str(p.size, 60),
      unit: str(p.unit, 20),
      cost: num(p.cost),
      price: num(p.price),
      supplierId: id(p.supplierId),
      image: imageUrl(p.image),
      note: str(p.note, 2000),
      minStock: num(p.minStock, 0, 1e6),
      archived: p.archived === true,
      createdAt: iso(p.createdAt),
    };
  });
  const suppliers = arr(b.suppliers, LIMITS.suppliers).map((x): Supplier => {
    const s = obj(x);
    return {
      id: id(s.id) || newId(),
      name: str(s.name, 120) || "Chưa đặt tên",
      phone: str(s.phone, 40),
      address: str(s.address, 300),
      link: webLink(s.link),
      note: str(s.note, 2000),
      createdAt: iso(s.createdAt),
    };
  });
  const vouchers = arr(b.vouchers, LIMITS.vouchers).map((x): Voucher => {
    const v = obj(x);
    const kind: VoucherKind = v.kind === "in" || v.kind === "adjust" ? v.kind : "out";
    const status: OrderStatus = v.status === "pending" || v.status === "cancelled" ? v.status : "done";
    return {
      id: id(v.id) || newId(),
      kind,
      date: date(v.date),
      lines: arr(v.lines, LIMITS.lines)
        .map((l) => obj(l))
        .map((l) => ({ productId: id(l.productId), qty: num(l.qty, kind === "adjust" ? -1e6 : 0, 1e6), price: num(l.price) }))
        .filter((l) => l.productId && l.qty !== 0),
      supplierId: id(v.supplierId),
      customer: str(v.customer, 120),
      phone: str(v.phone, 40),
      address: str(v.address, 300),
      channel: str(v.channel, 40),
      status,
      paid: v.paid !== false,
      discount: num(v.discount),
      fee: num(v.fee),
      note: str(v.note, 2000),
      createdAt: iso(v.createdAt),
    };
  });
  const notes = arr(b.notes, LIMITS.notes).map((x): Note => {
    const n = obj(x);
    return {
      id: id(n.id) || newId(),
      title: str(n.title, 160),
      body: str(n.body, 10000),
      pinned: n.pinned === true,
      color: NOTE_COLORS.includes(String(n.color)) ? String(n.color) : NOTE_COLORS[0],
      updatedAt: iso(n.updatedAt),
    };
  });
  return {
    v: 1,
    shopName: str(b.shopName, 80),
    categories: list(b.categories, base.categories),
    units: list(b.units, base.units),
    channels: list(b.channels, base.channels),
    products,
    suppliers,
    vouchers,
    notes,
  };
}

// ───────────── helpers ─────────────

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

/** Local calendar date as YYYY-MM-DD. */
export function today(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const vnd = new Intl.NumberFormat("vi-VN");
export const money = (n: number) => `${vnd.format(Math.round(n))}đ`;
export const qtyText = (n: number) => vnd.format(n);
/** "2026-11-03" → "03/11/2026" */
export const dmy = (d: string) => d.split("-").reverse().join("/");

export const goodsTotal = (v: Voucher) => v.lines.reduce((s, l) => s + l.qty * l.price, 0);
/** Money changing hands: what the customer pays, or what the purchase cost in total. */
export const voucherTotal = (v: Voucher) => (v.kind === "out" ? goodsTotal(v) - v.discount + v.fee : v.kind === "in" ? goodsTotal(v) + v.fee : 0);
/** Revenue from the goods themselves (shipping passes through). */
export const saleRevenue = (v: Voucher) => goodsTotal(v) - v.discount;
/** Cancelled orders never touched the stock. */
export const counts = (v: Voucher) => !(v.kind === "out" && v.status === "cancelled");

export type ProductStats = { stock: number; inQty: number; soldQty: number; avgCost: number; revenue: number; lastIn: string; lastOut: string };

/** Stock, weighted-average purchase cost and sales per product, from every voucher. */
export function productStats(book: ShopBook): Map<string, ProductStats> {
  const map = new Map<string, ProductStats & { costSum: number }>();
  for (const p of book.products) map.set(p.id, { stock: 0, inQty: 0, soldQty: 0, avgCost: p.cost, revenue: 0, lastIn: "", lastOut: "", costSum: 0 });
  for (const v of book.vouchers) {
    if (!counts(v)) continue;
    const goods = goodsTotal(v);
    for (const l of v.lines) {
      const s = map.get(l.productId);
      if (!s) continue;
      if (v.kind === "in") {
        s.stock += l.qty;
        s.inQty += l.qty;
        s.costSum += l.qty * l.price;
        if (v.date > s.lastIn) s.lastIn = v.date;
      } else if (v.kind === "out") {
        s.stock -= l.qty;
        s.soldQty += l.qty;
        // Spread the order discount over its lines by value.
        s.revenue += goods ? l.qty * l.price * (1 - v.discount / goods) : 0;
        if (v.date > s.lastOut) s.lastOut = v.date;
      } else s.stock += l.qty;
    }
  }
  for (const s of map.values()) if (s.inQty > 0) s.avgCost = s.costSum / s.inQty;
  return map;
}

/** Cost of the goods in a sale, at each product's average purchase cost. */
export const saleCost = (v: Voucher, stats: Map<string, ProductStats>) => v.lines.reduce((s, l) => s + l.qty * (stats.get(l.productId)?.avgCost ?? 0), 0);

export const KIND_LABEL: Record<VoucherKind, string> = { in: "Nhập hàng", out: "Bán hàng", adjust: "Điều chỉnh kho" };
export const STATUS_LABEL: Record<OrderStatus, string> = { pending: "Chờ giao", done: "Hoàn thành", cancelled: "Đã huỷ" };
