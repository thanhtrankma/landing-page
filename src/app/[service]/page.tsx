import { notFound } from "next/navigation";
import ServicePage from "@/components/service/ServicePage";
import { servicePages } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return servicePages.map((s) => ({ service: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[service]">) {
  const { service: slug } = await params;
  const service = servicePages.find((s) => s.slug === slug);
  if (!service) return {};
  return pageMetadata({
    title: service.metaTitle,
    description: service.description,
    path: `/${service.slug}`,
    ogImageSize: false,
  });
}

export default async function Page({ params }: PageProps<"/[service]">) {
  const { service: slug } = await params;
  const service = servicePages.find((s) => s.slug === slug);
  if (!service) notFound();
  return <ServicePage service={service} />;
}
