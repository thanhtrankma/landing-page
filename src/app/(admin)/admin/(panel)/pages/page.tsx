import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/admin/Icons";
import { SubmitButton } from "@/components/admin/Controls";
import { adminListPages } from "@/lib/repo";
import { togglePageAction } from "./actions";

export const metadata: Metadata = { title: "Chính sách & điều khoản" };
const fmt = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" });

export default async function PagesAdmin() {
  let pages: Awaited<ReturnType<typeof adminListPages>> = [];
  let error = "";
  try {
    pages = await adminListPages();
  } catch (e) {
    error = (e as Error).message;
  }
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Chính sách & điều khoản</h1>
          <p>Nội dung các trang pháp lý hiển thị ở chân trang website. Bạn có thể sửa hoặc ẩn từng trang.</p>
        </div>
      </div>

      {error && (
        <div className="notice err">
          <Icon name="alert" size={18} />
          <span>Không đọc được bảng <code>pages</code> ({error}). Mở Supabase → SQL Editor và chạy file <code>supabase/pages.sql</code>, sau đó tải lại trang này.</span>
        </div>
      )}

      <div className="stack">
        {pages.map((p) => (
          <article className="card" key={p.slug} style={{ marginBottom: 0 }}>
            <div className="card-head" style={{ marginBottom: 12 }}>
              <div className="ico"><Icon name="shield" size={20} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2>{p.title}</h2>
                <p>/{p.slug} · {p.id ? `Sửa lần cuối ${fmt.format(new Date(p.updatedAt))}` : "Đang dùng nội dung gốc, chưa lưu vào cơ sở dữ liệu"}</p>
              </div>
              <span className={`badge ${p.published ? "on" : "off"}`}>{p.published ? "Đang hiển thị" : "Đang ẩn"}</span>
            </div>
            <p className="muted" style={{ margin: "0 0 16px" }}>{p.description}</p>
            <div className="row-actions">
              <Link className="btn primary sm" href={`/admin/pages/${p.slug}`}><Icon name="edit" size={14} /> Sửa nội dung</Link>
              {p.published && <Link className="btn sm" href={`/${p.slug}`} target="_blank"><Icon name="external" size={14} /> Xem trang</Link>}
              <form action={togglePageAction}>
                <input type="hidden" name="slug" value={p.slug} />
                <input type="hidden" name="to" value={p.published ? "off" : "on"} />
                <SubmitButton className="btn sm" pending="…"><Icon name={p.published ? "eyeOff" : "eye"} size={14} /> {p.published ? "Ẩn trang" : "Hiện trang"}</SubmitButton>
              </form>
            </div>
          </article>
        ))}
      </div>
      <p className="hint" style={{ marginTop: 16 }}>Khi ẩn, trang sẽ báo 404 và liên kết ở chân trang biến mất.</p>
    </>
  );
}
