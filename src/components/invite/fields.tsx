"use client";

import { useState, type ReactNode } from "react";
import { MUSIC_PRESETS } from "@/data/invite-music";
import { lunarLabel } from "@/lib/invites/lunar";
import { LIMITS, newEvent, VIETQR_BANKS, vietQrUrl, type BankInfo, type InviteEvent, type RsvpQuestion, type ScheduleItem } from "@/lib/invites/types";
import { UploadError, uploadFile } from "@/lib/upload-client";

// Form controls for the invitation builder.

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";

export function Section({ id, title, hint, open, onToggle, children }: { id: string; title: string; hint?: string; open: boolean; onToggle: (id: string) => void; children: ReactNode }) {
  return (
    <section className={`ib-section ${open ? "open" : ""}`}>
      <button type="button" className="ib-section-head" onClick={() => onToggle(id)} aria-expanded={open}>
        <span>
          <b>{title}</b>
          {hint && <small>{hint}</small>}
        </span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && <div className="ib-section-body">{children}</div>}
    </section>
  );
}

export function Text({ label, value, onChange, placeholder, multiline, rows = 3, max = 160, hint }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean; rows?: number; max?: number; hint?: string;
}) {
  return (
    <label className="ib-field">
      <span>{label}</span>
      {multiline ? (
        <textarea value={value} rows={rows} maxLength={max} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type="text" value={value} maxLength={max} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="ib-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="ib-switch" aria-hidden="true" />
      <span>
        {label}
        {hint && <small>{hint}</small>}
      </span>
    </label>
  );
}

type Busy = { setBusy: (s: string | null) => void; onError: (m: string) => void };

async function uploadImages(files: File[], { setBusy, onError }: Busy) {
  const urls: string[] = [];
  try {
    for (const [i, f] of files.entries()) {
      const prefix = files.length > 1 ? `Đang tải ảnh ${i + 1}/${files.length}` : "Đang tải ảnh";
      const r = await uploadFile(f, "image", { onProgress: (p) => setBusy(`${prefix}… ${Math.round(p * 100)}%`) });
      urls.push(r.url);
    }
  } catch (e) {
    onError(e instanceof UploadError || e instanceof Error ? e.message : "Không tải được ảnh.");
  } finally {
    setBusy(null);
  }
  return urls;
}

function Pick({ accept, multiple, onFiles, children, className = "ib-btn sm" }: { accept: string; multiple?: boolean; onFiles: (f: File[]) => void; children: ReactNode; className?: string }) {
  return (
    <label className={className}>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = "";
          if (files.length) onFiles(files);
        }}
      />
      {children}
    </label>
  );
}

