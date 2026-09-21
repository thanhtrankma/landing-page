import "server-only";

// All server-side configuration lives here so a missing value fails in one obvious place.
export const env = {
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  sessionSecret: process.env.ADMIN_SESSION_SECRET ?? "",
  supabaseUrl: (process.env.SUPABASE_URL ?? "").replace(/\/+$/, ""),
  // New-style secret key (sb_secret_…) or the legacy service_role JWT.
  supabaseKey: process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  telegramToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  telegramChatId: process.env.TELEGRAM_CHAT_ID ?? "",
  storageBucket: process.env.SUPABASE_STORAGE_BUCKET || "media",
};

export const supabaseConfigured = () => Boolean(env.supabaseUrl && env.supabaseKey);
export const authConfigured = () => env.adminPassword.length >= 8 && env.sessionSecret.length >= 24;

/** sb_secret_… keys are not JWTs: they go in `apikey` only. Legacy JWT keys also need a Bearer header. */
export const supabaseAuthHeaders = (): Record<string, string> =>
  env.supabaseKey.startsWith("sb_") ? { apikey: env.supabaseKey } : { apikey: env.supabaseKey, Authorization: `Bearer ${env.supabaseKey}` };
