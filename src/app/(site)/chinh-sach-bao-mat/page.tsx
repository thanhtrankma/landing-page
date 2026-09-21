import LegalPage, { legalMetadata } from "@/components/LegalPage";

const SLUG = "chinh-sach-bao-mat";

export const generateMetadata = () => legalMetadata(SLUG);

export default function Page() {
  return <LegalPage slug={SLUG} />;
}
