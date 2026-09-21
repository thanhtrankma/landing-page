import Link from "next/link";
import type { ReactNode } from "react";
import AdminNav from "@/components/admin/AdminNav";
import { Icon } from "@/components/admin/Icons";
import { requireAdmin } from "@/lib/auth";
import { leadCounts } from "@/lib/repo";
import { logoutAction } from "./actions";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  const counts = await leadCounts().catch(() => null);
  return (
    <div className="shell">
      <aside className="side">
        <Link href="/admin" className="brand" style={{ textDecoration: "none" }}>
          <div className="mark">S</div>
          <div>Super<span>Landing</span></div>
        </Link>
        <AdminNav newLeads={counts?.new ?? 0} />
        <div className="foot">
          <Link className="btn sm" href="/" target="_blank" aria-label="Xem website">
            <Icon name="external" size={15} /> <span>Xem website</span>
          </Link>
          <form action={logoutAction}>
            <button className="btn sm ghost" type="submit" style={{ width: "100%" }} aria-label="Đăng xuất">
              <Icon name="logout" size={15} /> <span>Đăng xuất</span>
            </button>
          </form>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
