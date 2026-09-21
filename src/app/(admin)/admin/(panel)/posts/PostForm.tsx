"use client";

import { useActionState } from "react";
import { Icon } from "@/components/admin/Icons";
import { ImageField, Notice, SubmitButton } from "@/components/admin/Controls";
import type { Post } from "@/lib/content";
import { savePostAction } from "./actions";

type Opt = { value: string; label: string };

export default function PostForm({ post, categories, services }: { post?: Post; categories: Opt[]; services: Opt[] }) {
  const [state, action] = useActionState(savePostAction.bind(null, post?.id ?? null), undefined);
  const local = post?.createdAt ? new Date(new Date(post.createdAt).getTime() + 7 * 3600_000).toISOString().slice(0, 16) : "";
  return (
    <form action={action}>
      <Notice state={state} />
      <div className="editor-layout">
        <div>
          <div className="card">
            <div className="field">
              <label htmlFor="title">Tiêu đề *</label>
              <input id="title" name="title" type="text" required defaultValue={post?.title} />
            </div>
            <div className="field">
              <label htmlFor="slug">Đường dẫn (slug)</label>
              <input id="slug" name="slug" type="text" defaultValue={post?.slug} placeholder="Để trống để tự tạo từ tiêu đề" />
              <span className="hint">Địa chỉ bài viết: /tin-tuc/<b>slug</b>. Đổi slug sẽ làm đổi link cũ.</span>
            </div>
            <div className="field">
              <label htmlFor="summary">Tóm tắt</label>
              <textarea id="summary" name="summary" rows={3} defaultValue={post?.summary} />
            </div>
            <div className="field">
              <label htmlFor="content">Nội dung (HTML) *</label>
              <textarea id="content" name="content" className="code" required defaultValue={post?.content} />
              <span className="hint">Hỗ trợ thẻ HTML (h2, h3, p, ul, img, a…). Chỉ quản trị viên mới sửa được nội dung này.</span>
            </div>
          </div>
          <div className="card">
            <h2>SEO</h2>
            <div className="field">
              <label htmlFor="metaTitle">Meta title</label>
              <input id="metaTitle" name="metaTitle" type="text" defaultValue={post?.metaTitle ?? ""} />
            </div>
            <div className="field">
              <label htmlFor="metaDescription">Meta description</label>
              <textarea id="metaDescription" name="metaDescription" rows={2} defaultValue={post?.metaDescription ?? ""} />
            </div>
            <div className="field">
              <label htmlFor="metaKeywords">Từ khóa (cách nhau bằng dấu phẩy)</label>
              <input id="metaKeywords" name="metaKeywords" type="text" defaultValue={post?.metaKeywords ?? ""} />
            </div>
          </div>
        </div>
        <aside>
          <div className="card">
            <label className="check">
              <input type="checkbox" name="published" defaultChecked={post ? post.published !== false : true} /> Hiển thị công khai
            </label>
            <div className="field" style={{ marginTop: 14 }}>
              <label htmlFor="category">Chuyên mục</label>
              <select id="category" name="category" defaultValue={post?.category ?? categories[0]?.value}>
                {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="service">Dịch vụ liên quan</label>
              <select id="service" name="service" defaultValue={post?.service ?? "thiet-ke-website"}>
                {services.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="createdAt">Ngày đăng</label>
              <input id="createdAt" name="createdAt" type="datetime-local" defaultValue={local} />
              <span className="hint">Giờ Việt Nam. Để trống = lúc lưu.</span>
            </div>
          </div>
          <div className="card">
            <ImageField name="img" label="Ảnh đại diện" defaultValue={post?.img} hint="Nên dùng ảnh ngang 1200×630." />
          </div>
        </aside>
      </div>
      <div className="sticky-save">
        <SubmitButton><Icon name="check" size={18} /> Lưu bài viết</SubmitButton>
        <span className="muted small">Thay đổi sẽ hiện trên website ngay sau khi lưu.</span>
      </div>
    </form>
  );
}
