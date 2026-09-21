import type { Metadata } from "next";
import Link from "next/link";
import { Bars } from "@/components/admin/Charts";
import { Icon } from "@/components/admin/Icons";
import { getAnalytics } from "@/lib/analytics";
import { db } from "@/lib/db";
import { STATUS_LABEL, adminListPosts, adminListProjects, leadCounts, listLeads } from "@/lib/repo";

export const metadata: Metadata = { title: "Tổng quan" };
const fmt = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" });

const greeting = () => {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Ho_Chi_Minh" }).format(new Date()));
  return h < 11 ? "Chào buổi sáng" : h < 14 ? "Chào buổi trưa" : h < 18 ? "Chào buổi chiều" : "Chào buổi tối";
};

export default async function Dashboard() {
  const [counts, recent, posts, projects, a] = await Promise.all([leadCounts(), listLeads({ limit: 5 }), adminListPosts({ limit: 1 }), adminListProjects({ limit: 1 }), getAnalytics(7)]);
  const empty = posts.count === 0 && projects.count === 0;
  return (
    <>
      <div className="page-head">
        <div>
          <p className="greet">{greeting()} 👋</p>
          <h1>Tổng quan website</h1>
        </div>
        <div className="row-actions">
          <Link className="btn primary" href="/admin/posts/new"><Icon name="plus" size={18} /> Viết bài mới</Link>
          <Link className="btn" href="/admin/projects/new"><Icon name="plus" size={18} /> Thêm dự án</Link>
        </div>
      </div>

      {db.mode === "local" && (
        <div className="notice info">
          <Icon name="database" size={18} />
          <span>Đang dùng lưu trữ cục bộ (chỉ để phát triển). Cấu hình Supabase trong <code>.env.local</code> để lưu dữ liệu thật.</span>
        </div>
      )}
      {empty && (
        <div className="notice info">
          <Icon name="database" size={18} />
          <span>Cơ sở dữ liệu chưa có bài viết và dự án. Vào <Link href="/admin/settings#database">Cài đặt → Cơ sở dữ liệu</Link> và bấm “Nhập dữ liệu có sẵn”.</span>
        </div>
      )}

      <div className="grid c4" style={{ marginBottom: 20 }}>
        <Link className="stat" href="/admin/leads?status=new"><div className={`ico${counts.new ? " warn" : ""}`}><Icon name="inbox" size={22} /></div><div><b>{counts.new}</b><span>Yêu cầu chưa xử lý</span></div></Link>
        <Link className="stat" href="/admin/analytics"><div className="ico"><Icon name="eye" size={22} /></div><div><b>{a.totals.views}</b><span>Lượt xem · 7 ngày</span></div></Link>
        <Link className="stat" href="/admin/analytics"><div className="ico ok"><Icon name="chart" size={22} /></div><div><b>{a.totals.clicks}</b><span>Click liên hệ / demo · 7 ngày</span></div></Link>
        <div className="stat"><div className="ico"><Icon name="news" size={22} /></div><div><b>{posts.count} · {projects.count}</b><span>Bài viết · dự án</span></div></div>
      </div>

      <div className="grid c2" style={{ alignItems: "start" }}>
        <section className="card">
          <div className="card-head" style={{ marginBottom: 8 }}>
            <div><h2>Lượt xem 7 ngày qua</h2><p>Di chuột lên cột để xem chi tiết.</p></div>
            <Link href="/admin/analytics" style={{ marginLeft: "auto" }}>Chi tiết →</Link>
          </div>
          <Bars series={a.series} />
        </section>
        <section className="card">
          <div className="card-head" style={{ marginBottom: 8 }}>
            <div><h2>Yêu cầu gần đây</h2></div>
            <Link href="/admin/leads" style={{ marginLeft: "auto" }}>Xem tất cả →</Link>
          </div>
          {recent.rows.length === 0 ? (
            <div className="empty" style={{ padding: "28px 8px" }}>
              <b>Chưa có yêu cầu nào</b>
              Yêu cầu từ biểu mẫu tư vấn sẽ xuất hiện ở đây.
            </div>
          ) : (
            <div className="stack" style={{ gap: 0 }}>
              {recent.rows.map((l) => (
                <Link key={l.id} href="/admin/leads" style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 0", borderTop: "1px solid var(--line)", color: "inherit", textDecoration: "none" }}>
                  <div className="avatar" style={{ width: 38, height: 38, fontSize: 15 }} aria-hidden="true">{l.name.trim().charAt(0).toUpperCase() || "?"}</div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <b style={{ display: "block" }}>{l.name} <span className="muted small" style={{ fontWeight: 400 }}>· {l.phone}</span></b>
                    <span className="muted small" style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.message}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className={`badge ${l.status}`}>{STATUS_LABEL[l.status]}</span>
                    <div className="muted small">{fmt.format(new Date(l.createdAt))}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
