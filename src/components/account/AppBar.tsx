"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { AppUser } from "@/lib/account/server";
import "./tool.css";

// Top bar of the invitation tool pages: brand, navigation and the account menu.

export const TOOL = "/cong-cu/thiep-cuoi-online";

export default function AppBar({ user }: { user: AppUser | null }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(TOOL);
    router.refresh();
  };

  const nav: [string, string][] = [
    [`${TOOL}/quan-ly`, "Thiệp của tôi"],
    [`${TOOL}#mau-thiep`, "Mẫu thiệp"],
  ];
  return (
    <header className="tl-bar">
      <Link href={TOOL} className="tl-brand">
        <Image src="/images/logo.png" alt="" width={32} height={32} />
        <span>
          SuperLanding <small>· Thiệp cưới online</small>
        </span>
      </Link>
      <nav className="tl-nav" aria-label="Công cụ thiệp cưới">
        {nav.map(([href, label]) => (
          <Link key={href} href={href} className={path === href ? "on" : ""}>
            {label}
          </Link>
        ))}
      </nav>
      <div className="tl-user" ref={ref}>
        {user ? (
          <>
            <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="menu">
              <span className="tl-avatar">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {user.avatarUrl ? <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" /> : (user.name || user.email)[0].toUpperCase()}
              </span>
              <span className="hide-sm">{user.name || user.email.split("@")[0]}</span>
            </button>
            {open && (
              <div className="tl-menu" role="menu">
                <p>{user.email}</p>
                <Link href={`${TOOL}/quan-ly`} role="menuitem" onClick={() => setOpen(false)}>
                  Thiệp của tôi
                </Link>
                <button type="button" role="menuitem" onClick={logout}>
                  Đăng xuất
                </button>
              </div>
            )}
          </>
        ) : (
          <Link className="ce-btn primary" href={`/dang-nhap?next=${encodeURIComponent(path || TOOL)}`}>
            Đăng nhập
          </Link>
        )}
      </div>
    </header>
  );
}
