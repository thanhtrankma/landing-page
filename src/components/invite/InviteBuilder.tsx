"use client";

import { useCallback, useEffect, useState } from "react";
import { I, Modal } from "@/components/cards/ui";
import { lunarLabel } from "@/lib/invites/lunar";
import { inviteTitle, type BankInfo, type Family, type InviteData } from "@/lib/invites/types";
import { slugify } from "@/lib/validate";
import { EventsField, GalleryField, ImageField, MusicField, Section, Text, Toggle } from "./fields";
import { inviteFontVars } from "./fonts";
import Invitation from "./Invitation";
import WishesPanel from "./WishesPanel";
import "./builder.css";

// Invitation builder: form on the left, the real invitation rendered live in a phone frame on the right.
// No account: the first save returns a secret edit link (and sets a cookie on this device).

export type SavedInvite = { id: string; slug: string; published: boolean; updatedAt: string };
type Props = { initial: InviteData; invite?: SavedInvite };
type Dialog = { kind: "created"; editUrl: string } | { kind: "share" } | { kind: "editLink"; url: string } | null;
type SlugState = { checking: boolean; ok: boolean; reason: string | null };

const BASE = "/cong-cu/thiep-cuoi-online";
const SITE = typeof window !== "undefined" ? window.location.origin : "";

async function send(url: string, method: string, body: unknown) {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra, vui lòng thử lại.");
  return data;
}

