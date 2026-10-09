"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navLinks, toolLinks } from "@/data/site";
import { Brand, Button, Icon } from "./ui";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  // On phones the header slides away while scrolling down and returns on scroll up.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      if (window.innerWidth > 600) {
        setVisible(true);
        return;
      }
      const y = window.scrollY;
      setVisible(y <= 10 || !(y > last && !open));
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  // Close the "Công cụ" dropdown on outside click or Escape.
  useEffect(() => {
    if (!toolsOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!toolsRef.current?.contains(e.target as Node)) setToolsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setToolsOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [toolsOpen]);

  const closeAll = () => {
    setOpen(false);
    setToolsOpen(false);
  };
  const toolsActive = toolLinks.some(([href]) => pathname === href);

  return (
    <header className={`gv-header ${visible ? "" : "hidden"}`}>
      <Brand />
      <nav className={open ? "open" : ""}>
        {navLinks.map(([href, label]) => (
          <Link key={label} className={pathname === href ? "active" : ""} href={href} onClick={() => setOpen(false)}>
            {label}
          </Link>
        ))}
        <div ref={toolsRef} className={`gv-nav-drop ${toolsOpen ? "open" : ""}`}>
          <button
            type="button"
            className={toolsActive ? "active" : ""}
            aria-expanded={toolsOpen}
            aria-haspopup="true"
            onClick={() => setToolsOpen(!toolsOpen)}
          >
            Công cụ
            <Icon name="chevron" size={16} />
          </button>
          <div className="gv-nav-menu">
            {toolLinks.map(([href, label]) => (
              <Link key={href} className={pathname === href ? "active" : ""} href={href} onClick={closeAll}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <div className="gv-header-actions">
        <Button href="/lien-he">Bắt đầu ngay</Button>
      </div>
      <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Mở menu">
        <Icon name="menu" />
      </button>
    </header>
  );
}
