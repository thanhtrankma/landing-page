import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/Controls";
import { Icon } from "@/components/admin/Icons";
import { postCategories, servicePages } from "@/lib/content";
import { adminGetPost } from "@/lib/repo";
import { deletePostAction } from "../actions";
import PostForm from "../PostForm";

export const metadata: Metadata = { title: "Sửa bài viết" };

export default async function EditPostPage({ params, searchParams }: PageProps<"/admin/posts/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const post = await adminGetPost(id);
  if (!post) notFound();
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Sửa bài viết</h1>
          {sp.created && <p style={{ color: "var(--ok)", fontWeight: 600 }}>✓ Đã tạo bài viết.</p>}
        </div>
        <div className="row-actions">
          {post.published !== false && <Link className="btn" href={`/tin-tuc/${post.slug}`} target="_blank">Xem bài ↗</Link>}
          <Link className="btn" href="/admin/posts">← Danh sách</Link>
        </div>
      </div>
      <PostForm
        key={post.id}
        post={post}
        categories={postCategories.map((c) => ({ value: c.slug, label: c.label }))}
        services={servicePages.map((s) => ({ value: s.slug, label: s.shortLabel }))}
      />
      <div className="danger-zone">
        <p>Xóa bài viết này vĩnh viễn. Không thể hoàn tác.</p>
        <form action={deletePostAction}>
          <input type="hidden" name="id" value={post.id} />
          <ConfirmButton message="Xóa bài viết này vĩnh viễn?"><Icon name="trash" size={15} /> Xóa bài viết</ConfirmButton>
        </form>
      </div>
    </>
  );
}
