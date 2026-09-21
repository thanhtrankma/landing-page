"use client";

import Image from "next/image";
import { useState } from "react";
import { Heading } from "../ui";

export default function Faq({
  faqs,
  images = [
    { src: "/images/faq-illustration.png", alt: "FAQ Illustration", width: 200, height: 200 },
    { src: "/images/faq-support.png", alt: "Support Illustration", width: 200, height: 200 },
  ],
}: {
  faqs: [question: string, answer: string][];
  images?: { src: string; alt: string; width: number; height: number }[];
}) {
  const [open, setOpen] = useState(0);

  return (
    <section className="surface">
      <div className="gv-wrap faq">
        <div className="animate-on-scroll faq-sidebar">
          <Heading
            eyebrow="CÂU HỎI THƯỜNG GẶP"
            title="Giải đáp trước khi bạn bắt đầu"
            text="Những câu hỏi khách hàng thường đặt ra khi hợp tác thiết kế website cùng SuperLanding."
          />
          <div className="faq-images">
            {images.map((img) => (
              <Image key={img.src} src={img.src} alt={img.alt} width={img.width} height={img.height} className="faq-illustration-img" />
            ))}
          </div>
        </div>
        <div>
          {faqs.map(([question, answer], i) => (
            <div key={question} className="animate-on-scroll" style={{ transitionDelay: `${100 * i}ms` }}>
              <article>
                <button onClick={() => setOpen(open === i ? -1 : i)}>
                  <span>{question}</span>
                  <b>{open === i ? "−" : "+"}</b>
                </button>
                {open === i && <p>{answer}</p>}
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
