"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { AppUser } from "@/lib/account/server";
import "./tool.css";

// Top bar of the account-based tool pages (invitations, sales book): brand, navigation and the account menu.

export const TOOL = "/cong-cu/thiep-cuoi-online";

export type ToolInfo = { href: string; name: string; nav: [href: string, label: string][] };

const INVITES: ToolInfo = {
  href: TOOL,
  name: "Thiệp cưới online",
  nav: [
    [`${TOOL}/quan-ly`, "Thiệp của tôi"],
    [`${TOOL}#mau-thiep`, "Mẫu thiệp"],
  ],
};

export default function AppBar({ user, tool = INVITES }: { user: AppUser | null; tool?: ToolInfo }) {
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
    router.push(tool.href);
    router.refresh();
  };

  const nav = tool.nav;
  return (
    <header className="tl-bar">
      <Link href={tool.href} className="tl-brand">
        <Image src="/images/logo.png" alt="" width={32} height={32} />
        <span>
          SuperLanding <small>· {tool.name}</small>
        </span>
      </Link>
      <nav className="tl-nav" aria-label={tool.name}>
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
                <Link href={nav[0][0]} role="menuitem" onClick={() => setOpen(false)}>
                  {nav[0][1]}
                </Link>
                <button type="button" role="menuitem" onClick={logout}>
                  Đăng xuất
                </button>
              </div>
            )}
          </>
        ) : (
          <Link className="ce-btn primary" href={`/dang-nhap?next=${encodeURIComponent(path || tool.href)}`}>
            Đăng nhập
          </Link>
        )}
      </div>
    </header>
  );
}
