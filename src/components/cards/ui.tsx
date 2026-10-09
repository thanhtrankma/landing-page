"use client";

import { useEffect, useId, type ReactNode } from "react";

// Small building blocks for the card editor (icons, modal, labelled controls).

const PATHS = {
  back: "M15 18l-6-6 6-6",
  undo: "M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11",
  redo: "m15 14 5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  fit: "M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4",
  save: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  share: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13",
  magic: "M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8 19 13M17.8 6.2 19 5M12.2 6.2 11 5M3 21l9-9",
  text: "M4 7V4h16v3M9 20h6M12 4v16",
  image: "M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21",
  shapes: "M12 3l4 7H8zM7 21a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM14 14h7v7h-7z",
  palette: "M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1-3.7 2 2 0 0 1 1-3.7h3A3 3 0 0 0 21 11a9 9 0 0 0-9-8ZM7.5 11h.01M10 7.5h.01M15 7.5h.01",
  layout: "M3 4h18v16H3zM3 9h18M9 9v11",
  trash: "M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
  copy: "M8 8h12v12H8zM4 16V4h12",
  lock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
  unlock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 7.5-2",
  toFront: "M8 8h12v12H8zM4 4h10v2H6v8H4z",
  toBack: "M4 4h12v12H4zM18 8h2v12H8v-2h10z",
  up: "M12 19V5M5 12l7-7 7 7",
  down: "M12 5v14M19 12l-7 7-7-7",
  x: "M18 6 6 18M6 6l12 12",
  check: "M20 6 9 17l-5-5",
  link: "M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7",
  alignLeft: "M4 4v16M8 8h12M8 16h7",
  alignHCenter: "M12 4v16M6 8h12M8 16h8",
  alignRight: "M20 4v16M4 8h12M9 16h7",
  alignTop: "M4 4h16M8 8v12M16 8v7",
  alignVCenter: "M4 12h16M8 6v12M16 8v8",
  alignBottom: "M4 20h16M8 4v12M16 9v7",
  textLeft: "M4 6h16M4 12h10M4 18h14",
  textCenter: "M4 6h16M7 12h10M5 18h14",
  textRight: "M4 6h16M10 12h10M6 18h14",
  flip: "M12 3v18M16 7l4 5-4 5zM8 7l-4 5 4 5z",
  frame: "M3 3h18v18H3zM3 15l5-5 5 5 3-3 5 5",
  loader: "M21 12a9 9 0 1 1-6.22-8.56",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  sliders: "M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6",
};
export type EIcon = keyof typeof PATHS;

export function I({ name, size = 18, className }: { name: EIcon; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const id = useId();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="ce-modal-back" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`ce-modal ${wide ? "wide" : ""}`} role="dialog" aria-modal="true" aria-labelledby={id}>
        <div className="ce-modal-head">
          <h2 id={id}>{title}</h2>
          <button type="button" className="ce-icon-btn" onClick={onClose} aria-label="Đóng">
            <I name="x" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="ce-field">
      <span className="ce-label">{label}</span>
      {children}
      {hint && <span className="ce-hint">{hint}</span>}
    </label>
  );
}

export function Range({ label, value, min, max, step = 1, onChange, onCommit, format }: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; onCommit?: () => void; format?: (v: number) => string;
}) {
  return (
    <label className="ce-field ce-range">
      <span className="ce-label">
        {label} <b>{format ? format(value) : Math.round(value * 100) / 100}</b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerUp={onCommit}
        onKeyUp={onCommit}
      />
    </label>
  );
}

export const SWATCHES = ["#ffffff", "#111111", "#5b4630", "#8f6a35", "#b89257", "#e6c27a", "#9e1b1e", "#c0566b", "#e8a3ae", "#f8d7dc", "#4f6148", "#8da386", "#14213d", "#1a86bd", "#bbe4f6", "#777777"];

export function ColorField({ label, value, onChange, onCommit }: { label: string; value: string; onChange: (c: string) => void; onCommit?: () => void }) {
  const hex = /^#[0-9a-f]{6}$/i.test(value) ? value : "#000000";
  return (
    <div className="ce-field">
      <span className="ce-label">{label}</span>
      <div className="ce-swatches">
        <label className="ce-swatch custom" title="Chọn màu khác" style={{ background: hex }}>
          <input type="color" value={hex} onChange={(e) => onChange(e.target.value)} onBlur={onCommit} aria-label={`${label}: chọn màu`} />
        </label>
        {SWATCHES.map((c) => (
          <button
            key={c}
            type="button"
            className={`ce-swatch ${c.toLowerCase() === hex.toLowerCase() ? "on" : ""}`}
            style={{ background: c }}
            onClick={() => {
              onChange(c);
              onCommit?.();
            }}
            aria-label={`Màu ${c}`}
          />
        ))}
      </div>
    </div>
  );
}

/** Hidden file input + button. */
export function FilePick({ accept, multiple, onFiles, children, className = "ce-btn", disabled }: {
  accept: string; multiple?: boolean; onFiles: (files: File[]) => void; children: ReactNode; className?: string; disabled?: boolean;
}) {
  return (
    <label className={`${className} ${disabled ? "disabled" : ""}`}>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        disabled={disabled}
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
