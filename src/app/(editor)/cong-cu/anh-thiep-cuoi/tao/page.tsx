import type { Metadata } from "next";
import { blankCanvas } from "@/data/card-templates";
import EditorLoader from "@/components/cards/EditorLoader";
import { getPublishedTemplate } from "@/lib/cards/server";
import { formatById } from "@/lib/cards/types";

export const metadata: Metadata = { title: "Tạo thiệp cưới | SuperLanding" };

// New design: from a template (?mau=<slug>) or a blank card (?kho=<format id>). Nothing is stored until "Lưu".
export default async function NewCardPage({ searchParams }: PageProps<"/cong-cu/anh-thiep-cuoi/tao">) {
  const sp = await searchParams;
  const slug = typeof sp.mau === "string" ? sp.mau : undefined;
  const template = slug ? await getPublishedTemplate(slug) : undefined;
  const format = formatById(typeof sp.kho === "string" ? sp.kho : null) ?? formatById("5x7")!;

  const initial = template
    ? { canvas: template.canvas, width: template.width, height: template.height, title: "Thiệp cưới" }
    : { canvas: blankCanvas(format.width, format.height), width: format.width, height: format.height, title: "Thiệp cưới" };

  return (
    <EditorLoader
      key={template?.slug ?? format.id}
      mode="design"
      initial={initial}
      templateSlug={template?.slug ?? null}
      backHref="/cong-cu/anh-thiep-cuoi"
    />
  );
}
