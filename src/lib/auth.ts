import "server-only";
import { timingSafeEqual, createHash } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { authConfigured, env } from "./env";
import { clearLimit, clientIp, rateLimit } from "./rate-limit";
import { SESSION_COOKIE, SESSION_TTL_S, createSession, verifySession } from "./session";

const digest = (s: string) => createHash("sha256").update(s).digest();

export function passwordMatches(input: string): boolean {
  if (!authConfigured()) return false;
  return timingSafeEqual(digest(input), digest(env.adminPassword));
}

export async function isAdmin(): Promise<boolean> {
  if (!authConfigured()) return false;
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value, env.sessionSecret);
}

/** Use at the top of every admin page and server action (the proxy is only the first gate). */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function login(password: string): Promise<LoginResult> {
  if (!authConfigured()) return { ok: false, error: "Chưa cấu hình ADMIN_PASSWORD / ADMIN_SESSION_SECRET trong .env.local." };
  const ip = clientIp(await headers());
  const key = `login:${ip}`;
  const gate = rateLimit(key, 6, 15 * 60 * 1000);
  if (!gate.ok) return { ok: false, error: `Sai mật khẩu quá nhiều lần. Thử lại sau ${Math.ceil(gate.retryAfterS / 60)} phút.` };
  if (!passwordMatches(password)) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return { ok: false, error: "Mật khẩu không đúng." };
  }
  clearLimit(key);
  (await cookies()).set(SESSION_COOKIE, createSession(env.sessionSecret), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_S,
  });
  return { ok: true };
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** For route handlers: cookie check + same-origin check (server actions get CSRF protection from Next itself). */
export function isAdminRequest(request: Request): boolean {
  if (!authConfigured()) return false;
  const cookie = request.headers.get("cookie") ?? "";
  const token = cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
  if (!verifySession(token, env.sessionSecret)) return false;
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
