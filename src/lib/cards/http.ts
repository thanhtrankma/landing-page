import "server-only";
import { NextResponse } from "next/server";
import { EDIT_COOKIE, tokenMatches } from "./server";

// Request helpers shared by the /api/cards routes.

export const fail = (error: string, status = 400) => NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
export const ok = (data: object) => NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });

/** Rejects cross-site writes: the browser always sends Origin on POST/PUT/DELETE. */
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

function cookieValue(request: Request, name: string) {
  const raw = request.headers.get("cookie") ?? "";
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

/** The edit token comes from the httpOnly cookie set at creation/claim, or an explicit header. */
export async function canEdit(request: Request, id: string) {
  const token = request.headers.get("x-edit-token") ?? cookieValue(request, EDIT_COOKIE(id));
  return tokenMatches(id, token ?? undefined);
}

export function withEditCookie(res: NextResponse, id: string, token: string) {
  res.cookies.set(EDIT_COOKIE(id), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
  });
  return res;
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? body : null;
  } catch {
    return null;
  }
}
