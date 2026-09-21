export function Bars({ series }: { series: { day: string; views: number; clicks: number }[] }) {
  const max = Math.max(1, ...series.map((s) => s.views));
  return (
    <div className="bars" role="img" aria-label="Biểu đồ lượt xem theo ngày">
      {series.map((s) => (
        <div key={s.day} className="bar" style={{ height: `${Math.max(2, (s.views / max) * 100)}%` }}>
          <i>{s.day.slice(5)}: {s.views} xem · {s.clicks} click</i>
        </div>
      ))}
    </div>
  );
}

export function BarList({ items, empty = "Chưa có dữ liệu." }: { items: { label: string; n: number }[]; empty?: string }) {
  if (!items.length) return <p className="muted small" style={{ margin: 0 }}>{empty}</p>;
  const max = items[0].n;
  return (
    <div className="bar-list">
      {items.map((i) => (
        <div className="r" key={i.label}>
          <span className="t" title={i.label}>{i.label}</span>
          <b>{i.n}</b>
          <span className="track"><i style={{ width: `${(i.n / max) * 100}%` }} /></span>
        </div>
      ))}
    </div>
  );
}
