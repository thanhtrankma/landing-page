"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "fabric";
import { formatBySize, TEXT_ROLES, type CardJson } from "@/lib/cards/types";
import { UploadError, uploadBlob, uploadFile } from "@/lib/upload-client";
import { EditorContext, type EditorApi, type TemplateInfo } from "./context";
import { BackgroundPanel, DecorPanel, ImagePanel, QuickFillPanel, TemplatePanel, TextPanel } from "./EditorPanels";
import { dataUrlToBlob, downloadCard, renderPreview, renderThumb, type DownloadKind } from "./export";
import { arrange, duplicate, isBackdrop, isImage, isText, loadInto, serialize, setupFabric, withoutHints } from "./fabric-kit";
import Inspector from "./Inspector";
import { I, Modal, type EIcon } from "./ui";

// The wedding card editor: a Fabric canvas in the middle, panels on the left, the inspector on the right
// (bottom sheets on phones). The same component edits visitors' designs and, in "template" mode, admin templates.

export type SaveTemplateInput = TemplateInfo & { width: number; height: number; canvas: CardJson; thumbKey: string };

export type CardEditorProps = {
  mode: "design" | "template";
  initial: { canvas: CardJson; width: number; height: number; title: string };
  /** A design already saved on the server. */
  design?: { id: string; shareSlug: string | null; updatedAt: string };
  templateSlug?: string | null;
  template?: TemplateInfo;
  saveTemplate?: (input: SaveTemplateInput) => Promise<{ ok?: boolean; error?: string }>;
  backHref: string;
};

type Tab = "template" | "fill" | "text" | "image" | "decor" | "bg";
const TABS: { id: Tab; label: string; icon: EIcon }[] = [
  { id: "template", label: "Mẫu", icon: "layout" },
  { id: "fill", label: "Điền nhanh", icon: "magic" },
  { id: "text", label: "Chữ", icon: "text" },
  { id: "image", label: "Ảnh", icon: "image" },
  { id: "decor", label: "Trang trí", icon: "shapes" },
  { id: "bg", label: "Nền", icon: "palette" },
];

type Dialog = { kind: "link"; url: string } | { kind: "share"; url: string } | { kind: "download" } | null;
type Draft = { ts: number; json: string };

const isMobile = () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
const TOOL_PATH = "/cong-cu/anh-thiep-cuoi";

