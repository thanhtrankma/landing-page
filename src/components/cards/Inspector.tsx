"use client";

import { useState } from "react";
import { ActiveSelection, Circle, Rect, Textbox, type FabricImage, type FabricObject } from "fabric";
import { CARD_FONTS, HINT_PREFIX, PHOTO_ROLES, TEXT_ROLES } from "@/lib/cards/types";
import { useEditor } from "./context";
import {
  align,
  arrange,
  assignRole,
  clearPhoto,
  duplicate,
  fillPhoto,
  isImage,
  isPhoto,
  isPhotoFrame,
  isText,
  normalizeText,
  roleOf,
  setLocked,
  SOFT_SHADOW,
  type Obj,
} from "./fabric-kit";
import { ensureFonts } from "./fonts";
import { ColorField, Field, FilePick, I, Range, type EIcon } from "./ui";

// Properties of the current selection. Desktop: right column. Mobile: bottom sheet.

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";
const hexOf = (v: unknown, fallback = "#000000") => (typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v) ? v : fallback);

export default function Inspector({ onClose }: { onClose?: () => void }) {
  const api = useEditor();
  const { canvas, commit, refresh } = api;
  const c = canvas();
  const active = c?.getActiveObject();
  if (!c || !active) {
    return (
      <div className="ce-inspector-empty">
        <I name="sliders" size={22} />
        <p>Bấm vào chữ, ảnh hoặc hình trên thiệp để chỉnh sửa.</p>
      </div>
    );
  }

  const remove = () => {
    const objs = c.getActiveObjects();
    c.discardActiveObject();
    for (const o of objs) {
      c.remove(o);
      for (const h of c.getObjects().filter((x) => roleOf(x) === `${HINT_PREFIX}${roleOf(o)}`)) c.remove(h);
    }
    c.requestRenderAll();
    commit();
    onClose?.();
  };

  if (active instanceof ActiveSelection) {
    const objs = active.getObjects();
    const doAlign = (how: Parameters<typeof align>[2]) => {
      c.discardActiveObject();
      align(c, objs, how, api.size);
      c.setActiveObject(new ActiveSelection(objs, { canvas: c }));
      c.requestRenderAll();
      commit();
    };
    return (
      <div className="ce-inspector-body">
        <Head title={`${objs.length} đối tượng`} onClose={onClose} />
        <AlignRow onAlign={doAlign} />
        <button type="button" className="ce-btn danger block" onClick={remove}>
          <I name="trash" size={16} /> Xoá các đối tượng đã chọn
        </button>
      </div>
    );
  }

  const o = active as Obj;
  const set = (props: Record<string, unknown>) => {
    o.set(props);
    o.setCoords();
    c.requestRenderAll();
    refresh();
  };
  const setNow = (props: Record<string, unknown>) => {
    set(props);
    commit();
  };
  const kind = isText(o) ? "Chữ" : isPhoto(o) ? "Ảnh trong khung" : isImage(o) ? "Ảnh" : isPhotoFrame(o) ? "Khung ảnh (trống)" : "Hình";

  return (
    <div className="ce-inspector-body">
      <Head title={kind} onClose={onClose}>
        <button type="button" className="ce-icon-btn" title="Nhân bản (Ctrl+D)" onClick={() => api.run("", async () => { await duplicate(c, o); commit(); })}>
          <I name="copy" />
        </button>
        <button
          type="button"
          className={`ce-icon-btn ${o.locked ? "on" : ""}`}
          title={o.locked ? "Mở khoá" : "Khoá vị trí"}
          onClick={() => {
            setLocked(o, !o.locked);
            c.requestRenderAll();
            refresh();
            commit();
          }}
        >
          <I name={o.locked ? "lock" : "unlock"} />
        </button>
        <button type="button" className="ce-icon-btn danger" title="Xoá (Delete)" onClick={remove}>
          <I name="trash" />
        </button>
      </Head>

      {isText(o) && <TextProps t={o} set={set} setNow={setNow} />}
      {isImage(o) && <ImageProps img={o as FabricImage} setNow={setNow} />}
      {isPhotoFrame(o) && (
        <FilePick
          accept={IMAGE_ACCEPT}
          className="ce-btn primary block"
          onFiles={(files) =>
            api.run("Đang tải ảnh lên…", async () => {
              const [url] = await api.upload(files.slice(0, 1));
              if (url) {
                await fillPhoto(c, o, url);
                commit();
              }
            })
          }
        >
          <I name="image" size={16} /> Thêm ảnh vào khung
        </FilePick>
      )}
      {!isText(o) && !isImage(o) && <ShapeProps o={o} set={set} setNow={setNow} />}

      {api.mode === "template" && <RoleField o={o} />}

      <Range label="Độ mờ" value={Math.round((o.opacity ?? 1) * 100)} min={10} max={100} onChange={(v) => set({ opacity: v / 100 })} onCommit={commit} format={(v) => `${v}%`} />
      <Range label="Xoay" value={Math.round(o.angle ?? 0)} min={-180} max={180} onChange={(v) => { o.rotate(v); o.setCoords(); c.requestRenderAll(); refresh(); }} onCommit={commit} format={(v) => `${v}°`} />
      {!isText(o) && (
        <Range
          label="Kích thước"
          value={Math.round((o.scaleX ?? 1) * 100)}
          min={5}
          max={400}
          onChange={(v) => {
            const ratio = (o.scaleY ?? 1) / (o.scaleX ?? 1);
            set({ scaleX: v / 100, scaleY: (v / 100) * ratio });
          }}
          onCommit={commit}
          format={(v) => `${v}%`}
        />
      )}

      <div className="ce-field">
        <span className="ce-label">Lớp</span>
        <div className="ce-btn-group">
          {([["toFront", "front", "Lên trên cùng"], ["up", "forward", "Lên một lớp"], ["down", "backward", "Xuống một lớp"], ["toBack", "back", "Xuống dưới cùng"]] as const).map(([icon, how, label]) => (
            <button key={how} type="button" className="ce-icon-btn" title={label} aria-label={label} onClick={() => { arrange(c, o, how); refresh(); commit(); }}>
              <I name={icon} />
            </button>
          ))}
        </div>
      </div>
      <AlignRow onAlign={(how) => { align(c, [o], how, api.size); refresh(); commit(); }} label="Căn theo thiệp" />
    </div>
  );
}

