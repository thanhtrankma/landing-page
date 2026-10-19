import { NextResponse } from "next/server";
import { googleConfigured } from "@/lib/env";
import { googleAuthUrl, OAUTH_STATE_COOKIE, safeNext } from "@/lib/account/server";

// "Đăng nhập với Google": redirect to Google with a state bound to this browser.
export async function GET(request: Request) {
  const url = new URL(request.url);
  if (!googleConfigured()) return NextResponse.redirect(new URL(`/dang-nhap?error=google`, url));
  const { url: target, cookieValue } = googleAuthUrl(url.origin, safeNext(url.searchParams.get("next")));
  const res = NextResponse.redirect(target);
  res.cookies.set(OAUTH_STATE_COOKIE, cookieValue, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 });
  return res;
}
