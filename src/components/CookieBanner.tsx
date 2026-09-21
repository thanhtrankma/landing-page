"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onOpenConsentSettings, openConsentSettings, useConsent } from "@/lib/consent";

export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={openConsentSettings}>
      Cài đặt cookie
    </button>
  );
}

export default function CookieBanner() {
  const { ready, consent, save } = useConsent();
  const [reopened, setReopened] = useState(false);
  const [custom, setCustom] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [thirdParty, setThirdParty] = useState(false);

  useEffect(
    () =>
      onOpenConsentSettings(() => {
        setAnalytics(consent?.analytics ?? false);
        setThirdParty(consent?.thirdParty ?? false);
        setCustom(true);
        setReopened(true);
      }),
    [consent],
  );

  if (!ready || (consent && !reopened)) return null;

  const decide = (a: boolean, t: boolean) => {
    save({ analytics: a, thirdParty: t });
    setReopened(false);
    setCustom(false);
  };

  return (
    <section className="consent" role="dialog" aria-labelledby="consent-title" aria-describedby="consent-desc">
      <h2 id="consent-title">Chúng tôi tôn trọng quyền riêng tư của bạn</h2>
      <p id="consent-desc">
        Website không dùng cookie quảng cáo và không bán dữ liệu của bạn. Với sự đồng ý của bạn, chúng tôi bật thống kê ẩn danh (không lưu IP) để cải thiện
        website và tải nội dung nhúng từ bên thứ ba (iNET). Xem chi tiết tại <Link href="/chinh-sach-bao-mat">Chính sách bảo mật</Link>.
      </p>

      {custom && (
        <div className="consent-opts">
          <div className="consent-opt">
            <span>
              <b>Cần thiết</b>
              <small>Ghi nhớ lựa chọn này. Luôn bật.</small>
            </span>
            <input type="checkbox" checked disabled aria-label="Cần thiết (luôn bật)" />
          </div>
          <label className="consent-opt">
            <span>
              <b>Thống kê ẩn danh</b>
              <small>Đếm lượt xem và click, không nhận dạng cá nhân.</small>
            </span>
            <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
          </label>
          <label className="consent-opt">
            <span>
              <b>Nội dung bên thứ ba</b>
              <small>Khung nhúng từ iNET trên trang Dịch vụ và Bảng giá.</small>
            </span>
            <input type="checkbox" checked={thirdParty} onChange={(e) => setThirdParty(e.target.checked)} />
          </label>
        </div>
      )}

      <div className="consent-actions">
        {custom ? (
          <button type="button" className="consent-btn primary" onClick={() => decide(analytics, thirdParty)}>
            Lưu lựa chọn
          </button>
        ) : (
          <>
            <button type="button" className="consent-btn primary" onClick={() => decide(true, true)}>
              Chấp nhận tất cả
            </button>
            <button type="button" className="consent-btn" onClick={() => decide(false, false)}>
              Chỉ cần thiết
            </button>
            <button type="button" className="consent-link" onClick={() => setCustom(true)}>
              Tùy chọn
            </button>
          </>
        )}
      </div>
    </section>
  );
}
