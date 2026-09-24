import Cta from "@/components/home/Cta";
import Faq from "@/components/home/Faq";
import Hero from "@/components/home/Hero";
import Portfolio from "@/components/home/Portfolio";
import PromoPopup from "@/components/PromoPopup";
import Pricing from "@/components/home/Pricing";
import Process from "@/components/home/Process";
import Services from "@/components/home/Services";
import { projectsToCards } from "@/data/projects";
import { getProjects, getSettings } from "@/lib/site-data";

export default async function Home() {
  const [{ faqs }, projects] = await Promise.all([getSettings(), getProjects()]);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([name, text]) => ({
      "@type": "Question",
      name,
      acceptedAnswer: { "@type": "Answer", text },
    })),
  };
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Hero />
      <Services />
      <Process />
      <Portfolio projects={projectsToCards(projects)} />
      <Pricing />
      <Faq faqs={faqs} />
      <Cta />
      <PromoPopup />
    </main>
  );
}
