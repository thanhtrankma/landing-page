import { pricingTiers } from "@/data/content";

export default function Pricing() {
  return (
    <section id="pricing" className="bg-muted py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-brand-600">Bảng giá dịch vụ</p>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Giải pháp &amp; Bảng giá</h2>
          <p className="mt-3 text-muted-foreground">
            Lựa chọn gói dịch vụ phù hợp nhất cho hoạt động kinh doanh của bạn. Số liệu mẫu — cập nhật theo bảng giá thật.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pricingTiers.map((tier) => (
            <article
              key={tier.name}
              className={`relative flex flex-col rounded-2xl border bg-background p-6 ${
                tier.featured ? "border-brand-600 shadow-xl shadow-brand-600/15 lg:-translate-y-2" : "border-border"
              }`}
            >
              {tier.badge && (
                <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-brand-500 to-brand-700 px-3 py-1 text-xs font-bold text-white">
                  {tier.badge}
                </span>
              )}
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{tier.duration}</span>
              <p className="mt-1 text-xs font-semibold text-brand-600">{tier.tag}</p>
              <h3 className="mt-2 text-xl font-extrabold">{tier.name}</h3>
              <p className="mt-2 min-h-[42px] text-sm text-muted-foreground">{tier.description}</p>
              <p className="mt-4 text-2xl font-extrabold">
                {tier.priceFrom !== "Báo giá riêng" && <span className="mr-1 text-sm font-medium text-muted-foreground">Từ</span>}
                {tier.priceFrom}
                {tier.priceFrom !== "Báo giá riêng" && <span className="text-sm font-medium text-muted-foreground"> / dự án</span>}
              </p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`mt-6 inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition ${
                  tier.featured
                    ? "bg-brand-600 text-white hover:bg-brand-700"
                    : "border border-border text-foreground hover:border-brand-600 hover:text-brand-600"
                }`}
              >
                {tier.ctaLabel}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
