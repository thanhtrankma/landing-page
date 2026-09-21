import LegalPage, { legalMetadata } from "@/components/LegalPage";

const SLUG = "dieu-khoan-dich-vu";

export const generateMetadata = () => legalMetadata(SLUG);

export default function Page() {
  return <LegalPage slug={SLUG} />;
}
