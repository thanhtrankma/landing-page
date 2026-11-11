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

/**
 * in = nhập hàng, out = bán hàng, adjust = kiểm kho / hàng hỏng (signed quantities),
 * order = đơn đặt hàng gửi nguồn: no stock change until it is received as an "in" voucher.
 */
export type VoucherKind = "in" | "out" | "adjust" | "order";
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
  /** On an "in" voucher: the purchase order it received. */
  orderId: string;
  /** Who wrote it, in a shared book (name or email). */
  by: string;
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
    const kind: VoucherKind = v.kind === "in" || v.kind === "adjust" || v.kind === "order" ? v.kind : "out";
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
      orderId: kind === "in" ? id(v.orderId) : "",
      by: str(v.by, 80),
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
export const voucherTotal = (v: Voucher) => (v.kind === "out" ? goodsTotal(v) - v.discount + v.fee : v.kind === "in" ? goodsTotal(v) + v.fee : v.kind === "order" ? goodsTotal(v) : 0);
/** Revenue from the goods themselves (shipping passes through). */
export const saleRevenue = (v: Voucher) => goodsTotal(v) - v.discount;
/** Purchase orders and cancelled sales never touch the stock. */
export const counts = (v: Voucher) => v.kind !== "order" && !(v.kind === "out" && v.status === "cancelled");
/** A purchase order still waiting for its goods. */
export const awaiting = (v: Voucher) => v.kind === "order" && v.status === "pending";

/**
 * avgCost: moving weighted-average cost now (shipping included); `estimated` while the product has no
 * purchase yet and avgCost is just the expected purchase price. value: what the stock in hand cost.
 * lastPrice / minPrice / maxPrice: unit prices written on purchases. lost: cost of goods written off.
 * onOrder: quantity in purchase orders that have not arrived yet.
 */
export type ProductStats = {
  stock: number;
  inQty: number;
  soldQty: number;
  onOrder: number;
  avgCost: number;
  estimated: boolean;
  value: number;
  revenue: number;
  lost: number;
  lastIn: string;
  lastOut: string;
  lastPrice: number;
  lastSupplierId: string;
  minPrice: number;
  maxPrice: number;
};
/** Cost of goods of one sale, fixed at the moment of the sale. provisional: sold before the goods were bought. */
export type SaleCost = { cost: number; provisional: boolean };
/** One product line of a purchase: unit cost after shipping, and the average cost right after it. */
export type InLine = { unit: number; avgAfter: number };
export type Ledger = {
  stats: Map<string, ProductStats>;
  sales: Map<string, SaleCost>;
  lines: Map<string, InLine>;
};
export const lineKey = (voucherId: string, productId: string) => `${voucherId}:${productId}`;

// Purchases of a day count before that day's write-offs and sales.
const DAY_ORDER: Record<VoucherKind, number> = { in: 0, adjust: 1, out: 2, order: 3 };

/**
 * Replays every voucher by date and keeps a moving weighted average per product (bình quân gia quyền di
 * động): a purchase adds its goods plus its share of shipping, a sale or write-off takes goods out at the
 * average of that moment. So a sale's cost never changes when later goods arrive. Goods sold before they
 * were bought (stock below zero) are costed at the next purchase's price once it is written.
 */
