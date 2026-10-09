"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { adminCreateTemplate, adminDeleteTemplate, adminUpdateTemplate, importSeedTemplates, TEMPLATE_TAG } from "@/lib/cards/server";
import { formatById } from "@/lib/cards/types";
import { text } from "@/lib/validate";

const refresh = () => {
  updateTag(TEMPLATE_TAG);
  revalidatePath("/cong-cu/anh-thiep-cuoi");
  revalidatePath("/admin/mau-thiep");
};

export async function createTemplateAction(fd: FormData) {
  await requireAdmin();
  const format = formatById(text(fd, "format")) ?? formatById("5x7")!;
  const id = await adminCreateTemplate({ name: `Mẫu mới (${format.label})`, width: format.width, height: format.height });
  refresh();
  redirect(`/admin/mau-thiep/${id}`);
}

export async function importSeedsAction() {
  await requireAdmin();
  const added = await importSeedTemplates();
  refresh();
  redirect(`/admin/mau-thiep?imported=${added}`);
}

export async function toggleTemplateAction(fd: FormData) {
  await requireAdmin();
  await adminUpdateTemplate(text(fd, "id"), { published: text(fd, "to") === "on" });
  refresh();
}

export async function deleteTemplateAction(fd: FormData) {
  await requireAdmin();
  await adminDeleteTemplate(text(fd, "id"));
  refresh();
}
