"use client";

import { useActionState } from "react";
import { Notice, PasswordInput, SubmitButton } from "@/components/admin/Controls";
import { loginAction } from "./actions";

export default function LoginForm() {
  const [state, action] = useActionState(loginAction, undefined);
  return (
    <form action={action}>
      <Notice state={state} inline />
      <div className="field">
        <label htmlFor="password">Mật khẩu quản trị</label>
        <PasswordInput id="password" name="password" autoComplete="current-password" required autoFocus placeholder="Nhập mật khẩu" />
      </div>
      <SubmitButton pending="Đang đăng nhập…" className="btn primary" style={{ width: "100%" }}>
        Đăng nhập
      </SubmitButton>
    </form>
  );
}
