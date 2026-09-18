const columns = [
  {
    title: "Dịch vụ",
    links: ["Thiết kế Website", "Landing Page", "Tối ưu & Chăm sóc", "Web App theo yêu cầu"],
  },
  {
    title: "Công ty",
    links: ["Dự án", "Bảng giá", "Câu hỏi thường gặp", "Liên hệ"],
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-foreground py-14 text-white/70">
      <div className="mx-auto grid max-w-6xl gap-10 border-b border-white/10 px-4 pb-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <a href="#top" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 17V7l10 10V7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="font-heading text-base font-bold text-white">
              Web<span className="text-brand-400">Landing</span>
            </span>
          </a>
          <p className="mt-3 max-w-[32ch] text-sm">
            Thiết kế Website &amp; Landing Page tối ưu chuyển đổi cho doanh nghiệp và cá nhân kinh doanh.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title} className="flex flex-col gap-2.5 text-sm">
            <h4 className="mb-1 font-semibold text-white">{col.title}</h4>
            {col.links.map((link) => (
              <a key={link} href="#" className="hover:text-white">
                {link}
              </a>
            ))}
          </div>
        ))}

        <div className="flex flex-col gap-2.5 text-sm">
          <h4 className="mb-1 font-semibold text-white">Liên hệ</h4>
          <a href="mailto:hello@weblanding.example" className="hover:text-white">
            hello@weblanding.example
          </a>
          <span>Thứ 2 – Thứ 7, 9:00 – 18:00</span>
        </div>
      </div>

      <p className="mx-auto max-w-6xl px-4 pt-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} WebLanding. Sample content — replace with your real copy before launch.
      </p>
    </footer>
  );
}
