"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { refreshSite } from "@/lib/refresh";
import { resetPage, savePage } from "@/lib/repo";
import { flag, text, type FormState } from "@/lib/validate";

const revalidate = (slug: string) => {
  refreshSite("pages");
  revalidatePath("/admin/pages");
  revalidatePath(`/${slug}`);
};

export async function savePageAction(slug: string, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const title = text(fd, "title");
  if (title.length < 3) return { error: "Tiêu đề cần ít nhất 3 ký tự." };
  const content = String(fd.get("content") ?? "");
  if (content.trim().length < 20) return { error: "Nội dung đang quá ngắn." };
  try {
    await savePage(slug, { title, description: text(fd, "description"), content, published: flag(fd, "published") });
  } catch (e) {
    return { error: `Không lưu được: ${(e as Error).message}. Nếu là lỗi bảng "pages", hãy chạy supabase/pages.sql trong Supabase.` };
  }
  revalidate(slug);
  return { ok: true, message: "Đã lưu. Trang trên website đã được cập nhật." };
}

export async function togglePageAction(fd: FormData) {
  await requireAdmin();
  const slug = text(fd, "slug");
  await savePage(slug, { published: text(fd, "to") === "on" });
  revalidate(slug);
}

export async function resetPageAction(fd: FormData) {
  await requireAdmin();
  const slug = text(fd, "slug");
  await resetPage(slug);
  revalidate(slug);
  redirect(`/admin/pages/${slug}?reset=1`);
}
