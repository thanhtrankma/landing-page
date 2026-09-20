"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { Heading } from "./ui";

type Cell = boolean | string;
type Row = { feature: string; basic: Cell; standard: Cell; premium: Cell };

const rows: Row[] = [
  { feature: "MỤC ĐÍCH", basic: "Có website để giới thiệu", standard: "Dùng lâu dài, chỉn chu", premium: "Website phục vụ hoạt động kinh doanh" },
  { feature: "PHÙ HỢP VỚI", basic: "Cá nhân, kinh doanh nhỏ", standard: "Doanh nghiệp nhỏ", premium: "Doanh nghiệp muốn phát triển" },
  { feature: "SỐ TRANG", basic: "1 trang (Landing Page)", standard: "6 trang", premium: "8-12 trang" },
  { feature: "TRANG CHỦ", basic: "Giao diện có sẵn", standard: "Bố cục rõ ràng", premium: "Định vị thương hiệu" },
  { feature: "VAI TRÒ CỦA WEB", basic: "Bảng hiệu trực tuyến", standard: "Công cụ giới thiệu", premium: "Công cụ tạo doanh thu" },
  { feature: "DỊCH VỤ", basic: "Gộp chung", standard: "Tách từng dịch vụ", premium: "Chi tiết + Landing Page" },
  { feature: "MẪU LIÊN HỆ", basic: true, standard: true, premium: true },
  { feature: "GIỚI THIỆU", basic: false, standard: true, premium: true },
  { feature: "TƯƠNG THÍCH DI ĐỘNG", basic: true, standard: true, premium: true },
  { feature: "QUẢN LÝ NỘI DUNG", basic: false, standard: "CRUD cơ bản", premium: "CRUD nâng cao" },
  { feature: "TỐI ƯU HÓA TÌM KIẾM", basic: "SEO cơ bản", standard: "SEO tiêu chuẩn", premium: "SEO nâng cao" },
  { feature: "NHẬN DIỆN THƯƠNG HIỆU", basic: false, standard: "Theo lĩnh vực", premium: "Theo bộ nhận diện riêng" },
  { feature: "TỐC ĐỘ & TỐI ƯU", basic: "Cơ bản", standard: "Cơ bản", premium: "Tối ưu" },
  { feature: "KHẢ NĂNG MỞ RỘNG", basic: false, standard: true, premium: "Rất cao" },
  { feature: "TIN TỨC / BÀI VIẾT", basic: false, standard: true, premium: "Có (SEO)" },
  { feature: "DANH MỤC BÀI VIẾT", basic: false, standard: true, premium: "Có (đa cấp)" },
  { feature: "TRANG QUẢN TRỊ", basic: false, standard: true, premium: true },
  { feature: "THỐNG KÊ TRUY CẬP", basic: false, standard: false, premium: true },
  { feature: "BẢO HÀNH", basic: "Bảo hành 4 tháng", standard: "Bảo hành 12 tháng", premium: "Bảo hành 12 tháng" },
];

const tiers = ["basic", "standard", "premium"] as const;
const tierLabel = { basic: "Cơ Bản", standard: "Tiêu Chuẩn", premium: "Cao Cấp" };
const highlighted = ["Tối ưu", "Rất cao", "CRUD nâng cao", "SEO nâng cao", "Không giới hạn", "Tối ưu tối đa (CDN/Cache)"];

const tick = (style: CSSProperties) => (
  <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

function renderCell(v: Cell): ReactNode {
  if (v === true) return tick({ width: "20px", height: "20px", display: "inline-block", color: "var(--primary)" });
  if (v === false)
    return (
      <svg
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
        style={{ width: "16px", height: "16px", display: "inline-block", color: "#b3babd", opacity: 0.5 }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
      </svg>
    );
  if (v.startsWith("Có"))
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          color: "var(--primary)",
          fontWeight: 600,
        }}
      >
        {tick({ width: "16px", height: "16px" })}
        {v}
      </span>
    );
  return <span className={highlighted.includes(v) ? "val-highlight" : "val-text"}>{v}</span>;
}

export default function PricingCompare() {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<(typeof tiers)[number]>("standard");

  return (
    <section className="comparison-section">
      <div className="gv-wrap">
        <div className="animate-on-scroll">
          <Heading
            center
            eyebrow="BẢNG SO SÁNH"
            title="Chi tiết tính năng các gói"
            text="So sánh trực quan các tính năng và dịch vụ đi kèm để chọn lựa giải pháp tối ưu nhất cho bạn."
          />
        </div>
        <div className={`comparison-wrapper ${expanded ? "expanded" : "collapsed"}`}>
          <div className="comparison-container comparison-desktop-view animate-on-scroll">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th className="category-title">Hạng mục</th>
                  <th className="col-basic">CƠ BẢN</th>
                  <th className="col-standard">TIÊU CHUẨN</th>
                  <th className="col-premium">CAO CẤP</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.feature}>
                    <td>{r.feature}</td>
                    <td>{renderCell(r.basic)}</td>
                    <td>{renderCell(r.standard)}</td>
                    <td>{renderCell(r.premium)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="comparison-mobile-view animate-on-scroll">
            <div className="comparison-mobile-tabs">
              {tiers.map((t) => (
                <button key={t} className={`comparison-mobile-tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                  {tierLabel[t]}
                </button>
              ))}
            </div>
            <div className="comparison-mobile-list">
              {rows.map((r) => (
                <div key={r.feature} className="comparison-mobile-row">
                  <span className="feature-name">{r.feature}</span>
                  <span className="feature-value">{renderCell(r[tab])}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="comparison-overlay" />
        </div>
        <div className="comparison-toggle-btn animate-on-scroll">
          <ToggleButton expanded={expanded} onClick={() => setExpanded(!expanded)} />
        </div>
        <div className="comparison-footer-note animate-on-scroll">
          ✦ Hỗ trợ kết nối và cấu hình Tên miền, Hosting &amp; cài đặt bảo mật SSL miễn phí cho tất cả các gói dịch vụ
        </div>
      </div>
    </section>
  );
}

// The shared Button renders a link; this variant is a real <button> like the original.
function ToggleButton({ expanded, onClick }: { expanded: boolean; onClick: () => void }) {
  return (
    <button className="gv-btn" onClick={onClick} style={{ border: 0, cursor: "pointer" }}>
      {expanded ? "Thu gọn bảng so sánh" : "Xem so sánh chi tiết tính năng"}
      <svg className="gv-icon" width={17} height={17} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12h14m-5-5 5 5-5 5" />
      </svg>
    </button>
  );
}
