import Link from "next/link";
import { services } from "@/data/site";
import ScrollRow from "../ScrollRow";
import Tilt from "../Tilt";
import { Heading, Icon } from "../ui";

export default function Services({
  eyebrow = "NĂNG LỰC CỐT LÕI",
  title = "Dịch vụ chuyên sâu",
  text = "Thiết kế tinh tế, tối ưu trải nghiệm và công nghệ vững chắc mang lại kết quả vượt trội.",
  large = false,
}: {
  eyebrow?: string;
  title?: string;
  text?: string | null;
  large?: boolean;
}) {
  return (
    <section>
      <div className="gv-wrap">
        <div className="animate-on-scroll">
          <Heading eyebrow={eyebrow} title={title} text={text ?? undefined} />
        </div>
        <ScrollRow>
          <div className={large ? "service-grid large" : "service-grid"}>
            {services.map((item, i) => (
              <div key={item.title} className="animate-on-scroll" style={{ transitionDelay: `${150 * i}ms` }}>
                <Tilt maxRotation={12}>
                  <article className="gv-card service-card">
                    <div className="card-top">
                      <span className="icon-box">
                        <Icon name={item.icon} size={28} />
                      </span>
                      <small>0{i + 1}</small>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                    <ul>
                      {item.items.map((text) => (
                        <li key={text}>
                          <Icon name="check" size={16} />
                          {text}
                        </li>
                      ))}
                    </ul>
                    <Link href={item.href}>
                      Khám phá thêm <Icon name="arrow" size={16} />
                    </Link>
                  </article>
                </Tilt>
              </div>
            ))}
          </div>
        </ScrollRow>
      </div>
    </section>
  );
}
