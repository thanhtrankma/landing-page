import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmButton, SubmitButton } from "@/components/admin/Controls";
import { Icon } from "@/components/admin/Icons";
import { LEAD_STATUSES, STATUS_LABEL, leadCounts, listLeads } from "@/lib/repo";
import { deleteLeadAction, saveLeadAction } from "./actions";

export const metadata: Metadata = { title: "Yêu cầu liên hệ" };

const PAGE = 20;
const fmt = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" });

export default async function LeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const status = one("status") || "all";
  const q = one("q");
  const page = Math.max(1, Number.parseInt(one("trang") || "1", 10) || 1);
  const [{ rows, count }, counts] = await Promise.all([listLeads({ status, q, limit: PAGE, offset: (page - 1) * PAGE }), leadCounts()]);
  const pages = Math.max(1, Math.ceil(count / PAGE));
  const href = (p: number) => `/admin/leads?${new URLSearchParams({ ...(status !== "all" ? { status } : {}), ...(q ? { q } : {}), trang: String(p) })}`;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Yêu cầu liên hệ</h1>
          <p>{counts.total} yêu cầu · {counts.new} chưa xử lý</p>
        </div>
      </div>

      <div className="chips" role="group" aria-label="Lọc theo trạng thái">
        {[["all", "Tất cả", counts.total] as const, ...LEAD_STATUSES.map((st) => [st, STATUS_LABEL[st], counts[st]] as const)].map(([key, label, n]) => (
          <Link key={key} className={`chip${status === key ? " active" : ""}`} href={`/admin/leads?${new URLSearchParams({ ...(key !== "all" ? { status: key } : {}), ...(q ? { q } : {}) })}`}>
            {label} <span style={{ opacity: 0.75 }}>{n}</span>
          </Link>
        ))}
      </div>
      <form className="filters" method="get">
        <input type="search" name="q" defaultValue={q} placeholder="Tìm tên, số điện thoại, nội dung…" aria-label="Tìm kiếm" />
        {status !== "all" && <input type="hidden" name="status" value={status} />}
        <button className="btn" type="submit">Tìm kiếm</button>
        {q && <Link className="btn ghost" href={status !== "all" ? `/admin/leads?status=${status}` : "/admin/leads"}>Xóa lọc</Link>}
      </form>

      {rows.length === 0 ? (
        <div className="card empty">
          <div className="ico"><Icon name="inbox" size={26} /></div>
          <b>{q || status !== "all" ? "Không có yêu cầu nào khớp" : "Chưa có yêu cầu liên hệ nào"}</b>
          {q || status !== "all" ? "Thử đổi từ khóa hoặc chọn trạng thái khác." : "Khi khách gửi biểu mẫu tư vấn trên website, yêu cầu sẽ hiện ở đây."}
        </div>
      ) : (
        <div className="stack">
          {rows.map((l) => (
            <article className="card lead" key={l.id}>
              <div className="lead-top">
                <div className="avatar" aria-hidden="true">{l.name.trim().charAt(0).toUpperCase() || "?"}</div>
                <div className="who">
                  <h3>{l.name} <span className={`badge ${l.status}`}>{STATUS_LABEL[l.status]}</span></h3>
                  <span className="muted small">{fmt.format(new Date(l.createdAt))}{l.page ? ` · từ ${l.page}` : ""}</span>
                </div>
                <div className="row-actions">
                  <a className="btn sm" href={`tel:${l.phone}`}><Icon name="phone" size={14} /> {l.phone}</a>
                  <a className="btn sm" href={`https://zalo.me/${l.phone}`} target="_blank" rel="noopener noreferrer"><Icon name="message" size={14} /> Zalo</a>
                </div>
              </div>
              <p className="lead-msg">{l.message}</p>
              <form action={saveLeadAction} className="lead-foot">
                <input type="hidden" name="id" value={l.id} />
                <select name="status" defaultValue={l.status} aria-label="Trạng thái">
                  {LEAD_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
                <input type="text" name="note" defaultValue={l.note} placeholder="Ghi chú nội bộ (chỉ bạn thấy)" aria-label="Ghi chú" />
                <SubmitButton className="btn sm primary"><Icon name="check" size={14} /> Lưu</SubmitButton>
              </form>
              <form action={deleteLeadAction} className="lead-foot" style={{ paddingTop: 0, marginTop: -6 }}>
                <input type="hidden" name="id" value={l.id} />
                <ConfirmButton message="Xóa yêu cầu này vĩnh viễn?" className="btn sm ghost danger"><Icon name="trash" size={14} /> Xóa yêu cầu</ConfirmButton>
              </form>
            </article>
          ))}
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
