import type { Metadata } from "next";
import Link from "next/link";
import { BarList, Bars } from "@/components/admin/Charts";
import { Icon } from "@/components/admin/Icons";
import { getAnalytics } from "@/lib/analytics";

export const metadata: Metadata = { title: "Lượt xem & click" };
const RANGES = [7, 30, 90];

export default async function AnalyticsPage({ searchParams }: PageProps<"/admin/analytics">) {
  const sp = await searchParams;
  const days = RANGES.includes(Number(sp.days)) ? Number(sp.days) : 30;
  const a = await getAnalytics(days);
  const rate = a.totals.views ? ((a.totals.clicks / a.totals.views) * 100).toFixed(1) : "0";

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Lượt xem & click</h1>
          <p>Thống kê ẩn danh: không lưu IP hay cookie theo dõi.</p>
        </div>
        <div className="chips" style={{ margin: 0 }} role="group" aria-label="Khoảng thời gian">
          {RANGES.map((r) => (
            <Link key={r} className={`chip${r === days ? " active" : ""}`} href={`/admin/analytics?days=${r}`}>{r} ngày</Link>
          ))}
        </div>
      </div>
      {a.truncated && <div className="notice info"><Icon name="alert" size={18} /><span>Dữ liệu rất lớn — chỉ hiển thị 30.000 sự kiện gần nhất.</span></div>}
      <div className="grid c4" style={{ marginBottom: 18 }}>
        <div className="stat"><div className="ico"><Icon name="eye" size={22} /></div><div><b>{a.totals.views}</b><span>Lượt xem trang</span></div></div>
        <div className="stat"><div className="ico"><Icon name="dashboard" size={22} /></div><div><b>{a.totals.visitors}</b><span>Phiên truy cập</span></div></div>
        <div className="stat"><div className="ico ok"><Icon name="chart" size={22} /></div><div><b>{a.totals.clicks}</b><span>Click liên hệ / demo</span></div></div>
        <div className="stat"><div className="ico warn"><Icon name="arrowUp" size={22} /></div><div><b>{rate}%</b><span>Click trên lượt xem</span></div></div>
      </div>
      <section className="card">
        <h2>Lượt xem theo ngày</h2>
        <Bars series={a.series} />
      </section>
      <div className="grid c2">
        <section className="card"><h2>Trang được xem nhiều</h2><BarList items={a.topPages} /></section>
        <section className="card"><h2>Loại click</h2><BarList items={a.clickKinds} /></section>
        <section className="card"><h2>Liên kết được click nhiều</h2><BarList items={a.topClicks} /></section>
        <section className="card">
          <h2>Thiết bị</h2><BarList items={a.devices} />
          <h2 style={{ marginTop: 22 }}>Nguồn truy cập</h2><BarList items={a.referrers} empty="Chưa có nguồn giới thiệu." />
        </section>
      </div>
    </>
  );
}
