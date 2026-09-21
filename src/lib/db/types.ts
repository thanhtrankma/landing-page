export type Row = Record<string, unknown>;

export type FilterOp = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "is" | "ilike";
export type Filter = { col: string; op: FilterOp; val: unknown };

export type Query = {
  filters?: Filter[];
  /** Filters combined with OR (used for text search across columns). */
  or?: Filter[];
  order?: { col: string; asc?: boolean }[];
  limit?: number;
  offset?: number;
  /** Comma separated columns (PostgREST select); defaults to all. */
  columns?: string;
};

/** Cache hints for public reads (ignored by the local adapter and by admin reads). */
export type CacheHint = { tags: string[]; revalidate?: number };

export interface Db {
  mode: "supabase" | "local";
  select<T = Row>(table: string, q?: Query, cache?: CacheHint): Promise<{ rows: T[]; count: number }>;
  insert<T = Row>(table: string, rows: Row | Row[]): Promise<T[]>;
  update<T = Row>(table: string, filters: Filter[], patch: Row): Promise<T[]>;
  upsert<T = Row>(table: string, rows: Row | Row[], onConflict: string): Promise<T[]>;
  remove(table: string, filters: Filter[]): Promise<number>;
}

export const TABLES = ["leads", "posts", "projects", "settings", "events"] as const;
export type Table = (typeof TABLES)[number];