async function postJson(url: string, method: string, body: unknown) {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra, vui lòng thử lại.");
  return data;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function CardEditor(props: CardEditorProps) {
  const { mode } = props;
  const { width, height } = props.initial;
  const size = useMemo(() => ({ width, height }), [width, height]);
  const mm = useMemo<[number, number]>(() => formatBySize(width, height)?.mm ?? [(width / 1000) * 127, (height / 1000) * 127], [width, height]);

  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fcRef = useRef<Canvas | null>(null);
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const hasRoles = props.initial.canvas.objects.some((o) => TEXT_ROLES.some((r) => r.role === o.role));
  const [tab, setTab] = useState<Tab | null>(() => (isMobile() ? null : mode === "template" ? "template" : hasRoles ? "fill" : "text"));
  const [sheet, setSheet] = useState(false);
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);
  const [title, setTitle] = useState(props.initial.title);
  const [design, setDesign] = useState(props.design ?? null);
  const [template, setTemplate] = useState(props.template);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; kind: "ok" | "err" } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [library, setLibrary] = useState<string[]>([]);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  const history = useRef({ stack: [] as string[], index: -1, loading: false, quietUntil: 0 });
  const [canStep, setCanStep] = useState({ undo: false, redo: false });
  const syncSteps = useCallback(() => {
    const h = history.current;
    setCanStep({ undo: h.index > 0, redo: h.index < h.stack.length - 1 });
  }, []);
  const commitTimer = useRef<number | undefined>(undefined);

  const draftKey =
    mode === "template"
      ? `sl-tpl-draft:${template?.id}`
      : design
        ? `sl-card-draft:${design.id}`
        : `sl-card-draft:new:${props.templateSlug ?? "blank"}:${width}x${height}`;

  const notify = useCallback((message: string, kind: "ok" | "err" = "ok") => setToast({ message, kind }), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.kind === "err" ? 6000 : 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // ───────────── history ─────────────
  const commit = useCallback(() => {
    window.clearTimeout(commitTimer.current);
    commitTimer.current = window.setTimeout(() => {
      const c = fcRef.current;
      const h = history.current;
      if (!c || h.loading || Date.now() < h.quietUntil) return;
      const snap = JSON.stringify(serialize(c));
      if (snap === h.stack[h.index]) return;
      h.stack = h.stack.slice(0, h.index + 1);
      h.stack.push(snap);
      if (h.stack.length > 60) h.stack.shift();
      h.index = h.stack.length - 1;
      setDirty(true);
      syncSteps();
      try {
        localStorage.setItem(draftKey, JSON.stringify({ ts: Date.now(), json: snap } satisfies Draft));
      } catch {}
    }, 250);
  }, [draftKey, syncSteps]);
  const commitRef = useRef(commit);
  useEffect(() => {
    commitRef.current = commit;
  }, [commit]);

  const restore = useCallback(
    async (json: string) => {
      const c = fcRef.current;
      if (!c) return;
      const h = history.current;
      window.clearTimeout(commitTimer.current);
      h.loading = true;
      try {
        await loadInto(c, JSON.parse(json));
      } finally {
        h.loading = false;
        h.quietUntil = Date.now() + 400;
      }
      refresh();
    },
    [refresh],
  );

  const step = useCallback(
    async (delta: number) => {
      const h = history.current;
      const i = h.index + delta;
      if (i < 0 || i >= h.stack.length || h.loading) return;
      h.index = i;
      fcRef.current?.discardActiveObject();
      await restore(h.stack[i]);
      setDirty(true);
      syncSteps();
    },
    [restore, syncSteps],
  );

  // ───────────── canvas setup ─────────────
  const fit = useCallback(() => {
    const c = fcRef.current, stage = stageRef.current;
    if (!c || !stage) return;
    const pad = isMobile() ? 24 : 72;
    const base = Math.min((stage.clientWidth - pad) / width, (stage.clientHeight - pad) / height);
    const z = Math.max(0.05, base * zoomRef.current);
    c.setDimensions({ width: Math.round(width * z), height: Math.round(height * z) });
    c.setZoom(z);
    c.requestRenderAll();
  }, [width, height]);

  useEffect(() => {
    zoomRef.current = zoom;
    fit();
  }, [zoom, fit]);

  useEffect(() => {
    setupFabric();
    const host = hostRef.current!;
    const el = document.createElement("canvas");
    host.appendChild(el);
    const c = new Canvas(el, {
      width,
      height,
      preserveObjectStacking: true,
      backgroundColor: "#ffffff",
      selectionColor: "rgba(26,134,189,0.08)",
      selectionBorderColor: "#1a86bd",
      allowTouchScrolling: false,
      targetFindTolerance: 6,
    });
    fcRef.current = c;
    const abort = new AbortController();
    const disposed = () => abort.signal.aborted;

    (async () => {
      history.current.loading = true;
      try {
        await loadInto(c, props.initial.canvas, abort.signal);
      } catch (e) {
        if (disposed()) return;
        console.error(e);
        setToast({ message: "Không tải được thiệp. Hãy tải lại trang.", kind: "err" });
      }
      if (disposed()) return;
      const first = JSON.stringify(serialize(c));
      history.current = { stack: [first], index: 0, loading: false, quietUntil: Date.now() + 400 };
      setLibrary([...new Set(c.getObjects().filter((o) => isImage(o) && !isBackdrop(o)).map((o) => (o as unknown as { getSrc: () => string }).getSrc()))]);
      fit();
      setReady(true);
      try {
        const saved = JSON.parse(localStorage.getItem(draftKey) ?? "null") as Draft | null;
        const newer = !props.design || saved!.ts > Date.parse(props.design.updatedAt);
        if (saved?.json && saved.json !== first && newer) setDraft(saved);
      } catch {}
    })();

    const onChange = () => commitRef.current();
    const onSelect = () => {
      setTick((t) => t + 1);
      if (isMobile()) {
        const has = Boolean(c.getActiveObject());
        setSheet(has);
        if (has) setTab(null);
      }
    };
    c.on("object:modified", onChange);
    c.on("object:added", onChange);
    c.on("object:removed", onChange);
    c.on("text:changed", onChange);
    c.on("selection:created", onSelect);
    c.on("selection:updated", onSelect);
    c.on("selection:cleared", onSelect);

    const ro = new ResizeObserver(() => fit());
    if (stageRef.current) ro.observe(stageRef.current);
    return () => {
      abort.abort();
      ro.disconnect();
      fcRef.current = null;
      void c.dispose();
      host.innerHTML = "";
    };
    // The canvas is created once; later prop changes never re-create it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ───────────── keyboard ─────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const c = fcRef.current;
      if (!c) return;
      const target = e.target as HTMLElement;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable) return;
      const active = c.getActiveObject();
      if (isText(active) && active.isEditing) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        void step(e.shiftKey ? 1 : -1);
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        void step(1);
      } else if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        document.getElementById("ce-save")?.click();
      } else if (!active) {
        return;
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        const objs = c.getActiveObjects().filter((o) => !isBackdrop(o));
        c.discardActiveObject();
        c.remove(...objs);
        c.requestRenderAll();
      } else if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        void duplicate(c, active).then(() => commitRef.current());
      } else if (e.key === "Escape") {
        c.discardActiveObject();
        c.requestRenderAll();
      } else if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        const d = e.shiftKey ? 10 : 1;
        const dx = e.key === "ArrowLeft" ? -d : e.key === "ArrowRight" ? d : 0;
        const dy = e.key === "ArrowUp" ? -d : e.key === "ArrowDown" ? d : 0;
        active.set({ left: (active.left ?? 0) + dx, top: (active.top ?? 0) + dy });
        active.setCoords();
        c.requestRenderAll();
        commitRef.current();
      } else if (e.key === "]" || e.key === "[") {
        arrange(c, active, e.key === "]" ? "forward" : "backward");
        commitRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // ───────────── actions ─────────────
  const run = useCallback(
    async (label: string, fn: () => Promise<void>) => {
      if (label) setBusy(label);
      try {
        await fn();
      } catch (e) {
        console.error(e);
        notify(e instanceof UploadError || e instanceof Error ? e.message : "Có lỗi xảy ra, vui lòng thử lại.", "err");
      } finally {
        if (label) setBusy(null);
        refresh();
      }
    },
    [notify, refresh],
  );

  const upload = useCallback(async (files: File[]) => {
    const urls: string[] = [];
    for (const [i, f] of files.entries()) {
      const prefix = files.length > 1 ? `Đang tải ảnh ${i + 1}/${files.length}` : "Đang tải ảnh lên";
      const r = await uploadFile(f, "image", { onProgress: (p) => setBusy(`${prefix}… ${Math.round(p * 100)}%`) });
      urls.push(r.url);
    }
    setLibrary((l) => [...urls, ...l.filter((u) => !urls.includes(u))]);
    return urls;
  }, []);

  const currentJson = useCallback((): CardJson => {
    const c = fcRef.current!;
    const a = c.getActiveObject();
    if (isText(a) && a.isEditing) a.exitEditing();
    return serialize(c);
  }, []);

  const clearDraft = (key = draftKey) => {
    try {
      localStorage.removeItem(key);
    } catch {}
  };

  const publishPreview = async (id: string, json: CardJson) => {
    const blob = await renderPreview(withoutHints(json), size);
    const { key } = await uploadBlob(blob);
    const data = await postJson(`/api/cards/${id}/share`, "POST", { previewKey: key });
    setDesign((d) => (d ? { ...d, shareSlug: data.slug } : d));
    return data.slug as string;
  };

  /** Saves the design (creating it the first time). Returns its id. */
  const saveDesign = async (refreshPreview = true): Promise<string> => {
    const json = currentJson();
    if (!design) {
      const data = await postJson("/api/cards", "POST", { title, width, height, templateSlug: props.templateSlug ?? null, canvas: json });
      setDesign({ id: data.id, shareSlug: null, updatedAt: new Date().toISOString() });
      clearDraft();
      try {
        localStorage.setItem(`sl-card-token:${data.id}`, data.token);
      } catch {}
      window.history.replaceState(null, "", `${TOOL_PATH}/sua/${data.id}`);
      setDirty(false);
      setDialog({ kind: "link", url: `${location.origin}${TOOL_PATH}/sua/${data.id}#t=${data.token}` });
      return data.id;
    }
    await postJson(`/api/cards/${design.id}`, "PUT", { title, canvas: json });
    if (refreshPreview && design.shareSlug) await publishPreview(design.id, json);
    setDirty(false);
    clearDraft();
    return design.id;
  };

  const save = () =>
    run(mode === "template" ? "Đang lưu mẫu…" : "Đang lưu…", async () => {
      if (mode === "template") {
        if (!template || !props.saveTemplate) return;
        const json = currentJson();
        const thumb = await renderThumb(json, size, 480, false);
        const { key } = await uploadBlob(await dataUrlToBlob(thumb));
        const r = await props.saveTemplate({ ...template, width, height, canvas: json, thumbKey: key });
        if (r.error) throw new Error(r.error);
        setDirty(false);
        clearDraft();
        notify("Đã lưu mẫu.");
        return;
      }
      const wasNew = !design;
      await saveDesign();
      if (!wasNew) notify(design?.shareSlug ? "Đã lưu. Link chia sẻ đã được cập nhật." : "Đã lưu.");
    });

  const share = () =>
    run("Đang tạo link chia sẻ…", async () => {
      const id = !design || dirty ? await saveDesign(false) : design.id;
      const slug = await publishPreview(id, currentJson());
      setDialog({ kind: "share", url: `${location.origin}/anh-thiep/${slug}` });
    });

  const unshare = () =>
    run("Đang tắt chia sẻ…", async () => {
      if (!design) return;
      await postJson(`/api/cards/${design.id}/share`, "POST", { enabled: false });
      setDesign({ ...design, shareSlug: null });
      setDialog(null);
      notify("Đã tắt link chia sẻ.");
    });

  const download = (kind: DownloadKind) =>
    run(kind === "pdf" ? "Đang tạo file PDF…" : "Đang xuất ảnh…", async () => {
      await downloadCard(currentJson(), { width, height, mm }, kind, title);
      setDialog(null);
    });

  const showEditLink = () => {
    if (!design) return;
    let token: string | null = null;
    try {
      token = localStorage.getItem(`sl-card-token:${design.id}`);
    } catch {}
    if (token) setDialog({ kind: "link", url: `${location.origin}${TOOL_PATH}/sua/${design.id}#t=${token}` });
    else notify("Link chỉnh sửa chỉ xem lại được trên thiết bị đã tạo thiệp.", "err");
  };

  const api: EditorApi = {
    mode,
    canvas: () => fcRef.current,
    size,
    tick,
    refresh,
    commit,
    run,
    busy,
    notify,
    upload,
    library,
    template,
    setTemplate: (t) => {
      setTemplate(t);
      setDirty(true);
    },
  };

  const tabs = TABS.filter((t) => (t.id === "template" ? mode === "template" : true));
  const panel = { template: <TemplatePanel />, fill: <QuickFillPanel />, text: <TextPanel />, image: <ImagePanel />, decor: <DecorPanel />, bg: <BackgroundPanel /> };
  const status = busy ?? (dirty ? "Chưa lưu" : design || mode === "template" ? "Đã lưu" : "");

  return (
    <EditorContext.Provider value={api}>
      <div className="ce" data-ready={ready}>
        <header className="ce-top">
          <a className="ce-icon-btn" href={props.backHref} aria-label="Quay lại">
            <I name="back" />
          </a>
          {mode === "template" && template ? (
            <input className="ce-title" value={template.name} onChange={(e) => api.setTemplate!({ ...template, name: e.target.value })} aria-label="Tên mẫu" />
          ) : (
            <input className="ce-title" value={title} onChange={(e) => { setTitle(e.target.value); setDirty(true); }} aria-label="Tên thiệp" maxLength={120} />
          )}
          <div className="ce-tools">
            <button type="button" className="ce-icon-btn" onClick={() => step(-1)} disabled={!canStep.undo} title="Hoàn tác (Ctrl+Z)" aria-label="Hoàn tác">
              <I name="undo" />
            </button>
            <button type="button" className="ce-icon-btn" onClick={() => step(1)} disabled={!canStep.redo} title="Làm lại (Ctrl+Shift+Z)" aria-label="Làm lại">
              <I name="redo" />
            </button>
            <span className="ce-sep hide-sm" />
            <button type="button" className="ce-icon-btn hide-sm" onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.2).toFixed(2)))} aria-label="Thu nhỏ">
              <I name="minus" />
            </button>
            <button type="button" className="ce-zoom hide-sm" onClick={() => setZoom(1)} title="Vừa khung">
              {Math.round(zoom * 100)}%
            </button>
            <button type="button" className="ce-icon-btn hide-sm" onClick={() => setZoom((z) => Math.min(3, +(z + 0.2).toFixed(2)))} aria-label="Phóng to">
              <I name="plus" />
            </button>
          </div>
          <div className="ce-actions">
            <span className={`ce-status ${busy ? "busy" : ""}`} aria-live="polite">
              {busy && <I name="loader" size={14} className="spin" />}
              {status}
            </span>
            <button id="ce-save" type="button" className="ce-btn" onClick={save} disabled={Boolean(busy) || !ready}>
              <I name="save" size={16} />
              <span className="hide-sm">Lưu</span>
            </button>
            <button type="button" className="ce-btn" onClick={() => setDialog({ kind: "download" })} disabled={!ready}>
              <I name="download" size={16} />
              <span className="hide-sm">Tải về</span>
            </button>
            {mode === "design" && (
              <button type="button" className="ce-btn primary" onClick={share} disabled={Boolean(busy) || !ready}>
                <I name="share" size={16} />
                <span className="hide-xs">Chia sẻ</span>
              </button>
            )}
          </div>
        </header>

        {draft && (
          <div className="ce-banner" role="status">
            <span>Bạn có bản nháp chưa lưu lúc {new Date(draft.ts).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}.</span>
            <button
              type="button"
              className="ce-btn sm primary"
              onClick={() =>
                run("Đang khôi phục…", async () => {
                  await restore(draft.json);
                  const hh = history.current;
                  hh.stack = [...hh.stack.slice(0, hh.index + 1), draft.json];
                  hh.index = hh.stack.length - 1;
                  syncSteps();
                  setDirty(true);
                  setDraft(null);
                })
              }
            >
              Khôi phục
            </button>
            <button type="button" className="ce-btn sm ghost" onClick={() => { clearDraft(); setDraft(null); }}>
              Bỏ qua
            </button>
          </div>
        )}

        <div className="ce-body">
          <nav className="ce-rail" aria-label="Công cụ">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                className={tab === t.id ? "on" : ""}
                aria-pressed={tab === t.id}
                onClick={() => {
                  const next = tab === t.id && isMobile() ? null : t.id;
                  setTab(next);
                  if (next && isMobile()) setSheet(false);
                }}
              >
                <I name={t.icon} size={20} />
                <span>{t.label}</span>
              </button>
            ))}
          </nav>

          <aside className={`ce-panel ${tab ? "open" : ""}`} aria-label={tabs.find((t) => t.id === tab)?.label}>
            {tab && (
              <>
                <div className="ce-panel-head">
                  <h2>{tabs.find((t) => t.id === tab)?.label}</h2>
                  <button type="button" className="ce-icon-btn ce-sheet-close" onClick={() => setTab(null)} aria-label="Đóng">
                    <I name="x" />
                  </button>
                </div>
                <div className="ce-panel-body">{panel[tab]}</div>
              </>
            )}
          </aside>

          <main
            className="ce-stage"
            ref={stageRef}
            onPointerDown={(e) => {
              if (e.target === e.currentTarget) {
                fcRef.current?.discardActiveObject();
                fcRef.current?.requestRenderAll();
              }
            }}
          >
            <div className="ce-canvas-host" ref={hostRef} />
            {!ready && (
              <div className="ce-loading">
                <I name="loader" size={22} className="spin" /> Đang tải thiệp…
              </div>
            )}
          </main>

          <aside className={`ce-inspector ${sheet ? "open" : ""}`} aria-label="Thuộc tính">
            <Inspector
              onClose={
                isMobile()
                  ? () => {
                      setSheet(false);
                      fcRef.current?.discardActiveObject();
                      fcRef.current?.requestRenderAll();
                    }
                  : undefined
              }
            />
          </aside>
        </div>

        {toast && (
          <div className={`ce-toast ${toast.kind}`} role={toast.kind === "err" ? "alert" : "status"}>
            <I name={toast.kind === "err" ? "x" : "check"} size={16} /> {toast.message}
          </div>
        )}

        {dialog?.kind === "download" && (
          <Modal title="Tải thiệp về máy" onClose={() => setDialog(null)}>
            <div className="ce-choices">
              <button type="button" onClick={() => download("png")} disabled={Boolean(busy)}>
                <b>PNG chất lượng cao</b>
                <span>{width * 2}×{height * 2}px. Rõ nét nhất, phù hợp lưu trữ và in.</span>
              </button>
              <button type="button" onClick={() => download("jpg")} disabled={Boolean(busy)}>
                <b>JPG</b>
                <span>Nhẹ hơn, tiện gửi qua Zalo, Messenger.</span>
              </button>
              <button type="button" onClick={() => download("pdf")} disabled={Boolean(busy)}>
                <b>PDF để in</b>
                <span>Đúng khổ {mm[0].toFixed(0)}×{mm[1].toFixed(0)}mm, 300 DPI. Gửi thẳng cho tiệm in.</span>
              </button>
            </div>
            {busy && <p className="ce-hint center"><I name="loader" size={14} className="spin" /> {busy}</p>}
          </Modal>
        )}

        {dialog?.kind === "link" && (
          <Modal title="Giữ link để sửa thiệp sau" onClose={() => setDialog(null)}>
            <p>Thiệp đã được lưu. Bạn không cần tài khoản: <b>ai có link dưới đây đều sửa được thiệp</b>, vì vậy hãy lưu lại và đừng chia sẻ link này.</p>
            <CopyBox url={dialog.url} notify={notify} />
            <p className="ce-hint">Trên thiết bị này, bạn có thể mở lại thiệp bất cứ lúc nào. Sang máy khác thì cần link trên.</p>
          </Modal>
        )}

        {dialog?.kind === "share" && (
          <Modal title="Chia sẻ thiệp" onClose={() => setDialog(null)}>
            <p>Gửi link này cho khách mời. Người nhận chỉ xem được, không sửa được thiệp.</p>
            <CopyBox url={dialog.url} notify={notify} />
            <div className="ce-row wrap">
              {typeof navigator !== "undefined" && "share" in navigator && (
                <button type="button" className="ce-btn primary" onClick={() => navigator.share({ title, url: dialog.url }).catch(() => {})}>
                  <I name="share" size={16} /> Gửi qua Zalo, Messenger…
                </button>
              )}
              <a className="ce-btn" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(dialog.url)}`} target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
              <a className="ce-btn" href={dialog.url} target="_blank" rel="noopener noreferrer">
                <I name="link" size={16} /> Xem trang thiệp
              </a>
            </div>
            <p className="ce-hint">Mỗi lần bạn bấm Lưu, ảnh trên link chia sẻ được cập nhật theo.</p>
            <div className="ce-row between">
              <button type="button" className="ce-btn ghost" onClick={showEditLink}>Xem link chỉnh sửa</button>
              <button type="button" className="ce-btn ghost danger" onClick={unshare}>Tắt chia sẻ</button>
            </div>
          </Modal>
        )}
      </div>
    </EditorContext.Provider>
  );
}

function CopyBox({ url, notify }: { url: string; notify: (m: string, k?: "ok" | "err") => void }) {
  return (
    <div className="ce-copy">
      <input type="text" readOnly value={url} onFocus={(e) => e.currentTarget.select()} aria-label="Đường dẫn" />
      <button type="button" className="ce-btn primary" onClick={async () => notify((await copyText(url)) ? "Đã sao chép link." : "Không sao chép được, hãy bôi đen và sao chép thủ công.", "ok")}>
        Sao chép
      </button>
    </div>
  );
}

