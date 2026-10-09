import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui";
import { cardTitle, getSharedCard } from "@/lib/cards/server";
import "../../cong-cu/cards.css";

// Public page of a shared card: the rendered preview plus a way back into the tool. Never indexed.

const describe = (m: { date?: string; venue?: string }) =>
  [m.date && `Ngày ${m.date}`, m.venue].filter(Boolean).join(" · ") || "Trân trọng kính mời bạn đến chung vui cùng chúng tôi.";

export async function generateMetadata({ params }: PageProps<"/anh-thiep/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const card = await getSharedCard(slug);
  if (!card) return { title: "Không tìm thấy thiệp", robots: { index: false } };
  const title = cardTitle(card.meta, card.title);
  return {
    title,
    description: describe(card.meta),
    robots: { index: false, follow: false },
    openGraph: { title, description: describe(card.meta), type: "website", images: [{ url: card.previewUrl, width: 1080, height: Math.round((1080 * card.height) / card.width) }] },
    twitter: { card: "summary_large_image", title, images: [card.previewUrl] },
  };
}

export default async function SharedCardPage({ params }: PageProps<"/anh-thiep/[slug]">) {
  const { slug } = await params;
  const card = await getSharedCard(slug);
  if (!card) notFound();
  const title = cardTitle(card.meta, card.title);
  return (
    <main className="cards-share">
      <div className="gv-wrap">
        <h1>{title}</h1>
        <p className="cards-share-sub">{describe(card.meta)}</p>
        <figure className="cards-share-card" style={{ maxWidth: card.width >= card.height ? 760 : 520 }}>
          <Image src={card.previewUrl} alt={title} width={1080} height={Math.round((1080 * card.height) / card.width)} priority sizes="(max-width: 600px) 92vw, 520px" unoptimized />
        </figure>
        <div className="cards-share-actions">
          <a className="gv-btn light" href={card.previewUrl} target="_blank" rel="noopener">
            Xem ảnh gốc
          </a>
          <Button href="/cong-cu/anh-thiep-cuoi">Tạo thiệp cưới miễn phí</Button>
        </div>
        <p className="cards-share-note">Thiệp được tạo bằng công cụ miễn phí của SuperLanding.</p>
      </div>
    </main>
  );
}
