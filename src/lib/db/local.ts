import "server-only";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Db, Filter, Query, Row } from "./types";

// File-backed stand-in for Supabase: one JSON array per table under .data/. For local development and
// for trying the admin before a Supabase project exists. It mirrors the table shapes in supabase/schema.sql.
const DIR = path.join(process.cwd(), ".data");
const file = (t: string) => path.join(DIR, `${t}.json`);
let chain: Promise<unknown> = Promise.resolve();
const locked = <T,>(fn: () => Promise<T>): Promise<T> => {
  const run = chain.then(fn, fn);
  chain = run.catch(() => undefined);
  return run;
};

async function read(t: string): Promise<Row[]> {
  try {
    return JSON.parse(await fs.readFile(file(t), "utf8"));
  } catch {
    return [];
  }
}
async function write(t: string, rows: Row[]) {
  await fs.mkdir(DIR, { recursive: true });
  const tmp = `${file(t)}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(rows));
  await fs.rename(tmp, file(t));
}

const test = (row: Row, f: Filter): boolean => {
  const v = row[f.col] as never;
  switch (f.op) {
    case "eq": return v === f.val || String(v) === String(f.val);
    case "neq": return !(v === f.val || String(v) === String(f.val));
    case "gt": return v > (f.val as never);
    case "gte": return v >= (f.val as never);
    case "lt": return v < (f.val as never);
    case "lte": return v <= (f.val as never);
    case "in": return (f.val as unknown[]).map(String).includes(String(v));
    case "is": return f.val === null ? v == null : v === f.val;
    case "ilike": return String(v ?? "").toLowerCase().includes(String(f.val).toLowerCase());
  }
};
const matches = (row: Row, q: Query) => (q.filters ?? []).every((f) => test(row, f)) && (!q.or?.length || q.or.some((f) => test(row, f)));

const defaults: Record<string, () => Row> = {
  leads: () => ({ status: "new", note: "" }),
  posts: () => ({ published: true }),
  projects: () => ({ published: true, sample: false }),
  pages: () => ({ published: true, updated_at: new Date().toISOString() }),
};
const prepare = (table: string, r: Row): Row => ({
  ...(["settings"].includes(table) ? {} : { id: randomUUID() }),
  ...(table === "events" ? {} : {}),
  created_at: new Date().toISOString(),
  ...(defaults[table]?.() ?? {}),
  ...r,
});

export const localDb: Db = {
  mode: "local",

  select<T = Row>(table: string, q: Query = {}) {
    return locked(async () => {
      let rows = (await read(table)).filter((r) => matches(r, q));
      const count = rows.length;
      for (const o of [...(q.order ?? [])].reverse()) {
        rows = [...rows].sort((a, b) => {
          const x = a[o.col] as never, y = b[o.col] as never;
          if (x === y) return 0;
          if (x == null) return 1;
          if (y == null) return -1;
          return (x < y ? -1 : 1) * (o.asc ? 1 : -1);
        });
      }
      const start = q.offset ?? 0;
      rows = rows.slice(start, q.limit != null ? start + q.limit : undefined);
      return { rows: rows as T[], count };
    });
  },

  insert<T = Row>(table: string, input: Row | Row[]) {
    return locked(async () => {
      const all = await read(table);
      const made = (Array.isArray(input) ? input : [input]).map((r) => prepare(table, r));
      if (table === "events") {
        const last = all.length ? Number(all[all.length - 1].id) : 0;
        made.forEach((r, i) => (r.id = last + i + 1));
      }
      await write(table, [...all, ...made]);
      return made as T[];
    });
  },

  update<T = Row>(table: string, filters: Filter[], patch: Row) {
    return locked(async () => {
      const all = await read(table);
      const hit: Row[] = [];
      const next = all.map((r) => {
        if (!matches(r, { filters })) return r;
        const u = { ...r, ...patch };
        hit.push(u);
        return u;
      });
      await write(table, next);
      return hit as T[];
    });
  },

  upsert<T = Row>(table: string, input: Row | Row[], onConflict: string) {
    return locked(async () => {
      const all = await read(table);
      const out: Row[] = [];
      for (const r of Array.isArray(input) ? input : [input]) {
        const i = all.findIndex((x) => x[onConflict] === r[onConflict]);
        if (i >= 0) { all[i] = { ...all[i], ...r }; out.push(all[i]); }
        else { const n = prepare(table, r); all.push(n); out.push(n); }
      }
      await write(table, all);
      return out as T[];
    });
  },

  remove(table: string, filters: Filter[]) {
    return locked(async () => {
      const all = await read(table);
      const keep = all.filter((r) => !matches(r, { filters }));
      await write(table, keep);
      return all.length - keep.length;
    });
  },
};
