import "server-only";
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "../db";
import type { Row } from "../db/types";
import { env } from "../env";

// Visitor accounts for the online invitation tool: email login codes, Google sign-in and a signed session
// cookie. Separate from the admin login (lib/auth.ts).

export const USER_COOKIE = "sl_user";
const SESSION_TTL_S = 60 * 60 * 24 * 60; // 60 days
const CODE_TTL_MS = 10 * 60_000;
const MAX_CODE_ATTEMPTS = 5;

export type AppUser = { id: string; email: string; name: string; avatarUrl: string };

const b64 = (b: Buffer | string) => Buffer.from(b).toString("base64url");
const hmac = (data: string) => createHmac("sha256", env.userSessionSecret).update(data).digest();

// ───────────── session cookie ─────────────

function signSession(uid: string) {
  const payload = b64(JSON.stringify({ uid, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_S }));
  return `${payload}.${b64(hmac(payload))}`;
}

function readSession(token: string | undefined): string | null {
  if (!token || !env.userSessionSecret) return null;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return null;
  const expected = hmac(payload);
  const given = Buffer.from(mac, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const { uid, exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof uid === "string" && typeof exp === "number" && exp * 1000 > Date.now() ? uid : null;
  } catch {
    return null;
  }
}

export const sessionCookie = (uid: string) => ({
  name: USER_COOKIE,
  value: signSession(uid),
  options: { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_TTL_S },
});

const userFromRow = (r: Row): AppUser => ({ id: String(r.id), email: String(r.email), name: String(r.name ?? ""), avatarUrl: String(r.avatar_url ?? "") });

export async function getUserById(id: string): Promise<AppUser | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { rows } = await db.select<Row>("app_users", { filters: [{ col: "id", op: "eq", val: id }], limit: 1 });
  return rows[0] ? userFromRow(rows[0]) : null;
}

/** The signed-in visitor, or null. Safe to call from any server component or route. */
export async function currentUser(): Promise<AppUser | null> {
  const uid = readSession((await cookies()).get(USER_COOKIE)?.value);
  if (!uid) return null;
  try {
    return await getUserById(uid);
  } catch {
    return null;
  }
}

/** For route handlers that receive a Request. */
export async function userFromRequest(request: Request): Promise<AppUser | null> {
  const raw = request.headers.get("cookie") ?? "";
  const token = raw
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${USER_COOKIE}=`))
    ?.slice(USER_COOKIE.length + 1);
  const uid = readSession(token ? decodeURIComponent(token) : undefined);
  return uid ? getUserById(uid).catch(() => null) : null;
}

export async function requireUser(next: string): Promise<AppUser> {
  const user = await currentUser();
  if (!user) redirect(`/dang-nhap?next=${encodeURIComponent(next)}`);
  return user;
}

// ───────────── users ─────────────

export const normalizeEmail = (e: string) => e.trim().toLowerCase();
export const validEmail = (e: string) => /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i.test(e);

export async function upsertUser(input: { email: string; name?: string; avatarUrl?: string; googleSub?: string }): Promise<AppUser> {
  const email = normalizeEmail(input.email);
  const { rows } = await db.select<Row>("app_users", { filters: [{ col: "email", op: "eq", val: email }], limit: 1 });
  const now = new Date().toISOString();
  if (rows[0]) {
    const patch: Row = { last_login_at: now };
    if (input.name && !rows[0].name) patch.name = input.name;
    if (input.avatarUrl) patch.avatar_url = input.avatarUrl;
    if (input.googleSub && !rows[0].google_sub) patch.google_sub = input.googleSub;
    const [u] = await db.update<Row>("app_users", [{ col: "id", op: "eq", val: String(rows[0].id) }], patch);
    return userFromRow(u ?? rows[0]);
  }
  const [u] = await db.insert<Row>("app_users", { email, name: input.name ?? "", avatar_url: input.avatarUrl ?? "", google_sub: input.googleSub ?? null, last_login_at: now });
  return userFromRow(u);
}

export async function updateProfile(id: string, patch: { name?: string }) {
  await db.update("app_users", [{ col: "id", op: "eq", val: id }], { ...(patch.name !== undefined ? { name: patch.name.slice(0, 80) } : {}) });
}

// ───────────── email codes ─────────────

const codeHash = (email: string, code: string) => createHash("sha256").update(`${env.userSessionSecret}|${email}|${code}`).digest("hex");

async function sendMail(to: string, subject: string, html: string, text: string) {
  if (!env.resendKey) {
    if (process.env.NODE_ENV === "production") throw new Error("Chưa cấu hình gửi email (RESEND_API_KEY).");
    console.info(`[account] (dev, no RESEND_API_KEY) email to ${to}: ${text}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.mailFrom, to: [to], subject, html, text }),
  });
  if (!res.ok) throw new Error(`Không gửi được email (${res.status}).`);
}