export function bookLedger(book: ShopBook): Ledger {
  const stats = new Map<string, ProductStats>();
  type Run = { qty: number; value: number; avg: number; owed: { vid: string; qty: number; guess: number }[] };
  const runs = new Map<string, Run>();
  for (const p of book.products) {
    stats.set(p.id, { stock: 0, inQty: 0, soldQty: 0, onOrder: 0, avgCost: p.cost, estimated: true, value: 0, revenue: 0, lost: 0, lastIn: "", lastOut: "", lastPrice: 0, lastSupplierId: "", minPrice: 0, maxPrice: 0 });
    runs.set(p.id, { qty: 0, value: 0, avg: p.cost, owed: [] });
  }
  const sales = new Map<string, SaleCost>();
  const lines = new Map<string, InLine>();

  for (const v of book.vouchers) {
    if (!awaiting(v)) continue;
    for (const l of v.lines) {
      const s = stats.get(l.productId);
      if (s) s.onOrder += l.qty;
    }
  }

  const list = book.vouchers.filter(counts).sort((a, b) => a.date.localeCompare(b.date) || DAY_ORDER[a.kind] - DAY_ORDER[b.kind] || a.createdAt.localeCompare(b.createdAt));
  for (const v of list) {
    const goods = goodsTotal(v);
    const sale: SaleCost = { cost: 0, provisional: false };
    if (v.kind === "out") sales.set(v.id, sale);
    for (const l of v.lines) {
      const s = stats.get(l.productId);
      const r = runs.get(l.productId);
      if (!s || !r) continue;
      if (v.kind === "in") {
        const unit = goods > 0 ? l.price * (1 + v.fee / goods) : l.price;
        let left = l.qty;
        // First settle what was sold before these goods were written down.
        for (const o of r.owed) {
          if (!left) break;
          const take = Math.min(left, o.qty);
          sales.get(o.vid)!.cost += take * (unit - o.guess);
          o.qty -= take;
          left -= take;
          r.qty += take;
        }
        r.owed = r.owed.filter((o) => o.qty > 0);
        if (r.qty < 0) {
          const fill = Math.min(left, -r.qty);
          r.qty += fill;
          left -= fill;
        }
        if (left > 0) {
          r.value += left * unit;
          r.qty += left;
          r.avg = r.value / r.qty;
        } else if (s.estimated) r.avg = unit;
        s.estimated = false;
        s.stock += l.qty;
        s.inQty += l.qty;
        s.lastIn = v.date;
        s.lastPrice = l.price;
        s.lastSupplierId = v.supplierId;
        s.minPrice = s.minPrice ? Math.min(s.minPrice, l.price) : l.price;
        s.maxPrice = Math.max(s.maxPrice, l.price);
        lines.set(lineKey(v.id, l.productId), { unit, avgAfter: r.avg });
      } else if (v.kind === "out") {
        const covered = Math.max(0, Math.min(l.qty, r.qty));
        const short = l.qty - covered;
        sale.cost += l.qty * r.avg;
        r.value -= covered * r.avg;
        r.qty -= l.qty;
        if (short > 0) r.owed.push({ vid: v.id, qty: short, guess: r.avg });
        s.stock -= l.qty;
        s.soldQty += l.qty;
        // Spread the order discount over its lines by value.
        s.revenue += goods ? l.qty * l.price * (1 - v.discount / goods) : 0;
        s.lastOut = v.date;
      } else if (l.qty < 0) {
        const covered = Math.max(0, Math.min(-l.qty, r.qty));
        r.value -= covered * r.avg;
        s.lost += covered * r.avg;
        r.qty += l.qty;
        s.stock += l.qty;
      } else {
        // Found more than counted: the extra joins the stock at the current average.
        const fill = r.qty < 0 ? Math.min(l.qty, -r.qty) : 0;
        r.value += (l.qty - fill) * r.avg;
        r.qty += l.qty;
        s.stock += l.qty;
      }
      if (r.qty <= 0) r.value = 0;
    }
  }
  for (const [id, r] of runs) {
    const s = stats.get(id)!;
    s.avgCost = r.avg;
    s.value = r.qty > 0 ? r.value : 0;
    for (const o of r.owed) sales.get(o.vid)!.provisional = true;
  }
  return { stats, sales, lines };
}

export const productStats = (book: ShopBook) => bookLedger(book).stats;

/** Cost of the goods in a sale: fixed at sale time once saved, estimated at today's average before that. */
export const saleCost = (v: Voucher, ledger: Ledger) =>
  ledger.sales.get(v.id)?.cost ?? v.lines.reduce((s, l) => s + l.qty * (ledger.stats.get(l.productId)?.avgCost ?? 0), 0);

/**
 * The latest price paid for a product, preferring the given supplier; falls back to the expected price.
 * `except` leaves out the voucher being edited, so it can be compared with what came before it.
 */
export function lastBuyPrice(book: ShopBook, productId: string, supplierId = "", except = ""): number {
  let any: { key: string; price: number } | null = null;
  let same: { key: string; price: number } | null = null;
  for (const v of book.vouchers) {
    if (v.kind !== "in" || v.id === except) continue;
    const l = v.lines.find((x) => x.productId === productId);
    if (!l) continue;
    const key = v.date + v.createdAt;
    if (!any || key > any.key) any = { key, price: l.price };
    if (supplierId && v.supplierId === supplierId && (!same || key > same.key)) same = { key, price: l.price };
  }
  return same?.price ?? any?.price ?? book.products.find((p) => p.id === productId)?.cost ?? 0;
}

export const KIND_LABEL: Record<VoucherKind, string> = { in: "Nhập hàng", out: "Bán hàng", adjust: "Điều chỉnh kho", order: "Đặt hàng" };
export const STATUS_LABEL: Record<OrderStatus, string> = { pending: "Chờ giao", done: "Hoàn thành", cancelled: "Đã huỷ" };
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = { pending: "Chờ hàng về", done: "Đã nhập kho", cancelled: "Đã huỷ" };
export const statusLabel = (v: Voucher) => (v.kind === "order" ? ORDER_STATUS_LABEL : STATUS_LABEL)[v.status];