export default function InviteBuilder({ initial, invite: savedInvite }: Props) {
  const [data, setData] = useState<InviteData>(initial);
  const [invite, setInvite] = useState<SavedInvite | null>(savedInvite ?? null);
  const [slug, setSlug] = useState(savedInvite?.slug ?? slugify(`${initial.groomName}-${initial.brideName}`));
  const [slugTouched, setSlugTouched] = useState(Boolean(savedInvite));
  const [slugState, setSlugState] = useState<SlugState>({ checking: false, ok: true, reason: null });
  const [open, setOpen] = useState<string>(savedInvite ? "" : "couple");
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ m: string; err?: boolean } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [guestName, setGuestName] = useState("");
  const [draft, setDraft] = useState<{ ts: number; data: InviteData; slug: string } | null>(null);
  const draftKey = `sl-invite-draft:${invite?.id ?? "new"}`;

  const notify = useCallback((m: string, err = false) => setToast({ m, err }), []);
  const onError = useCallback((m: string) => setToast({ m, err: true }), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.err ? 6000 : 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const update = useCallback((patch: Partial<InviteData>) => {
    setData((d) => ({ ...d, ...patch }));
    setDirty(true);
  }, []);
  const setFamily = (which: "groomFamily" | "brideFamily", patch: Partial<Family>) => update({ [which]: { ...data[which], ...patch } });
  const setBank = (who: "groom" | "bride", patch: Partial<BankInfo>) => update({ gift: { ...data.gift, [who]: { ...data.gift[who], ...patch } } });

  // Until the couple edits the link themselves, it follows their names.
  const effectiveSlug = slugTouched ? slug : slugify(`${data.groomName}-${data.brideName}`) || slug;

  useEffect(() => {
    if (!effectiveSlug) return;
    let alive = true;
    const t = setTimeout(async () => {
      setSlugState((s) => ({ ...s, checking: true }));
      try {
        const res = await fetch(`/api/invites/slug?slug=${encodeURIComponent(effectiveSlug)}${invite ? `&id=${invite.id}` : ""}`);
        const r = await res.json();
        if (alive) setSlugState({ checking: false, ok: Boolean(r.available), reason: r.reason ?? null });
      } catch {
        if (alive) setSlugState({ checking: false, ok: true, reason: null });
      }
    }, 450);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [effectiveSlug, invite]);

  // Local draft so a closed tab or a dead battery never loses the couple's typing.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(draftKey) ?? "null");
      if (saved?.data && (!savedInvite || saved.ts > Date.parse(savedInvite.updatedAt))) {
        const t = setTimeout(() => setDraft(saved), 0);
        return () => clearTimeout(t);
      }
    } catch {}
    // Only on first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify({ ts: Date.now(), data, slug: effectiveSlug }));
      } catch {}
    }, 800);
    return () => clearTimeout(t);
  }, [data, dirty, draftKey, effectiveSlug]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const shareUrl = invite ? `${SITE}/thiep/${invite.slug}` : "";
  const guestUrl = shareUrl && guestName.trim() ? `${shareUrl}?khach=${encodeURIComponent(guestName.trim())}` : shareUrl;

  const save = async (): Promise<SavedInvite | null> => {
    if (!data.groomName.trim() || !data.brideName.trim()) {
      setOpen("couple");
      setView("edit");
      onError("Hãy nhập tên cô dâu và chú rể.");
      return null;
    }
    if (!slugState.ok && !slugState.checking) {
      setOpen("link");
      setView("edit");
      onError(slugState.reason ?? "Đường dẫn chưa hợp lệ.");
      return null;
    }
    setBusy("Đang lưu…");
    try {
      if (!invite) {
        const r = await send("/api/invites", "POST", { slug: effectiveSlug, data });
        const next = { id: r.id, slug: r.slug, published: true, updatedAt: new Date().toISOString() };
        setInvite(next);
        setSlug(r.slug);
        setSlugTouched(true);
        try {
          localStorage.setItem(`sl-invite-token:${r.id}`, r.token);
          localStorage.removeItem(draftKey);
        } catch {}
        window.history.replaceState(null, "", `${BASE}/sua/${r.id}`);
        setDirty(false);
        setDialog({ kind: "created", editUrl: `${SITE}${BASE}/sua/${r.id}#t=${r.token}` });
        return next;
      }
      const r = await send(`/api/invites/${invite.id}`, "PUT", { slug: effectiveSlug, data });
      const next = { ...invite, slug: r.slug, updatedAt: r.updatedAt };
      setInvite(next);
      setDirty(false);
      try {
        localStorage.removeItem(draftKey);
      } catch {}
      notify("Đã lưu. Khách mở link sẽ thấy nội dung mới.");
      return next;
    } catch (e) {
      onError((e as Error).message);
      return null;
    } finally {
      setBusy(null);
    }
  };

  const share = async () => {
    const saved = !invite || dirty ? await save() : invite;
    if (saved && invite) setDialog({ kind: "share" });
  };

  const showEditLink = () => {
    if (!invite) return;
    let token: string | null = null;
    try {
      token = localStorage.getItem(`sl-invite-token:${invite.id}`);
    } catch {}
    if (token) setDialog({ kind: "editLink", url: `${SITE}${BASE}/sua/${invite.id}#t=${token}` });
    else onError("Link chỉnh sửa chỉ xem lại được trên thiết bị đã tạo thiệp.");
  };

  const togglePublished = async () => {
    if (!invite) return;
    try {
      const r = await send(`/api/invites/${invite.id}`, "PUT", { published: !invite.published });
      setInvite({ ...invite, published: r.published });
      notify(r.published ? "Thiệp đã được bật lại." : "Đã tạm ẩn thiệp. Link sẽ báo không tìm thấy.");
    } catch (e) {
      onError((e as Error).message);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify("Đã sao chép link.");
    } catch {
      onError("Không sao chép được, hãy bôi đen và sao chép thủ công.");
    }
  };

  const toggle = (id: string) => setOpen((o) => (o === id ? "" : id));
  const busyProps = { setBusy, onError };
  const status = busy ?? (dirty ? "Chưa lưu" : invite ? "Đã lưu" : "");

  return (
    <div className="ib" data-view={view}>
      <header className="ib-top">
        <a className="ce-icon-btn" href={BASE} aria-label="Quay lại">
          <I name="back" />
        </a>
        <div className="ib-top-title">
          <b>{inviteTitle(data)}</b>
          <small>{invite ? `superlanding.vn/thiep/${invite.slug}` : "Chưa lưu"}</small>
        </div>
        <span className={`ce-status ${busy ? "busy" : ""}`} aria-live="polite">
          {busy && <I name="loader" size={14} className="spin" />}
          {status}
        </span>
        <button type="button" className="ce-btn" onClick={save} disabled={Boolean(busy)}>
          <I name="save" size={16} />
          <span className="hide-sm">Lưu</span>
        </button>
        <button type="button" className="ce-btn primary" onClick={share} disabled={Boolean(busy)}>
          <I name="share" size={16} />
          <span>Chia sẻ</span>
        </button>
      </header>

      {draft && (
        <div className="ce-banner" role="status">
          <span>Bạn có bản nháp chưa lưu lúc {new Date(draft.ts).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}.</span>
          <button type="button" className="ce-btn sm primary" onClick={() => { setData(draft.data); if (draft.slug) { setSlug(draft.slug); setSlugTouched(true); } setDirty(true); setDraft(null); }}>
            Khôi phục
          </button>
          <button type="button" className="ce-btn sm ghost" onClick={() => { try { localStorage.removeItem(draftKey); } catch {} setDraft(null); }}>
            Bỏ qua
          </button>
        </div>
      )}

      <div className="ib-switcher" role="tablist">
        <button type="button" role="tab" aria-selected={view === "edit"} className={view === "edit" ? "on" : ""} onClick={() => setView("edit")}>Chỉnh sửa</button>
        <button type="button" role="tab" aria-selected={view === "preview"} className={view === "preview" ? "on" : ""} onClick={() => setView("preview")}>Xem trước</button>
      </div>

      <div className="ib-body">
        <div className="ib-form">
          {invite && !invite.published && (
            <div className="ib-note warn">
              Thiệp đang tạm ẩn, khách mở link sẽ không xem được.{" "}
              <button type="button" onClick={togglePublished}>Bật lại</button>
            </div>
          )}

          <Section id="couple" title="Cô dâu & chú rể" hint={inviteTitle(data)} open={open === "couple"} onToggle={toggle}>
            <div className="ib-grid2">
              <Text label="Tên chú rể (ngắn)" value={data.groomName} onChange={(v) => update({ groomName: v })} placeholder="Minh Anh" max={60} />
              <Text label="Tên cô dâu (ngắn)" value={data.brideName} onChange={(v) => update({ brideName: v })} placeholder="Thu Hà" max={60} />
            </div>
            <div className="ib-grid2">
              <Text label="Họ tên đầy đủ chú rể" value={data.groomFullName} onChange={(v) => update({ groomFullName: v })} max={80} />
              <Text label="Họ tên đầy đủ cô dâu" value={data.brideFullName} onChange={(v) => update({ brideFullName: v })} max={80} />
            </div>
          </Section>

          <Section id="families" title="Gia đình hai bên" hint="Tên bố mẹ, địa chỉ" open={open === "families"} onToggle={toggle}>
            {(["groomFamily", "brideFamily"] as const).map((k) => (
              <div key={k} className="ib-sub">
                <Text label="Tiêu đề" value={data[k].title} onChange={(v) => setFamily(k, { title: v })} max={40} />
                <Text label="Bố mẹ (mỗi người một dòng)" value={data[k].parents} onChange={(v) => setFamily(k, { parents: v })} multiline rows={2} max={300} />
                <Text label="Địa chỉ" value={data[k].address} onChange={(v) => setFamily(k, { address: v })} max={300} />
              </div>
            ))}
          </Section>

          <Section id="date" title="Ngày cưới & sự kiện" hint={data.date.split("-").reverse().join("/")} open={open === "date"} onToggle={toggle}>
            <label className="ib-field">
              <span>Ngày cưới chính</span>
              <input type="date" value={data.date} onChange={(e) => update({ date: e.target.value })} />
              <small>Dùng cho phần “Save the date”, lịch tháng và đếm ngược. {lunarLabel(data.date)}</small>
            </label>
            <EventsField value={data.events} onChange={(events) => update({ events })} mainDate={data.date} />
          </Section>

          <Section id="photos" title="Ảnh chính" hint="Ảnh bìa, ảnh đôi, 3 ảnh nổi bật" open={open === "photos"} onToggle={toggle}>
            <ImageField label="Ảnh bìa" value={data.cover} onChange={(v) => update({ cover: v })} hint="Ảnh dọc đẹp nhất, cũng là ảnh khi gửi link qua Zalo/Messenger." {...busyProps} />
            <ImageField label="Ảnh cô dâu chú rể" value={data.couplePhoto} onChange={(v) => update({ couplePhoto: v })} ratio="4 / 5" {...busyProps} />
            <div className="ib-grid3">
              {[0, 1, 2].map((i) => (
                <ImageField
                  key={i}
                  label={["Ảnh ngày", "Ảnh tháng", "Ảnh năm"][i]}
                  value={data.highlights[i] ?? ""}
                  onChange={(v) => update({ highlights: data.highlights.map((h, k) => (k === i ? v : h)) })}
                  {...busyProps}
                />
              ))}
            </div>
            <ImageField label="Ảnh nền lời cảm ơn" value={data.thanksPhoto} onChange={(v) => update({ thanksPhoto: v })} hint="Bỏ trống sẽ dùng ảnh bìa." {...busyProps} />
          </Section>

          <Section id="album" title="Album ảnh cưới" hint={`${data.gallery.length} ảnh`} open={open === "album"} onToggle={toggle}>
            <GalleryField value={data.gallery} onChange={(gallery) => update({ gallery })} {...busyProps} />
          </Section>

          <Section id="words" title="Lời mời & lời cảm ơn" open={open === "words"} onToggle={toggle}>
            <Text label="Dòng mời" value={data.inviteHeading} onChange={(v) => update({ inviteHeading: v })} max={80} />
            <Text label="Tên khách mặc định" value={data.defaultGuest} onChange={(v) => update({ defaultGuest: v })} max={60} hint="Hiện khi link không kèm tên khách. Tạo link riêng cho từng người trong mục Chia sẻ." />
            <Text label="Dòng dưới tên khách" value={data.inviteLine} onChange={(v) => update({ inviteLine: v })} max={160} />
            <Text label="Lời cảm ơn" value={data.thanks} onChange={(v) => update({ thanks: v })} multiline rows={4} max={600} />
          </Section>

          <Section id="gift" title="Hộp mừng cưới" hint={data.gift.enabled ? "Đang bật" : "Đang tắt"} open={open === "gift"} onToggle={toggle}>
            <Toggle label="Hiện hộp mừng cưới" checked={data.gift.enabled} onChange={(v) => update({ gift: { ...data.gift, enabled: v } })} hint="Khách có thể quét QR hoặc sao chép số tài khoản." />
            {data.gift.enabled &&
              (["groom", "bride"] as const).map((who) => (
                <div key={who} className="ib-sub">
                  <b className="ib-sub-title">{who === "groom" ? "Chú rể" : "Cô dâu"}</b>
                  <div className="ib-grid2">
                    <Text label="Ngân hàng" value={data.gift[who].bank} onChange={(v) => setBank(who, { bank: v })} placeholder="Vietcombank" max={80} />
                    <Text label="Số tài khoản" value={data.gift[who].account} onChange={(v) => setBank(who, { account: v })} max={40} />
                  </div>
                  <Text label="Chủ tài khoản" value={data.gift[who].holder} onChange={(v) => setBank(who, { holder: v })} max={80} />
                  <ImageField label="Ảnh mã QR" value={data.gift[who].qr} onChange={(v) => setBank(who, { qr: v })} ratio="1 / 1" hint="Chụp màn hình mã QR nhận tiền trong app ngân hàng." {...busyProps} />
                </div>
              ))}
          </Section>

          <Section id="music" title="Nhạc nền & hiệu ứng" hint={data.music.src ? data.music.title || "Có nhạc" : "Không có nhạc"} open={open === "music"} onToggle={toggle}>
            <MusicField value={data.music} onChange={(music) => update({ music })} {...busyProps} />
            <Toggle label="Hiệu ứng hoa rơi" checked={data.petals} onChange={(v) => update({ petals: v })} />
          </Section>

          <Section id="rsvp" title="Lời chúc & xác nhận tham dự" hint={data.rsvp.enabled ? "Đang nhận" : "Đang tắt"} open={open === "rsvp"} onToggle={toggle}>
            <Toggle label="Cho khách gửi lời chúc và xác nhận tham dự" checked={data.rsvp.enabled} onChange={(v) => update({ rsvp: { enabled: v } })} hint="Lời chúc hiện công khai trên thiệp; bạn có thể ẩn từng lời chúc." />
            {invite ? <WishesPanel inviteId={invite.id} onError={onError} /> : <p className="ib-muted">Lưu thiệp để bắt đầu nhận lời chúc.</p>}
          </Section>

          <Section id="link" title="Đường dẫn thiệp" hint={`/thiep/${effectiveSlug}`} open={open === "link"} onToggle={toggle}>
            <label className="ib-field">
              <span>Link thiệp của bạn</span>
              <div className="ib-slug">
                <em>superlanding.vn/thiep/</em>
                <input
                  type="text"
                  value={effectiveSlug}
                  maxLength={40}
                  onChange={(e) => {
                    setSlug(slugify(e.target.value).slice(0, 40));
                    setSlugTouched(true);
                    setDirty(true);
                  }}
                />
              </div>
              <small className={slugState.ok ? "ok" : "bad"}>{slugState.checking ? "Đang kiểm tra…" : slugState.ok ? "Có thể dùng đường dẫn này." : slugState.reason}</small>
            </label>
            {invite && (
              <div className="ib-row wrap">
                <button type="button" className="ib-btn sm" onClick={showEditLink}>Xem link chỉnh sửa</button>
                <button type="button" className="ib-btn sm ghost" onClick={togglePublished}>{invite.published ? "Tạm ẩn thiệp" : "Bật lại thiệp"}</button>
              </div>
            )}
          </Section>
        </div>

        <div className="ib-preview">
          <div className="ib-phone">
            <div className="ib-screen">
              <div className={inviteFontVars}>
                <Invitation data={data} preview />
              </div>
            </div>
          </div>
          <p className="ib-preview-note">Xem trước trực tiếp: khách sẽ thấy thêm màn hình “Mở thiệp” và nhạc nền.</p>
        </div>
      </div>

      {toast && (
        <div className={`ce-toast ${toast.err ? "err" : "ok"}`} role={toast.err ? "alert" : "status"}>
          <I name={toast.err ? "x" : "check"} size={16} /> {toast.m}
        </div>
      )}

      {dialog?.kind === "created" && (
        <Modal title="Thiệp đã được tạo 🎉" onClose={() => setDialog({ kind: "share" })}>
          <p><b>Bước 1 — Lưu link chỉnh sửa.</b> Không cần tài khoản: ai có link này đều sửa được thiệp, hãy giữ riêng cho mình.</p>
          <CopyRow url={dialog.editUrl} onCopy={copy} />
          <p className="ce-hint">Trên thiết bị này bạn có thể mở lại bất cứ lúc nào; sang máy khác cần link trên.</p>
          <button type="button" className="ce-btn primary" onClick={() => setDialog({ kind: "share" })}>Tiếp: gửi thiệp cho khách</button>
        </Modal>
      )}

      {dialog?.kind === "editLink" && (
        <Modal title="Link chỉnh sửa thiệp" onClose={() => setDialog(null)}>
          <p>Ai có link này đều sửa được thiệp. Đừng gửi cho khách mời.</p>
          <CopyRow url={dialog.url} onCopy={copy} />
        </Modal>
      )}

      {dialog?.kind === "share" && invite && (
        <Modal title="Gửi thiệp cho bạn bè, người thân" onClose={() => setDialog(null)}>
          <p>Link thiệp chung:</p>
          <CopyRow url={shareUrl} onCopy={copy} />
          <label className="ib-field">
            <span>Link có tên khách (thiệp hiện “Kính gửi …”)</span>
            <input type="text" value={guestName} maxLength={60} placeholder="VD: Anh Nam & chị Lan" onChange={(e) => setGuestName(e.target.value)} />
          </label>
          {guestName.trim() && <CopyRow url={guestUrl} onCopy={copy} />}
          <div className="ce-row wrap">
            {typeof navigator !== "undefined" && "share" in navigator && (
              <button type="button" className="ce-btn primary" onClick={() => navigator.share({ title: inviteTitle(data), url: guestUrl }).catch(() => {})}>
                <I name="share" size={16} /> Gửi qua Zalo, Messenger…
              </button>
            )}
            <a className="ce-btn" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer">Facebook</a>
            <a className="ce-btn" href={guestUrl} target="_blank" rel="noopener noreferrer"><I name="link" size={16} /> Mở thiệp</a>
          </div>
        </Modal>
      )}
    </div>
  );
}

function CopyRow({ url, onCopy }: { url: string; onCopy: (u: string) => void }) {
  return (
    <div className="ce-copy">
      <input type="text" readOnly value={url} onFocus={(e) => e.currentTarget.select()} aria-label="Đường dẫn" />
      <button type="button" className="ce-btn primary" onClick={() => onCopy(url)}>Sao chép</button>
    </div>
  );
}
