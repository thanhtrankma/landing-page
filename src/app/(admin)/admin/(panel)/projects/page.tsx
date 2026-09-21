import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmButton, FilterSelect, SubmitButton } from "@/components/admin/Controls";
import { Icon } from "@/components/admin/Icons";
import { categories } from "@/data/projects";
import { adminListProjects } from "@/lib/repo";
import { deleteProjectAction, toggleProjectAction } from "./actions";

export const metadata: Metadata = { title: "Dự án & mẫu" };
const PAGE = 30;

export default async function ProjectsAdminPage({ searchParams }: PageProps<"/admin/projects">) {
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const q = one("q");
  const category = one("category");
  const published = one("state") === "yes" || one("state") === "no" ? (one("state") as "yes" | "no") : undefined;
  const page = Math.max(1, Number.parseInt(one("trang") || "1", 10) || 1);
  const { rows, count } = await adminListProjects({ q, category, published, limit: PAGE, offset: (page - 1) * PAGE });
  const pages = Math.max(1, Math.ceil(count / PAGE));
  const href = (p: number) => `/admin/projects?${new URLSearchParams({ ...(q ? { q } : {}), ...(category ? { category } : {}), ...(published ? { state: published } : {}), trang: String(p) })}`;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dự án & kho mẫu</h1>
          <p>{count} mục</p>
        </div>
        <Link className="btn primary" href="/admin/projects/new"><Icon name="plus" size={18} /> Thêm dự án</Link>
      </div>
      {sp.deleted && <div className="notice ok"><Icon name="check" size={18} />Đã xóa dự án.</div>}
      <form className="filters" method="get">
        <input type="search" name="q" defaultValue={q} placeholder="Tìm theo tên, mã, slug…" aria-label="Tìm kiếm" />
        <FilterSelect name="category" defaultValue={category} aria-label="Ngành">
          <option value="">Mọi ngành</option>
          {categories.filter((c) => c.id !== "all").map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </FilterSelect>
        <FilterSelect name="state" defaultValue={published ?? ""} aria-label="Trạng thái">
          <option value="">Mọi trạng thái</option>
          <option value="yes">Đang hiển thị</option>
          <option value="no">Đang ẩn</option>
        </FilterSelect>
        <button className="btn" type="submit">Tìm kiếm</button>
        {(q || category || published) && <Link className="btn ghost" href="/admin/projects">Xóa lọc</Link>}
      </form>

      {rows.length === 0 ? (
        <div className="card empty">
          <div className="ico"><Icon name="folder" size={26} /></div>
          <b>{q || category || published ? "Không có dự án nào khớp bộ lọc" : "Chưa có dự án nào"}</b>
          {q || category || published ? "Thử bỏ bớt bộ lọc hoặc đổi từ khóa." : <>Nếu đây là lần đầu dùng cơ sở dữ liệu, vào <Link href="/admin/settings#database">Cài đặt</Link> để nhập dữ liệu có sẵn.</>}
        </div>
      ) : (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th style={{ width: 96 }}>Ảnh</th><th>Dự án</th><th>Ngành</th><th className="num">Thứ tự</th><th>Trạng thái</th><th aria-label="Thao tác" /></tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <td>{p.img ? <img className="thumb" src={p.img} alt="" loading="lazy" /> : <div className="thumb" />}</td>
                  <td className="title-cell">
                    <Link href={`/admin/projects/${p.id}`}><b>{p.title}</b></Link>
                    <div className="muted small">{p.code} · /du-an/{p.slug}{p.sample ? " · Mẫu web" : ""}</div>
                  </td>
                  <td>{p.categoryLabel}</td>
                  <td className="num">{p.homeOrder}</td>
                  <td><span className={`badge ${p.published !== false ? "on" : "off"}`}>{p.published !== false ? "Hiển thị" : "Đang ẩn"}</span></td>
                  <td>
                    <div className="row-actions">
                      <Link className="btn sm" href={`/admin/projects/${p.id}`}><Icon name="edit" size={14} /> Sửa</Link>
                      <form action={toggleProjectAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="to" value={p.published !== false ? "off" : "on"} />
                        <SubmitButton className="btn sm" pending="…"><Icon name={p.published !== false ? "eyeOff" : "eye"} size={14} /> {p.published !== false ? "Ẩn" : "Hiện"}</SubmitButton>
                      </form>
                      <form action={deleteProjectAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <ConfirmButton message={`Xóa dự án "${p.title}"?`}>Xóa</ConfirmButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pages > 1 && (
        <div className="pager">
          {page > 1 && <Link className="btn sm" href={href(page - 1)}>← Trước</Link>}
          <span>Trang {page}/{pages}</span>
          {page < pages && <Link className="btn sm" href={href(page + 1)}>Sau →</Link>}
        </div>
      )}
    </>
  );
}
