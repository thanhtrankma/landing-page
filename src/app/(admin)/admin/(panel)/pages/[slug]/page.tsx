import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/Controls";
import { Icon } from "@/components/admin/Icons";
import { LEGAL_SLUGS } from "@/data/legal";
import { adminGetPage } from "@/lib/repo";
import { resetPageAction } from "../actions";
import PageForm from "../PageForm";

export const metadata: Metadata = { title: "Sửa trang pháp lý" };

export default async function EditLegalPage({ params, searchParams }: PageProps<"/admin/pages/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  if (!LEGAL_SLUGS.includes(slug)) notFound();
  const page = await adminGetPage(slug);
  if (!page) notFound();
  return (
    <>
      <div className="page-head">
        <div>
          <h1>{page.title}</h1>
          {sp.reset && <p style={{ color: "var(--ok)", fontWeight: 600 }}>✓ Đã khôi phục nội dung gốc.</p>}
        </div>
        <div className="row-actions">
          {page.published && <Link className="btn" href={`/${slug}`} target="_blank"><Icon name="external" size={15} /> Xem trang</Link>}
          <Link className="btn" href="/admin/pages">← Danh sách</Link>
        </div>
      </div>
      <PageForm key={`${page.slug}-${page.updatedAt}`} page={page} />
      <div className="danger-zone">
        <p>Muốn làm lại từ đầu? Nội dung hiện tại sẽ bị thay bằng bản gốc do hệ thống soạn sẵn.</p>
        <form action={resetPageAction}>
          <input type="hidden" name="slug" value={slug} />
          <ConfirmButton message="Khôi phục nội dung gốc? Mọi chỉnh sửa hiện tại của trang này sẽ mất."><Icon name="trash" size={15} /> Khôi phục bản gốc</ConfirmButton>
        </form>
      </div>
    </>
  );
}
