import Image from "next/image";
import { processSteps } from "@/data/site";
import Tilt from "../Tilt";
import { Heading, Icon } from "../ui";

export default function Process() {
  return (
    <section className="surface">
      <div className="gv-wrap">
        <div className="animate-on-scroll">
          <Heading
            center
            eyebrow="QUY TRÌNH"
            title="Rõ ràng ở từng điểm chạm"
            text="Quy trình linh hoạt giúp dự án đi nhanh nhưng không đánh đổi chất lượng."
          />
        </div>
        <div className="process-layout">
          <div className="process-list">
            {processSteps.map(([icon, title, text], i) => (
              <div key={title} className="animate-on-scroll" style={{ transitionDelay: `${150 * i}ms`, width: "100%" }}>
                <Tilt maxRotation={6}>
                  <article className="process-card-horizontal">
                    <span
                      className="step-num tilt-inner-deep"
                      style={{ fontSize: "24px", margin: "0 10px 0 0", opacity: 0.85 }}
                    >
                      0{i + 1}
                    </span>
                    <div className="icon-box tilt-inner" style={{ margin: 0, flexShrink: 0 }}>
                      <Icon name={icon} size={24} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "left" }}>
                      <h3 className="tilt-inner" style={{ margin: 0, fontSize: "18px" }}>
                        {title}
                      </h3>
                      <p style={{ margin: 0, fontSize: "14px", color: "var(--text-light)", lineHeight: 1.4 }}>{text}</p>
                    </div>
                  </article>
                </Tilt>
              </div>
            ))}
          </div>
          <div className="process-art-wrap animate-on-scroll" style={{ transitionDelay: "300ms" }}>
            <Tilt maxRotation={8}>
              <Image
                src="/images/process-illustration.webp"
                alt="Quy trình 4 bước thiết kế Landing Page và Website chuẩn SEO chuyên nghiệp"
                width={500}
                height={380}
                className="process-illustration-img tilt-inner"
              />
            </Tilt>
          </div>
        </div>
      </div>
    </section>
  );
}
