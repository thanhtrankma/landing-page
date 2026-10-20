"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { I, Modal } from "@/components/cards/ui";
import { lunarLabel } from "@/lib/invites/lunar";
import { demoSlug, INVITE_THEMES, inviteTitle, templateName, themeVariant, variantSwatch, type BankInfo, type Family, type InviteData, type SectionKey } from "@/lib/invites/types";
import { slugify } from "@/lib/validate";
import { BankField, ColorsField, EventsField, GalleryField, ImageField, MusicField, QuestionsField, ScheduleField, Segmented, Text, Toggle } from "./fields";
import { inviteFontVars } from "./fonts";
import Invitation from "./Invitation";
import WishesPanel from "./WishesPanel";
import "./builder.css";
import "./editor2.css";

// Invitation editor (after chungdoi.com): one column of section cards, each with a "Hiện" switch, a
// Chỉnh sửa ⇄ Xem trước toggle, template switcher, autosave, and "Xuất bản" (which needs an account).

const BASE = "/cong-cu/thiep-cuoi-online";

export type EditorInvite = { id: string; slug: string; status: "draft" | "published"; published: boolean; role: "owner" | "editor" | "token" };
type Props = { initial: InviteData; invite?: EditorInvite; user: { email: string; name: string } | null; autoPublish?: boolean };
type Dialog = "theme" | "publish" | "login" | "share" | "members" | "language" | null;
type Save = "idle" | "saving" | "saved" | "error";

async function send(url: string, method: string, body?: unknown) {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || "Có lỗi xảy ra, vui lòng thử lại."), { status: res.status });
  return data;
}

function Card({ title, icon, section, data, onShow, open, onToggle, children, note }: {
  title: string; icon: string; section?: SectionKey; data: InviteData; onShow: (k: SectionKey, v: boolean) => void;
  open: boolean; onToggle: () => void; children: ReactNode; note?: string;
}) {
  const shown = section ? data.show[section] : true;
  return (
    <section className={`ie-card ${open ? "open" : ""} ${shown ? "" : "off"}`}>
      <header>
        <button type="button" className="ie-card-head" onClick={onToggle} aria-expanded={open}>
          <svg className="ie-chev" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
          <span className="ie-card-icon" aria-hidden="true">{icon}</span>
          <b>{title}</b>
          {note && <small>{note}</small>}
        </button>
        {section && (
          <label className="ie-show" title={shown ? "Đang hiện trên thiệp" : "Đang ẩn"}>
            <span>{shown ? "Hiện" : "Ẩn"}</span>
            <input type="checkbox" checked={shown} onChange={(e) => onShow(section, e.target.checked)} />
            <i aria-hidden="true" />
          </label>
        )}
      </header>
      {open && <div className="ie-card-body">{children}</div>}
    </section>
  );
}

