import type { ReactNode } from "react";

// Stroke icons (24px grid, 2px stroke) used where the original design used emoji.
const glyphs = {
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  trend: (
    <>
      <path d="m3 17 6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.6 4 5.6 4 9s-1.4 6.4-4 9c-2.6-2.6-4-5.6-4-9s1.4-6.4 4-9Z" />
    </>
  ),
  chat: <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9Z" />,
  check: <path d="m5 12 4.5 4.5L19 7" />,
  mobile: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  rocket: (
    <>
      <path d="M14 5c3-3 6-2 6-2s1 3-2 6l-5 5-4-4Z" />
      <path d="m9 10-4 1-2 2 6 1m4 0 1 6 2-2 1-5M7 17c-2 0-3 1-3 3 2 0 3-1 3-3Z" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  cloud: <path d="M7 18h11a4 4 0 0 0 .4-8A7 7 0 0 0 5 9a4.5 4.5 0 0 0 2 9Z" />,
} satisfies Record<string, ReactNode>;

export type GlyphName = keyof typeof glyphs;

export default function Glyph({ name, size = 18 }: { name: GlyphName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {glyphs[name]}
    </svg>
  );
}
