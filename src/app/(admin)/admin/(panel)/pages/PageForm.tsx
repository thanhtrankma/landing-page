"use client";

import { useActionState } from "react";
import { Icon } from "@/components/admin/Icons";
import { Notice, SubmitButton } from "@/components/admin/Controls";
import type { SitePage } from "@/lib/models";
import { savePageAction } from "./actions";

export default function PageForm({ page }: { page: SitePage }) {
  const [state, action] = useActionState(savePageAction.bind(null, page.slug), undefined);
  return (
    <form action={action}>
      <Notice state={state} />
      <div className="editor-layout">
        <div>
          <div className="card">
            <div className="field">
              <label htmlFor="title">Tiêu đề *</label>
              <input id="title" name="title" type="text" required defaultValue={page.title} />
            </div>
            <div className="field">
              <label htmlFor="description">Mô tả ngắn (hiển thị trên Google)</label>
              <textarea id="description" name="description" rows={3} defaultValue={page.description} />
            </div>
            <div className="field">
              <label htmlFor="content">Nội dung (HTML) *</label>
              <textarea id="content" name="content" className="code" required defaultValue={page.content} style={{ minHeight: 520 }} />
              <span className="hint">Dùng các thẻ &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;&lt;li&gt;, &lt;a&gt;, &lt;table&gt;…</span>
            </div>
          </div>
        </div>
        <aside>
          <div className="card">
            <label className="check">
              <input type="checkbox" name="published" defaultChecked={page.published} />
              <span>Hiển thị công khai<small>Tắt để ẩn trang và liên kết ở chân trang.</small></span>
            </label>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 8 }}>Biến tự động điền</h3>
            <p className="hint" style={{ margin: "0 0 10px" }}>Chèn vào nội dung, hệ thống thay bằng thông tin trong Cài đặt:</p>
            <div className="stack" style={{ gap: 6 }}>
              <div><code>{"{{phone}}"}</code> <span className="muted small">số điện thoại</span></div>
              <div><code>{"{{phoneLink}}"}</code> <span className="muted small">số dùng cho tel:</span></div>
              <div><code>{"{{email}}"}</code> <span className="muted small">email</span></div>
              <div><code>{"{{address}}"}</code> <span className="muted small">địa chỉ</span></div>
              <div><code>{"{{updated}}"}</code> <span className="muted small">ngày cập nhật</span></div>
            </div>
          </div>
        </aside>
      </div>
      <div className="sticky-save">
        <SubmitButton><Icon name="check" size={18} /> Lưu thay đổi</SubmitButton>
        <span className="muted small">Trang trên website cập nhật ngay sau khi lưu.</span>
      </div>
    </form>
  );
}
