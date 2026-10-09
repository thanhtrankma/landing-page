import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EditorLoader from "@/components/cards/EditorLoader";
import { requireAdmin } from "@/lib/auth";
import { adminGetTemplate } from "@/lib/cards/server";
import { saveTemplateAction } from "../actions";

export const metadata: Metadata = { title: "Sửa mẫu thiệp | Quản trị" };

// Full-screen template editor for admins (the proxy already guards /admin/*; this re-checks).
export default async function TemplateEditorPage({ params }: PageProps<"/admin/mau-thiep/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const t = await adminGetTemplate(id);
  if (!t) notFound();
  return (
    <EditorLoader
      mode="template"
      initial={{ canvas: t.canvas, width: t.width, height: t.height, title: t.name }}
      template={{ id: t.id, name: t.name, slug: t.slug, tags: t.tags, published: t.published, sortOrder: t.sortOrder }}
      saveTemplate={saveTemplateAction}
      backHref="/admin/mau-thiep"
    />
  );
}
