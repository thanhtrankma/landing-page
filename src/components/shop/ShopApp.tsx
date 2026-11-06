"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { productStats, type ShopBook } from "@/lib/shop/types";
import Notes, { NoteForm } from "./Notes";
import Overview from "./Overview";
import Products, { ProductForm } from "./Products";
import Settings from "./Settings";
import Suppliers, { SupplierForm } from "./Suppliers";
import { Icon, type IconName } from "./icons";
import QuickCreate from "./QuickCreate";
import { ShopContext, type Sheet, type Shop } from "./ui";
import VoucherForm from "./VoucherForm";
import Vouchers from "./Vouchers";
import "./shop.css";

// The signed-in sales book: tabs over one in-memory book that autosaves to /api/shop after each change.

// [id, label, short label for the phone tab bar, icon]
const TABS = [
  ["overview", "Tổng quan", "Tổng quan", "home"],
  ["products", "Mẫu hàng", "Mẫu hàng", "flower"],
  ["vouchers", "Nhập – Bán", "Phiếu", "receipt"],
  ["suppliers", "Nguồn hàng", "Nguồn", "truck"],
  ["notes", "Ghi chú", "Ghi chú", "note"],
] as const satisfies readonly (readonly [string, string, string, IconName])[];
type Tab = (typeof TABS)[number][0];

type SaveState = "saved" | "dirty" | "saving" | "error" | "conflict";
const SAVE_TEXT: Record<SaveState, string> = { saved: "Đã lưu", dirty: "Chưa lưu…", saving: "Đang lưu…", error: "Lỗi lưu, đang thử lại", conflict: "Có thay đổi từ thiết bị khác" };

