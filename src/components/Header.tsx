"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks } from "@/data/site";
import { Brand, Button, Icon } from "./ui";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

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

  return (
    <header className={`gv-header ${visible ? "" : "hidden"}`}>
      <Brand />
      <nav className={open ? "open" : ""}>
        {navLinks.map(([href, label]) => (
          <Link key={label} className={pathname === href ? "active" : ""} href={href} onClick={() => setOpen(false)}>
            {label}
          </Link>
        ))}
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
