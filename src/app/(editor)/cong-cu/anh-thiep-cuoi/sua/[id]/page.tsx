import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import ClaimDesign from "@/components/cards/ClaimDesign";
import EditorLoader from "@/components/cards/EditorLoader";
import { EDIT_COOKIE, getDesign, isDesignId, tokenMatches } from "@/lib/cards/server";

export const metadata: Metadata = { title: "Sửa thiệp cưới | SuperLanding" };

// Re-opening a saved design. Access = the edit cookie; without it the page trades the #t=<token> link for one.
export default async function EditCardPage({ params }: PageProps<"/cong-cu/anh-thiep-cuoi/sua/[id]">) {
  const { id } = await params;
  if (!isDesignId(id)) notFound();
  const token = (await cookies()).get(EDIT_COOKIE(id))?.value;
  const design = await getDesign(id);
  if (!design) notFound();
  if (!(await tokenMatches(id, token))) return <ClaimDesign claimUrl={`/api/cards/${id}/claim`} tokenKey={`sl-card-token:${id}`} newHref="/cong-cu/anh-thiep-cuoi" />;

  return (
    <EditorLoader
      mode="design"
      initial={{ canvas: design.canvas, width: design.width, height: design.height, title: design.title }}
      design={{ id: design.id, shareSlug: design.shareSlug, updatedAt: design.updatedAt }}
      templateSlug={design.templateSlug}
      backHref="/cong-cu/anh-thiep-cuoi"
    />
  );
}
