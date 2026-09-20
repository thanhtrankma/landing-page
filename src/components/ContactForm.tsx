"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "./ui";

const empty = { name: "", phone: "", message: "", website: "" };

export default function ContactForm() {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const name = form.name.trim();
    const phone = form.phone.trim();
    const message = form.message.trim();

    if (name.length < 2) return setError("Họ và tên phải có ít nhất 2 ký tự.");
    if (!/^(0|84)(3|5|7|8|9)[0-9]{8}$/.test(phone))
      return setError("Số điện thoại không hợp lệ (vui lòng sử dụng số điện thoại Việt Nam).");
    if (message.length < 5) return setError("Nội dung yêu cầu phải có ít nhất 5 ký tự.");

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, message, website: form.website }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDone(true);
        setForm(empty);
      } else {
        setError(data.error || "Có lỗi xảy ra khi gửi thông tin.");
      }
    } catch {
      setError("Không thể kết nối tới máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div
        className="form-success fade-in-right"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
      >
        <h2>Gửi yêu cầu thành công!</h2>
        <p style={{ marginTop: "12px", color: "#6e7477", fontSize: "14px" }}>
          Cảm ơn bạn. Chúng tôi đã nhận được thông tin liên hệ và sẽ phản hồi trong vòng 5 phút.
        </p>
        <button
          type="button"
          onClick={() => {
            setDone(false);
            setError(null);
          }}
          className="gv-btn"
          style={{ border: 0, cursor: "pointer", marginTop: "24px" }}
        >
          Gửi yêu cầu mới <Icon name="arrow" size={17} />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="fade-in-right">
      <div className="form-title">
        <span>Gửi yêu cầu tư vấn</span>
        <small>Phản hồi ~ 5 phút</small>
      </div>
      {/* Honeypot: real visitors never see or fill this field. */}
      <div style={{ display: "none" }} aria-hidden="true">
        <input
          type="text"
          name="website"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <label htmlFor="name">
        HỌ VÀ TÊN *
        <input
          id="name"
          type="text"
          placeholder="Nguyễn Văn A"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          disabled={loading}
        />
      </label>
      <label htmlFor="phone">
        SỐ ĐIỆN THOẠI *
        <input
          id="phone"
          type="tel"
          placeholder="0912 345 678"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
          disabled={loading}
        />
      </label>
      <label htmlFor="message">
        NỘI DUNG YÊU CẦU *
        <textarea
          id="message"
          rows={4}
          placeholder="Mô tả ngắn gọn về dự án, website cần làm hoặc câu hỏi của bạn..."
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
          disabled={loading}
        />
      </label>
      {error && <p style={{ color: "#d93838", fontSize: "13px", marginTop: "-5px" }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Đang gửi yêu cầu..." : "Gửi yêu cầu ngay"}
        <Icon name="arrow" size={17} />
      </button>
    </form>
  );
}
