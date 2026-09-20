import { pricingPlans } from "@/data/site";
import ScrollRow from "../ScrollRow";
import Tilt from "../Tilt";
import { Button, Heading, Icon } from "../ui";

export function PricingCards({ tilt = true }: { tilt?: boolean }) {
  const inner = tilt ? "tilt-inner" : undefined;
  const deep = tilt ? "tilt-inner-deep" : undefined;
  return (
    <ScrollRow>
      <div className="price-grid" style={tilt ? { marginTop: "50px" } : undefined}>
        {pricingPlans.map((plan, i) => {
          const custom = plan.price === "Báo giá riêng" || plan.price === "Liên hệ";
          const card = (
            <article className={plan.hot ? "price-card hot" : "price-card"} style={{ width: "100%", height: "100%" }}>
              {plan.duration && <div className={inner ? `duration-badge ${inner}` : "duration-badge"}>{plan.duration}</div>}
              {plan.hot && <i className={inner}>PHỔ BIẾN NHẤT</i>}
              <small className={inner}>WEBLANDING / {plan.name.toUpperCase()}</small>
              <h2 className={inner}>{plan.name}</h2>
              <p>{plan.desc}</p>
              <strong className={deep}>
                {!custom && "Từ "}
                {plan.price}
              </strong>
              <span className={inner}>{!custom && "/ dự án"}</span>
              <ul>
                {plan.items.map((text) => (
                  <li key={text}>
                    <Icon name="check" size={16} />
                    {text}
                  </li>
                ))}
              </ul>
              {tilt ? (
                <div className="tilt-inner" style={{ marginTop: "auto" }}>
                  <Button href="/lien-he">{custom ? "Liên hệ tư vấn" : "Bắt đầu ngay"}</Button>
                </div>
              ) : (
                <Button href="/lien-he">{custom ? "Liên hệ tư vấn" : "Bắt đầu ngay"}</Button>
              )}
            </article>
          );
          return (
            <div key={plan.name} className="animate-on-scroll" style={{ transitionDelay: `${100 * i}ms` }}>
              {tilt ? <Tilt maxRotation={10}>{card}</Tilt> : card}
            </div>
          );
        })}
      </div>
    </ScrollRow>
  );
}

export default function Pricing() {
  return (
    <section className="pricing-section">
      <div className="gv-wrap">
        <div className="animate-on-scroll">
          <Heading
            center
            eyebrow="BẢNG GIÁ DỊCH VỤ"
            title="Giải pháp & Bảng giá"
            text="Lựa chọn gói dịch vụ tối ưu nhất cho hoạt động kinh doanh và thương hiệu của bạn."
          />
        </div>
        <PricingCards />
      </div>
    </section>
  );
}
