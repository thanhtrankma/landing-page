"use client";

import { useState } from "react";
import { useConsent } from "@/lib/consent";
import Glyph, { type GlyphName } from "./Glyph";
import { Heading } from "./ui";

const partners: {
  id: string;
  title: string;
  badge: string;
  desc: string;
  link: string;
  cta: string;
  icon: GlyphName;
  color: string;
}[] = [
  {
    id: "domain",
    title: "Đăng Ký Tên Miền",
    badge: "Tên miền .VN & Quốc tế",
    desc: "Tra cứu và giữ chỗ tên miền thương hiệu đẹp nhất. Miễn phí bảo mật WHOIS, cấu hình DNS nhanh chóng.",
    link: "https://inet.vn/dang-ky-ten-mien?aff=561686",
    cta: "Tra cứu Tên miền",
    icon: "globe",
    color: "#16237f",
  },
  {
    id: "hosting",
    title: "Web Hosting NVMe",
    badge: "Ổ cứng NVMe siêu tốc",
    desc: "Gói lưu trữ web tốc độ cao, băng thông không giới hạn, tích hợp cPanel tiếng Việt và SSL miễn phí.",
    link: "https://inet.vn/hosting/web-hosting?aff=561686",
    cta: "Xem gói Web Hosting",
    icon: "rocket",
    color: "#f97316",
  },
  {
    id: "email",
    title: "Email Theo Tên Miền",
    badge: "Chống Spam 99.9%",
    desc: "Email doanh nghiệp uy tín tenban@tendoanhnghiep.com, địa chỉ IP sạch, tỷ lệ vào Inbox cao tuyệt đối.",
    link: "https://inet.vn/email-theo-ten-mien?aff=561686",
    cta: "Tạo Email Doanh nghiệp",
    icon: "mail",
    color: "#16a34a",
  },
  {
    id: "cloud",
    title: "Cloud VPS / Server",
    badge: "Uptime 99.99%",
    desc: "Máy chủ ảo hạ tầng mạnh mẽ, tài nguyên RAM & CPU riêng biệt, khởi tạo tự động trong 60 giây.",
    link: "https://inet.vn/cloud-server?aff=561686",
    cta: "Khám phá Cloud Server",
    icon: "cloud",
    color: "#2563eb",
  },
];

const dot = (background: string) =>
  ({ width: "12px", height: "12px", borderRadius: "50%", background, display: "inline-block" }) as const;

export default function InetPartner() {
  const [activeId, setActiveId] = useState("domain");
  const { ready, consent, save } = useConsent();
  const active = partners.find((p) => p.id === activeId) ?? partners[0];

  return (
    <section className="inet-partner-section" style={{ padding: "60px 0", background: "var(--surface-container-low, #f8fafc)" }}>
      <div className="gv-wrap">
        <div className="animate-on-scroll">
          <Heading
            eyebrow="HẠ TẦNG LƯU TRỮ KHUYÊN DÙNG"
            title="Giải pháp Tên Miền & Hosting iNET Uy Tín"
            text="Trải nghiệm và tra cứu trực tiếp các dịch vụ hạ tầng tên miền, hosting, email và cloud server từ đối tác iNET."
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
            marginTop: "32px",
            marginBottom: "40px",
          }}
        >
          {partners.map((p, i) => {
            const on = activeId === p.id;
            return (
              <div key={p.id} className="animate-on-scroll" style={{ transitionDelay: `${100 * i}ms` }}>
                <div
                  onClick={() => setActiveId(p.id)}
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "20px",
                    border: on ? `2px solid ${p.color}` : "1px solid #e2e8f0",
                    boxShadow: on ? "0 8px 24px rgba(0,0,0,0.08)" : "0 4px 12px rgba(0,0,0,0.02)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "100%",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                      <span style={{ display: "inline-flex", color: p.color }}>
                        <Glyph name={p.icon} size={30} />
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "4px 10px",
                          borderRadius: "20px",
                          background: `${p.color}15`,
                          color: p.color,
                          textTransform: "uppercase",
                        }}
                      >
                        {p.badge}
                      </span>
                    </div>
                    <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>{p.title}</h3>
                    <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.5, marginBottom: "16px" }}>{p.desc}</p>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveId(p.id);
                      }}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        background: on ? `${p.color}15` : "#f1f5f9",
                        color: on ? p.color : "#475569",
                        fontWeight: 700,
                        fontSize: "13px",
                        border: "none",
                        cursor: "pointer",
                        width: "100%",
                      }}
                    >
                      {on ? "✓ Đang xem Iframe" : "Xem Trực Tiếp Iframe"}
                    </button>
                    <a
                      href={p.link}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        background: p.color,
                        color: "#ffffff",
                        fontWeight: 700,
                        fontSize: "13px",
                        textDecoration: "none",
                        textAlign: "center",
                      }}
                    >
                      {p.cta} ↗
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div
          className="animate-on-scroll"
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            border: "1px solid #cbd5e1",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 24px",
              background: "#0f172a",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={dot("#ef4444")} />
              <span style={dot("#f59e0b")} />
              <span style={dot("#10b981")} />
              <span style={{ fontSize: "14px", fontWeight: 600, marginLeft: "8px", opacity: 0.9 }}>
                iNET Portal: {active.title}
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {partners.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActiveId(p.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    border: "none",
                    background: activeId === p.id ? p.color : "#1e293b",
                    color: "#ffffff",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <Glyph name={p.icon} size={14} />
                    {p.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ width: "100%", height: "600px", background: "#f8fafc", position: "relative" }}>
            {consent?.thirdParty ? (
              <iframe
                src={active.link}
                width="100%"
                height="600"
                style={{ border: "none", width: "100%", height: "600px" }}
                title={`iNET ${active.title}`}
              />
            ) : (
              <div className="embed-gate">
                <p>
                  Khung này tải nội dung từ <b>inet.vn</b> (bên thứ ba). Khi tải, iNET có thể nhận địa chỉ IP của bạn và đặt cookie riêng.
                </p>
                <div className="embed-gate-actions">
                  <button type="button" disabled={!ready} onClick={() => save({ analytics: consent?.analytics ?? false, thirdParty: true })}>
                    Cho phép và tải nội dung
                  </button>
                  <a href={active.link} target="_blank" rel="noopener noreferrer">
                    Hoặc mở trực tiếp trên inet.vn ↗
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
