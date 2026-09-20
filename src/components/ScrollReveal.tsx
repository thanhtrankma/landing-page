"use client";

import { useEffect } from "react";

// Adds `.active` to every `.animate-on-scroll` element once it enters the viewport,
// including elements that mount later (portfolio tab / page changes).
export default function ScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("active")),
      { threshold: 0.05 },
    );
    const seen = new WeakSet<Element>();
    const observeAll = () =>
      document.querySelectorAll(".animate-on-scroll").forEach((el) => {
        if (!seen.has(el)) {
          seen.add(el);
          io.observe(el);
        }
      });
    observeAll();
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
