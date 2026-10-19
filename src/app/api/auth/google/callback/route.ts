import { NextResponse } from "next/server";
import { decodeNext, googleExchange, OAUTH_STATE_COOKIE, sessionCookie } from "@/lib/account/server";
import { afterLogin } from "@/lib/invites/access";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cookie = request.headers.get("cookie") ?? "";
  const saved = cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${OAUTH_STATE_COOKIE}=`))?.slice(OAUTH_STATE_COOKIE.length + 1) ?? "";
  const [state, nextB64] = decodeURIComponent(saved).split(".");
  const back = (q: string) => NextResponse.redirect(new URL(`/dang-nhap?${q}`, url));
  if (!state || state !== url.searchParams.get("state") || !url.searchParams.get("code")) return back("error=state");
  try {
    const user = await googleExchange(url.origin, url.searchParams.get("code")!);
    await afterLogin(user, cookie).catch((e) => console.error("[auth] afterLogin:", e));
    const res = NextResponse.redirect(new URL(decodeNext(nextB64 ?? ""), url));
    const c = sessionCookie(user.id);
    res.cookies.set(c.name, c.value, c.options);
    res.cookies.delete(OAUTH_STATE_COOKIE);
    return res;
  } catch (e) {
    console.error("[auth] google:", (e as Error).message);
    return back("error=google");
  }
}
