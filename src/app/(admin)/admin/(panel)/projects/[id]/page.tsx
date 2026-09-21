import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/Controls";
import { Icon } from "@/components/admin/Icons";
import { categories } from "@/data/projects";
import { adminGetProject } from "@/lib/repo";
import { deleteProjectAction } from "../actions";
import ProjectForm from "../ProjectForm";

export const metadata: Metadata = { title: "Sửa dự án" };

export default async function EditProjectPage({ params, searchParams }: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const project = await adminGetProject(id);
  if (!project) notFound();
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Sửa dự án</h1>
          {sp.created && <p style={{ color: "var(--ok)", fontWeight: 600 }}>✓ Đã tạo dự án.</p>}
        </div>
        <div className="row-actions">
          {project.published !== false && <Link className="btn" href={`/du-an/${project.slug}`} target="_blank">Xem trang ↗</Link>}
          <Link className="btn" href="/admin/projects">← Danh sách</Link>
        </div>
      </div>
      <ProjectForm key={project.id} project={project} categories={categories.filter((c) => c.id !== "all")} />
      <div className="danger-zone">
        <p>Xóa dự án này vĩnh viễn. Không thể hoàn tác.</p>
        <form action={deleteProjectAction}>
          <input type="hidden" name="id" value={project.id} />
          <ConfirmButton message="Xóa dự án này vĩnh viễn?"><Icon name="trash" size={15} /> Xóa dự án</ConfirmButton>
        </form>
      </div>
    </>
  );
}
