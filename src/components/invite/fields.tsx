"use client";

import { useState, type ReactNode } from "react";
import { MUSIC_PRESETS } from "@/data/invite-music";
import { lunarLabel } from "@/lib/invites/lunar";
import { LIMITS, newEvent, type InviteEvent } from "@/lib/invites/types";
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
              <Text label="Tên sự kiện" value={e.title} onChange={(title) => update(e.id, { title })} placeholder="Tiệc mừng lễ cưới" max={80} />
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
              <Text label="Địa điểm" value={e.venue} onChange={(venue) => update(e.id, { venue })} placeholder="Tư gia nhà gái / Nhà hàng…" max={160} />
              <Text label="Địa chỉ" value={e.address} onChange={(address) => update(e.id, { address })} multiline rows={2} max={300} />
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
            const ev = { ...newEvent(mainDate, value.length ? "Lễ thành hôn" : "Tiệc cưới"), lunar: lunarLabel(mainDate) };
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
