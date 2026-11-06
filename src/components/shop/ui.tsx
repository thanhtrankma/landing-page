"use client";

import { createContext, useContext, useEffect, useId, useRef, useState } from "react";
import type { Product, ProductStats, ShopBook, VoucherKind } from "@/lib/shop/types";

// Shared state and small building blocks of the sales book app.

export type Sheet =
  | { t: "product"; id?: string; category?: string; onSaved?: (p: Product) => void }
  | {
      t: "voucher";
      id?: string;
      kind?: VoucherKind;
      /** Products to start the cart with. */
      productIds?: string[];
      supplierId?: string;
      /** Receive this purchase order: an "in" voucher prefilled from it. */
      fromOrder?: string;
    }
  | { t: "supplier"; id?: string; onSaved?: (id: string) => void }
  | { t: "note"; id?: string }
  | { t: "settings" }
  | { t: "quick" };

export type Shop = {
  book: ShopBook;
  stats: Map<string, ProductStats>;
  update: (fn: (b: ShopBook) => ShopBook) => void;
  open: (s: Sheet) => void;
  toast: (m: string, err?: boolean) => void;
  /** Toast with a "Hoàn tác" button that runs `restore`. */
  undoable: (m: string, restore: () => void) => void;
};

export const ShopContext = createContext<Shop | null>(null);
export const useShop = () => {
  const s = useContext(ShopContext);
  if (!s) throw new Error("useShop outside ShopApp");
  return s;
};

/** Modal panel: centred on desktop, full-height bottom sheet on phones. Esc and the backdrop close it. */
export function Panel({ title, onClose, children, foot, wide }: { title: string; onClose: () => void; children: React.ReactNode; foot?: React.ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      // Only the top-most panel reacts.
      if (e.key === "Escape" && ref.current && ref.current === [...document.querySelectorAll(".sh-panel")].at(-1)) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [onClose]);
  return (
    <div className="sh-overlay" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className={`sh-panel ${wide ? "wide" : ""}`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <header>
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="sh-x" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </header>
        <div className="sh-panel-body">{children}</div>
        {foot && <footer>{foot}</footer>}
      </div>
    </div>
  );
}

export function Field({ label, children, hint, wide }: { label: string; children: React.ReactNode; hint?: React.ReactNode; wide?: boolean }) {
  return (
    <label className={`sh-field ${wide ? "wide" : ""}`}>
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

/**
 * Number input showing thousands separators ("150.000") while typing. A trailing "k" means thousands,
 * the way sellers write prices: "250k" → 250.000.
 */
export function MoneyInput({ value, onChange, allowNegative, ...rest }: { value: number; onChange: (n: number) => void; allowNegative?: boolean } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const show = (n: number) => (n ? fmt(n) : "");
  // While typing, keep the user's text; otherwise show the value (picking a product fills its price).
  const [text, setText] = useState<string | null>(null);
  return (
    <input
      {...rest}
      inputMode={allowNegative ? "text" : "decimal"}
      value={text ?? show(value)}
      onFocus={(e) => {
        setText(show(value));
        e.target.select();
      }}
      onBlur={() => setText(null)}
      onChange={(e) => {
        const raw = e.target.value.trim();
        const neg = allowNegative && raw.startsWith("-");
        const kilo = /k$/i.test(raw);
        const digits = raw.replace(/[^\d]/g, "");
        const abs = Number(digits || 0) * (kilo ? 1000 : 1);
        setText(neg && !digits ? "-" : `${neg ? "-" : ""}${digits ? fmt(abs) : ""}`);
        onChange((neg ? -1 : 1) * abs);
      }}
    />
  );
}

/** − qty + : big tap targets for quantities. */
export function Stepper({ value, onChange, min = 0, label }: { value: number; onChange: (n: number) => void; min?: number; label: string }) {
  return (
    <div className="sh-stepper" role="group" aria-label={label}>
      <button type="button" aria-label="Bớt 1" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>
        −
      </button>
      <input
        aria-label={label}
        inputMode={min < 0 ? "text" : "numeric"}
        value={value === 0 ? "" : String(value)}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          const raw = e.target.value.trim();
          const n = Number(raw.replace(/[^\d.-]/g, "")) || 0;
          onChange(Math.max(min, n));
        }}
      />
      <button type="button" aria-label="Thêm 1" onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}

/** Segmented choice: every option visible, one tap to pick. */
export function Seg<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string, string?][]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="sh-seg" role="radiogroup" aria-label={label}>
      {options.map(([v, text, tone]) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} className={`${value === v ? "on" : ""} ${tone ?? ""}`} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  );
}

export function Empty({ title, text, children }: { title: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="sh-empty">
      <FlowerMark />
      <h3>{title}</h3>
      <p>{text}</p>
      {children}
    </div>
  );
}

export function FlowerMark({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <g fill="#f4b9c8">
        {[0, 72, 144, 216, 288].map((r) => (
          <ellipse key={r} cx="24" cy="13" rx="7" ry="10" transform={`rotate(${r} 24 24)`} />
        ))}
      </g>
      <circle cx="24" cy="24" r="5.5" fill="#f2c94c" />
    </svg>
  );
}

export const download = (blob: Blob, filename: string) => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
};

/** Excel opens UTF-8 CSV correctly only with the BOM. */
export const csv = (rows: unknown[][]) =>
  new Blob(["﻿" + rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });

/** Lower-case without Vietnamese accents, for forgiving search. */
export const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
