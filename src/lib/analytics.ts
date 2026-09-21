import "server-only";
import { fetchEvents, type EventRow } from "./repo";

const TZ = "Asia/Ho_Chi_Minh";
const dayKey = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d); // YYYY-MM-DD

const tally = <T,>(rows: T[], key: (r: T) => string | null | undefined, top = 8) => {
  const m = new Map<string, number>();
  for (const r of rows) {
    const k = key(r);
    if (k) m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, top).map(([label, n]) => ({ label, n }));
};

export async function getAnalytics(days: number) {
  const since = new Date(Date.now() - days * 86400_000);
  const { rows, truncated } = await fetchEvents(since.toISOString());
  const views = rows.filter((r) => r.type === "view");
  const clicks = rows.filter((r) => r.type === "click");

  const series: { day: string; views: number; clicks: number }[] = [];
  const index = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const day = dayKey(new Date(Date.now() - i * 86400_000));
    index.set(day, series.push({ day, views: 0, clicks: 0 }) - 1);
  }
  for (const r of rows) {
    const i = index.get(dayKey(new Date(r.created_at)));
    if (i !== undefined) series[i][r.type === "view" ? "views" : "clicks"]++;
  }

  const KIND: Record<string, string> = { zalo: "Zalo", phone: "Gọi điện", email: "Email", demo: "Xem demo", cta: "Nút / liên kết khác", social: "Mạng xã hội", other: "Khác" };
  return {
    truncated,
    totals: { views: views.length, clicks: clicks.length, visitors: new Set(views.map((v) => v.visitor).filter(Boolean)).size },
    series,
    topPages: tally(views, (r) => r.path, 10),
    clickKinds: tally(clicks, (r) => KIND[r.kind ?? "other"] ?? "Khác", 8),
    topClicks: tally(clicks, (r) => (r.label ? `${r.label} → ${r.href ?? ""}`.slice(0, 90) : r.href), 10),
    devices: tally(views, (r) => ({ mobile: "Di động", tablet: "Máy tính bảng", desktop: "Máy tính" })[r.device ?? ""] ?? null, 3),
    referrers: tally(views, (r) => r.referrer, 8),
  } satisfies Record<string, unknown> & { totals: Record<string, number> };
}

export type Analytics = Awaited<ReturnType<typeof getAnalytics>>;
export type { EventRow };
