"use client";

import { useActionState, useState } from "react";
import { Notice, SubmitButton } from "@/components/admin/Controls";
import { Icon } from "@/components/admin/Icons";
import type { PricingPlan } from "@/data/site";
import type { StoredContact, StoredFaq, StoredSocials } from "@/lib/models";
import { checkDbAction, importAction, saveContactAction, saveFaqsAction, savePricingAction, saveSocialsAction } from "./actions";

export function ContactForm({ value }: { value: StoredContact }) {
  const [state, action] = useActionState(saveContactAction, undefined);
  return (
    <form action={action}>
      <Notice state={state} />
      <div className="grid c2">
        <div className="field">
          <label htmlFor="phone">Số điện thoại / Zalo</label>
          <input id="phone" name="phone" type="tel" defaultValue={value.phone} required />
          <span className="hint">Dùng cho nút gọi, Zalo (zalo.me/…), chân trang và dữ liệu SEO.</span>
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" defaultValue={value.email} required />
        </div>
      </div>
      <div className="field">
        <label htmlFor="address">Địa chỉ</label>
        <input id="address" name="address" type="text" defaultValue={value.address} required />
      </div>
      <SubmitButton>Lưu thông tin liên hệ</SubmitButton>
    </form>
  );
}

export function SocialsForm({ value }: { value: StoredSocials }) {
  const [state, action] = useActionState(saveSocialsAction, undefined);
  return (
    <form action={action}>
      <Notice state={state} />
      <label className="check" style={{ marginBottom: 18 }}>
        <input type="checkbox" name="show" defaultChecked={value.show} />
        <span>Hiển thị mạng xã hội trên website<small>Tắt để ẩn hoàn toàn Facebook, Instagram và TikTok.</small></span>
      </label>
      <div className="field"><label htmlFor="facebook">Facebook</label><input id="facebook" name="facebook" type="url" defaultValue={value.facebook} placeholder="https://facebook.com/…" /></div>
      <div className="field"><label htmlFor="instagram">Instagram</label><input id="instagram" name="instagram" type="url" defaultValue={value.instagram} placeholder="https://instagram.com/…" /></div>
      <div className="field"><label htmlFor="tiktok">TikTok</label><input id="tiktok" name="tiktok" type="url" defaultValue={value.tiktok} placeholder="https://tiktok.com/@…" /></div>
      <SubmitButton>Lưu mạng xã hội</SubmitButton>
    </form>
  );
}

