import Cta from "@/components/home/Cta";
import Faq from "@/components/home/Faq";
import Hero from "@/components/home/Hero";
import Portfolio from "@/components/home/Portfolio";
import Pricing from "@/components/home/Pricing";
import Process from "@/components/home/Process";
import Services from "@/components/home/Services";
import { faqs } from "@/data/site";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(([name, text]) => ({
    "@type": "Question",
    name,
    acceptedAnswer: { "@type": "Answer", text },
  })),
};

export default function Home() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Hero />
      <Services />
      <Process />
      <Portfolio />
      <Pricing />
      <Faq />
      <Cta />
    </main>
  );
}
