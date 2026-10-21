"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** Reads Chinese text aloud with the browser's built-in zh-CN voice; hidden when the browser has none. */
export default function SpeakButton({ text, label = "Nghe phát âm", small = false }: { text: string; label?: string; small?: boolean }) {
  // false during SSR, then the real answer once hydrated, without a setState-in-effect round trip.
  const supported = useSyncExternalStore(noop, () => "speechSynthesis" in window, () => false);

  if (!supported) return null;

  function speak() {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "zh-CN";
    u.rate = 0.8;
    const voice = synth.getVoices().find((v) => v.lang.replace("_", "-").startsWith("zh-CN"));
    if (voice) u.voice = voice;
    synth.speak(u);
  }

  return (
    <button type="button" onClick={speak} className={small ? "speak small" : "speak"} aria-label={small ? label : undefined} title={label}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={18} height={18} aria-hidden="true">
        <path d="M11 5 6 9H2v6h4l5 4V5z" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
      {!small && <span>{label}</span>}
    </button>
  );
}
