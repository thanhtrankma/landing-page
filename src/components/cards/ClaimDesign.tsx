"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

// Shown when a saved design is opened without its edit cookie. The secret link carries the token in the URL
// fragment (#t=…), which never reaches the server logs; we post it once to get the cookie, then reload.

const subscribe = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
/** null on the server (unknown yet), "" when the link has no token. */
const readToken = () => new URLSearchParams(window.location.hash.slice(1)).get("t") ?? "";

export default function ClaimDesign({ claimUrl, tokenKey, newHref }: { claimUrl: string; tokenKey: string; newHref: string }) {
  const router = useRouter();
  const token = useSyncExternalStore(subscribe, readToken, () => null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch(claimUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) })
      .then(async (res) => {
        if (res.ok) {
          try {
            localStorage.setItem(tokenKey, token);
          } catch {}
          window.history.replaceState(null, "", window.location.pathname);
          router.refresh();
          return;
        }
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Không mở được thiệp.");
      })
      .catch(() => setError("Mất kết nối, vui lòng thử lại."));
  }, [claimUrl, tokenKey, token, router]);

  if (token === null || (token && !error)) {
    return (
      <div className="ce-boot">
        <span className="ce-boot-spinner" aria-hidden="true" />
        Đang mở thiệp…
      </div>
    );
  }
  return (
    <div className="ce-gate">
      <h1>{error ? "Không mở được thiệp" : "Cần link chỉnh sửa"}</h1>
      <p>{error || "Thiệp này chỉ sửa được bằng link chỉnh sửa đã hiện khi bạn lưu thiệp lần đầu (hoặc trên thiết bị đã tạo thiệp)."}</p>
      <Link className="ce-btn primary" href={newHref}>
        Tạo thiệp mới
      </Link>
    </div>
  );
}
