import { services } from "@/data/content";

const icons: Record<string, React.ReactNode> = {
  "01": (
    <path d="M3 4h18v14H3zM3 9h18M8 21h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  "02": (
    <path d="M12 3v18M5 8l7-5 7 5M5 8v9l7 5 7-5V8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
  ),
  "03": (
    <path d="M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0M12 8v4l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  "04": (
    <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
  ),
};

export default function Services() {
  return (
    <section id="services" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-brand-600">Năng lực cốt lõi</p>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Dịch vụ chuyên sâu</h2>
          <p className="mt-3 text-muted-foreground">
            Thiết kế tinh tế, tối ưu trải nghiệm và nền tảng công nghệ vững chắc để mang lại kết quả vượt trội.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <article
              key={service.index}
              className="group rounded-2xl border border-border bg-background p-6 transition hover:-translate-y-1 hover:border-brand-500 hover:shadow-lg hover:shadow-brand-600/10"
            >
              <span className="text-xs font-bold text-border">{service.index}</span>
              <div className="my-4 flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-brand-600">
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                  {icons[service.index]}
                </svg>
              </div>
              <h3 className="text-lg font-bold">{service.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>
              <ul className="mt-4 space-y-2">
                {service.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
