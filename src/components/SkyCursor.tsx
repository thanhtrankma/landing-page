"use client";

import { useEffect, useRef } from "react";

const TRAIL = 9;
const INTERACTIVE = "a, button, summary, label, [role='button'], .clickable, .template-tab-btn, .pagination-btn, .hero-carousel, .carousel-dot";
const TEXT_FIELDS = "input, textarea, select, [contenteditable='true']";

/**
 * "Paper plane" cursor.
 * - A paper plane sits on the pointer and banks toward the direction of travel.
 * - A trail of soft cloud puffs follows behind it.
 * - Over anything clickable the plane folds into a sky-blue lens ring.
 * - Over text fields and iframes the native cursor is restored so typing stays natural.
 * Fine pointers only; reduced-motion drops the rotation and trail but keeps the plane.
 */
export default function SkyCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const puffsRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const root = rootRef.current;
    const plane = planeRef.current;
    if (!root || !plane) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const html = document.documentElement;
    html.classList.add("has-sky-cursor");

    let x = -100;
    let y = -100;
    let angle = -20; // degrees; 0 points right, plane art points up-right
    let targetAngle = -20;
    let visible = false;
    let raf = 0;
    const trail = Array.from({ length: TRAIL }, () => ({ x: -100, y: -100 }));

    const setState = (target: EventTarget | null) => {
      const el = target instanceof Element ? target : null;
      const text = !!el?.closest(TEXT_FIELDS);
      const frame = !!el?.closest("iframe");
      html.classList.toggle("sky-cursor-native", text || frame);
      root.classList.toggle("is-link", !!el?.closest(INTERACTIVE) && !text);
      root.classList.toggle("is-media", !!el?.closest(".template-img-container, .project-hub-image"));
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const dx = e.clientX - x;
      const dy = e.clientY - y;
      if (visible && Math.hypot(dx, dy) > 3) targetAngle = (Math.atan2(dy, dx) * 180) / Math.PI + 45;
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        visible = true;
        trail.forEach((t) => ((t.x = x), (t.y = y)));
        root.classList.add("is-visible");
      }
    };
    const onOver = (e: PointerEvent) => {
      if (e.pointerType === "mouse") setState(e.target);
    };
    const onLeave = () => {
      visible = false;
      root.classList.remove("is-visible");
    };
    const onDown = () => root.classList.add("is-down");
    const onUp = () => root.classList.remove("is-down");

    const tick = () => {
      plane.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (!reduce) {
        // shortest-path easing so the plane never spins the long way round
        let d = targetAngle - angle;
        d = ((((d + 180) % 360) + 360) % 360) - 180;
        angle += d * 0.14;
        plane.style.setProperty("--bank", `${angle}deg`);
        let px = x;
        let py = y;
        trail.forEach((t, i) => {
          t.x += (px - t.x) * (0.42 - i * 0.03);
          t.y += (py - t.y) * (0.42 - i * 0.03);
          const puff = puffsRef.current[i];
          if (puff) puff.style.transform = `translate3d(${t.x}px, ${t.y}px, 0) scale(${1 - i / (TRAIL + 2)})`;
          px = t.x;
          py = t.y;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove("has-sky-cursor", "sky-cursor-native");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, []);

  return (
    <div ref={rootRef} className="sky-cursor" aria-hidden="true">
      {Array.from({ length: TRAIL }, (_, i) => (
        <span
          key={i}
          className="sky-puff"
          ref={(el) => {
            if (el) puffsRef.current[i] = el;
          }}
        />
      ))}
      <div ref={planeRef} className="sky-plane">
        <div className="sky-plane-body">
          <svg viewBox="0 0 32 32" width="30" height="30">
            {/* paper plane: two wings folded on a centre crease */}
            <path className="sky-wing-a" d="M3 15.5 29 3 20 29l-5-10.5z" />
            <path className="sky-wing-b" d="M15 18.5 29 3 12.5 21.5z" />
            <path className="sky-crease" d="M15 18.5 12.5 27l2.5-5.5" />
          </svg>
          <span className="sky-lens" />
          <span className="sky-label">↗</span>
        </div>
      </div>
    </div>
  );
}
