import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Invitation from "@/components/invite/Invitation";
import { getPublicInvite, listPublicWishes } from "@/lib/invites/server";
import { inviteTitle, parseDate } from "@/lib/invites/types";

// The shared invitation. ?khach=<tên> personalises the greeting ("Kính gửi …").

const guestFrom = (sp: Record<string, string | string[] | undefined>) => {
  const v = sp.khach ?? sp.to;
  return typeof v === "string" ? v.normalize("NFC").replace(/\s+/g, " ").trim().slice(0, 60) : "";
};

export async function generateMetadata({ params, searchParams }: PageProps<"/thiep/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const invite = await getPublicInvite(slug);
  if (!invite) return { title: "Không tìm thấy thiệp", robots: { index: false } };
  const d = invite.data;
  const date = parseDate(d.date);
  const guest = guestFrom(await searchParams);
  const title = inviteTitle(d);
  const description = `${guest ? `Kính gửi ${guest}. ` : ""}Trân trọng kính mời bạn đến chung vui${date ? ` ngày ${date.dd}.${date.mm}.${date.y}` : ""}.`;
  const image = d.cover || d.couplePhoto;
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "website", ...(image ? { images: [{ url: image }] } : {}) },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, ...(image ? { images: [image] } : {}) },
  };
}

export default async function InvitationPage({ params, searchParams }: PageProps<"/thiep/[slug]">) {
  const { slug } = await params;
  const invite = await getPublicInvite(slug);
  if (!invite) notFound();
  const wishes = invite.id && invite.data.rsvp.enabled ? await listPublicWishes(invite.id).catch(() => []) : [];
  return <Invitation data={invite.data} slug={invite.id ? slug : null} demo={!invite.id} guest={guestFrom(await searchParams)} initialWishes={wishes} />;
}
