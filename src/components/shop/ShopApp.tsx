"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { mergeBooks } from "@/lib/shop/merge";
import type { BookRef, BookRole } from "@/lib/shop/server";
import { SHOP_APP, SHOP_BOOK_COOKIE as BOOK_COOKIE } from "@/lib/shop/tool";
import { bookLedger, sanitizeBook, type ShopBook } from "@/lib/shop/types";
import Members from "./Members";
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

type SaveState = "saved" | "dirty" | "saving" | "error";
const SAVE_TEXT: Record<SaveState, string> = { saved: "Đã lưu", dirty: "Chưa lưu…", saving: "Đang lưu…", error: "Lỗi lưu, đang thử lại" };
const POLL_MS = 15_000;

type Props = { initial: ShopBook; initialVersion: number; bookId: string; role: BookRole; books: BookRef[]; me: string };

export default function ShopApp({ initial, initialVersion, bookId, role: initialRole, books, me }: Props) {
  const [book, setBook] = useState(initial);
  const [role, setRole] = useState(initialRole);
  const [tab, setTab] = useState<Tab>("overview");
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [save, setSave] = useState<SaveState>("saved");
  const [lost, setLost] = useState("");
  const [toastMsg, setToastMsg] = useState<{ m: string; err?: boolean; undo?: () => void } | null>(null);
  const readOnly = role === "viewer";
  const router = useRouter();

  // ── sync: debounced autosave, one request at a time; when someone else saved first, or every few
  //    seconds while the tab is open, the stored book is merged in (lib/shop/merge.ts) ──
  const bookRef = useRef(book);
  /** The stored book at `version`: the common ancestor for merging. */
  const base = useRef(initial);
  const version = useRef(initialVersion);
  const rev = useRef(0);
  /** rev at the last successful save; differs while this device has unsaved edits. */
  const savedRev = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const busy = useRef(false);
  const stopped = useRef(false);
  // flush re-schedules itself; the ref lets it do so without referring to its own binding.
  const flushRef = useRef<() => void>(() => {});
  const later = (ms: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => flushRef.current(), ms);
  };

  const noAccess = useCallback((m: string) => {
    stopped.current = true;
    setLost(m || "Bạn không còn quyền vào sổ hàng này.");
  }, []);

  /** Fetches the stored book if it changed and merges it under this device's edits. True when edits remain to save. */
  const pull = useCallback(async (): Promise<boolean | null> => {
    const res = await fetch(`/api/shop?book=${bookId}&v=${version.current}`, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 || res.status === 403) {
      noAccess(data.error);
      return null;
    }
    if (!res.ok) throw new Error(data.error || "Không tải được sổ hàng.");
    if (data.role) setRole(data.role);
    if (data.unchanged) return null;
    const theirs = sanitizeBook(data.book);
    const merged = mergeBooks(base.current, bookRef.current, theirs);
    base.current = theirs;
    version.current = data.version;
    bookRef.current = merged;
    setBook(merged);
    return JSON.stringify(merged) !== JSON.stringify(theirs);
  }, [bookId, noAccess]);

  const flush = useCallback(async () => {
    if (busy.current || stopped.current) return;
    busy.current = true;
    const sentRev = rev.current;
    const sent = bookRef.current;
    setSave("saving");
    try {
      const res = await fetch("/api/shop", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, book: sent, version: version.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        // Someone saved first: take their changes, keep ours on top, save again.
        await pull();
        later(150);
        return;
      }
      if (res.status === 401 || res.status === 403) return noAccess(data.error);
      if (!res.ok) throw new Error(data.error || "Không lưu được.");
      version.current = data.version;
      base.current = sent;
      savedRev.current = sentRev;
      if (rev.current !== sentRev) later(300);
      else setSave("saved");
    } catch (e) {
      setSave("error");
      setToastMsg({ m: (e as Error).message, err: true });
      later(5000);
    } finally {
      busy.current = false;
    }
  }, [bookId, pull, noAccess]);
  useEffect(() => {
    flushRef.current = flush;
  }, [flush]);

  const update = useCallback(
    (fn: (b: ShopBook) => ShopBook) => {
      if (readOnly) {
        setToastMsg({ m: "Bạn chỉ có quyền xem sổ hàng này.", err: true });
        return;
      }
      const next = fn(bookRef.current);
      bookRef.current = next;
      setBook(next);
      rev.current++;
      if (stopped.current) return;
      setSave("dirty");
      later(700);
    },
    [readOnly],
  );

  // Pick up other people's changes: every few seconds while visible, and on coming back to the tab.
  useEffect(() => {
    const check = async () => {
      if (busy.current || stopped.current || document.hidden || rev.current !== savedRev.current) return;
      busy.current = true;
      try {
        const pending = await pull();
        if (pending) {
          rev.current++;
          setSave("dirty");
          later(300);
        }
      } catch {
        // Offline for a moment: the next tick tries again.
      } finally {
        busy.current = false;
      }
    };
    const id = setInterval(check, POLL_MS);
    const onShow = () => !document.hidden && check();
    document.addEventListener("visibilitychange", onShow);
    window.addEventListener("focus", onShow);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onShow);
      window.removeEventListener("focus", onShow);
    };
  }, [pull]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (save !== "saved") e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [save]);

  // Remember the open book for the next visit.
  useEffect(() => {
    document.cookie = `${BOOK_COOKIE}=${bookId}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  }, [bookId]);

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), toastMsg.undo ? 6000 : 3200);
    return () => clearTimeout(t);
  }, [toastMsg]);

  const ledger = useMemo(() => bookLedger(book), [book]);
  const stats = ledger.stats;
  const open = useCallback((s: Sheet) => setSheets((list) => [...list, s]), []);
  const close = useCallback(() => setSheets((list) => list.slice(0, -1)), []);
  const toast = useCallback((m: string, err?: boolean) => setToastMsg({ m, err }), []);
  const undoable = useCallback((m: string, undo: () => void) => setToastMsg({ m, undo }), []);
  const shop: Shop = useMemo(() => ({ book, bookId, role, me, stats, ledger, update, open, toast, undoable }), [book, bookId, role, me, stats, ledger, update, open, toast, undoable]);
  const others = books.length > 1;
  const go = (t: Tab) => {
    setTab(t);
    window.scrollTo({ top: 0 });
  };

  return (
    <ShopContext.Provider value={shop}>
      <main className={`sh ${readOnly ? "readonly" : ""}`}>
        <div className="sh-head">
          <div>
            <h1>{book.shopName || (role === "owner" ? "Sổ hàng của tôi" : (books.find((b) => b.id === bookId)?.name ?? "Sổ hàng"))}</h1>
            <p className="sh-head-meta">
              {readOnly ? (
                <span className="sh-role">Chỉ xem</span>
              ) : (
                <span className={`sh-save ${save}`} role="status">
                  <i />
                  {SAVE_TEXT[save]}
                </span>
              )}
              {others && (
                <select
                  className="sh-book-pick"
                  aria-label="Chọn sổ hàng"
                  value={bookId}
                  onChange={(e) => router.push(`${SHOP_APP}?so=${e.target.value}`)}
                >
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.role === "owner" ? `Sổ của tôi${b.name !== "Sổ hàng của tôi" ? ` · ${b.name}` : ""}` : `${b.name}${b.owner && !b.name.includes(b.owner) ? ` · ${b.owner}` : ""}`}
                    </option>
                  ))}
                </select>
              )}
            </p>
          </div>
          <div className="sh-head-actions">
            {!readOnly && (
              <>
                <button type="button" className="ce-btn sh-btn-in" onClick={() => open({ t: "voucher", kind: "order" })}>
                  <Icon name="receipt" size={18} /> Đặt hàng
                </button>
                <button type="button" className="ce-btn sh-btn-in" onClick={() => open({ t: "voucher", kind: "in" })}>
                  <Icon name="box" size={18} /> Nhập hàng
                </button>
                <button type="button" className="ce-btn primary sh-btn-out" onClick={() => open({ t: "voucher", kind: "out" })}>
                  <Icon name="cart" size={18} /> Bán hàng
                </button>
              </>
            )}
            <button type="button" className="ce-btn ghost" onClick={() => open({ t: "members" })} aria-label="Người cùng quản lý" title="Mời người cùng quản lý">
              <Icon name="users" size={18} /> <span className="hide-sm">Chia sẻ</span>
            </button>
            <button type="button" className="ce-btn ghost" onClick={() => open({ t: "settings" })} aria-label="Cài đặt & dữ liệu" title="Cài đặt & dữ liệu">
              <Icon name="gear" size={18} /> <span className="hide-sm">Cài đặt</span>
            </button>
          </div>
        </div>

        {lost && (
          <div className="sh-alert" role="alert">
            <p>
              <b>{lost}</b> Có thể chủ sổ đã bớt bạn ra hoặc phiên đăng nhập đã hết. Những thay đổi chưa lưu ở đây sẽ không được ghi.
            </p>
            <div>
              <button type="button" className="ce-btn primary sm" onClick={() => router.push(SHOP_APP)}>
                Mở sổ của tôi
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

        {!readOnly && (
        <button type="button" className="sh-fab" onClick={() => open({ t: "quick" })} aria-label="Tạo mới: bán hàng, nhập hàng, mẫu, ghi chú">
          <Icon name="plus" size={28} />
        </button>
        )}
      </main>

      {sheets.map((s, i) => {
        const key = `${i}-${s.t}`;
        if (s.t === "product") return <ProductForm key={key} sheet={s} onClose={close} />;
        if (s.t === "voucher") return <VoucherForm key={key} sheet={s} onClose={close} />;
        if (s.t === "supplier") return <SupplierForm key={key} sheet={s} onClose={close} />;
        if (s.t === "note") return <NoteForm key={key} sheet={s} onClose={close} />;
        if (s.t === "quick") return <QuickCreate key={key} onClose={close} />;
        if (s.t === "members") return <Members key={key} onClose={close} />;
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
