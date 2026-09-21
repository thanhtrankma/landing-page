"use client";

import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Icon } from "./Icons";

/** Submit button that shows a spinner and disables itself while the surrounding form's server action runs. */
export function SubmitButton({ children, pending: label, className = "btn primary", ...rest }: { children: ReactNode; pending?: string } & ComponentProps<"button">) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending} aria-busy={pending} {...rest}>
      {pending ? (
        <>
          <Icon name="loader" size={16} className="spin" /> {label ?? "Đang lưu…"}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/** Asks for confirmation before letting a destructive form submit. */
export function ConfirmButton({ children, message, className = "btn danger sm", ...rest }: { children: ReactNode; message: string } & ComponentProps<"button">) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

type State = { ok?: boolean; error?: string; message?: string } | undefined;

/** Result of a form action: floats bottom-right so it stays visible on long pages. Successes fade after a few seconds. */
export function Notice({ state, inline = false }: { state?: State; inline?: boolean }) {
  const [dismissed, setDismissed] = useState<State | null>(null);
  const isError = Boolean(state?.error);
  const visible = Boolean(state && (state.error || state.ok || state.message)) && dismissed !== state;

  useEffect(() => {
    if (!state || isError || state.error) return;
    const t = setTimeout(() => setDismissed(state), 4500);
    return () => clearTimeout(t);
  }, [state, isError]);

  if (!visible || !state) return null;
  const box = (
    <div className={`notice ${isError ? "err" : "ok"}${inline ? "" : " toast"}`} role={isError ? "alert" : "status"}>
      <Icon name={isError ? "alert" : "check"} size={18} />
      <span>{state.error ?? state.message ?? "Đã lưu."}</span>
      {!inline && (
        <button type="button" className="notice-x" aria-label="Đóng thông báo" onClick={() => setDismissed(state)}>
          <Icon name="x" size={16} />
        </button>
      )}
    </div>
  );
  return box;
}

/** Select that submits its filter form as soon as the choice changes. */
export function FilterSelect(props: ComponentProps<"select">) {
  return <select {...props} onChange={(e) => e.currentTarget.form?.requestSubmit()} />;
}

/** Password input with a show/hide toggle. */
export function PasswordInput(props: ComponentProps<"input">) {
  const [show, setShow] = useState(false);
  return (
    <div className="input-wrap">
      <input {...props} type={show ? "text" : "password"} />
      <button type="button" className="input-icon-btn" onClick={() => setShow((s) => !s)} aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"} aria-pressed={show}>
        <Icon name={show ? "eyeOff" : "eye"} size={18} />
      </button>
    </div>
  );
}

/** Image picker: big preview, click or drop to upload (posts to /api/admin/upload), URL kept as a fallback. */
export function ImageField({ name, label, defaultValue = "", hint }: { name: string; label: string; defaultValue?: string; hint?: string }) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tải ảnh thất bại.");
      setUrl(data.url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="field">
      <span className="lbl">{label}</span>
      <div
        className={`dropzone${drag ? " drag" : ""}${busy ? " busy" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          upload(e.dataTransfer.files?.[0]);
        }}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="dz-img" src={url} alt="" />
        ) : (
          <button type="button" className="dz-empty" onClick={() => fileRef.current?.click()}>
            <Icon name="image" size={30} />
            <b>Kéo ảnh vào đây hoặc bấm để chọn</b>
            <span>PNG, JPG, WebP, GIF, AVIF · tối đa 5MB</span>
          </button>
        )}
        {busy && (
          <div className="dz-busy">
            <Icon name="loader" size={22} className="spin" /> Đang tải lên…
          </div>
        )}
      </div>
      <div className="row-actions">
        <button type="button" className="btn sm" onClick={() => fileRef.current?.click()} disabled={busy}>
          <Icon name="upload" size={15} /> {url ? "Đổi ảnh" : "Chọn ảnh"}
        </button>
        {url && (
          <button type="button" className="btn sm ghost" onClick={() => setUrl("")} disabled={busy}>
            <Icon name="trash" size={15} /> Bỏ ảnh
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" hidden onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
      <details className="more">
        <summary>Hoặc dán đường dẫn ảnh</summary>
        <input id={`${name}-url`} type="text" name={name} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/images/… hoặc https://…" aria-label={`${label} (đường dẫn)`} />
      </details>
      {hint && <span className="hint">{hint}</span>}
      {error && (
        <span className="hint err" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
