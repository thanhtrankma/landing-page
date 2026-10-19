import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AppBar from "@/components/account/AppBar";
import GuestManager from "@/components/account/GuestManager";
import { pageRole } from "@/lib/invites/access";
import { getInvite, isUuid } from "@/lib/invites/server";
import { inviteTitle } from "@/lib/invites/types";

export const metadata: Metadata = { title: "Quản lý khách mời | SuperLanding" };

const TOOL = "/cong-cu/thiep-cuoi-online";

export default async function GuestsPage({ params }: PageProps<"/cong-cu/thiep-cuoi-online/khach-moi/[id]">) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const invite = await getInvite(id);
  if (!invite) notFound();
  const { role, user } = await pageRole(id);
  if (!role) redirect(user ? `${TOOL}/quan-ly` : `/dang-nhap?next=${encodeURIComponent(`${TOOL}/khach-moi/${id}`)}`);
  const title = inviteTitle(invite.data);
  return (
    <div className="tl">
      <AppBar user={user} />
      <main className="tl-main">
        <div className="tl-head">
          <div>
            <h1>Khách mời</h1>
            <p>{title}</p>
          </div>
          <div className="ce-row wrap">
            <Link className="ce-btn" href={`${TOOL}/sua/${id}`}>
              Sửa thiệp
            </Link>
            {invite.status === "published" && (
              <a className="ce-btn" href={`/thiep/${invite.slug}`} target="_blank" rel="noopener noreferrer">
                Xem thiệp ↗
              </a>
            )}
          </div>
        </div>
        <GuestManager inviteId={id} slug={invite.slug} status={invite.status} title={title} questions={invite.data.rsvp.questions.map((q) => q.label)} />
      </main>
    </div>
  );
}
