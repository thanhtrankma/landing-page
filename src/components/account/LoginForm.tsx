"use client";

import { useEffect, useRef, useState } from "react";

// Email + 6-digit code login (no password), plus "Đăng nhập với Google".

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

export default function LoginForm({ next, googleEnabled, initialError }: { next: string; googleEnabled: boolean; initialError?: string }) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError ?? "");
  const [cooldown, setCooldown] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!cooldown) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const post = async (url: string, body: unknown) => {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra, vui lòng thử lại.");
    return data;
  };

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    setError("");
    try {
      await post("/api/auth/code", { email });
      setStep("code");
      setCooldown(45);
      setTimeout(() => codeRef.current?.focus(), 50);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await post("/api/auth/verify", { email, code, next });
      window.location.assign(data.next || next);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="lg-card">
      <div className="lg-logo" aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#0b6fa4">
          <path d="M12 21s-7.5-4.6-9.6-9.3C1 8.4 3.2 5 6.6 5c2 0 3.6 1.1 5.4 3 1.8-1.9 3.4-3 5.4-3 3.4 0 5.6 3.4 4.2 6.7C19.5 16.4 12 21 12 21z" />
        </svg>
      </div>
      <h1>Chào mừng bạn</h1>
      <p>Đăng nhập để xuất bản thiệp, quản lý khách mời và xem xác nhận tham dự.</p>

      <a className={`lg-google ${googleEnabled ? "" : "disabled"}`} href={`/api/auth/google?next=${encodeURIComponent(next)}`} aria-disabled={!googleEnabled}>
        <GoogleLogo /> Đăng nhập với Google
      </a>
      {!googleEnabled && <p className="lg-note" style={{ marginTop: 6 }}>Đăng nhập Google chưa được bật.</p>}
      <div className="lg-or">hoặc</div>

      {step === "email" ? (
        <form className="lg-form" onSubmit={sendCode}>
          <label htmlFor="lg-email">Email</label>
          <input id="lg-email" type="email" required autoComplete="email" placeholder="ban@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          {error && <p className="lg-err" role="alert">{error}</p>}
          <button className="ce-btn primary" type="submit" disabled={busy}>
            {busy ? "Đang gửi mã…" : "Tiếp tục"}
          </button>
          <p className="lg-note">Mã xác thực sẽ được gửi qua email.</p>
        </form>
      ) : (
        <form className="lg-form" onSubmit={verify}>
          <label htmlFor="lg-code">Nhập mã 6 số đã gửi tới {email}</label>
          <input
            id="lg-code"
            ref={codeRef}
            className="lg-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
          {error && <p className="lg-err" role="alert">{error}</p>}
          <button className="ce-btn primary" type="submit" disabled={busy || code.length !== 6}>
            {busy ? "Đang kiểm tra…" : "Đăng nhập"}
          </button>
          <p className="lg-note">
            Không nhận được mã?{" "}
            <button type="button" className="lg-link" disabled={cooldown > 0 || busy} onClick={() => sendCode()}>
              {cooldown ? `Gửi lại sau ${cooldown}s` : "Gửi lại mã"}
            </button>
            {" · "}
            <button type="button" className="lg-link" onClick={() => { setStep("email"); setCode(""); setError(""); }}>
              Đổi email
            </button>
          </p>
        </form>
      )}

      <ul className="lg-checks">
        <li>Không cần mật khẩu</li>
        <li>Đăng nhập an toàn với mã OTP</li>
        <li>Hoàn toàn miễn phí</li>
      </ul>
    </div>
  );
}