export default function InviteEditor({ initial, invite: initialInvite, user, autoPublish }: Props) {
  const [data, setData] = useState<InviteData>(initial);
  const [invite, setInvite] = useState<EditorInvite | null>(initialInvite ?? null);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [open, setOpen] = useState<Record<string, boolean>>({ basic: true });
  const [save, setSave] = useState<Save>(initialInvite ? "saved" : "idle");
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ m: string; err?: boolean } | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [slug, setSlug] = useState(initialInvite?.slug ?? "");
  const [slugMsg, setSlugMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [members, setMembers] = useState<{ id: string; email: string; joined: boolean }[] | null>(null);
  const [memberEmail, setMemberEmail] = useState("");
  const [menu, setMenu] = useState(false);
  const firstRun = useRef(true);
  const saving = useRef<Promise<unknown> | null>(null);
  const pending = useRef(false);
  const flushRef = useRef<() => Promise<void>>(async () => {});
  const dataRef = useRef(data);
  const inviteRef = useRef(invite);
  useEffect(() => {
    dataRef.current = data;
    inviteRef.current = invite;
  });

  const onError = useCallback((m: string) => setToast({ m, err: true }), []);
  const notify = useCallback((m: string) => setToast({ m }), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.err ? 6000 : 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const update = useCallback((patch: Partial<InviteData>) => setData((d) => ({ ...d, ...patch })), []);
  const setShow = (k: SectionKey, v: boolean) => update({ show: { ...data.show, [k]: v }, ...(k === "rsvp" ? { rsvp: { ...data.rsvp, enabled: v } } : {}) });
  const setFamily = (which: "groomFamily" | "brideFamily", patch: Partial<Family>) => update({ [which]: { ...data[which], ...patch } });
  const setBank = (who: "groom" | "bride", v: BankInfo) => update({ gift: { ...data.gift, [who]: v } });
  const toggle = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  // ── autosave: the first change creates the draft, later ones update it (one request at a time) ──
  const flush = useCallback(async () => {
    if (saving.current) {
      pending.current = true;
      return;
    }
    setSave("saving");
    const run = (async () => {
      const cur = inviteRef.current;
      if (!cur) {
        const r = await send("/api/invites", "POST", { data: dataRef.current });
        const created: EditorInvite = { id: r.id, slug: r.slug, status: "draft", published: true, role: user ? "owner" : "token" };
        inviteRef.current = created;
        setInvite(created);
        setSlug(r.slug);
        window.history.replaceState(null, "", `${BASE}/sua/${r.id}`);
      } else {
        await send(`/api/invites/${cur.id}`, "PUT", { data: dataRef.current });
      }
    })();
    saving.current = run;
    try {
      await run;
      setSave("saved");
    } catch (e) {
      setSave("error");
      onError((e as Error).message);
    } finally {
      saving.current = null;
      if (pending.current) {
        pending.current = false;
        void flushRef.current();
      }
    }
  }, [onError, user]);
  useEffect(() => {
    flushRef.current = flush;
  }, [flush]);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const t = setTimeout(() => void flush(), 900);
    return () => clearTimeout(t);
  }, [data, flush]);

  useEffect(() => {
    if (save !== "saving") return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [save]);

  // ── publish / share ──
  const ensureSaved = async () => {
    if (!inviteRef.current || save !== "saved") await flush();
    while (saving.current) await saving.current.catch(() => {});
    return inviteRef.current;
  };

  const openPublish = useCallback(async () => {
    if (!data.groomName.trim() || !data.brideName.trim()) {
      setOpen((o) => ({ ...o, basic: true }));
      setMode("edit");
      onError("Hãy nhập tên cô dâu và chú rể trước khi xuất bản.");
      return;
    }
    const inv = await ensureSaved();
    if (!inv) return;
    if (!user) return setDialog("login");
    if (!slug) setSlug(inv.slug);
    setDialog("publish");
    // ensureSaved reads the latest state through refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.groomName, data.brideName, user, slug, onError]);

  useEffect(() => {
    if (autoPublish && user) {
      const t = setTimeout(() => void openPublish(), 300);
      return () => clearTimeout(t);
    }
    // Only once, when arriving back from the login page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (dialog !== "publish" || !slug) return;
    let alive = true;
    const t = setTimeout(async () => {
      try {
        const r = await send(`/api/invites/slug?slug=${encodeURIComponent(slug)}${invite ? `&id=${invite.id}` : ""}`, "GET");
        if (alive) setSlugMsg({ ok: r.available, text: r.available ? "Có thể dùng đường dẫn này." : r.reason });
      } catch {}
    }, 350);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [slug, dialog, invite]);

  const publish = async () => {
    if (!invite) return;
    setBusy("Đang xuất bản…");
    try {
      const r = await send(`/api/invites/${invite.id}/publish`, "POST", { slug });
      setInvite({ ...invite, slug: r.slug, status: "published", published: true, role: invite.role === "token" ? "owner" : invite.role });
      setDialog("share");
    } catch (e) {
      if ((e as { status?: number }).status === 401) setDialog("login");
      else onError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const setVisible = async (published: boolean) => {
    if (!invite) return;
    try {
      await send(`/api/invites/${invite.id}`, "PUT", { published });
      setInvite({ ...invite, published });
      notify(published ? "Thiệp đã hiển thị trở lại." : "Đã tạm ẩn thiệp.");
    } catch (e) {
      onError((e as Error).message);
    }
  };

  const loadMembers = useCallback(async () => {
    if (!invite || !user) return;
    try {
      const r = await send(`/api/invites/${invite.id}/members`, "GET");
      setMembers(r.members);
    } catch (e) {
      onError((e as Error).message);
    }
  }, [invite, user, onError]);

  const memberAction = async (body: unknown) => {
    if (!invite) return;
    try {
      const r = await send(`/api/invites/${invite.id}/members`, "POST", body);
      setMembers(r.members);
      setMemberEmail("");
    } catch (e) {
      onError((e as Error).message);
    }
  };

  const shareUrl = invite ? `${typeof window !== "undefined" ? window.location.origin : ""}/thiep/${invite.slug}` : "";
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify("Đã sao chép link.");
    } catch {
      onError("Không sao chép được, hãy bôi đen và sao chép thủ công.");
    }
  };

  const busyProps = { setBusy, onError };
  const swatch = variantSwatch(data.theme, data.color);
  const published = invite?.status === "published";
  const card = (k: string) => ({ open: Boolean(open[k]), onToggle: () => toggle(k), data, onShow: setShow });
  const saveLabel = busy ?? { idle: "", saving: "Đang lưu…", saved: "Đã lưu", error: "Lưu lỗi" }[save];

  return (
    <div className="ie">
      <header className="ie-top">
        <Link className="ce-icon-btn" href={user ? `${BASE}/quan-ly` : BASE} aria-label="Quay lại">
          <I name="back" />
        </Link>
        <button type="button" className="ie-theme-btn" onClick={() => setDialog("theme")} title="Đổi mẫu thiệp">
          <span className="ie-swatch" aria-hidden="true">
            {swatch.map((c, i) => (
              <i key={i} style={{ background: c }} />
            ))}
          </span>
          <span className="hide-sm">{templateName(data.theme, data.color)}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        <div className="ie-menu-wrap">
          <button type="button" className="ce-icon-btn" onClick={() => setMenu(!menu)} aria-label="Cài đặt" aria-expanded={menu}>
            <I name="sliders" />
          </button>
          {menu && (
            <div className="ie-menu" role="menu" onMouseLeave={() => setMenu(false)}>
              <button type="button" role="menuitem" onClick={() => { setMenu(false); setDialog("language"); }}>
                <b>Ngôn ngữ thiệp</b>
                <small>{data.lang === "vi-en" ? "Tiếng Việt + English" : "Tiếng Việt"}</small>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenu(false);
                  if (!user) return setDialog("login");
                  setDialog("members");
                  void loadMembers();
                }}
              >
                <b>Thành viên</b>
                <small>Mời người khác cùng chỉnh sửa thiệp</small>
              </button>
            </div>
          )}
        </div>

        <div className="ie-mode" role="tablist">
          <button type="button" role="tab" aria-selected={mode === "edit"} className={mode === "edit" ? "on" : ""} onClick={() => setMode("edit")}>
            <I name="text" size={15} /> <span>Chỉnh sửa</span>
          </button>
          <button type="button" role="tab" aria-selected={mode === "preview"} className={mode === "preview" ? "on" : ""} onClick={() => setMode("preview")}>
            <I name="image" size={15} /> <span>Xem trước</span>
          </button>
        </div>

        <span className={`ie-save ${save}`} aria-live="polite">
          {(save === "saving" || busy) && <I name="loader" size={13} className="spin" />}
          {saveLabel}
        </span>
        {invite && (
          <Link className="ce-btn hide-sm" href={`${BASE}/khach-moi/${invite.id}`}>
            Khách mời
          </Link>
        )}
        {published ? (
          <button type="button" className="ce-btn primary" onClick={() => setDialog("share")}>
            <I name="share" size={16} /> <span className="hide-xs">Chia sẻ</span>
          </button>
        ) : (
          <button type="button" className="ce-btn primary" onClick={openPublish} disabled={Boolean(busy)}>
            <I name="share" size={16} /> <span className="hide-xs">Xuất bản</span>
          </button>
        )}
      </header>

      {mode === "preview" ? (
        <div className="ie-preview">
          <div className={`ie-preview-frame ${inviteFontVars}`}>
            <Invitation data={data} preview />
          </div>
        </div>
      ) : (
        <main className="ie-form">
          {invite && published && !invite.published && (
            <div className="ib-note warn">
              Thiệp đang tạm ẩn. <button type="button" onClick={() => setVisible(true)}>Hiện lại</button>
            </div>
          )}
          {!user && (
            <div className="ie-hint">
              Bạn đang làm thiệp mà chưa đăng nhập. Mọi thay đổi được tự lưu trên thiết bị này; <Link href={`/dang-nhap?next=${encodeURIComponent(invite ? `${BASE}/sua/${invite.id}` : BASE)}`}>đăng nhập</Link> để quản lý thiệp ở mọi nơi.
            </div>
          )}

          <Card title="Thông tin cơ bản" icon="♡" {...card("basic")}>
            <div className="ib-grid2">
              <Text label="Họ tên chú rể" value={data.groomFullName} onChange={(v) => update({ groomFullName: v, groomName: data.groomName || v.split(" ").slice(-2).join(" ") })} placeholder="Trần Dũng Thành" max={80} />
              <Text label="Họ tên cô dâu" value={data.brideFullName} onChange={(v) => update({ brideFullName: v, brideName: data.brideName || v.split(" ").slice(-2).join(" ") })} placeholder="Ninh Thị Thuỳ Trang" max={80} />
              <Text label="Tên ngắn chú rể" value={data.groomName} onChange={(v) => update({ groomName: v })} placeholder="Dũng Thành" max={60} />
              <Text label="Tên ngắn cô dâu" value={data.brideName} onChange={(v) => update({ brideName: v })} placeholder="Thuỳ Trang" max={60} />
              <Text label="Danh xưng chú rể" value={data.groomTitle} onChange={(v) => update({ groomTitle: v })} placeholder="Trưởng nam" max={40} />
              <Text label="Danh xưng cô dâu" value={data.brideTitle} onChange={(v) => update({ brideTitle: v })} placeholder="Út nữ" max={40} />
            </div>
            <div className="ib-field">
              <span>Thứ tự hiển thị</span>
              <Segmented value={data.groomFirst ? "g" : "b"} onChange={(v) => update({ groomFirst: v === "g" })} options={[["g", "Nhà trai trước"], ["b", "Nhà gái trước"]]} />
            </div>
            <label className="ib-field">
              <span>Ngày cưới chính</span>
              <input type="date" value={data.date} onChange={(e) => update({ date: e.target.value })} />
              <small>Dùng cho “Save the date”, lịch tháng và đếm ngược. {lunarLabel(data.date)}</small>
            </label>
          </Card>

          <Card title="Ảnh đầu thiệp & ảnh nổi bật" icon="◩" {...card("photos")}>
            <ImageField label="Ảnh đầu thiệp" value={data.cover} onChange={(v) => update({ cover: v })} hint="Nên dùng ảnh dọc hoặc ảnh cặp đôi toàn thân. Đây cũng là ảnh khi gửi link." {...busyProps} />
            <ImageField label="Ảnh cô dâu chú rể" value={data.couplePhoto} onChange={(v) => update({ couplePhoto: v })} ratio="4 / 5" {...busyProps} />
            <div className="ib-grid3">
              {[0, 1, 2].map((i) => (
                <ImageField key={i} label={["Ảnh 1", "Ảnh 2", "Ảnh 3"][i]} value={data.highlights[i] ?? ""} onChange={(v) => update({ highlights: data.highlights.map((h, k) => (k === i ? v : h)) })} {...busyProps} />
              ))}
            </div>
          </Card>

          <Card title="Thư viện ảnh" icon="▦" section="gallery" note={`${data.gallery.length} ảnh`} {...card("gallery")}>
            <GalleryField value={data.gallery} onChange={(gallery) => update({ gallery })} {...busyProps} />
          </Card>

          <Card title="Thông tin gia đình" icon="⌂" section="families" {...card("families")}>
            {(["groomFamily", "brideFamily"] as const).map((k) => (
              <div key={k} className="ib-sub">
                <Text label="Tiêu đề" value={data[k].title} onChange={(v) => setFamily(k, { title: v })} max={40} />
                <Text label="Bố mẹ (mỗi người một dòng)" value={data[k].parents} onChange={(v) => setFamily(k, { parents: v })} multiline rows={2} max={300} placeholder={"Ông Nguyễn Văn Hùng\nBà Trần Thị Lan"} />
                <Text label="Địa chỉ" value={data[k].address} onChange={(v) => setFamily(k, { address: v })} max={300} />
              </div>
            ))}
          </Card>

          <Card title="Lời mời" icon="✉" section="invite" {...card("invite")}>
            <Text label="Câu thông báo" value={data.announcement} onChange={(v) => update({ announcement: v })} max={160} hint="Để trống nếu không muốn hiện." />
            <Text label="Dòng mời" value={data.inviteHeading} onChange={(v) => update({ inviteHeading: v })} max={80} />
            <Text label="Tên khách mặc định" value={data.defaultGuest} onChange={(v) => update({ defaultGuest: v })} max={60} hint="Hiện khi link không có tên khách. Link riêng từng khách tạo trong Quản lý khách mời." />
            <Text label="Dòng dưới tên khách" value={data.inviteLine} onChange={(v) => update({ inviteLine: v })} max={160} />
            <Text label="Câu trích dẫn" value={data.quote} onChange={(v) => update({ quote: v })} multiline rows={2} max={200} />
          </Card>

          <Card title="Lễ & tiệc cưới" icon="✦" section="events" note={`${data.events.length} sự kiện`} {...card("events")}>
            <EventsField value={data.events} onChange={(events) => update({ events })} mainDate={data.date} />
          </Card>

          <Card title="Lịch tháng & đếm ngược" icon="▤" section="calendar" {...card("calendar")}>
            <Toggle label="Đồng hồ đếm ngược" checked={data.show.countdown} onChange={(v) => setShow("countdown", v)} />
          </Card>

          <Card title="Lịch trình ngày cưới" icon="⏱" section="schedule" {...card("schedule")}>
            <Text label="Tiêu đề mục" value={data.schedule.title} onChange={(v) => update({ schedule: { ...data.schedule, title: v } })} max={80} />
            <ScheduleField value={data.schedule.items} onChange={(items) => update({ schedule: { ...data.schedule, items } })} />
          </Card>

          <Card title="Dress code" icon="◐" section="dressCode" {...card("dress")}>
            <Text label="Gợi ý trang phục" value={data.dressCode.note} onChange={(v) => update({ dressCode: { ...data.dressCode, note: v } })} max={200} />
            <div className="ib-field">
              <span>Màu chủ đạo</span>
              <ColorsField value={data.dressCode.colors} onChange={(colors) => update({ dressCode: { ...data.dressCode, colors } })} />
            </div>
          </Card>

          <Card title="Xác nhận tham dự (RSVP)" icon="✓" section="rsvp" {...card("rsvp")}>
            <div className="ib-field">
              <span>Kiểu hiển thị</span>
              <Segmented value={data.rsvp.mode} onChange={(mode) => update({ rsvp: { ...data.rsvp, mode } })} options={[["button", "Nút bấm (popup)"], ["inline", "Hiện trực tiếp"]]} />
            </div>
            <div className="ib-field">
              <span>Số người mỗi thiệp</span>
              <Segmented value={data.rsvp.limit ? "limit" : "free"} onChange={(v) => update({ rsvp: { ...data.rsvp, limit: v === "limit" ? 2 : null } })} options={[["free", "Khách tự chọn"], ["limit", "Giới hạn"]]} />
              {data.rsvp.limit !== null && (
                <input type="number" min={1} max={20} value={data.rsvp.limit} onChange={(e) => update({ rsvp: { ...data.rsvp, limit: Math.min(20, Math.max(1, Number(e.target.value) || 1)) } })} aria-label="Số người tối đa" />
              )}
            </div>
            <div className="ib-field">
              <span>Câu hỏi thêm cho khách mời</span>
              <QuestionsField value={data.rsvp.questions} onChange={(questions) => update({ rsvp: { ...data.rsvp, questions } })} />
            </div>
            {invite && (
              <Link className="ib-btn sm" href={`${BASE}/khach-moi/${invite.id}`}>
                Xem danh sách xác nhận →
              </Link>
            )}
          </Card>

          <Card title="Sổ lưu bút" icon="✎" section="guestbook" {...card("guestbook")}>
            {invite ? <WishesPanel inviteId={invite.id} onError={onError} /> : <p className="ib-muted">Lời chúc của khách hiện ở đây sau khi thiệp được lưu.</p>}
          </Card>

          <Card title="Hộp quà mừng" icon="❖" section="gift" {...card("gift")}>
            <Toggle label="Hiện thông tin mừng cưới" checked={data.gift.enabled} onChange={(v) => update({ gift: { ...data.gift, enabled: v } })} />
            {data.gift.enabled && (
              <>
                <BankField who="Chú rể" value={data.gift.groom} onChange={(v) => setBank("groom", v)} {...busyProps} />
                <BankField who="Cô dâu" value={data.gift.bride} onChange={(v) => setBank("bride", v)} {...busyProps} />
              </>
            )}
          </Card>

          <Card title="Lời cảm ơn" icon="❀" section="thanks" {...card("thanks")}>
            <Text label="Lời cảm ơn" value={data.thanks} onChange={(v) => update({ thanks: v })} multiline rows={4} max={600} />
            <ImageField label="Ảnh nền" value={data.thanksPhoto} onChange={(v) => update({ thanksPhoto: v })} hint="Bỏ trống sẽ dùng ảnh đầu thiệp." {...busyProps} />
          </Card>

          <Card title="Nhạc nền & phong bì" icon="♫" {...card("music")}>
            <MusicField value={data.music} onChange={(music) => update({ music })} {...busyProps} />
            <Toggle label="Màn hình phong bì “Mở thiệp”" checked={data.intro} onChange={(v) => update({ intro: v })} hint="Khách thấy phong bì có tên mình trước khi mở thiệp; nhạc phát ngay khi mở." />
            <Toggle label="Hiệu ứng rơi (hoa, tim, tuyết)" checked={data.petals} onChange={(v) => update({ petals: v })} />
          </Card>
        </main>
      )}

      {toast && (
        <div className={`ce-toast ${toast.err ? "err" : "ok"}`} role={toast.err ? "alert" : "status"}>
          <I name={toast.err ? "x" : "check"} size={16} /> {toast.m}
        </div>
      )}

      {dialog === "theme" && (
        <Modal title="Đổi mẫu thiệp" onClose={() => setDialog(null)} wide>
          <p>Chọn bố cục, rồi bấm chấm màu để đổi bảng màu. Nội dung đã nhập được giữ nguyên.</p>
          <div className="ie-themes">
            {INVITE_THEMES.map((t) => {
              const on = t.id === data.theme;
              const current = on ? themeVariant(t.id, data.color).id : t.variants[0].id;
              return (
                <div key={t.id} className={`ie-theme ${on ? "on" : ""}`}>
                  <button type="button" onClick={() => { update({ theme: t.id, color: on ? data.color : "" }); setDialog(null); }}>
                    <span className="ie-theme-sw">
                      {variantSwatch(t.id, on ? data.color : "").map((c, i) => (
                        <i key={i} style={{ background: c }} />
                      ))}
                    </span>
                    <b>{t.name}</b>
                    <small>{t.note}</small>
                  </button>
                  <div className="ie-variants" role="radiogroup" aria-label={`Màu của mẫu ${t.name}`}>
                    {t.variants.map((v, i) => (
                      <button
                        key={v.id}
                        type="button"
                        role="radio"
                        aria-checked={on && current === v.id}
                        className={on && current === v.id ? "on" : ""}
                        title={v.name}
                        aria-label={v.name}
                        style={{ background: v.c2 ? `linear-gradient(135deg, ${v.c1} 50%, ${v.c2} 50%)` : v.c1 }}
                        onClick={() => update({ theme: t.id, color: i ? v.id : "" })}
                      />
                    ))}
                  </div>
                  <a href={`/thiep/${demoSlug(t.id, current)}`} target="_blank" rel="noopener noreferrer">
                    Xem mẫu ↗
                  </a>
                </div>
              );
            })}
          </div>
        </Modal>
      )}

      {dialog === "login" && (
        <Modal title="Đăng nhập để tiếp tục" onClose={() => setDialog(null)}>
          <p>Đăng nhập (miễn phí, không cần mật khẩu) để xuất bản thiệp, quản lý khách mời và mời người cùng chỉnh sửa. Thiệp bạn đang làm sẽ được giữ nguyên.</p>
          <a className="ce-btn primary" href={`/dang-nhap?next=${encodeURIComponent(`${BASE}/sua/${invite?.id ?? ""}?publish=1`)}`}>
            Đăng nhập
          </a>
        </Modal>
      )}

      {dialog === "publish" && invite && (
        <Modal title="Xuất bản thiệp" onClose={() => setDialog(null)}>
          <p>Chọn đường dẫn cho thiệp. Bạn có thể đổi lại sau, nhưng link đã gửi khách sẽ thay đổi theo.</p>
          <label className="ib-field">
            <span>Link thiệp</span>
            <div className="ib-slug">
              <em>superlanding.vn/thiep/</em>
              <input type="text" value={slug} maxLength={40} onChange={(e) => setSlug(slugify(e.target.value).slice(0, 40))} />
            </div>
            {slugMsg && <small className={slugMsg.ok ? "ok" : "bad"}>{slugMsg.text}</small>}
          </label>
          <button type="button" className="ce-btn primary" onClick={publish} disabled={Boolean(busy) || slugMsg?.ok === false}>
            {busy ?? "Xuất bản ngay"}
          </button>
        </Modal>
      )}

      {dialog === "share" && invite && (
        <Modal title={published ? "Gửi thiệp cho khách mời" : "Chia sẻ thiệp"} onClose={() => setDialog(null)}>
          <p>Link chung cho mọi người:</p>
          <div className="ce-copy">
            <input type="text" readOnly value={shareUrl} onFocus={(e) => e.currentTarget.select()} aria-label="Link thiệp" />
            <button type="button" className="ce-btn primary" onClick={() => copy(shareUrl)}>
              Sao chép
            </button>
          </div>
          <div className="ce-row wrap">
            {typeof navigator !== "undefined" && "share" in navigator && (
              <button type="button" className="ce-btn" onClick={() => navigator.share({ title: inviteTitle(data), url: shareUrl }).catch(() => {})}>
                <I name="share" size={16} /> Gửi qua Zalo, Messenger…
              </button>
            )}
            <a className="ce-btn" href={shareUrl} target="_blank" rel="noopener noreferrer">
              <I name="link" size={16} /> Mở thiệp
            </a>
          </div>
          <QuickGuestLink base={shareUrl} onCopy={copy} />
          <div className="ie-tip">
            <b>Gửi thiệp có tên từng khách?</b>
            <span>Thêm khách hoặc tải file Excel danh sách trong trang Quản lý khách mời: mỗi người có link riêng, lời chào riêng và bạn biết ai đã xác nhận.</span>
            <Link className="ce-btn sm primary" href={`${BASE}/khach-moi/${invite.id}`}>
              Quản lý khách mời
            </Link>
          </div>
          <div className="ce-row between">
            <span className="ce-hint">{invite.published ? "Thiệp đang hiển thị." : "Thiệp đang tạm ẩn."}</span>
            <button type="button" className="ce-btn ghost" onClick={() => setVisible(!invite.published)}>
              {invite.published ? "Tạm ẩn thiệp" : "Hiện lại thiệp"}
            </button>
          </div>
        </Modal>
      )}

      {dialog === "members" && (
        <Modal title="Thành viên" onClose={() => setDialog(null)}>
          <p>Người được mời đăng nhập bằng email này sẽ chỉnh sửa được thiệp và quản lý khách mời cùng bạn.</p>
          {invite?.role === "owner" && (
            <form className="ce-copy" onSubmit={(e) => { e.preventDefault(); void memberAction({ email: memberEmail }); }}>
              <input type="email" required placeholder="email@vidu.com" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} aria-label="Email thành viên" />
              <button type="submit" className="ce-btn primary">
                Mời
              </button>
            </form>
          )}
          {!invite && <p className="ce-hint">Hãy nhập vài thông tin để thiệp được lưu trước.</p>}
          <ul className="ie-members">
            {user && <li><b>{user.email}</b><small>{invite?.role === "owner" ? "Chủ thiệp" : "Bạn"}</small></li>}
            {(members ?? []).map((m) => (
              <li key={m.id}>
                <b>{m.email}</b>
                <small>{m.joined ? "Đã tham gia" : "Chờ đăng nhập"}</small>
                {invite?.role === "owner" && (
                  <button type="button" className="ce-btn sm ghost danger" onClick={() => void memberAction({ remove: m.id })}>
                    Gỡ
                  </button>
                )}
              </li>
            ))}
          </ul>
        </Modal>
      )}

      {dialog === "language" && (
        <Modal title="Ngôn ngữ thiệp" onClose={() => setDialog(null)} wide>
          <Segmented value={data.lang} onChange={(lang) => update({ lang })} options={[["vi", "Tiếng Việt"], ["vi-en", "Tiếng Việt + English"]]} />
          {data.lang === "vi-en" ? (
            <div className="ie-lang">
              <p className="ce-hint">Các nhãn cố định (Chỉ đường, Xác nhận tham dự…) tự có tiếng Anh. Nhập bản tiếng Anh cho nội dung của bạn:</p>
              {(
                [
                  ["announcement", "Câu thông báo"],
                  ["inviteHeading", "Dòng mời"],
                  ["inviteLine", "Dòng dưới tên khách"],
                  ["quote", "Câu trích dẫn"],
                  ["thanks", "Lời cảm ơn"],
                  ["groomFamily", "Tiêu đề nhà trai"],
                  ["brideFamily", "Tiêu đề nhà gái"],
                ] as const
              ).map(([k, label]) => (
                <Text key={k} label={`${label} (English)`} value={data.en[k]} onChange={(v) => update({ en: { ...data.en, [k]: v } })} multiline={k === "thanks"} max={k === "thanks" ? 600 : 160} />
              ))}
            </div>
          ) : (
            <p className="ce-hint">Bật song ngữ khi bạn có khách nước ngoài hoặc Việt kiều: thiệp hiện tiếng Anh ngay dưới tiếng Việt.</p>
          )}
        </Modal>
      )}
    </div>
  );
}

/** "Link có tên khách": the shared link plus ?khach=<tên>, so the card greets that person instead of "Quý khách". */
function QuickGuestLink({ base, onCopy }: { base: string; onCopy: (text: string) => void }) {
  const [guest, setGuest] = useState("");
  const name = guest.replace(/\s+/g, " ").trim();
  const url = name ? `${base}?khach=${encodeURIComponent(name)}` : "";
  return (
    <div className="ie-quick">
      <label htmlFor="ie-quick-name">Link có tên khách (thay chữ “Quý khách” trên thiệp):</label>
      <div className="ce-copy">
        <input id="ie-quick-name" type="text" maxLength={60} value={guest} onChange={(e) => setGuest(e.target.value)} placeholder="VD: Anh Trọng" />
        <button type="button" className="ce-btn" disabled={!url} onClick={() => onCopy(url)}>
          Sao chép link
        </button>
      </div>
      {url && <small className="ie-quick-url">{decodeURIComponent(url)}</small>}
    </div>
  );
}