function Head({ title, onClose, children }: { title: string; onClose?: () => void; children?: React.ReactNode }) {
  return (
    <div className="ce-inspector-head">
      <h3>{title}</h3>
      <div className="ce-btn-group">
        {children}
        {onClose && (
          <button type="button" className="ce-icon-btn ce-sheet-close" onClick={onClose} aria-label="Đóng">
            <I name="x" />
          </button>
        )}
      </div>
    </div>
  );
}

function AlignRow({ onAlign, label = "Căn chỉnh" }: { onAlign: (how: "left" | "hcenter" | "right" | "top" | "vcenter" | "bottom") => void; label?: string }) {
  const items: [EIcon, Parameters<typeof onAlign>[0], string][] = [
    ["alignLeft", "left", "Căn trái"],
    ["alignHCenter", "hcenter", "Căn giữa ngang"],
    ["alignRight", "right", "Căn phải"],
    ["alignTop", "top", "Căn trên"],
    ["alignVCenter", "vcenter", "Căn giữa dọc"],
    ["alignBottom", "bottom", "Căn dưới"],
  ];
  return (
    <div className="ce-field">
      <span className="ce-label">{label}</span>
      <div className="ce-btn-group">
        {items.map(([icon, how, t]) => (
          <button key={how} type="button" className="ce-icon-btn" title={t} aria-label={t} onClick={() => onAlign(how)}>
            <I name={icon} />
          </button>
        ))}
      </div>
    </div>
  );
}

type SetFns = { set: (p: Record<string, unknown>) => void; setNow: (p: Record<string, unknown>) => void };

