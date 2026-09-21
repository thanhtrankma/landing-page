import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// Stateless signed session cookie shared by proxy.ts (edge of the app) and the server code.
// Kept free of framework imports so both can use it.
export const SESSION_COOKIE = "sl_admin";
export const SESSION_TTL_S = 60 * 60 * 24 * 7; // 7 days

const b64 = (b: Buffer | string) => Buffer.from(b).toString("base64url");
const sign = (data: string, secret: string) => createHmac("sha256", secret).update(data).digest();

export function createSession(secret: string, now = Date.now()): string {
  const payload = b64(JSON.stringify({ exp: Math.floor(now / 1000) + SESSION_TTL_S, n: randomBytes(9).toString("base64url") }));
  return `${payload}.${b64(sign(payload, secret))}`;
}

export function verifySession(token: string | undefined, secret: string | undefined, now = Date.now()): boolean {
  if (!token || !secret) return false;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return false;
  const expected = sign(payload, secret);
  let given: Buffer;
  try {
    given = Buffer.from(mac, "base64url");
  } catch {
    return false;
  }
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof exp === "number" && exp * 1000 > now;
  } catch {
    return false;
  }
}
