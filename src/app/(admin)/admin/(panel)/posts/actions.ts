"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { deletePost, savePost, slugTaken } from "@/lib/repo";
import { refreshSite } from "@/lib/refresh";
import { flag, slugify, text, type FormState } from "@/lib/validate";

export async function savePostAction(id: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const title = text(fd, "title");
  if (title.length < 3) return { error: "Tiêu đề cần ít nhất 3 ký tự." };
  const slug = slugify(text(fd, "slug") || title);
  if (!slug) return { error: "Đường dẫn (slug) không hợp lệ." };
  if (await slugTaken("posts", slug, id ?? undefined)) return { error: `Đường dẫn "${slug}" đã được dùng cho bài khác.` };
  const content = String(fd.get("content") ?? "");
  if (content.trim().length < 10) return { error: "Nội dung bài viết đang trống." };

  const createdAt = text(fd, "createdAt");
  const data = {
    slug,
    title,
    category: text(fd, "category"),
    img: text(fd, "img"),
    summary: text(fd, "summary"),
    content,
    metaTitle: text(fd, "metaTitle"),
    metaDescription: text(fd, "metaDescription"),
    metaKeywords: text(fd, "metaKeywords"),
    service: text(fd, "service") || "thiet-ke-website",
    published: flag(fd, "published"),
    ...(createdAt && !Number.isNaN(Date.parse(createdAt)) ? { createdAt: new Date(createdAt).toISOString() } : {}),
  };
  let saved;
  try {
    saved = await savePost(data, id ?? undefined);
  } catch (e) {
    return { error: (e as Error).message };
  }
  refreshSite("posts");
  revalidatePath("/admin/posts");
  if (!id) redirect(`/admin/posts/${saved.id}?created=1`);
  return { ok: true, message: "Đã lưu bài viết." };
}

export async function deletePostAction(fd: FormData) {
  await requireAdmin();
  await deletePost(text(fd, "id"));
  refreshSite("posts");
  revalidatePath("/admin/posts");
  redirect("/admin/posts?deleted=1");
}

export async function togglePostAction(fd: FormData) {
  await requireAdmin();
  const id = text(fd, "id");
  await savePost({ published: text(fd, "to") === "on" }, id);
  refreshSite("posts");
  revalidatePath("/admin/posts");
}
