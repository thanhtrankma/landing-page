import type { Metadata } from "next";
import Link from "next/link";
import { postCategories, servicePages } from "@/lib/content";
import PostForm from "../PostForm";

export const metadata: Metadata = { title: "Viết bài mới" };

export default function NewPostPage() {
  return (
    <>
      <div className="page-head">
        <h1>Viết bài mới</h1>
        <Link className="btn" href="/admin/posts">← Danh sách</Link>
      </div>
      <PostForm
        categories={postCategories.map((c) => ({ value: c.slug, label: c.label }))}
        services={servicePages.map((s) => ({ value: s.slug, label: s.shortLabel }))}
      />
    </>
  );
}
