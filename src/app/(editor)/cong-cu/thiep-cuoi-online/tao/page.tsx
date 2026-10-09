import type { Metadata } from "next";
import { connection } from "next/server";
import InviteBuilder from "@/components/invite/InviteBuilder";
import { defaultInvite } from "@/lib/invites/defaults";

export const metadata: Metadata = { title: "Tạo thiệp cưới online | SuperLanding" };

// New invitation: nothing is stored until the couple presses "Lưu". Rendered per request so the
// suggested date is always in the future.
export default async function NewInvitePage() {
  await connection();
  return <InviteBuilder initial={defaultInvite()} />;
}
