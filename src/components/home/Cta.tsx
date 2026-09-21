import { PHONE, PHONE_DOTTED } from "@/data/site";
import { Button, Icon } from "../ui";

const assurances = ["Phản hồi nhanh trong 15 phút", "Không ràng buộc hợp đồng", "Báo giá minh bạch, rõ ràng"];
const circle = "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831";

export default function Cta() {
  return (
    <section className="cta home-cta">
      <div className="cta-glow cta-glow-one" />
      <div className="cta-glow cta-glow-two" />
      <div className="cta-glow cta-glow-three" />
      <div className="gv-wrap cta-shell animate-on-scroll">
        <div className="cta-grid-container">
          <div className="cta-copy">
            <span className="cta-eyebrow">
              <i className="pulse-dot" /> SẴN SÀNG CHO BƯỚC TIẾP THEO?
            </span>
            <h2>
              Bắt đầu hành trình với
              <br />
              <span className="gradient-text">website xứng tầm</span> thương hiệu của bạn.
            </h2>
            <p className="cta-desc">Chia sẻ mục tiêu của bạn — SuperLanding sẽ tư vấn giải pháp phù hợp và gửi báo giá chi tiết, hoàn toàn miễn phí.</p>
            <div className="cta-action-group">
              <Button href="/lien-he" light>
                Nhận tư vấn miễn phí
              </Button>
              <a href={`tel:${PHONE}`} className="cta-phone-link">
                <span className="phone-icon-wrapper">
                  <Icon name="phone" size={16} />
                </span>
                <div className="phone-text">
                  <span className="phone-label">Gọi Hotline tư vấn</span>
                  <span className="phone-num">{PHONE_DOTTED}</span>
                </div>
              </a>
            </div>
            <div className="cta-assurances">
              {assurances.map((text) => (
                <div key={text} className="cta-badge">
                  <span className="badge-icon">
                    <Icon name="check" size={12} />
                  </span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="cta-visual-wrapper">
            <div className="cta-visual-card">
              <div className="mockup-browser">
                <div className="browser-header">
                  <span className="browser-dot dot-red" />
                  <span className="browser-dot dot-yellow" />
                  <span className="browser-dot dot-green" />
                  <div className="browser-address">superlanding.vn/yeu-cau-thiet-ke</div>
                </div>
                <div className="browser-content">
                  <div className="mockup-page-hero">
                    <div className="mockup-skeleton title-skele" />
                    <div className="mockup-skeleton desc-skele" />
                    <div className="mockup-skeleton btn-skele" />
                  </div>
                  <div className="floating-card card-design animate-float-delay-1">
                    <div className="card-design-header">
                      <span className="badge-design">UI/UX Layout</span>
                      <span className="design-status">Đang dựng</span>
                    </div>
                    <div className="skeleton-grid">
                      <div className="skeleton-col" />
                      <div className="skeleton-col" />
                      <div className="skeleton-col" />
                    </div>
                  </div>
                  <div className="floating-card card-metrics animate-float-delay-2">
                    <div className="metrics-icon">
                      <Icon name="chart" size={14} />
                    </div>
                    <div className="metrics-data">
                      <span className="metrics-num">CRO</span>
                      <span className="metrics-label">Theo mục tiêu</span>
                    </div>
                  </div>
                  <div className="floating-card card-speed animate-float-delay-3">
                    <div className="speed-gauge">
                      <svg viewBox="0 0 36 36" className="circular-chart green">
                        <path className="circle-bg" d={circle} />
                        <path className="circle" strokeDasharray="98, 100" d={circle} />
                      </svg>
                      <span className="speed-val">CWV</span>
                    </div>
                    <div className="speed-text">
                      <span className="speed-title">Hiệu năng</span>
                      <span className="speed-desc">Có đo lường</span>
                    </div>
                  </div>
                  <div className="mockup-cursor">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="white" stroke="#0b6fa4" strokeWidth="1.5">
                      <path d="M3 3l7.07 16.97 2.51-6.39 6.39-2.51L3 3z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
