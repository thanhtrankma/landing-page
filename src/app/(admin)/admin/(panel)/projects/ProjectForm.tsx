"use client";

import { useActionState } from "react";
import { Icon } from "@/components/admin/Icons";
import { ImageField, Notice, SubmitButton } from "@/components/admin/Controls";
import type { ProjectRecord } from "@/lib/content";
import { saveProjectAction } from "./actions";

export default function ProjectForm({ project, categories }: { project?: ProjectRecord; categories: { id: string; label: string }[] }) {
  const [state, action] = useActionState(saveProjectAction.bind(null, project?.id ?? null), undefined);
  return (
    <form action={action}>
      <Notice state={state} />
      <div className="editor-layout">
        <div>
          <div className="card">
            <div className="field">
              <label htmlFor="title">Tên dự án *</label>
              <input id="title" name="title" type="text" required defaultValue={project?.title} />
            </div>
            <div className="grid c2">
              <div className="field">
                <label htmlFor="slug">Đường dẫn (slug)</label>
                <input id="slug" name="slug" type="text" defaultValue={project?.slug} placeholder="Tự tạo từ tên" />
              </div>
              <div className="field">
                <label htmlFor="code">Mã dự án</label>
                <input id="code" name="code" type="text" defaultValue={project?.code} placeholder="VD: DA-35" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="demoUrl">Link demo</label>
              <input id="demoUrl" name="demoUrl" type="text" defaultValue={project?.demoUrl ?? ""} placeholder="/demos/ten-du-an/index.html hoặc https://…" />
              <span className="hint">Đường dẫn nội bộ (thư mục public/demos) hoặc URL đầy đủ. Để trống nếu chưa có demo.</span>
            </div>
            <div className="field">
              <label htmlFor="description">Mô tả ngắn</label>
              <textarea id="description" name="description" rows={3} defaultValue={project?.description} />
            </div>
            <div className="field">
              <label htmlFor="content">Nội dung chi tiết (HTML hoặc văn bản)</label>
              <textarea id="content" name="content" className="code" defaultValue={project?.content} style={{ minHeight: 220 }} />
            </div>
          </div>
          <div className="card">
            <h2>SEO</h2>
            <div className="field">
              <label htmlFor="metaTitle">Meta title</label>
              <input id="metaTitle" name="metaTitle" type="text" defaultValue={project?.metaTitle ?? ""} />
            </div>
            <div className="field">
              <label htmlFor="metaDescription">Meta description</label>
              <textarea id="metaDescription" name="metaDescription" rows={2} defaultValue={project?.metaDescription ?? ""} />
            </div>
            <div className="field">
              <label htmlFor="metaKeywords">Từ khóa</label>
              <input id="metaKeywords" name="metaKeywords" type="text" defaultValue={project?.metaKeywords ?? ""} />
            </div>
          </div>
        </div>
        <aside>
          <div className="card">
            <label className="check">
              <input type="checkbox" name="published" defaultChecked={project ? project.published !== false : true} /> Hiển thị công khai
            </label>
            <label className="check" style={{ marginTop: 10 }}>
              <input type="checkbox" name="sample" defaultChecked={project?.sample} /> Là mẫu web (gắn nhãn “Mẫu Web”)
            </label>
            <div className="field" style={{ marginTop: 14 }}>
              <label htmlFor="category">Ngành *</label>
              <select id="category" name="category" defaultValue={project?.category ?? categories[0]?.id}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            {project && (
              <div className="grid c2">
                <div className="field">
                  <label htmlFor="homeOrder">Thứ tự trang chủ</label>
                  <input id="homeOrder" name="homeOrder" type="number" defaultValue={project.homeOrder ?? 0} />
                </div>
                <div className="field">
                  <label htmlFor="hubOrder">Thứ tự trang Dự án</label>
                  <input id="hubOrder" name="hubOrder" type="number" defaultValue={project.hubOrder} />
                </div>
              </div>
            )}
            <span className="hint">Số nhỏ hiển thị trước.</span>
          </div>
          <div className="card">
            <ImageField name="img" label="Ảnh dự án" defaultValue={project?.img} hint="Ảnh chụp giao diện, tỉ lệ ngang." />
          </div>
        </aside>
      </div>
      <div className="sticky-save">
        <SubmitButton><Icon name="check" size={18} /> Lưu dự án</SubmitButton>
        <span className="muted small">Thay đổi sẽ hiện trên website ngay sau khi lưu.</span>
      </div>
    </form>
  );
}
