import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { recordEvents } from "@/lib/repo";

// Anonymous analytics: no IP or cookie is stored, only a random per-tab visitor id sent by the browser.
const clip = (v: unknown, n: number) => (typeof v === "string" && v ? v.slice(0, n) : null);
const DEVICES = new Set(["mobile", "tablet", "desktop"]);
const KINDS = new Set(["zalo", "phone", "email", "demo", "cta", "social", "other"]);

export async function POST(request: Request) {
  let body: { events?: unknown };
  try {
    body = JSON.parse(await request.text());
  } catch {
    return new NextResponse(null, { status: 204 });
  }
  if (!rateLimit(`track:${clientIp(request.headers)}`, 120, 60_000).ok) return new NextResponse(null, { status: 204 });

  const list = Array.isArray(body.events) ? body.events.slice(0, 20) : [];
  const events = list.flatMap((raw) => {
    const e = raw as Record<string, unknown>;
    const path = clip(e.path, 300);
    if (!path?.startsWith("/") || path.startsWith("/admin")) return [];
    const type = e.type === "click" ? "click" : "view";
    return [
      {
        type: type as "view" | "click",
        path,
        kind: type === "click" ? (KINDS.has(String(e.kind)) ? String(e.kind) : "other") : null,
        label: clip(e.label, 120),
        href: clip(e.href, 300),
        visitor: clip(e.visitor, 40),
        referrer: clip(e.referrer, 200),
        device: DEVICES.has(String(e.device)) ? String(e.device) : null,
      },
    ];
  });
  try {
    await recordEvents(events);
  } catch (e) {
    console.error("[track] failed:", (e as Error).message);
  }
  return new NextResponse(null, { status: 204 });
}
