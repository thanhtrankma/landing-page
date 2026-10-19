import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClaimDesign from "@/components/cards/ClaimDesign";
import InviteEditor from "@/components/invite/InviteEditor";
import { pageRole } from "@/lib/invites/access";
import { getInvite, isUuid } from "@/lib/invites/server";

export const metadata: Metadata = { title: "Sửa thiệp cưới online | SuperLanding" };

// Editing an invitation: owner, invited member, or the browser that started the draft (edit cookie / secret link).
export default async function EditInvitePage({ params, searchParams }: PageProps<"/cong-cu/thiep-cuoi-online/sua/[id]">) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const invite = await getInvite(id);
  if (!invite) notFound();
  const { role, user } = await pageRole(id);
  if (!role) {
    return <ClaimDesign claimUrl={`/api/invites/${id}/claim`} tokenKey={`sl-invite-token:${id}`} newHref="/cong-cu/thiep-cuoi-online" />;
  }
  const sp = await searchParams;
  return (
    <InviteEditor
      initial={invite.data}
      invite={{ id: invite.id, slug: invite.slug, status: invite.status, published: invite.published, role }}
      user={user ? { email: user.email, name: user.name } : null}
      autoPublish={sp.publish === "1"}
    />
  );
}
