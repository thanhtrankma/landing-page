import type { Metadata } from "next";
import Link from "next/link";
import { categories } from "@/data/projects";
import ProjectForm from "../ProjectForm";

export const metadata: Metadata = { title: "Thêm dự án" };

export default function NewProjectPage() {
  return (
    <>
      <div className="page-head">
        <h1>Thêm dự án / mẫu web</h1>
        <Link className="btn" href="/admin/projects">← Danh sách</Link>
      </div>
      <ProjectForm categories={categories.filter((c) => c.id !== "all")} />
    </>
  );
}
