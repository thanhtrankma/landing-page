import type { ShopBook } from "./types";

// Three-way merge of a sales book, for when several people (or devices) edit it at once.
// base = what this device last saved or loaded, mine = this device now, theirs = what is stored now.
// Products, suppliers, vouchers and notes merge per item: whatever this device changed wins, everything
// else comes from the stored book, so two people adding sales at the same time both keep theirs.

type Item = { id: string };
const same = (a: unknown, b: unknown) => a === b || JSON.stringify(a) === JSON.stringify(b);

function mergeItems<T extends Item>(base: T[], mine: T[], theirs: T[]): T[] {
  if (same(base, mine)) return theirs;
  if (same(base, theirs)) return mine;
  const b = new Map(base.map((x) => [x.id, x]));
  const m = new Map(mine.map((x) => [x.id, x]));
  const t = new Set(theirs.map((x) => x.id));
  const out: T[] = [];
  for (const x of theirs) {
    const was = b.get(x.id);
    const now = m.get(x.id);
    if (was && !now) {
      // Deleted here: stays deleted unless someone else changed it meanwhile.
      if (!same(was, x)) out.push(x);
    } else if (now && (!was || !same(was, now))) out.push(now);
    else out.push(x);
  }
  mine.forEach((x, i) => {
    if (t.has(x.id)) return;
    const was = b.get(x.id);
    // New here, or deleted elsewhere after this device changed it: keep, near where it sits here.
    if (!was || !same(was, x)) out.splice(Math.min(i, out.length), 0, x);
  });
  return out;
}

const pick = <T,>(base: T, mine: T, theirs: T): T => (same(base, mine) ? theirs : mine);

export function mergeBooks(base: ShopBook, mine: ShopBook, theirs: ShopBook): ShopBook {
  return {
    v: 1,
    shopName: pick(base.shopName, mine.shopName, theirs.shopName),
    categories: pick(base.categories, mine.categories, theirs.categories),
    units: pick(base.units, mine.units, theirs.units),
    channels: pick(base.channels, mine.channels, theirs.channels),
    products: mergeItems(base.products, mine.products, theirs.products),
    suppliers: mergeItems(base.suppliers, mine.suppliers, theirs.suppliers),
    vouchers: mergeItems(base.vouchers, mine.vouchers, theirs.vouchers),
    notes: mergeItems(base.notes, mine.notes, theirs.notes),
  };
}
