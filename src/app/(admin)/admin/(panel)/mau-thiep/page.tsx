import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/admin/Icons";
import { ConfirmButton, SubmitButton } from "@/components/admin/Controls";
import TemplateThumb from "@/components/cards/TemplateThumb";
import { adminListTemplates } from "@/lib/cards/server";
import { CARD_FORMATS, formatBySize, TEMPLATE_TAGS } from "@/lib/cards/types";
import { createTemplateAction, deleteTemplateAction, importSeedsAction, toggleTemplateAction } from "./actions";

export const metadata: Metadata = { title: "Mẫu thiệp cưới" };
const tagLabel = Object.fromEntries(TEMPLATE_TAGS);

export default async function CardTemplatesAdmin({ searchParams }: PageProps<"/admin/mau-thiep">) {
  const sp = await searchParams;
  let templates: Awaited<ReturnType<typeof adminListTemplates>> = [];
  let error = "";
  try {
    templates = await adminListTemplates();
  } catch (e) {
    error = (e as Error).message;
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Mẫu thiệp cưới</h1>
          <p>Kho mẫu của công cụ <Link href="/cong-cu/anh-thiep-cuoi" target="_blank">Tạo thiệp cưới online</Link>. Khi chưa có mẫu nào ở đây, website dùng bộ mẫu có sẵn.</p>
        </div>
      </div>

      {error && (
        <div className="notice err">
          <Icon name="alert" size={18} />
          <span>Không đọc được bảng <code>card_templates</code> ({error}). Mở Supabase → SQL Editor, chạy file <code>supabase/cards.sql</code> rồi tải lại trang.</span>
        </div>
      )}
      {sp.imported !== undefined && (
        <div className="notice ok">
          <Icon name="check" size={18} />
          <span>{sp.imported === "0" ? "Các mẫu có sẵn đã có đủ trong kho." : `Đã thêm ${sp.imported} mẫu có sẵn.`}</span>
        </div>
      )}

      <div className="card">
        <div className="row-actions" style={{ alignItems: "flex-end" }}>
          <form action={createTemplateAction} className="row-actions" style={{ alignItems: "flex-end" }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="format">Khổ thiệp</label>
              <select id="format" name="format" defaultValue="5x7">
                {CARD_FORMATS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label} ({f.width}×{f.height})
                  </option>
                ))}
              </select>
            </div>
            <SubmitButton pending="Đang tạo…">
              <Icon name="plus" size={16} /> Tạo mẫu trống
            </SubmitButton>
          </form>
          <form action={importSeedsAction}>
            <SubmitButton className="btn" pending="Đang thêm…">
              <Icon name="database" size={16} /> Thêm các mẫu có sẵn
            </SubmitButton>
          </form>
        </div>
        <p className="hint" style={{ marginTop: 10 }}>Mẫu mới tạo đang ẩn. Thiết kế xong, bật “Hiển thị trong kho mẫu công khai” trong tab Mẫu của trình sửa rồi bấm Lưu.</p>
      </div>

      {!error && !templates.length && <p className="muted">Chưa có mẫu nào trong cơ sở dữ liệu. Bấm “Thêm các mẫu có sẵn” để bắt đầu từ bộ mẫu mặc định.</p>}

      <div className="tpl-grid">
        {templates.map((t) => (
          <article className="card tpl-card" key={t.id}>
            <Link href={`/admin/mau-thiep/${t.id}`} className="tpl-thumb" aria-label={`Sửa mẫu ${t.name}`}>
              <TemplateThumb id={`${t.id}:${t.thumbUrl}`} name={t.name} canvas={t.canvas} width={t.width} height={t.height} thumbUrl={t.thumbUrl} />
            </Link>
            <div className="tpl-meta">
              <h2>{t.name}</h2>
              <p className="muted small">
                {formatBySize(t.width, t.height)?.label ?? `${t.width}×${t.height}`} · /{t.slug}
                {t.tags.length ? ` · ${t.tags.map((x) => tagLabel[x] ?? x).join(", ")}` : ""}
              </p>
              <span className={`badge ${t.published ? "on" : "off"}`}>{t.published ? "Đang hiển thị" : "Đang ẩn"}</span>
            </div>
            <div className="row-actions">
              <Link className="btn primary sm" href={`/admin/mau-thiep/${t.id}`}>
                <Icon name="edit" size={14} /> Sửa
              </Link>
              <form action={toggleTemplateAction}>
                <input type="hidden" name="id" value={t.id} />
                <input type="hidden" name="to" value={t.published ? "off" : "on"} />
                <SubmitButton className="btn sm" pending="…">
                  <Icon name={t.published ? "eyeOff" : "eye"} size={14} /> {t.published ? "Ẩn" : "Hiện"}
                </SubmitButton>
              </form>
              <form action={deleteTemplateAction}>
                <input type="hidden" name="id" value={t.id} />
                <ConfirmButton message={`Xoá mẫu "${t.name}"? Thiệp khách đã tạo từ mẫu này không bị ảnh hưởng.`}>
                  <Icon name="trash" size={14} /> Xoá
                </ConfirmButton>
              </form>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
