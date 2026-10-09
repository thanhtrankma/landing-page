"use client";

import type { Textbox } from "fabric";
import { PHOTO_ROLES, TEMPLATE_TAGS, TEXT_ROLES } from "@/lib/cards/types";
import { slugify } from "@/lib/validate";
import { useEditor } from "./context";
import {
  addImage,
  addShape,
  addText,
  backgroundFill,
  fillPhoto,
  hasBackgroundImage,
  isPhoto,
  isPhotoFrame,
  isText,
  normalizeText,
  roleOf,
  setBackground,
  setBackgroundImage,
  type Fill,
  type ShapeKind,
  type TextPreset,
} from "./fabric-kit";
import { ColorField, Field, FilePick, I } from "./ui";

// Left-hand panels of the card editor. They read the live canvas on every render (driven by api.tick).

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";

export function QuickFillPanel() {
  const { canvas, commit, refresh, run, upload } = useEditor();
  const c = canvas();
  if (!c) return null;
  const objects = c.getObjects();
  const texts = TEXT_ROLES.map((r) => ({ ...r, objs: objects.filter((o) => roleOf(o) === r.role && isText(o)) as Textbox[] })).filter((r) => r.objs.length);
  const photos = PHOTO_ROLES.map((r) => ({ ...r, obj: objects.find((o) => roleOf(o) === r.role) })).filter((r) => r.obj);

  const setText = (objs: Textbox[], value: string) => {
    for (const o of objs) o.set({ text: value });
    c.requestRenderAll();
    refresh();
  };
  const tidy = (objs: Textbox[]) => {
    for (const o of objs) o.set({ text: normalizeText(o.text ?? "") });
    commit();
  };

  if (!texts.length && !photos.length) {
    return <p className="ce-empty">Mẫu này chưa có ô điền nhanh. Bấm trực tiếp vào chữ hoặc ảnh trên thiệp để chỉnh sửa.</p>;
  }
  return (
    <div className="ce-stack">
      <p className="ce-hint">Điền thông tin, thiệp cập nhật ngay. Muốn đổi font, màu, vị trí: bấm vào chữ trên thiệp.</p>
      {photos.map((p) => (
        <div className="ce-photo-row" key={p.role}>
          <div>
            <b>{p.label}</b>
            <span className="ce-hint">{isPhoto(p.obj) ? "Đã có ảnh, bấm để đổi" : "Chưa có ảnh"}</span>
          </div>
          <FilePick
            accept={IMAGE_ACCEPT}
            className="ce-btn sm"
            onFiles={(files) =>
              run("Đang tải ảnh lên…", async () => {
                const [url] = await upload(files.slice(0, 1));
                const target = c.getObjects().find((o) => roleOf(o) === p.role);
                if (url && target) {
                  await fillPhoto(c, target, url);
                  commit();
                }
              })
            }
          >
            <I name="image" size={16} /> {isPhoto(p.obj) ? "Đổi ảnh" : "Chọn ảnh"}
          </FilePick>
        </div>
      ))}
      {texts.map((t) => {
        const value = t.objs[0].text ?? "";
        const multiline = t.multiline || value.includes("\n");
        return (
          <Field key={t.role} label={t.label}>
            {multiline ? (
              <textarea rows={Math.min(4, value.split("\n").length + 1)} value={value} placeholder={t.placeholder} onChange={(e) => setText(t.objs, e.target.value)} onBlur={() => tidy(t.objs)} />
            ) : (
              <input type="text" value={value} placeholder={t.placeholder} onChange={(e) => setText(t.objs, e.target.value)} onBlur={() => tidy(t.objs)} />
            )}
          </Field>
        );
      })}
    </div>
  );
}

const TEXT_PRESETS: { preset: TextPreset; label: string; style: React.CSSProperties }[] = [
  { preset: "names", label: "Minh Anh & Thu Hà", style: { fontFamily: "Great Vibes", fontSize: 30 } },
  { preset: "heading", label: "Lễ Thành Hôn", style: { fontFamily: "Playfair Display", fontSize: 24, fontWeight: 700 } },
  { preset: "date", label: "12 . 12 . 2026", style: { fontFamily: "Cormorant Garamond", fontSize: 24, fontWeight: 600 } },
  { preset: "caps", label: "TRÂN TRỌNG KÍNH MỜI", style: { fontFamily: "Montserrat", fontSize: 12, letterSpacing: "0.3em" } },
  { preset: "body", label: "Đoạn văn bản", style: { fontFamily: "Be Vietnam Pro", fontSize: 16 } },
];