export default function ShopApp({ initial, initialVersion }: { initial: ShopBook; initialVersion: number }) {
  const [book, setBook] = useState(initial);
  const [tab, setTab] = useState<Tab>("overview");
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [save, setSave] = useState<SaveState>("saved");
  const [toastMsg, setToastMsg] = useState<{ m: string; err?: boolean; undo?: () => void } | null>(null);

  // ── autosave: debounce, one request at a time, version check against other devices ──
  const bookRef = useRef(book);
  const version = useRef(initialVersion);
  const rev = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const busy = useRef(false);
  const conflict = useRef(false);
  // flush re-schedules itself; the ref lets it do so without referring to its own binding.
  const flushRef = useRef<() => void>(() => {});
  const later = (ms: number) => (timer.current = setTimeout(() => flushRef.current(), ms));

  const flush = useCallback(async () => {
    if (busy.current || conflict.current) return;
    busy.current = true;
    const sentRev = rev.current;
    setSave("saving");
    try {
      const res = await fetch("/api/shop", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book: bookRef.current, version: version.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        conflict.current = true;
        setSave("conflict");
        return;
      }
      if (!res.ok) throw new Error(data.error || "Không lưu được.");
      version.current = data.version;
      if (rev.current !== sentRev) later(300);
      else setSave("saved");
    } catch (e) {
      setSave("error");
      setToastMsg({ m: (e as Error).message, err: true });
      later(5000);
    } finally {
      busy.current = false;
    }
  }, []);
  useEffect(() => {
    flushRef.current = flush;
  }, [flush]);

  const update = useCallback(
    (fn: (b: ShopBook) => ShopBook) => {
      const next = fn(bookRef.current);
      bookRef.current = next;
      setBook(next);
      rev.current++;
      if (conflict.current) return;
      setSave("dirty");
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, 700);
    },
    [flush],
  );

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (save !== "saved") e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [save]);

  /** Keeps this device's book: takes the newer version number, then saves over it. */
  const overwrite = async () => {
    const res = await fetch("/api/shop");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setToastMsg({ m: data.error || "Không tải được.", err: true });
    version.current = data.version;
    conflict.current = false;
    void flush();
  };

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), toastMsg.undo ? 6000 : 3200);
    return () => clearTimeout(t);
  }, [toastMsg]);

  const stats = useMemo(() => productStats(book), [book]);
  const open = useCallback((s: Sheet) => setSheets((list) => [...list, s]), []);
  const close = useCallback(() => setSheets((list) => list.slice(0, -1)), []);
  const toast = useCallback((m: string, err?: boolean) => setToastMsg({ m, err }), []);
  const undoable = useCallback((m: string, undo: () => void) => setToastMsg({ m, undo }), []);
  const shop: Shop = useMemo(() => ({ book, stats, update, open, toast, undoable }), [book, stats, update, open, toast, undoable]);
  const go = (t: Tab) => {
    setTab(t);
    window.scrollTo({ top: 0 });
  };

  return (
    <ShopContext.Provider value={shop}>
      <main className="sh">
        <div className="sh-head">
          <div>
            <h1>{book.shopName || "Sổ hàng của tôi"}</h1>
            <p className={`sh-save ${save}`} role="status">
              <i />
              {SAVE_TEXT[save]}
            </p>
          </div>
          <div className="sh-head-actions">
            <button type="button" className="ce-btn sh-btn-in" onClick={() => open({ t: "voucher", kind: "order" })}>
              <Icon name="receipt" size={18} /> Đặt hàng
            </button>
            <button type="button" className="ce-btn sh-btn-in" onClick={() => open({ t: "voucher", kind: "in" })}>
              <Icon name="box" size={18} /> Nhập hàng
            </button>
            <button type="button" className="ce-btn primary sh-btn-out" onClick={() => open({ t: "voucher", kind: "out" })}>
              <Icon name="cart" size={18} /> Bán hàng
            </button>
            <button type="button" className="ce-btn ghost" onClick={() => open({ t: "settings" })} aria-label="Cài đặt & dữ liệu" title="Cài đặt & dữ liệu">
              <Icon name="gear" size={18} /> <span className="hide-sm">Cài đặt</span>
            </button>
          </div>
        </div>

        {save === "conflict" && (
          <div className="sh-alert" role="alert">
            <p>
              <b>Sổ hàng vừa được sửa ở thiết bị khác.</b> Tải lại để xem bản mới nhất (thay đổi chưa lưu ở đây sẽ mất), hoặc giữ bản đang mở và ghi đè.
            </p>
            <div>
              <button type="button" className="ce-btn primary sm" onClick={() => window.location.reload()}>
                Tải lại
              </button>
              <button type="button" className="ce-btn sm" onClick={overwrite}>
                Giữ bản này
              </button>
            </div>
          </div>
        )}

        <nav className="sh-tabs" aria-label="Mục">
          {TABS.map(([id, label, short, icon]) => (
            <button key={id} type="button" className={tab === id ? "on" : ""} aria-current={tab === id ? "page" : undefined} onClick={() => go(id)}>
              <Icon name={icon} size={20} />
              <span className="sh-tab-long">{label}</span>
              <span className="sh-tab-short">{short}</span>
            </button>
          ))}
        </nav>

        <section className="sh-body">
          {tab === "overview" && <Overview go={go} />}
          {tab === "products" && <Products />}
          {tab === "vouchers" && <Vouchers />}
          {tab === "suppliers" && <Suppliers />}
          {tab === "notes" && <Notes />}
        </section>

        <button type="button" className="sh-fab" onClick={() => open({ t: "quick" })} aria-label="Tạo mới: bán hàng, nhập hàng, mẫu, ghi chú">
          <Icon name="plus" size={28} />
        </button>
      </main>

      {sheets.map((s, i) => {
        const key = `${i}-${s.t}`;
        if (s.t === "product") return <ProductForm key={key} sheet={s} onClose={close} />;
        if (s.t === "voucher") return <VoucherForm key={key} sheet={s} onClose={close} />;
        if (s.t === "supplier") return <SupplierForm key={key} sheet={s} onClose={close} />;
        if (s.t === "note") return <NoteForm key={key} sheet={s} onClose={close} />;
        if (s.t === "quick") return <QuickCreate key={key} onClose={close} />;
        return <Settings key={key} onClose={close} />;
      })}

      {toastMsg && (
        <div className={`sh-toast ${toastMsg.err ? "err" : ""}`} role="status">
          <span>{toastMsg.m}</span>
          {toastMsg.undo && (
            <button
              type="button"
              onClick={() => {
                toastMsg.undo?.();
                setToastMsg({ m: "Đã hoàn tác." });
              }}
            >
              Hoàn tác
            </button>
          )}
        </div>
      )}
    </ShopContext.Provider>
  );
}

export type { Tab };
