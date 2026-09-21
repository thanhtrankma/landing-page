"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useConsent } from "@/lib/consent";

type Ev = Record<string, string | undefined> & { type: "view" | "click"; path: string };

const kindOf = (href: string) => {
  if (/zalo\.me/i.test(href)) return "zalo";
  if (href.startsWith("tel:")) return "phone";
  if (href.startsWith("mailto:")) return "email";
  if (/facebook|instagram|tiktok/i.test(href)) return "social";
  if (href.startsWith("/demos/") || href.includes("/demos/")) return "demo";
  return "cta";
};

const visitorId = () => {
  try {
    let id = sessionStorage.getItem("sl_v");
    if (!id) {
      id = Math.random().toString(36).slice(2, 12);
      sessionStorage.setItem("sl_v", id);
    }
    return id;
  } catch {
    return undefined;
  }
};

const deviceOf = () => (window.innerWidth < 700 ? "mobile" : window.innerWidth < 1100 ? "tablet" : "desktop");

function send(events: Ev[]) {
  const body = JSON.stringify({ events });
  try {
    if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "text/plain" }))) throw 0;
  } catch {
    fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
  }
}

/** Sends one page view per route change and one event per click on a contact / demo / CTA link. */
export default function Tracker() {
  const pathname = usePathname();
  const { consent } = useConsent();
  const allowed = consent?.analytics === true; // opt-in: nothing is sent or stored until the visitor agrees

  useEffect(() => {
    if (!allowed) return;
    send([{ type: "view", path: pathname, visitor: visitorId(), device: deviceOf(), referrer: document.referrer ? new URL(document.referrer).hostname : undefined }]);
  }, [pathname, allowed]);

  useEffect(() => {
    if (!allowed) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      const tracked = /^(https?:|tel:|mailto:)/.test(href) || href.includes("/demos/") || a.hasAttribute("data-track");
      if (!tracked) return;
      send([
        {
          type: "click",
          path: location.pathname,
          kind: kindOf(href),
          label: (a.getAttribute("aria-label") || a.textContent || "").trim().slice(0, 100),
          href: href.slice(0, 300),
          visitor: visitorId(),
          device: deviceOf(),
        },
      ]);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [allowed]);

  return null;
}
