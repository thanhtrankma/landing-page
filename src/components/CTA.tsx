"use client";

import { FormEvent, useState } from "react";

export default function CTA() {
  const [note, setNote] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();

    if (!name || !phone) {
      setNote("Vui lòng nhập đầy đủ họ tên và số điện thoại.");
      return;
    }
    setNote(`Cảm ơn ${name}! Đội ngũ sẽ liên hệ số ${phone} trong 24 giờ tới.`);
    event.currentTarget.reset();
  }

  return (
    <section id="contact" className="bg-gradient-to-br from-brand-600 to-brand-800 py-20 text-white sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-16">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Sẵn sàng cho bước tiếp theo?
          </h2>
          <p className="mt-3 max-w-md text-white/85">
            Nhận tư vấn giải pháp và báo giá chi tiết hoàn toàn miễn phí trong vòng 24 giờ.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/25 bg-white/10 p-6 backdrop-blur">
          <div className="space-y-1.5">
            <label htmlFor="cta-name" className="text-sm font-semibold">Họ và tên</label>
            <input
              id="cta-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Nguyễn Văn A"
              required
              className="h-11 w-full rounded-lg border border-white/30 bg-white/95 px-3.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-white"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="cta-phone" className="text-sm font-semibold">Số điện thoại</label>
            <input
              id="cta-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="09xx xxx xxx"
              required
              className="h-11 w-full rounded-lg border border-white/30 bg-white/95 px-3.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-white"
            />
          </div>
          <button
            type="submit"
            className="min-h-11 w-full cursor-pointer rounded-full bg-white px-5 text-sm font-bold text-brand-700 transition hover:bg-brand-50"
          >
            Gửi yêu cầu tư vấn
          </button>
          <p role="status" aria-live="polite" className="min-h-[18px] text-sm">{note}</p>
        </form>
      </div>
    </section>
  );
}
