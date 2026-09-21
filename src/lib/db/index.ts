import "server-only";
import { supabaseConfigured } from "../env";
import { localDb } from "./local";
import { supabaseDb } from "./supabase";
import type { Db } from "./types";

/** Supabase when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set, otherwise the local JSON store. */
export const db: Db = supabaseConfigured() ? supabaseDb : localDb;
export type { Db, Filter, Query, Row, CacheHint } from "./types";
export { TABLES } from "./types";