export function TextPanel() {
  const { canvas, size, commit, run } = useEditor();
  return (
    <div className="ce-stack">
      <p className="ce-hint">Bấm để thêm chữ vào giữa thiệp. Bấm đúp vào chữ trên thiệp để gõ trực tiếp.</p>
      {TEXT_PRESETS.map((t) => (
        <button
          key={t.preset}
          type="button"
          className="ce-preset"
          onClick={() =>
            run("", async () => {
              const c = canvas();
              if (!c) return;
              await addText(c, t.preset, size);
              commit();
            })
          }
        >
          <span style={t.style}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

export function ImagePanel() {
  const { canvas, size, commit, run, upload, library } = useEditor();
  const c = canvas();
  const active = c?.getActiveObject();
  const intoFrame = isPhotoFrame(active) || isPhoto(active);

  const use = (url: string, asBackground = false) =>
    run(asBackground ? "Đang đặt ảnh nền…" : "Đang chèn ảnh…", async () => {
      if (!c) return;
      if (asBackground) await setBackgroundImage(c, size, url);
      else if (intoFrame && active) await fillPhoto(c, active, url);
      else await addImage(c, url, size);
      commit();
    });

  return (
    <div className="ce-stack">
      <FilePick
        accept={IMAGE_ACCEPT}
        multiple
        className="ce-btn primary block"
        onFiles={(files) => run("Đang tải ảnh lên…", async () => void (await upload(files)))}
      >
        <I name="image" size={16} /> Tải ảnh lên
      </FilePick>
      <p className="ce-hint">
        {intoFrame ? "Đang chọn một khung ảnh: bấm vào ảnh bên dưới để đặt vào khung." : "Bấm vào ảnh để chèn. Chọn một khung ảnh trên thiệp trước nếu muốn đặt ảnh vào khung."}
        {" "}Ảnh được nén tự động trước khi tải lên.
      </p>
      {library.length ? (
        <div className="ce-library">
          {library.map((url) => (
            <div className="ce-lib-item" key={url}>
              <button type="button" onClick={() => use(url)} aria-label="Chèn ảnh này">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" crossOrigin="anonymous" loading="lazy" />
              </button>
              <button type="button" className="ce-lib-bg" onClick={() => use(url, true)}>
                Làm nền
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="ce-empty">Chưa có ảnh nào trong phiên làm việc này.</p>
      )}
    </div>
  );
}

const SHAPES: { kind: ShapeKind; label: string; svg: string }[] = [
  { kind: "heart", label: "Trái tim", svg: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" },
  { kind: "ring", label: "Vòng tròn", svg: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z" },
  { kind: "circle", label: "Hình tròn", svg: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z" },
  { kind: "rect", label: "Chữ nhật", svg: "M4 6h16v12H4z" },
  { kind: "rounded", label: "Bo góc", svg: "M8 6h8a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-4a4 4 0 0 1 4-4z" },
  { kind: "line", label: "Đường kẻ", svg: "M3 12h18" },
  { kind: "divider", label: "Gạch hoa văn", svg: "M2 12h7M15 12h7M12 9l3 3-3 3-3-3z" },
  { kind: "diamond", label: "Hình thoi", svg: "M12 3l9 9-9 9-9-9z" },
  { kind: "leaf", label: "Chiếc lá", svg: "M12 3c5 4 5 14 0 18-5-4-5-14 0-18z" },
  { kind: "songhy", label: "Chữ Song Hỷ", svg: "" },
];

export function DecorPanel() {
  const { canvas, size, commit, run } = useEditor();
  return (
    <div className="ce-stack">
      <div className="ce-shape-grid">
        {SHAPES.map((s) => (
          <button
            key={s.kind}
            type="button"
            className="ce-shape"
            title={s.label}
            onClick={() =>
              run("", async () => {
                const c = canvas();
                if (!c) return;
                await addShape(c, s.kind, size);
                commit();
              })
            }
          >
            {s.svg ? (
              <svg viewBox="0 0 24 24" width={30} height={30} aria-hidden="true">
                <path d={s.svg} fill={["line", "ring", "divider"].includes(s.kind) ? "none" : "currentColor"} stroke="currentColor" strokeWidth={["line", "ring", "divider"].includes(s.kind) ? 2 : 0} />
              </svg>
            ) : (
              <span className="ce-songhy">囍</span>
            )}
            <span>{s.label}</span>
          </button>
        ))}
      </div>
      <p className="ce-hint">Chọn hình trên thiệp để đổi màu, viền, độ mờ.</p>
    </div>
  );
}

const BG_PRESETS: Fill[] = [
  "#ffffff",
  "#fbf6ec",
  "#fdeef0",
  "#eef1ea",
  "#eef5fb",
  "#9e1b1e",
  "#14213d",
  "#2b2622",
  { from: "#fde9ec", to: "#fffaf8" },
  { from: "#fbf6ec", to: "#efe2c8" },
  { from: "#eef1ea", to: "#d6e0cf" },
  { from: "#e8f5fc", to: "#ffffff" },
  { from: "#14213d", to: "#2d4373", diagonal: true },
  { from: "#9e1b1e", to: "#5e0d10", diagonal: true },
];
const cssFill = (f: Fill) => (typeof f === "string" ? f : `linear-gradient(${f.diagonal ? "135deg" : "180deg"}, ${f.from}, ${f.to})`);

export function BackgroundPanel() {
  const { canvas, size, commit, run, upload } = useEditor();
  const c = canvas();
  if (!c) return null;
  const current = backgroundFill(c);
  const solid = typeof current === "string" ? current : "#ffffff";
  return (
    <div className="ce-stack">
      <div className="ce-field">
        <span className="ce-label">Màu & chuyển sắc</span>
        <div className="ce-bg-grid">
          {BG_PRESETS.map((f, i) => (
            <button
              key={i}
              type="button"
              className="ce-bg"
              style={{ background: cssFill(f) }}
              aria-label="Chọn nền"
              onClick={() => {
                setBackground(c, size, f);
                commit();
              }}
            />
          ))}
        </div>
      </div>
      <ColorField label="Màu tuỳ chọn" value={solid} onChange={(v) => setBackground(c, size, v)} onCommit={commit} />
      <div className="ce-field">
        <span className="ce-label">Ảnh nền</span>
        <div className="ce-row">
          <FilePick
            accept={IMAGE_ACCEPT}
            className="ce-btn"
            onFiles={(files) =>
              run("Đang tải ảnh nền…", async () => {
                const [url] = await upload(files.slice(0, 1));
                if (url) {
                  await setBackgroundImage(c, size, url);
                  commit();
                }
              })
            }
          >
            <I name="image" size={16} /> {hasBackgroundImage(c) ? "Đổi ảnh nền" : "Chọn ảnh nền"}
          </FilePick>
          {hasBackgroundImage(c) && (
            <button
              type="button"
              className="ce-btn ghost"
              onClick={() =>
                run("", async () => {
                  await setBackgroundImage(c, size, null);
                  commit();
                })
              }
            >
              Gỡ ảnh nền
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Template editor only: name, URL, tags and visibility. */
export function TemplatePanel() {
  const { template, setTemplate } = useEditor();
  if (!template || !setTemplate) return null;
  const set = (patch: Partial<typeof template>) => setTemplate({ ...template, ...patch });
  return (
    <div className="ce-stack">
      <Field label="Tên mẫu">
        <input type="text" value={template.name} onChange={(e) => set({ name: e.target.value })} />
      </Field>
      <Field label="Đường dẫn (slug)" hint={`/cong-cu/anh-thiep-cuoi/tao?mau=${template.slug}`}>
        <input type="text" value={template.slug} onChange={(e) => set({ slug: slugify(e.target.value) })} />
      </Field>
      <Field label="Thứ tự hiển thị" hint="Số nhỏ hiện trước.">
        <input type="number" value={template.sortOrder} onChange={(e) => set({ sortOrder: Number(e.target.value) || 0 })} />
      </Field>
      <div className="ce-field">
        <span className="ce-label">Nhóm</span>
        <div className="ce-chips">
          {TEMPLATE_TAGS.map(([id, label]) => (
            <label key={id} className={`ce-chip ${template.tags.includes(id) ? "on" : ""}`}>
              <input
                type="checkbox"
                checked={template.tags.includes(id)}
                onChange={(e) => set({ tags: e.target.checked ? [...template.tags, id] : template.tags.filter((t) => t !== id) })}
              />
              {label}
            </label>
          ))}
        </div>
      </div>
      <label className="ce-check">
        <input type="checkbox" checked={template.published} onChange={(e) => set({ published: e.target.checked })} />
        <span>Hiển thị trong kho mẫu công khai</span>
      </label>
      <p className="ce-hint">
        Gán vai trò cho chữ (tên cô dâu, ngày cưới…) và khung ảnh trong bảng thuộc tính bên phải để mẫu dùng được với “Điền nhanh”.
      </p>
    </div>
  );
}
