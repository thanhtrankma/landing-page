"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { categories } from "@/data/projects";
import { requireAdmin } from "@/lib/auth";
import { deleteProject, nextProjectOrder, saveProject, slugTaken } from "@/lib/repo";
import { refreshSite } from "@/lib/refresh";
import { flag, int, slugify, text, type FormState } from "@/lib/validate";

export async function saveProjectAction(id: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const title = text(fd, "title");
  if (title.length < 3) return { error: "Tên dự án cần ít nhất 3 ký tự." };
  const slug = slugify(text(fd, "slug") || title);
  if (!slug) return { error: "Đường dẫn (slug) không hợp lệ." };
  if (await slugTaken("projects", slug, id ?? undefined)) return { error: `Đường dẫn "${slug}" đã được dùng cho dự án khác.` };
  const category = text(fd, "category");
  const cat = categories.find((c) => c.id === category && c.id !== "all");
  if (!cat) return { error: "Vui lòng chọn ngành hợp lệ." };
  const demoUrl = text(fd, "demoUrl");
  if (demoUrl && !/^(\/|https?:\/\/)/.test(demoUrl)) return { error: "Link demo phải bắt đầu bằng / hoặc https://" };

  const order = id ? undefined : await nextProjectOrder();
  const data = {
    slug,
    title,
    category,
    categoryLabel: cat.label,
    code: text(fd, "code"),
    img: text(fd, "img"),
    demoUrl: demoUrl || null,
    description: text(fd, "description"),
    content: String(fd.get("content") ?? ""),
    metaTitle: text(fd, "metaTitle"),
    metaDescription: text(fd, "metaDescription"),
    metaKeywords: text(fd, "metaKeywords"),
    homeOrder: id ? int(fd, "homeOrder") : order,
    hubOrder: id ? int(fd, "hubOrder") : order,
    sample: flag(fd, "sample"),
    published: flag(fd, "published"),
  };
  let saved;
  try {
    saved = await saveProject(data, id ?? undefined);
  } catch (e) {
    return { error: (e as Error).message };
  }
  refreshSite("projects");
  revalidatePath("/admin/projects");
  if (!id) redirect(`/admin/projects/${saved.id}?created=1`);
  return { ok: true, message: "Đã lưu dự án." };
}

export async function deleteProjectAction(fd: FormData) {
  await requireAdmin();
  await deleteProject(text(fd, "id"));
  refreshSite("projects");
  revalidatePath("/admin/projects");
  redirect("/admin/projects?deleted=1");
}

export async function toggleProjectAction(fd: FormData) {
  await requireAdmin();
  await saveProject({ published: text(fd, "to") === "on" }, text(fd, "id"));
  refreshSite("projects");
  revalidatePath("/admin/projects");
}
