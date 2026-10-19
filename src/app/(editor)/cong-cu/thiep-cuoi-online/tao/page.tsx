import type { Metadata } from "next";
import { connection } from "next/server";
import InviteEditor from "@/components/invite/InviteEditor";
import { currentUser } from "@/lib/account/server";
import { defaultInvite, suggestedDate } from "@/lib/invites/defaults";
import { isTheme } from "@/lib/invites/types";

export const metadata: Metadata = { title: "Tạo thiệp cưới online | SuperLanding" };

// New invitation (?mau=<theme>&mau_sac=<colour>). Nothing is stored until the first edit (autosave then creates the draft and moves to /sua/<id>).
export default async function NewInvitePage({ searchParams }: PageProps<"/cong-cu/thiep-cuoi-online/tao">) {
  await connection();
  const { mau, mau_sac } = await searchParams;
  const user = await currentUser();
  return <InviteEditor initial={defaultInvite(suggestedDate(), isTheme(mau) ? mau : "song-hy", typeof mau_sac === "string" ? mau_sac : "")} user={user ? { email: user.email, name: user.name } : null} />;
}