function move<T>(list: T[], i: number, d: number): T[] {
  const j = i + d;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export function PricingForm({ value }: { value: PricingPlan[] }) {
  const [state, action] = useActionState(savePricingAction, undefined);
  const [plans, setPlans] = useState(value);
  const set = (i: number, patch: Partial<PricingPlan>) => setPlans((l) => l.map((p, k) => (k === i ? { ...p, ...patch } : p)));
  return (
    <form action={action}>
      <Notice state={state} />
      <input type="hidden" name="json" value={JSON.stringify(plans)} />
      {plans.map((p, i) => (
        <div className="repeat" key={i}>
          <div className="repeat-head"><span className="n">{i + 1}</span><b>{p.name || "Gói mới"}</b>{p.hot && <span className="badge new">Nổi bật</span>}</div>
          <div className="grid c3">
            <div className="field"><label>Tên gói</label><input type="text" aria-label="Tên gói" value={p.name} onChange={(e) => set(i, { name: e.target.value })} /></div>
            <div className="field"><label>Giá</label><input type="text" aria-label="Giá" value={p.price} onChange={(e) => set(i, { price: e.target.value })} placeholder="449.000đ hoặc Liên hệ" /></div>
            <div className="field"><label>Thời gian</label><input type="text" value={p.duration} onChange={(e) => set(i, { duration: e.target.value })} placeholder="3-5 ngày" /></div>
          </div>
          <div className="field"><label>Mô tả</label><textarea rows={2} value={p.desc} onChange={(e) => set(i, { desc: e.target.value })} /></div>
          <div className="field"><label>Quyền lợi (mỗi dòng một mục)</label><textarea rows={5} value={p.items.join("\n")} onChange={(e) => set(i, { items: e.target.value.split("\n") })} /></div>
          <div className="row-actions">
            <label className="check"><input type="checkbox" checked={!!p.hot} onChange={(e) => set(i, { hot: e.target.checked })} /> Gói nổi bật</label>
            <span style={{ flex: 1 }} />
            <button type="button" className="btn sm" onClick={() => setPlans((l) => move(l, i, -1))} disabled={i === 0} aria-label="Chuyển lên"><Icon name="arrowUp" size={15} /></button>
            <button type="button" className="btn sm" onClick={() => setPlans((l) => move(l, i, 1))} disabled={i === plans.length - 1} aria-label="Chuyển xuống"><Icon name="arrowDown" size={15} /></button>
            <button type="button" className="btn sm danger" onClick={() => setPlans((l) => l.filter((_, k) => k !== i))}><Icon name="trash" size={14} /> Xóa gói</button>
          </div>
        </div>
      ))}
      <div className="row-actions">
        <button type="button" className="btn" onClick={() => setPlans((l) => [...l, { name: "", desc: "", price: "", duration: "", items: [] }])}><Icon name="plus" size={16} /> Thêm gói</button>
        <SubmitButton>Lưu bảng giá</SubmitButton>
      </div>
    </form>
  );
}

export function FaqForm({ value }: { value: StoredFaq[] }) {
  const [state, action] = useActionState(saveFaqsAction, undefined);
  const [faqs, setFaqs] = useState(value);
  const set = (i: number, patch: Partial<StoredFaq>) => setFaqs((l) => l.map((f, k) => (k === i ? { ...f, ...patch } : f)));
  return (
    <form action={action}>
      <Notice state={state} />
      <input type="hidden" name="json" value={JSON.stringify(faqs)} />
      {faqs.map((f, i) => (
        <div className="repeat" key={i}>
          <div className="repeat-head"><span className="n">{i + 1}</span><b>{f.question || "Câu hỏi mới"}</b></div>
          <div className="field"><label>Câu hỏi</label><input type="text" value={f.question} onChange={(e) => set(i, { question: e.target.value })} /></div>
          <div className="field"><label>Trả lời</label><textarea rows={3} value={f.answer} onChange={(e) => set(i, { answer: e.target.value })} /></div>
          <div className="row-actions">
            <button type="button" className="btn sm" onClick={() => setFaqs((l) => move(l, i, -1))} disabled={i === 0} aria-label="Chuyển lên"><Icon name="arrowUp" size={15} /></button>
            <button type="button" className="btn sm" onClick={() => setFaqs((l) => move(l, i, 1))} disabled={i === faqs.length - 1} aria-label="Chuyển xuống"><Icon name="arrowDown" size={15} /></button>
            <button type="button" className="btn sm danger" onClick={() => setFaqs((l) => l.filter((_, k) => k !== i))}><Icon name="trash" size={14} /> Xóa</button>
          </div>
        </div>
      ))}
      <div className="row-actions">
        <button type="button" className="btn" onClick={() => setFaqs((l) => [...l, { question: "", answer: "" }])}><Icon name="plus" size={16} /> Thêm câu hỏi</button>
        <SubmitButton>Lưu câu hỏi</SubmitButton>
      </div>
    </form>
  );
}

export function DatabaseTools() {
  const [checkState, check] = useActionState(checkDbAction, undefined);
  const [importState, run] = useActionState(importAction, undefined);
  return (
    <div className="stack">
      <form action={check}>
        <Notice state={checkState} />
        <SubmitButton className="btn" pending="Đang kiểm tra…">Kiểm tra kết nối</SubmitButton>
      </form>
      <form action={run}>
        <Notice state={importState} />
        <SubmitButton className="btn" pending="Đang nhập…">Nhập dữ liệu có sẵn vào cơ sở dữ liệu</SubmitButton>
        <p className="hint muted small" style={{ margin: "6px 0 0" }}>Chép các bài viết, dự án và cài đặt gốc của website vào DB (bỏ qua mục đã tồn tại). Chỉ cần chạy một lần.</p>
      </form>
    </div>
  );
}
