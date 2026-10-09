"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { adminUpdateTemplate, TEMPLATE_TAG, validSize } from "@/lib/cards/server";
import type { SaveTemplateInput } from "@/components/cards/CardEditor";
import { OBJECT_KEY_RE } from "@/lib/r2";
import { TEMPLATE_TAGS } from "@/lib/cards/types";
import { slugify } from "@/lib/validate";

const TAG_IDS = new Set(TEMPLATE_TAGS.map(([id]) => id));

/** Called by the card editor in template mode. */
export async function saveTemplateAction(input: SaveTemplateInput): Promise<{ ok?: boolean; error?: string }> {
  await requireAdmin();
  const name = String(input.name ?? "").trim().slice(0, 120);
  const slug = slugify(String(input.slug ?? ""));
  if (name.length < 2) return { error: "Tên mẫu cần ít nhất 2 ký tự." };
  if (slug.length < 3) return { error: "Slug cần ít nhất 3 ký tự (a-z, 0-9, -)." };
  if (!validSize(input.width, input.height)) return { error: "Kích thước thiệp không hợp lệ." };
  if (input.thumbKey && !OBJECT_KEY_RE.test(input.thumbKey)) return { error: "Ảnh xem trước không hợp lệ." };
  try {
    await adminUpdateTemplate(input.id, {
      name,
      slug,
      tags: (input.tags ?? []).filter((t) => TAG_IDS.has(t)),
      published: Boolean(input.published),
      sortOrder: Number.isFinite(input.sortOrder) ? Math.round(input.sortOrder) : 100,
      width: input.width,
      height: input.height,
      canvas: input.canvas,
      thumbKey: input.thumbKey,
    });
  } catch (e) {
    const msg = (e as Error).message;
    return { error: /duplicate|unique/i.test(msg) ? "Slug này đã được dùng cho mẫu khác." : `Không lưu được: ${msg}` };
  }
  updateTag(TEMPLATE_TAG);
  revalidatePath("/cong-cu/anh-thiep-cuoi");
  revalidatePath("/admin/mau-thiep");
  return { ok: true };
}