export async function sendLoginCode(rawEmail: string) {
  const email = normalizeEmail(rawEmail);
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await db.insert("login_codes", { email, code_hash: codeHash(email, code), expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString() });
  const text = `Mã đăng nhập SuperLanding của bạn là ${code}. Mã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:24px;color:#0b2a3c">
    <h2 style="margin:0 0 12px">Mã đăng nhập của bạn</h2>
    <p style="margin:0 0 16px">Nhập mã dưới đây để đăng nhập công cụ tạo thiệp cưới online của SuperLanding:</p>
    <p style="font-size:34px;letter-spacing:10px;font-weight:700;margin:0 0 16px;color:#0b6fa4">${code}</p>
    <p style="margin:0;color:#52697a;font-size:13px">Mã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p></div>`;
  await sendMail(email, `${code} là mã đăng nhập SuperLanding`, html, text);
}

/** Checks the latest unused code for the email. Returns the user on success. */
export async function verifyLoginCode(rawEmail: string, code: string): Promise<AppUser | { error: string }> {
  const email = normalizeEmail(rawEmail);
  const { rows } = await db.select<Row>("login_codes", {
    filters: [
      { col: "email", op: "eq", val: email },
      { col: "used", op: "eq", val: false },
    ],
    order: [{ col: "created_at", asc: false }],
    limit: 1,
  });
  const r = rows[0];
  if (!r || Date.parse(String(r.expires_at)) < Date.now()) return { error: "Mã đã hết hạn, hãy gửi lại mã mới." };
  if (Number(r.attempts) >= MAX_CODE_ATTEMPTS) return { error: "Nhập sai quá nhiều lần, hãy gửi lại mã mới." };
  const a = Buffer.from(String(r.code_hash));
  const b = Buffer.from(codeHash(email, code.replace(/\D/g, "")));
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    await db.update("login_codes", [{ col: "id", op: "eq", val: String(r.id) }], { attempts: Number(r.attempts) + 1 });
    return { error: "Mã không đúng." };
  }
  await db.update("login_codes", [{ col: "id", op: "eq", val: String(r.id) }], { used: true });
  return upsertUser({ email });
}

// ───────────── Google (OpenID Connect, authorization-code flow) ─────────────

export const OAUTH_STATE_COOKIE = "sl_oauth";

export function googleAuthUrl(origin: string, next: string) {
  const state = randomBytes(18).toString("base64url");
  const q = new URLSearchParams({
    client_id: env.googleClientId,
    redirect_uri: `${origin}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  // The cookie binds the callback to this browser (CSRF) and remembers where to go afterwards.
  return { url: `https://accounts.google.com/o/oauth2/v2/auth?${q}`, cookieValue: `${state}.${b64(next)}` };
}

export async function googleExchange(origin: string, code: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: env.googleClientId, client_secret: env.googleClientSecret, redirect_uri: `${origin}/api/auth/google/callback`, grant_type: "authorization_code" }),
  });
  if (!res.ok) throw new Error("Google từ chối đăng nhập.");
  const { id_token } = (await res.json()) as { id_token?: string };
  if (!id_token) throw new Error("Thiếu thông tin tài khoản Google.");
  // The token came straight from Google's token endpoint over TLS, so its claims can be trusted (OIDC §3.1.3.7);
  // we still check audience, issuer, expiry and that the email is verified.
  const claims = JSON.parse(Buffer.from(id_token.split(".")[1], "base64url").toString("utf8"));
  if (claims.aud !== env.googleClientId || !["accounts.google.com", "https://accounts.google.com"].includes(claims.iss) || claims.exp * 1000 < Date.now()) {
    throw new Error("Phiên Google không hợp lệ.");
  }
  if (!claims.email || claims.email_verified === false) throw new Error("Email Google chưa được xác minh.");
  return upsertUser({ email: claims.email, name: claims.name, avatarUrl: claims.picture, googleSub: claims.sub });
}

export const decodeNext = (v: string) => {
  try {
    const n = Buffer.from(v, "base64url").toString("utf8");
    return n.startsWith("/") && !n.startsWith("//") ? n : "/cong-cu/thiep-cuoi-online/quan-ly";
  } catch {
    return "/cong-cu/thiep-cuoi-online/quan-ly";
  }
};

/** Only local paths, never another site. */
export const safeNext = (n: unknown) => (typeof n === "string" && n.startsWith("/") && !n.startsWith("//") ? n : "/cong-cu/thiep-cuoi-online/quan-ly");