export function ImageField({ label, value, onChange, hint, ratio = "3 / 4", ...busy }: { label: string; value: string; onChange: (url: string) => void; hint?: string; ratio?: string } & Busy) {
  return (
    <div className="ib-field">
      <span>{label}</span>
      <div className="ib-image">
        <div className="ib-image-thumb" style={{ aspectRatio: ratio }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {value ? <img src={value} alt="" /> : <i>Chưa có ảnh</i>}
        </div>
        <div className="ib-image-actions">
          <Pick accept={IMAGE_ACCEPT} onFiles={async (f) => { const [url] = await uploadImages(f.slice(0, 1), busy); if (url) onChange(url); }}>
            {value ? "Đổi ảnh" : "Chọn ảnh"}
          </Pick>
          {value && (
            <button type="button" className="ib-btn sm ghost" onClick={() => onChange("")}>
              Gỡ ảnh
            </button>
          )}
          {hint && <small>{hint}</small>}
        </div>
      </div>
    </div>
  );
}

export function GalleryField({ value, onChange, ...busy }: { value: string[]; onChange: (v: string[]) => void } & Busy) {
  const room = LIMITS.gallery - value.length;
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="ib-field">
      <div className="ib-gallery">
        {value.map((url, i) => (
          <div key={url + i} className="ib-gallery-item">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Ảnh ${i + 1}`} />
            <div className="ib-gallery-tools">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Lên trước">‹</button>
              <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label="Xoá ảnh">×</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Ra sau">›</button>
            </div>
          </div>
        ))}
        {room > 0 && (
          <Pick accept={IMAGE_ACCEPT} multiple className="ib-gallery-add" onFiles={async (f) => onChange([...value, ...(await uploadImages(f.slice(0, room), busy))])}>
            <b>+</b>
            <span>Thêm ảnh</span>
          </Pick>
        )}
      </div>
      <small>
        {value.length}/{LIMITS.gallery} ảnh. Ảnh được nén tự động trước khi tải lên; ảnh đầu tiên và mỗi ảnh thứ 6 hiển thị khổ ngang.
      </small>
    </div>
  );
}

export function MusicField({ value, onChange, ...busy }: { value: { src: string; title: string }; onChange: (v: { src: string; title: string }) => void } & Busy) {
  const isPreset = MUSIC_PRESETS.some((m) => m.src === value.src);
  return (
    <div className="ib-field">
      {MUSIC_PRESETS.length > 0 && (
        <label className="ib-field">
          <span>Chọn nhạc có sẵn</span>
          <select value={isPreset ? value.src : ""} onChange={(e) => onChange(e.target.value ? { src: e.target.value, title: MUSIC_PRESETS.find((m) => m.src === e.target.value)!.title } : { src: "", title: "" })}>
            <option value="">— Không dùng —</option>
            {MUSIC_PRESETS.map((m) => (
              <option key={m.id} value={m.src}>
                {m.title}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="ib-row">
        <Pick
          accept="audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,.mp3,.m4a"
          onFiles={async ([f]) => {
            try {
              const r = await uploadFile(f, "audio", { onProgress: (p) => busy.setBusy(`Đang tải nhạc… ${Math.round(p * 100)}%`) });
              onChange({ src: r.url, title: f.name.replace(/\.(mp3|m4a)$/i, "") });
            } catch (e) {
              busy.onError((e as Error).message);
            } finally {
              busy.setBusy(null);
            }
          }}
        >
          {value.src && !isPreset ? "Đổi file nhạc" : "Tải nhạc lên (MP3)"}
        </Pick>
        {value.src && (
          <button type="button" className="ib-btn sm ghost" onClick={() => onChange({ src: "", title: "" })}>
            Bỏ nhạc
          </button>
        )}
      </div>
      {value.src && (
        <>
          <audio src={value.src} controls preload="none" className="ib-audio" />
          <Text label="Tên bài hát" value={value.title} onChange={(title) => onChange({ ...value, title })} max={80} />
        </>
      )}
      <small>Tối đa 10MB. Chỉ dùng nhạc bạn có quyền sử dụng. Nhạc phát khi khách bấm “Mở thiệp”.</small>
    </div>
  );
}

export function EventsField({ value, onChange, mainDate }: { value: InviteEvent[]; onChange: (v: InviteEvent[]) => void; mainDate: string }) {
  const [openId, setOpenId] = useState<string | null>(value[0]?.id ?? null);
  const update = (id: string, patch: Partial<InviteEvent>) => onChange(value.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="ib-events">
      {value.map((e, i) => (
        <div key={e.id} className={`ib-event ${openId === e.id ? "open" : ""}`}>
          <div className="ib-event-head">
            <button type="button" onClick={() => setOpenId(openId === e.id ? null : e.id)}>
              <b>{e.title || "Sự kiện"}</b>
              <small>
                {e.time} · {e.date.split("-").reverse().join("/")}
              </small>
            </button>
            <div className="ib-event-tools">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Lên trên">↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Xuống dưới">↓</button>
              <button type="button" onClick={() => onChange(value.filter((x) => x.id !== e.id))} aria-label="Xoá sự kiện">×</button>
            </div>
          </div>
          {openId === e.id && (
            <div className="ib-event-body">
              <Segmented
                value={e.kind}
                onChange={(kind) => update(e.id, { kind, showMap: kind === "party" ? true : e.showMap })}
                options={[
                  ["ceremony", "Lễ (tại nhà)"],
                  ["party", "Tiệc"],
                ]}
              />
              <Text label="Tên sự kiện" value={e.title} onChange={(title) => update(e.id, { title })} placeholder={e.kind === "ceremony" ? "Lễ vu quy / Lễ thành hôn" : "Tiệc mừng lễ cưới"} max={80} />
              <div className="ib-grid2">
                <label className="ib-field">
                  <span>Giờ</span>
                  <input type="time" value={e.time} onChange={(ev) => update(e.id, { time: ev.target.value })} />
                </label>
                <label className="ib-field">
                  <span>Ngày (dương lịch)</span>
                  <input type="date" value={e.date} onChange={(ev) => update(e.id, { date: ev.target.value, lunar: lunarLabel(ev.target.value) })} />
                </label>
              </div>
              <Text label="Ngày âm lịch" value={e.lunar} onChange={(lunar) => update(e.id, { lunar })} hint="Tự tính theo ngày dương lịch, bạn có thể sửa lại." max={80} />
              {e.kind === "party" && (
                <div className="ib-grid2">
                  <label className="ib-field">
                    <span>Giờ đón khách</span>
                    <input type="time" value={e.welcomeTime} onChange={(ev) => update(e.id, { welcomeTime: ev.target.value })} />
                  </label>
                  <label className="ib-field">
                    <span>Giờ khai tiệc</span>
                    <input type="time" value={e.startTime} onChange={(ev) => update(e.id, { startTime: ev.target.value })} />
                  </label>
                </div>
              )}
              <Text label="Địa điểm" value={e.venue} onChange={(venue) => update(e.id, { venue })} placeholder="Tư gia nhà gái / Nhà hàng…" max={160} />
              <Text label="Địa chỉ" value={e.address} onChange={(address) => update(e.id, { address })} multiline rows={2} max={300} />
              <Toggle label="Hiện bản đồ" checked={e.showMap} onChange={(showMap) => update(e.id, { showMap })} hint="Bản đồ tự hiển thị theo địa chỉ." />
              <Text label="Link Google Maps (không bắt buộc)" value={e.mapUrl} onChange={(mapUrl) => update(e.id, { mapUrl })} placeholder="https://maps.app.goo.gl/…" hint="Bỏ trống thì nút “Chỉ đường” tự tìm theo địa chỉ." max={600} />
            </div>
          )}
        </div>
      ))}
      {value.length < LIMITS.events && (
        <button
          type="button"
          className="ib-btn sm block"
          onClick={() => {
            const ev = { ...newEvent(mainDate, value.length ? "Lễ thành hôn" : "Tiệc cưới", value.length ? "ceremony" : "party"), lunar: lunarLabel(mainDate) };
            onChange([...value, ev]);
            setOpenId(ev.id);
          }}
        >
          + Thêm sự kiện
        </button>
      )}
    </div>
  );
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div className="ib-seg" role="radiogroup">
      {options.map(([v, label]) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} className={value === v ? "on" : ""} onClick={() => onChange(v)}>
          {label}
        </button>
      ))}
    </div>
  );
}

const rid = () => Math.random().toString(36).slice(2, 9);

export function QuestionsField({ value, onChange }: { value: RsvpQuestion[]; onChange: (v: RsvpQuestion[]) => void }) {
  const set = (i: number, patch: Partial<RsvpQuestion>) => onChange(value.map((q, k) => (k === i ? { ...q, ...patch } : q)));
  return (
    <div className="ib-list">
      {value.map((q, i) => (
        <div key={q.id} className="ib-sub">
          <div className="ib-row between">
            <b className="ib-sub-title">Câu hỏi {i + 1}</b>
            <button type="button" className="ib-btn sm ghost" onClick={() => onChange(value.filter((_, k) => k !== i))}>
              Xoá
            </button>
          </div>
          <Text label="Nội dung câu hỏi" value={q.label} onChange={(label) => set(i, { label })} placeholder="Bạn có ăn chay không?" max={120} />
          <Segmented value={q.type} onChange={(type) => set(i, { type })} options={[["choice", "Chọn đáp án"], ["text", "Tự trả lời"]]} />
          {q.type === "choice" && (
            <Text
              label="Các đáp án (cách nhau bằng dấu phẩy)"
              value={q.options.join(", ")}
              onChange={(v) => set(i, { options: v.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 8) })}
              placeholder="Có, Không"
              max={300}
            />
          )}
        </div>
      ))}
      {value.length < 6 && (
        <button type="button" className="ib-btn sm block" onClick={() => onChange([...value, { id: rid(), label: "", type: "choice", options: ["Có", "Không"] }])}>
          + Thêm câu hỏi
        </button>
      )}
    </div>
  );
}

export function ScheduleField({ value, onChange }: { value: ScheduleItem[]; onChange: (v: ScheduleItem[]) => void }) {
  const set = (i: number, patch: Partial<ScheduleItem>) => onChange(value.map((it, k) => (k === i ? { ...it, ...patch } : it)));
  return (
    <div className="ib-list">
      {value.map((it, i) => (
        <div key={i} className="ib-row ib-sched">
          <input type="time" value={it.time} onChange={(e) => set(i, { time: e.target.value })} aria-label="Giờ" />
          <input type="text" value={it.label} maxLength={100} onChange={(e) => set(i, { label: e.target.value })} placeholder="Đón khách" aria-label="Hoạt động" />
          <button type="button" className="ib-btn sm ghost" onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label="Xoá">
            ×
          </button>
        </div>
      ))}
      {value.length < 12 && (
        <button type="button" className="ib-btn sm block" onClick={() => onChange([...value, { time: "", label: "" }])}>
          + Thêm hoạt động
        </button>
      )}
    </div>
  );
}

export function ColorsField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="ib-row wrap">
      {value.map((c, i) => (
        <span key={i} className="ib-color">
          <input type="color" value={c} onChange={(e) => onChange(value.map((x, k) => (k === i ? e.target.value : x)))} aria-label={`Màu ${i + 1}`} />
          <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label="Bỏ màu">
            ×
          </button>
        </span>
      ))}
      {value.length < 6 && (
        <button type="button" className="ib-btn sm" onClick={() => onChange([...value, "#d9b5a0"])}>
          + Màu
        </button>
      )}
    </div>
  );
}

export function BankField({ who, value, onChange, ...busy }: { who: string; value: BankInfo; onChange: (v: BankInfo) => void } & Busy) {
  const set = (patch: Partial<BankInfo>) => onChange({ ...value, ...patch });
  const qr = value.qr || vietQrUrl(value);
  return (
    <div className="ib-sub">
      <b className="ib-sub-title">{who}</b>
      <label className="ib-field">
        <span>Ngân hàng</span>
        <select value={value.code} onChange={(e) => set({ code: e.target.value, bank: VIETQR_BANKS.find(([c]) => c === e.target.value)?.[1] ?? value.bank })}>
          <option value="">— Chọn ngân hàng —</option>
          {VIETQR_BANKS.map(([c, n]) => (
            <option key={c} value={c}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <div className="ib-grid2">
        <Text label="Số tài khoản" value={value.account} onChange={(account) => set({ account: account.replace(/[^\d\s]/g, "") })} max={40} />
        <Text label="Chủ tài khoản" value={value.holder} onChange={(holder) => set({ holder: holder.toUpperCase() })} max={80} />
      </div>
      {qr && (
        <div className="ib-qr">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="Mã QR" />
          <small>{value.qr ? "Đang dùng ảnh QR bạn tải lên." : "Mã QR được tạo tự động từ số tài khoản (VietQR)."}</small>
        </div>
      )}
      <ImageField label="Hoặc tải ảnh QR của bạn" value={value.qr} onChange={(q) => set({ qr: q })} ratio="1 / 1" {...busy} />
    </div>
  );
}
