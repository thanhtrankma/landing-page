import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import ClaimDesign from "@/components/cards/ClaimDesign";
import InviteBuilder from "@/components/invite/InviteBuilder";
import { getInvite, INVITE_COOKIE, inviteTokenMatches, isUuid } from "@/lib/invites/server";

export const metadata: Metadata = { title: "Sửa thiệp cưới online | SuperLanding" };

// Re-opening a saved invitation. Access = the edit cookie; without it the page trades the #t=<token> link for one.
export default async function EditInvitePage({ params }: PageProps<"/cong-cu/thiep-cuoi-online/sua/[id]">) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const invite = await getInvite(id);
  if (!invite) notFound();
  const token = (await cookies()).get(INVITE_COOKIE(id))?.value;
  if (!(await inviteTokenMatches(id, token))) {
    return <ClaimDesign claimUrl={`/api/invites/${id}/claim`} tokenKey={`sl-invite-token:${id}`} newHref="/cong-cu/thiep-cuoi-online" />;
  }
  return <InviteBuilder initial={invite.data} invite={{ id: invite.id, slug: invite.slug, published: invite.published, updatedAt: invite.updatedAt }} />;
}