function TextProps({ t, set, setNow }: { t: Textbox } & SetFns) {
  const { canvas, commit, run } = useEditor();
  const [fontsOpen, setFontsOpen] = useState(false);
  const weight = String(t.fontWeight ?? "normal");
  const bold = weight === "bold" || Number(weight) >= 600;

  const changeFont = (props: Record<string, unknown>) =>
    run("", async () => {
      await ensureFonts([{ fontFamily: props.fontFamily ?? t.fontFamily, fontWeight: props.fontWeight ?? t.fontWeight, fontStyle: props.fontStyle ?? t.fontStyle }]);
      t.set(props);
      t.initDimensions();
      t.setCoords();
      canvas()?.requestRenderAll();
      commit();
    });

  return (
    <>
      <Field label="Nội dung">
        <textarea
          rows={Math.min(5, (t.text ?? "").split("\n").length + 1)}
          value={t.text ?? ""}
          onChange={(e) => set({ text: e.target.value })}
          onBlur={() => setNow({ text: normalizeText(t.text ?? "") })}
        />
      </Field>
      <div className="ce-field">
        <span className="ce-label">Font chữ</span>
        <button type="button" className="ce-font-current" onClick={() => setFontsOpen(!fontsOpen)} aria-expanded={fontsOpen} style={{ fontFamily: t.fontFamily }}>
          {t.fontFamily}
          <I name="down" size={14} />
        </button>
        {fontsOpen && (
          <div className="ce-font-list">
            {CARD_FONTS.map((f) => (
              <button
                key={f.family}
                type="button"
                className={f.family === t.fontFamily ? "on" : ""}
                style={{ fontFamily: f.family }}
                onClick={() => {
                  setFontsOpen(false);
                  changeFont({ fontFamily: f.family });
                }}
              >
                {f.label} <small>Thiệp cưới Đẹp</small>
              </button>
            ))}
          </div>
        )}
      </div>
      <Range label="Cỡ chữ" value={Math.round(t.fontSize ?? 30)} min={10} max={260} onChange={(v) => set({ fontSize: v })} onCommit={commit} />
      <ColorField label="Màu chữ" value={hexOf(t.fill, "#333333")} onChange={(v) => set({ fill: v })} onCommit={commit} />
      <div className="ce-field">
        <span className="ce-label">Kiểu chữ & căn lề</span>
        <div className="ce-btn-group">
          <button type="button" className={`ce-icon-btn txt ${bold ? "on" : ""}`} title="Đậm" onClick={() => changeFont({ fontWeight: bold ? "normal" : "700" })}>
            <b>B</b>
          </button>
          <button type="button" className={`ce-icon-btn txt ${t.fontStyle === "italic" ? "on" : ""}`} title="Nghiêng" onClick={() => changeFont({ fontStyle: t.fontStyle === "italic" ? "normal" : "italic" })}>
            <i>I</i>
          </button>
          <button type="button" className={`ce-icon-btn txt ${t.underline ? "on" : ""}`} title="Gạch chân" onClick={() => setNow({ underline: !t.underline })}>
            <u>U</u>
          </button>
          <span className="ce-sep" />
          {(["left", "center", "right"] as const).map((a) => (
            <button key={a} type="button" className={`ce-icon-btn ${t.textAlign === a ? "on" : ""}`} title={`Căn ${a === "left" ? "trái" : a === "center" ? "giữa" : "phải"}`} onClick={() => setNow({ textAlign: a })}>
              <I name={a === "left" ? "textLeft" : a === "center" ? "textCenter" : "textRight"} />
            </button>
          ))}
          <span className="ce-sep" />
          <button type="button" className="ce-icon-btn txt" title="Chữ in hoa" onClick={() => setNow({ text: (t.text ?? "").toLocaleUpperCase("vi") })}>
            AA
          </button>
        </div>
      </div>
      <Range label="Giãn chữ" value={t.charSpacing ?? 0} min={-100} max={800} step={10} onChange={(v) => set({ charSpacing: v })} onCommit={commit} />
      <Range label="Giãn dòng" value={t.lineHeight ?? 1.2} min={0.7} max={2.5} step={0.05} onChange={(v) => set({ lineHeight: v })} onCommit={commit} />
      <Range label="Độ rộng khung chữ" value={Math.round(t.width ?? 400)} min={60} max={3000} step={10} onChange={(v) => set({ width: v })} onCommit={commit} />
      <details className="ce-more">
        <summary>Hiệu ứng chữ</summary>
        <label className="ce-check">
          <input type="checkbox" checked={Boolean(t.shadow)} onChange={(e) => setNow({ shadow: e.target.checked ? SOFT_SHADOW() : null })} />
          <span>Đổ bóng</span>
        </label>
        <Range label="Viền chữ" value={t.stroke ? t.strokeWidth ?? 0 : 0} min={0} max={8} step={0.5} onChange={(v) => set({ stroke: v ? hexOf(t.stroke, "#ffffff") : null, strokeWidth: v, paintFirst: "stroke" })} onCommit={commit} />
        {Boolean(t.stroke) && <ColorField label="Màu viền" value={hexOf(t.stroke, "#ffffff")} onChange={(v) => set({ stroke: v })} onCommit={commit} />}
      </details>
    </>
  );
}

