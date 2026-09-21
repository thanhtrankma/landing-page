"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

// Visitor's privacy choices, remembered in this browser only (localStorage, never sent to the server).
export type Consent = { v: 1; analytics: boolean; thirdParty: boolean; ts: number };

const KEY = "sl_consent";
const CHANGED = "sl-consent-changed";
const OPEN = "sl-consent-open";
const MAX_AGE_MS = 365 * 24 * 3600 * 1000; // ask again after a year

const readRaw = () => {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
};

function parse(raw: string): Consent | null {
  try {
    const c = JSON.parse(raw) as Consent;
    return c?.v === 1 && Date.now() - c.ts < MAX_AGE_MS ? c : null;
  } catch {
    return null;
  }
}

const subscribe = (cb: () => void) => {
  window.addEventListener(CHANGED, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGED, cb);
    window.removeEventListener("storage", cb);
  };
};

/** `ready` is false during server render / hydration so nothing flashes before the stored choice is known. */
export function useConsent() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "ssr");
  const consent = useMemo(() => (raw === "ssr" ? null : parse(raw)), [raw]);
  const save = useCallback((choice: Pick<Consent, "analytics" | "thirdParty">) => {
    const value: Consent = { v: 1, ...choice, ts: Date.now() };
    try {
      localStorage.setItem(KEY, JSON.stringify(value));
      if (!choice.analytics) sessionStorage.removeItem("sl_v");
    } catch {
      /* storage blocked: the choice simply applies until the next page load */
    }
    window.dispatchEvent(new Event(CHANGED));
  }, []);
  return { ready: raw !== "ssr", consent, save };
}

export const openConsentSettings = () => window.dispatchEvent(new Event(OPEN));
export const onOpenConsentSettings = (cb: () => void) => {
  window.addEventListener(OPEN, cb);
  return () => window.removeEventListener(OPEN, cb);
};
