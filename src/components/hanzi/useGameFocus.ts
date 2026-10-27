"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * While a game is on (playing, paused or showing its result) it is lifted out of the page into a panel fixed in the
 * middle of the screen, over a dimmed backdrop (styles in game.css). The returned ref goes on a holder element around
 * the game: it keeps the game's last in-page height meanwhile, so the page behind doesn't jump.
 * The header and floating buttons sit in a layer above the game, so they hide through the "vg-focus" class on <html>,
 * which also stops the page behind from scrolling.
 */
export function useGameFocus(on: boolean) {
  const holder = useRef<HTMLDivElement>(null);
  const height = useRef(0);
  const lifted = useRef(on);

  // remember the game's height while it sits in the page
  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (!lifted.current) height.current = entry.contentRect.height;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // before paint, so the page never shows the gap the game leaves
  useLayoutEffect(() => {
    lifted.current = on;
    const el = holder.current;
    if (!on || !el) return;
    el.style.minHeight = `${height.current}px`;
    const root = document.documentElement;
    root.classList.add("vg-focus");
    return () => {
      el.style.minHeight = "";
      root.classList.remove("vg-focus");
    };
  }, [on]);

  return holder;
}
