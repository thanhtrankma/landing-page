"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./Icons";

const items: { href: string; label: string; short: string; icon: IconName; exact?: boolean }[] = [
  { href: "/admin", label: "Tổng quan", short: "Tổng quan", icon: "dashboard", exact: true },
  { href: "/admin/leads", label: "Yêu cầu liên hệ", short: "Liên hệ", icon: "inbox" },
  { href: "/admin/analytics", label: "Lượt xem & click", short: "Thống kê", icon: "chart" },
  { href: "/admin/posts", label: "Tin tức", short: "Tin tức", icon: "news" },
  { href: "/admin/projects", label: "Dự án & mẫu", short: "Dự án", icon: "folder" },
  { href: "/admin/pages", label: "Chính sách & điều khoản", short: "Pháp lý", icon: "shield" },
  { href: "/admin/settings", label: "Cài đặt", short: "Cài đặt", icon: "settings" },
];

export default function AdminNav({ newLeads = 0 }: { newLeads?: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Menu quản trị">
      {items.map((i) => {
        const active = i.exact ? pathname === i.href : pathname.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} aria-current={active ? "page" : undefined}>
            <Icon name={i.icon} size={20} />
            <span className="t-full">{i.label}</span>
            <span className="t-short">{i.short}</span>
            {i.href === "/admin/leads" && newLeads > 0 && <span className="count" aria-label={`${newLeads} yêu cầu mới`}>{newLeads > 99 ? "99+" : newLeads}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
