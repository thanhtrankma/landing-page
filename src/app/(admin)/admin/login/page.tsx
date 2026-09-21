import type { Metadata } from "next";
import { authConfigured } from "@/lib/env";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Đăng nhập" };
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="brand">
          <div className="mark">S</div>
          <div>Super<span>Landing</span></div>
        </div>
        <h1>Chào mừng trở lại 👋</h1>
        <p className="muted" style={{ margin: "0 0 22px" }}>Đăng nhập để quản lý website của bạn.</p>
        {authConfigured() ? (
          <LoginForm />
        ) : (
          <div className="notice err">
            Chưa cấu hình đăng nhập. Thêm <code>ADMIN_PASSWORD</code> (≥ 8 ký tự) và <code>ADMIN_SESSION_SECRET</code> (≥ 24 ký tự) vào <code>.env.local</code> rồi khởi động lại.
          </div>
        )}
      </div>
    </div>
  );
}
