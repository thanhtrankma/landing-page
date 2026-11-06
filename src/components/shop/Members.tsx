"use client";

import { useCallback, useEffect, useState } from "react";
import { SHOP_APP, SHOP_BOOK_COOKIE } from "@/lib/shop/tool";
import { Field, Panel, Seg, useShop } from "./ui";

// "Người cùng quản lý": invite staff or family by email to share this book. Everyone in it works on the
// same data (synced every few seconds); only the owner invites, changes roles and removes people.

type MemberRole = "editor" | "viewer";
type Member = { id: string; email: string; name: string; role: MemberRole; joined: boolean };
type Data = { members: Member[]; owner: { name: string; email: string }; emailed?: boolean };

const ROLES: [MemberRole, string][] = [
  ["editor", "Cùng quản lý"],
  ["viewer", "Chỉ xem"],
];

export default function Members({ onClose }: { onClose: () => void }) {
  const { book, bookId, role, toast, me } = useShop();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState<MemberRole>("editor");
  const [busy, setBusy] = useState(false);
  const [invited, setInvited] = useState<{ email: string; role: MemberRole } | null>(null);
  const owner = role === "owner";

  const load = useCallback(async () => {
    const res = await fetch(`/api/shop/members?book=${bookId}`, { cache: "no-store" });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return setError(d.error || "Không tải được danh sách.");
    setData(d);
  }, [bookId]);
  useEffect(() => {
    // Fetch on open; setState happens after the await.
    void load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [load]);

  const send = async (body: object) => {
    setBusy(true);
    try {
      const res = await fetch("/api/shop/members", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ book: bookId, ...body }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(d.error || "Không thực hiện được.", true);
        return null;
      }
      if (d.members) setData(d);
      return d;
    } finally {
      setBusy(false);
    }
  };

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    const to = email.trim().toLowerCase();
    if (!to) return;
    const d = await send({ action: "add", email: to, role: newRole });
    if (!d) return;
    setEmail("");
    setInvited({ email: to, role: newRole });
    toast(d.emailed ? `Đã mời và gửi email cho ${to}.` : `Đã mời ${to}. Gửi lời mời cho họ qua Zalo bên dưới.`);
  };

  const remove = async (m: Member) => {
    if (!window.confirm(`Bớt ${m.name || m.email} khỏi sổ hàng? Họ sẽ không mở được sổ này nữa.`)) return;
    if (await send({ action: "remove", member: m.id })) toast(`Đã bớt ${m.name || m.email}.`);
  };

  const leave = async () => {
    if (!window.confirm("Rời sổ hàng này? Bạn sẽ không mở được nữa cho tới khi chủ sổ mời lại.")) return;
    if (await send({ action: "leave" })) {
      document.cookie = `${SHOP_BOOK_COOKIE}=; path=/; max-age=0`;
      window.location.href = SHOP_APP;
    }
  };

  const link = typeof window === "undefined" ? SHOP_APP : `${window.location.origin}${SHOP_APP}?so=${bookId}`;
  const message = (to: string, r: MemberRole) =>
    `Mời bạn ${r === "viewer" ? "xem" : "cùng quản lý"} sổ hàng${book.shopName ? ` “${book.shopName}”` : ""} trên SuperLanding (nhập – bán, tồn kho, đơn đặt hàng).\n` +
    `1. Mở link: ${link}\n2. Đăng nhập bằng email ${to}\nLà vào được sổ ngay.`;
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast("Đã sao chép lời mời, dán vào Zalo hoặc Messenger để gửi.");
    } catch {
      toast("Không sao chép được.", true);
    }
  };
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <Panel title="Người cùng quản lý" onClose={onClose}>
      <p className="sh-muted sh-members-intro">
        Mời nhân viên hoặc người nhà cùng ghi nhập – bán vào sổ này. Mọi người dùng chung một sổ: thay đổi của ai cũng tự cập nhật sang máy người khác sau vài giây, và mỗi đơn ghi rõ ai tạo.
      </p>

      {error ? (
        <p className="sh-muted">{error}</p>
      ) : !data ? (
        <p className="sh-muted">Đang tải…</p>
      ) : (
        <ul className="sh-members">
          <li>
            <span className="sh-avatar" aria-hidden="true">
              {(data.owner.name || data.owner.email || "?").slice(0, 1).toUpperCase()}
            </span>
            <span className="sh-member-main">
              <b>
                {data.owner.name || data.owner.email}
                {owner && " (bạn)"}
              </b>
              {data.owner.name && <small>{data.owner.email}</small>}
            </span>
            <em className="sh-member-role owner">Chủ sổ</em>
          </li>
          {data.members.map((m) => (
            <li key={m.id}>
              <span className="sh-avatar" aria-hidden="true">
                {(m.name || m.email).slice(0, 1).toUpperCase()}
              </span>
              <span className="sh-member-main">
                <b>
                  {m.name || m.email}
                  {(m.email === me || m.name === me) && " (bạn)"}
                </b>
                <small>
                  {m.name ? m.email : ""}
                  {!m.joined && <i className="sh-member-wait">Chưa vào sổ</i>}
                </small>
              </span>
              {owner ? (
                <span className="sh-member-act">
                  <select aria-label={`Quyền của ${m.email}`} value={m.role} disabled={busy} onChange={(e) => send({ action: "role", member: m.id, role: e.target.value })}>
                    {ROLES.map(([v, t]) => (
                      <option key={v} value={v}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {!m.joined && (
                    <button type="button" className="ce-btn sm ghost" onClick={() => copy(message(m.email, m.role))}>
                      Lời mời
                    </button>
                  )}
                  <button type="button" className="sh-x" aria-label={`Bớt ${m.email}`} title="Bớt khỏi sổ" disabled={busy} onClick={() => remove(m)}>
                    ×
                  </button>
                </span>
              ) : (
                <em className="sh-member-role">{ROLES.find(([v]) => v === m.role)?.[1]}</em>
              )}
            </li>
          ))}
          {!data.members.length && <li className="sh-muted sh-members-none">Chưa mời ai. Sổ này hiện chỉ mình bạn dùng.</li>}
        </ul>
      )}

      {owner && (
        <form className="sh-invite" onSubmit={invite}>
          <h3>Mời thêm người</h3>
          <Field label="Email của người được mời" hint="Họ đăng nhập bằng đúng email này là vào được sổ, chưa có tài khoản cũng được.">
            <input type="email" inputMode="email" autoComplete="off" placeholder="vd: nhanvien@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Seg label="Quyền" value={newRole} options={ROLES} onChange={setNewRole} />
          <p className="sh-muted sh-role-hint">
            {newRole === "editor"
              ? "Cùng quản lý: thêm, sửa, xoá mẫu hàng, phiếu nhập – bán, đơn đặt, nguồn hàng, ghi chú. Thấy cả giá nhập và tiền lãi."
              : "Chỉ xem: xem tồn kho, phiếu, báo cáo; không sửa được gì."}
          </p>
          <button type="submit" className="ce-btn primary" disabled={busy || !email.trim()}>
            {busy ? "Đang mời…" : "Mời vào sổ"}
          </button>
        </form>
      )}

      {owner && invited && (
        <div className="sh-send">
          <b>Gửi lời mời cho {invited.email}</b>
          <pre>{message(invited.email, invited.role)}</pre>
          <div className="sh-row-actions">
            <button type="button" className="ce-btn sm primary" onClick={() => copy(message(invited.email, invited.role))}>
              Sao chép lời mời
            </button>
            {canShare && (
              <button type="button" className="ce-btn sm" onClick={() => navigator.share({ text: message(invited.email, invited.role) }).catch(() => {})}>
                Chia sẻ…
              </button>
            )}
          </div>
        </div>
      )}

      {!owner && data && (
        <div className="sh-row-actions sh-leave">
          <p className="sh-muted">Chỉ chủ sổ mới mời thêm hoặc bớt người được.</p>
          <button type="button" className="ce-btn sm danger" disabled={busy} onClick={leave}>
            Rời sổ này
          </button>
        </div>
      )}
    </Panel>
  );
}
