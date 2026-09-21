import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// First gate for the admin area. Pages and actions re-check with requireAdmin().
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = verifySession(request.cookies.get(SESSION_COOKIE)?.value, process.env.ADMIN_SESSION_SECRET);

  if (pathname.startsWith("/api/admin")) {
    return authed ? NextResponse.next() : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (pathname === "/admin/login") {
    return authed ? NextResponse.redirect(new URL("/admin", request.url)) : NextResponse.next();
  }
  if (!authed) return NextResponse.redirect(new URL("/admin/login", request.url));

  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