function ImageProps({ img, setNow }: { img: FabricImage; setNow: SetFns["setNow"] }) {
  const { canvas, commit, run, upload } = useEditor();
  const c = canvas()!;
  const inFrame = isPhoto(img);
  const clipShape = !inFrame && img.clipPath ? (img.clipPath instanceof Circle ? "circle" : "rounded") : "none";

  const replace = (files: File[]) =>
    run("Đang tải ảnh lên…", async () => {
      const [url] = await upload(files.slice(0, 1));
      if (!url) return;
      if (inFrame) await fillPhoto(c, img, url);
      else {
        const shown = img.getScaledWidth();
        await img.setSrc(url, { crossOrigin: "anonymous" });
        img.scale(shown / img.width);
        img.setCoords();
        c.requestRenderAll();
      }
      commit();
    });

  const setClip = (shape: "none" | "circle" | "rounded") => {
    const w = img.width, h = img.height, m = Math.min(w, h);
    const clipPath =
      shape === "circle" ? new Circle({ radius: m / 2, left: 0, top: 0 }) : shape === "rounded" ? new Rect({ width: w, height: h, rx: m * 0.08, ry: m * 0.08, left: 0, top: 0 }) : undefined;
    setNow({ clipPath });
  };

  return (
    <>
      <div className="ce-row">
        <FilePick accept={IMAGE_ACCEPT} className="ce-btn" onFiles={replace}>
          <I name="image" size={16} /> Đổi ảnh
        </FilePick>
        {inFrame && (
          <button type="button" className="ce-btn ghost" onClick={() => run("", async () => { await clearPhoto(c, img); commit(); })}>
            Gỡ ảnh
          </button>
        )}
      </div>
      {inFrame ? (
        <p className="ce-hint">Kéo ảnh để chỉnh phần hiển thị trong khung; dùng thanh “Kích thước” để phóng to.</p>
      ) : (
        <div className="ce-field">
          <span className="ce-label">Cắt khung</span>
          <div className="ce-btn-group">
            {(["none", "circle", "rounded"] as const).map((s) => (
              <button key={s} type="button" className={`ce-chip-btn ${clipShape === s ? "on" : ""}`} onClick={() => setClip(s)}>
                {s === "none" ? "Không" : s === "circle" ? "Tròn" : "Bo góc"}
              </button>
            ))}
          </div>
        </div>
      )}
      <button type="button" className="ce-btn ghost" onClick={() => setNow({ flipX: !img.flipX })}>
        <I name="flip" size={16} /> Lật ngang
      </button>
    </>
  );
}

function ShapeProps({ o, set, setNow }: { o: FabricObject } & SetFns) {
  const { commit } = useEditor();
  const gradient = o.fill && typeof o.fill === "object";
  const hasStroke = Boolean(o.stroke) && (o.strokeWidth ?? 0) > 0;
  return (
    <>
      {gradient ? (
        <div className="ce-field">
          <span className="ce-label">Màu nền</span>
          <button type="button" className="ce-btn ghost" onClick={() => setNow({ fill: "#b89257" })}>
            Đang dùng màu chuyển sắc. Đổi sang màu đơn
          </button>
        </div>
      ) : (
        <ColorField label="Màu nền" value={hexOf(o.fill, "#b89257")} onChange={(v) => set({ fill: v })} onCommit={commit} />
      )}
      <Range label="Viền" value={hasStroke ? o.strokeWidth ?? 0 : 0} min={0} max={20} step={0.5} onChange={(v) => set({ stroke: v ? hexOf(o.stroke, "#b89257") : null, strokeWidth: v })} onCommit={commit} />
      {hasStroke && <ColorField label="Màu viền" value={hexOf(o.stroke, "#b89257")} onChange={(v) => set({ stroke: v })} onCommit={commit} />}
      {o instanceof Rect && <Range label="Bo góc" value={o.rx ?? 0} min={0} max={Math.round(Math.min(o.width, o.height) / 2)} onChange={(v) => set({ rx: v, ry: v })} onCommit={commit} />}
    </>
  );
}

/** Template editor: tag text for “Điền nhanh”, or turn a shape into a photo frame. */
function RoleField({ o }: { o: Obj }) {
  const { canvas, commit, refresh } = useEditor();
  const c = canvas()!;
  const isTextObj = o instanceof Textbox;
  const options = isTextObj ? TEXT_ROLES.map((r) => [r.role, r.label]) : isImage(o) && !isPhoto(o) ? [] : PHOTO_ROLES.map((r) => [r.role, r.label]);
  if (!options.length) return null;
  return (
    <Field label="Vai trò (điền nhanh)" hint={isTextObj ? "Ô này sẽ hiện trong tab Điền nhanh." : "Biến hình này thành khung để khách thêm ảnh."}>
      <select
        value={o.role ?? ""}
        onChange={(e) => {
          assignRole(c, o, e.target.value || undefined);
          refresh();
          commit();
        }}
      >
        <option value="">— Không —</option>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </Field>
  );
}
