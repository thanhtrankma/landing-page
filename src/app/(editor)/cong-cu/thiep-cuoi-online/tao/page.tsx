import type { Metadata } from "next";
import { connection } from "next/server";
import InviteBuilder from "@/components/invite/InviteBuilder";
import { defaultInvite, suggestedDate } from "@/lib/invites/defaults";
import { isTheme } from "@/lib/invites/types";

export const metadata: Metadata = { title: "Tạo thiệp cưới online | SuperLanding" };

// New invitation: nothing is stored until the couple presses "Lưu". Rendered per request so the
// suggested date is always in the future.
export default async function NewInvitePage({ searchParams }: PageProps<"/cong-cu/thiep-cuoi-online/tao">) {
  await connection();
  const { mau } = await searchParams;
  return <InviteBuilder initial={defaultInvite(suggestedDate(), isTheme(mau) ? mau : "song-hy")} />;
}
