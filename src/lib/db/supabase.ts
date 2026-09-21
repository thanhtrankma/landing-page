import "server-only";
import { env, supabaseAuthHeaders } from "../env";
import type { CacheHint, Db, Filter, Query, Row } from "./types";

// Minimal PostgREST client (what Supabase exposes at /rest/v1). Uses the service-role key, server side only.
const base = () => `${env.supabaseUrl}/rest/v1`;
const headers = (extra: Record<string, string> = {}) => ({
  ...supabaseAuthHeaders(),
  "Content-Type": "application/json",
  ...extra,
});

// PostgREST filter values: quote anything with reserved characters.
const val = (v: unknown) => {
  const s = String(v);
  return /[,()."\s*:]/.test(s) && !/^[A-Za-z0-9_-]+$/.test(s) ? `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"` : s;
};
const expr = (f: Filter): string => {
  switch (f.op) {
    case "in":
      return `in.(${(f.val as unknown[]).map(val).join(",")})`;
    case "is":
      return `is.${f.val === null ? "null" : String(f.val)}`;
    case "ilike":
      return `ilike.*${String(f.val).replace(/[*]/g, "")}*`;
    default:
      return `${f.op}.${val(f.val)}`;
  }
};

function params(q: Query = {}) {
  const p = new URLSearchParams();
  for (const f of q.filters ?? []) p.append(f.col, expr(f));
  if (q.or?.length) p.append("or", `(${q.or.map((f) => `${f.col}.${expr(f)}`).join(",")})`);
  if (q.order?.length) p.set("order", q.order.map((o) => `${o.col}.${o.asc ? "asc" : "desc"}`).join(","));
  if (q.limit != null) p.set("limit", String(q.limit));
  if (q.offset != null) p.set("offset", String(q.offset));
  return p;
}

async function call(path: string, init: RequestInit & { next?: unknown }) {
  const res = await fetch(`${base()}${path}`, init);
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const body = await res.json();
      msg = body.message || body.hint || JSON.stringify(body);
    } catch {}
    throw new Error(`Supabase ${res.status}: ${msg}`);
  }
  return res;
}

export const supabaseDb: Db = {
  mode: "supabase",

  async select<T = Row>(table: string, q: Query = {}, cache?: CacheHint) {
    const p = params(q);
    p.set("select", q.columns || "*");
    const init: RequestInit & { next?: unknown } = { method: "GET", headers: headers({ Prefer: "count=exact" }) };
    if (cache) {
      init.cache = "force-cache";
      init.next = { tags: cache.tags, revalidate: cache.revalidate ?? 3600 };
    } else init.cache = "no-store";
    const res = await call(`/${table}?${p}`, init);
    const rows = (await res.json()) as T[];
    const total = Number((res.headers.get("content-range") ?? "").split("/")[1]);
    return { rows, count: Number.isFinite(total) ? total : rows.length };
  },

  async insert<T = Row>(table: string, rows: Row | Row[]) {
    // PostgREST rejects a bulk insert whose objects have different keys ("All object keys must match"),
    // so send one request per distinct key set, keeping the original order of the results.
    const list = Array.isArray(rows) ? rows : [rows];
    const groups = new Map<string, number[]>();
    list.forEach((r, i) => {
      const k = Object.keys(r).sort().join(",");
      groups.set(k, [...(groups.get(k) ?? []), i]);
    });
    const out: T[] = new Array(list.length);
    for (const idx of groups.values()) {
      const res = await call(`/${table}`, { method: "POST", cache: "no-store", headers: headers({ Prefer: "return=representation" }), body: JSON.stringify(idx.map((i) => list[i])) });
      ((await res.json()) as T[]).forEach((row, n) => (out[idx[n]] = row));
    }
    return out;
  },

  async update<T = Row>(table: string, filters: Filter[], patch: Row) {
    const res = await call(`/${table}?${params({ filters })}`, { method: "PATCH", cache: "no-store", headers: headers({ Prefer: "return=representation" }), body: JSON.stringify(patch) });
    return (await res.json()) as T[];
  },

  async upsert<T = Row>(table: string, rows: Row | Row[], onConflict: string) {
    const res = await call(`/${table}?on_conflict=${encodeURIComponent(onConflict)}`, {
      method: "POST",
      cache: "no-store",
      headers: headers({ Prefer: "resolution=merge-duplicates,return=representation" }),
      body: JSON.stringify(rows),
    });
    return (await res.json()) as T[];
  },

  async remove(table: string, filters: Filter[]) {
    const res = await call(`/${table}?${params({ filters })}`, { method: "DELETE", cache: "no-store", headers: headers({ Prefer: "return=representation" }) });
    return ((await res.json()) as unknown[]).length;
  },
};
