"use server";

import { requireAdmin } from "@/lib/auth";
import { checkDatabase, seedFromStatic, writeSetting } from "@/lib/repo";
import { refreshSite } from "@/lib/refresh";
import { digitsOnly, type StoredContact, type StoredFaq, type StoredSocials } from "@/lib/models";
import { flag, text, type FormState } from "@/lib/validate";
import type { PricingPlan } from "@/data/site";

const okUrl = (u: string) => !u || /^https?:\/\//.test(u);

export async function saveContactAction(_p: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const phone = digitsOnly(text(fd, "phone"));
  if (!/^0\d{9}$/.test(phone)) return { error: "Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0." };
  const email = text(fd, "email");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Email không hợp lệ." };
  const address = text(fd, "address");
  if (!address) return { error: "Vui lòng nhập địa chỉ." };
  const value: StoredContact = { phone, email, address };
  await writeSetting("contact", value);
  refreshSite("settings");
  return { ok: true, message: "Đã lưu thông tin liên hệ." };
}

export async function saveSocialsAction(_p: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const value: StoredSocials = { show: flag(fd, "show"), facebook: text(fd, "facebook"), instagram: text(fd, "instagram"), tiktok: text(fd, "tiktok") };
  if (![value.facebook, value.instagram, value.tiktok].every(okUrl)) return { error: "Liên kết mạng xã hội phải bắt đầu bằng https://" };
  if (value.show && !value.facebook && !value.instagram && !value.tiktok) return { error: "Hãy nhập ít nhất một liên kết trước khi bật hiển thị." };
  await writeSetting("socials", value);
  refreshSite("settings");
  return { ok: true, message: value.show ? "Đã lưu — mạng xã hội đang hiển thị." : "Đã lưu — mạng xã hội đang ẩn." };
}

export async function savePricingAction(_p: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  let raw: unknown;
  try {
    raw = JSON.parse(String(fd.get("json") ?? "[]"));
  } catch {
    return { error: "Dữ liệu không hợp lệ." };
  }
  if (!Array.isArray(raw) || raw.length === 0) return { error: "Cần ít nhất một gói giá." };
  const plans: PricingPlan[] = [];
  for (const p of raw as Record<string, unknown>[]) {
    const name = String(p.name ?? "").trim();
    const price = String(p.price ?? "").trim();
    if (!name || !price) return { error: "Mỗi gói cần có tên và giá." };
    plans.push({
      name,
      desc: String(p.desc ?? "").trim(),
      price,
      duration: String(p.duration ?? "").trim(),
      ...(p.hot ? { hot: true } : {}),
      items: (Array.isArray(p.items) ? p.items : []).map((i) => String(i).trim()).filter(Boolean),
    });
  }
  await writeSetting("pricing", plans);
  refreshSite("settings");
  return { ok: true, message: "Đã lưu bảng giá." };
}

export async function saveFaqsAction(_p: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  let raw: unknown;
  try {
    raw = JSON.parse(String(fd.get("json") ?? "[]"));
  } catch {
    return { error: "Dữ liệu không hợp lệ." };
  }
  const faqs: StoredFaq[] = (Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [])
    .map((f) => ({ question: String(f.question ?? "").trim(), answer: String(f.answer ?? "").trim() }))
    .filter((f) => f.question && f.answer);
  if (!faqs.length) return { error: "Cần ít nhất một câu hỏi có đủ câu trả lời." };
  await writeSetting("faqs", faqs);
  refreshSite("settings");
  return { ok: true, message: "Đã lưu câu hỏi thường gặp." };
}

export async function importAction(): Promise<FormState> {
  await requireAdmin();
  try {
    const r = await seedFromStatic();
    refreshSite("posts", "projects", "settings");
    return { ok: true, message: `Đã nhập ${r.posts} bài viết, ${r.projects} dự án${r.settings.length ? `, cài đặt: ${r.settings.join(", ")}` : ""}. Dữ liệu đã có được giữ nguyên.` };
  } catch (e) {
    return { error: `Nhập dữ liệu thất bại: ${(e as Error).message}` };
  }
}

export async function checkDbAction(): Promise<FormState> {
  await requireAdmin();
  const r = await checkDatabase();
  const bad = r.tables.filter((t) => !t.ok);
  if (bad.length) return { error: `Kết nối lỗi ở bảng: ${bad.map((t) => `${t.table} (${t.error})`).join("; ")}. Hãy chạy supabase/schema.sql.` };
  return { ok: true, message: `Kết nối tốt (${r.mode}). ${r.tables.map((t) => `${t.table}: ${t.rows}`).join(" · ")}` };
}
