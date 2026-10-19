import type { Metadata } from "next";
import AppBar from "@/components/account/AppBar";
import Dashboard from "@/components/account/Dashboard";
import { requireUser } from "@/lib/account/server";
import { listMyInvites } from "@/lib/invites/access";
import { inviteTitle } from "@/lib/invites/types";

export const metadata: Metadata = { title: "Thiệp của tôi | SuperLanding" };

export default async function MyInvitesPage() {
  const user = await requireUser("/cong-cu/thiep-cuoi-online/quan-ly");
  const invites = await listMyInvites(user).catch(() => []);
  return (
    <div className="tl">
      <AppBar user={user} />
      <main className="tl-main">
        <div className="tl-head">
          <div>
            <h1>Thiệp của tôi</h1>
            <p>Sửa thiệp, quản lý khách mời và xem ai đã xác nhận tham dự.</p>
          </div>
        </div>
        <Dashboard
          items={invites.map((i) => ({
            id: i.id,
            slug: i.slug,
            title: inviteTitle(i.data),
            theme: i.data.theme,
            cover: i.data.cover,
            status: i.status,
            published: i.published,
            role: i.role === "token" ? "owner" : i.role,
            updatedAt: i.updatedAt,
            viewCount: i.viewCount,
            date: i.data.date,
          }))}
        />
      </main>
    </div>
  );
}
