// Line icons for the sales book (24px grid, stroke follows currentColor).

const PATHS = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  flower: "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM12 2.5c1.8 0 3 1.5 3 3.2 0 .9-.4 1.8-1 2.6M12 2.5c-1.8 0-3 1.5-3 3.2 0 .9.4 1.8 1 2.6M21.5 12c0 1.8-1.5 3-3.2 3-.9 0-1.8-.4-2.6-1M21.5 12c0-1.8-1.5-3-3.2-3-.9 0-1.8.4-2.6 1M2.5 12c0 1.8 1.5 3 3.2 3 .9 0 1.8-.4 2.6-1M2.5 12c0-1.8 1.5-3 3.2-3 .9 0 1.8.4 2.6 1M12 21.5c1.8 0 3-1.5 3-3.2 0-.9-.4-1.8-1-2.6M12 21.5c-1.8 0-3-1.5-3-3.2 0-.9.4-1.8 1-2.6",
  receipt: "M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3",
  truck: "M3 6h11v10H3zM14 9h4l3 3.5V16h-7M7.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  note: "M5 3h10l4 4v14H5zM14 3v5h5M8.5 12.5h7M8.5 16.5h5",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  gear: "M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM19.4 13.5l1.6 1.2-1.8 3.1-1.9-.7a7 7 0 0 1-1.7 1l-.3 2h-3.6l-.3-2a7 7 0 0 1-1.7-1l-1.9.7-1.8-3.1 1.6-1.2a7 7 0 0 1 0-2l-1.6-1.2 1.8-3.1 1.9.7a7 7 0 0 1 1.7-1l.3-2h3.6l.3 2a7 7 0 0 1 1.7 1l1.9-.7 1.8 3.1-1.6 1.2a7 7 0 0 1 0 2z",
  cart: "M3 4h2.5l2.2 10.5h10.6L20.5 7H6.4M9.5 19.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM17 19.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  box: "M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5zM3.5 7.5 12 12l8.5-4.5M12 12v9",
  scale: "M12 4v16M6 20h12M4 8l2-3 2 3a2 2 0 0 1-4 0zM16 8l2-3 2 3a2 2 0 0 1-4 0zM6 5h12",
  check: "M5 12.5l4.5 4.5L19 7.5",
  search: "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM20 20l-4.8-4.8",
  copy: "M8 8h11v12H8zM5 16V4h11",
  money: "M3 7h18v10H3zM12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM6.5 10v4M17.5 10v4",
  close: "M6 6l12 12M18 6 6 18",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
