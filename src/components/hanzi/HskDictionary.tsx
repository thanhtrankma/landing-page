"use client";

import Link from "next/link";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import WordPreview, { loadDictionary } from "@/components/hanzi/WordPreview";
import { displayPinyin, plainPinyin, plainVi, posLabel, posTitle, wordHref, type HskLevel, type HskListItem } from "@/lib/hsk-text";

const POS_FILTERS = ["名", "动", "形", "副", "代", "数", "量"];

// From this width the details open in a column beside the list; below it, in a modal sheet.
const WIDE = "(min-width: 1100px)";
const subscribeWide = (cb: () => void) => {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

const initial = (w: HskListItem) => plainPinyin(w.pinyin).charAt(0).toUpperCase();

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** How well one search term fits a word; 0 = no match. Exact hanzi/pinyin first, then prefixes, then whole words in the meaning. */
function termScore(w: HskListItem, raw: string): number {
  const py = plainPinyin(raw);
  const vi = plainVi(raw);
  let score = 0;
  if (w.zh.split(" ").includes(raw)) score = Math.max(score, 100);
  else if (w.zh.includes(raw)) score = Math.max(score, 70);
  if (py) {
    if (w.py === py) score = Math.max(score, 95);
    else if (w.py.startsWith(py)) score = Math.max(score, 60);
    else if (w.py.includes(py)) score = Math.max(score, 30);
  }
  if (vi) {
    if (new RegExp(`(^|[^a-z])${escape(vi)}($|[^a-z])`).test(w.vi)) score = Math.max(score, w.vi.startsWith(vi) ? 80 : 50);
    else if (vi.length > 2 && w.vi.includes(vi)) score = Math.max(score, 15);
    if (w.hv === vi) score = Math.max(score, 40);
  }
  return score;
}

/** Words matching every term (and the level / part-of-speech filters), best matches first; list order breaks ties. */
function search(words: HskListItem[], q: string, pos: string | null, level: HskLevel | null): HskListItem[] {
  const pool = words.filter((w) => (!pos || w.pos.includes(pos)) && (!level || w.level === level));
  const terms = q.split(/\s+/).filter(Boolean);
  if (!terms.length) return pool;
  return pool
    .map((w) => {
      let total = 0;
      for (const t of terms) {
        const s = termScore(w, t);
        if (!s) return null;
        total += s;
      }
      return { w, total };
    })
    .filter((r): r is { w: HskListItem; total: number } => r !== null)
    .sort((a, b) => b.total - a.total || a.w.level - b.w.level || a.w.n - b.w.n)
    .map((r) => r.w);
}

/**
 * The prerendered HTML holds the unfiltered list (every word linked, for crawlers and first paint); on the client the
 * URL's ?q= / ?cap= / ?loai= are restored so "Back" from a word page returns to the same search.
 */
export default function HskDictionary({ words }: { words: HskListItem[] }) {
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState<string | null>(null);
  const [level, setLevel] = useState<HskLevel | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const q = useDeferredValue(query.trim());

  const [selected, setSelected] = useState<string | null>(null);
  const wide = useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE).matches,
    () => true,
  );
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Set when opening the sheet added a history entry, so closing it (or the phone's Back) pops that entry.
  const pushed = useRef(false);

  // Restore the search and the open word from the URL once mounted; the prerendered page can't know them.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off sync from the URL after hydration
    setQuery(params.get("q") ?? "");
    setPos(params.get("loai"));
    const cap = Number(params.get("cap"));
    setLevel(words.some((w) => w.level === cap) ? (cap as HskLevel) : null);
    setSelected(params.get("tu"));
    // Start fetching the word data while the user is still scanning the list.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    idle(() => void loadDictionary());
  }, [words]);

  // Browser Back closes the sheet (or steps back to the previously shown word).
  useEffect(() => {
    const onPop = () => {
      pushed.current = false;
      setSelected(new URLSearchParams(window.location.search).get("tu"));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Keep the search in the URL. Skips the first run so the empty initial state can't wipe a ?q= being restored.
  const synced = useRef(false);
  useEffect(() => {
    if (!synced.current) {
      synced.current = true;
      return;
    }
    const url = new URL(window.location.href);
    if (q) url.searchParams.set("q", q);
    else url.searchParams.delete("q");
    if (level) url.searchParams.set("cap", String(level));
    else url.searchParams.delete("cap");
    if (pos) url.searchParams.set("loai", pos);
    else url.searchParams.delete("loai");
    if (selected) url.searchParams.set("tu", selected);
    else url.searchParams.delete("tu");
    window.history.replaceState(window.history.state, "", url);
  }, [q, pos, level, selected]);

  // "/" focuses the search box from anywhere on the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key !== "/" || t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const levels = useMemo(() => [...new Set(words.map((w) => w.level))], [words]);
  const results = useMemo(() => search(words, q, pos, level), [words, q, pos, level]);
  // Each filter's counts reflect the search and the *other* filter, so they show what picking it would give.
  const posCounts = useMemo(() => {
    const base = search(words, q, null, level);
    const counts: Record<string, number> = { all: base.length };
    for (const p of POS_FILTERS) counts[p] = base.filter((w) => w.pos.includes(p)).length;
    return counts;
  }, [words, q, level]);
  const levelCounts = useMemo(() => {
    const base = search(words, q, pos, null);
    const counts: Record<string, number> = { all: base.length };
    for (const l of levels) counts[l] = base.filter((w) => w.level === l).length;
    return counts;
  }, [words, q, pos, levels]);

  const groups = useMemo(() => {
    if (q) return [["", results]] as [string, HskListItem[]][];
    const map = new Map<string, HskListItem[]>();
    for (const w of results) {
      const k = initial(w);
      map.set(k, [...(map.get(k) ?? []), w]);
    }
    return [...map].sort(([a], [b]) => a.localeCompare(b));
  }, [results, q]);
  const allLetters = useMemo(() => [...new Set(words.map(initial))], [words]);
  const present = new Set(groups.map(([k]) => k));
  const filtered = Boolean(q || pos || level);

  function reset() {
    setQuery("");
    setPos(null);
    setLevel(null);
    inputRef.current?.focus();
  }

  const select = useCallback(
    (slug: string) => {
      if (!wide && !selected && !pushed.current) {
        const url = new URL(window.location.href);
        url.searchParams.set("tu", slug);
        window.history.pushState(null, "", url);
        pushed.current = true;
      }
      setSelected(slug);
    },
    [wide, selected],
  );

  const close = useCallback(() => {
    if (pushed.current) window.history.back();
    else setSelected(null);
  }, []);

  // Previous / next within what's currently listed.
  const index = selected ? results.findIndex((w) => w.slug === selected) : -1;
  const prev = index > 0 ? results[index - 1].slug : undefined;
  const next = index >= 0 && index < results.length - 1 ? results[index + 1].slug : undefined;

  // ← / → step through the results while a word is open, unless the user is typing or drawing.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      const to = e.key === "ArrowLeft" ? prev : e.key === "ArrowRight" ? next : undefined;
      if (!to) return;
      e.preventDefault();
      setSelected(to);
      document.querySelector(`[data-slug="${to}"]`)?.scrollIntoView({ block: "nearest" });
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected, prev, next]);

  // The sheet is a native modal <dialog>: focus trap, Esc and backdrop come for free.
  const sheetOpen = Boolean(selected) && !wide;
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (sheetOpen && !d.open) {
      d.showModal();
      // showModal focuses the first control (the "Mở trang riêng" link); start on the content instead, with no ring.
      d.querySelector<HTMLElement>(".preview-body")?.focus({ preventScroll: true });
    }
    if (!sheetOpen && d.open) d.close();
  }, [sheetOpen]);

  // One delegated handler for all cards, in the capture phase so it runs before <Link> navigates (Link skips
  // default-prevented clicks). New-tab / new-window clicks still follow the link to the word's own page.
  const onListClick = useCallback(
    (e: React.MouseEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>("[data-slug]");
      if (!card || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      select(card.dataset.slug!);
    },
    [select],
  );

  const searchIcon = (
    <svg
      className="dict-search-icon"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );

  // Desktop: filters in a sticky left column, sticky search above the results.
  // Phones: .dict-side dissolves (display: contents) so the search and the part-of-speech row stick together on top.
  return (
    <div className="dict">
      <div className="dict-bar">
        <div className="dict-search">
          {searchIcon}
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
            placeholder="Tìm: 爱, chifan, yêu…"
            aria-label="Tìm từ"
            enterKeyHint="search"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          {query ? (
            <button type="button" className="dict-clear" onClick={() => setQuery("")} aria-label="Xoá từ khoá">
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          ) : (
            <kbd className="dict-kbd" aria-hidden="true">
              /
            </kbd>
          )}
        </div>
      </div>

      <aside className="dict-side" aria-label="Bộ lọc">
        <div className="dict-filter">
          {levels.length > 1 && (
            <>
              <div className="dict-filter-group dict-levels" role="group" aria-labelledby="dict-level-h">
                <h2 id="dict-level-h" className="dict-side-h">
                  Cấp độ
                </h2>
                <div className="dict-seg">
                  <button type="button" aria-pressed={level === null} onClick={() => setLevel(null)}>
                    Tất cả <small>{levelCounts.all}</small>
                  </button>
                  {levels.map((l) => (
                    <button
                      key={l}
                      type="button"
                      aria-pressed={level === l}
                      disabled={!levelCounts[l] && level !== l}
                      onClick={() => setLevel(level === l ? null : l)}
                    >
                      HSK {l} <small>{levelCounts[l]}</small>
                    </button>
                  ))}
                </div>
              </div>
              <span className="dict-filter-sep" aria-hidden="true" />
            </>
          )}
          <div className="dict-filter-group" role="group" aria-labelledby="dict-pos-h">
            <h2 id="dict-pos-h" className="dict-side-h">
              Từ loại
            </h2>
            <button type="button" aria-pressed={pos === null} onClick={() => setPos(null)}>
              Tất cả <small>{posCounts.all}</small>
            </button>
            {POS_FILTERS.map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={pos === p}
                disabled={!posCounts[p] && pos !== p}
                onClick={() => setPos(pos === p ? null : p)}
              >
                {posTitle(p)} <small>{posCounts[p]}</small>
              </button>
            ))}
          </div>
        </div>

        {!q && (
          <nav className="dict-letters" aria-labelledby="dict-abc-h">
            <h2 id="dict-abc-h" className="dict-side-h">
              Chữ cái đầu (pinyin)
            </h2>
            <div>
              {allLetters.map((l) =>
                present.has(l) ? (
                  <a key={l} href={`#chu-${l}`}>
                    {l}
                  </a>
                ) : (
                  <span key={l} aria-hidden="true">
                    {l}
                  </span>
                ),
              )}
            </div>
          </nav>
        )}
      </aside>

      <div className="dict-main" onClickCapture={onListClick}>
        <p className="dict-count" aria-live="polite">
          {filtered ? (
            <>
              <span>
                <b>{results.length}</b> / {words.length} từ
              </span>
              <button type="button" onClick={reset}>
                Xoá bộ lọc
              </button>
            </>
          ) : (
            <span>
              <b>{words.length}</b> từ vựng HSK {levels.join("–")} · bấm vào từ để xem nghĩa và cách viết
            </span>
          )}
        </p>

        {results.length === 0 ? (
          <div className="dict-empty">
            <p>
              <b>
                Không tìm thấy “{q}”{level ? ` ở HSK ${level}` : ""}
                {pos ? ` trong nhóm ${posLabel(pos)}` : ""}.
              </b>
            </p>
            <p>Thử gõ pinyin không dấu (vd: chifan), một chữ Hán đơn, hoặc một từ tiếng Việt ngắn hơn.</p>
            <button type="button" onClick={reset}>
              Xoá bộ lọc
            </button>
          </div>
        ) : (
          groups.map(([letter, list]) => (
            <section
              key={letter || "ket-qua"}
              id={letter ? `chu-${letter}` : undefined}
              className="dict-group"
              aria-label={letter ? undefined : "Kết quả tìm kiếm"}
              aria-labelledby={letter ? `chu-${letter}-h` : undefined}
            >
              {letter && (
                <h2 id={`chu-${letter}-h`}>
                  {letter} <small>{list.length} từ</small>
                </h2>
              )}
              <ul className="dict-grid">
                {list.map((w) => (
                  <li key={w.slug}>
                    <Link
                      href={wordHref(w.slug)}
                      className="dict-card"
                      data-slug={w.slug}
                      aria-current={w.slug === selected ? "true" : undefined}
                    >
                      <span className="dict-card-hanzi" lang="zh" data-len={Math.min([...w.hanzi].length, 4)}>
                        {w.hanzi}
                      </span>
                      <span className="dict-card-pinyin">{displayPinyin(w.pinyin)}</span>
                      <span className="dict-card-meaning">{w.meaning}</span>
                      {!level && levels.length > 1 && (
                        <span className="dict-card-level" title={`HSK ${w.level}`}>
                          H<span>SK </span>
                          {w.level}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>

      {wide && (
        <aside className="dict-detail" aria-label="Chi tiết từ">
          {selected ? (
            <WordPreview slug={selected} prev={prev} next={next} onSelect={setSelected} onClose={() => setSelected(null)} />
          ) : (
            <div className="dict-detail-empty">
              <span lang="zh" aria-hidden="true">
                字
              </span>
              <p>
                <b>Chọn một từ</b> để xem nghĩa, cách dùng, ví dụ và cách viết ngay tại đây.
              </p>
              <p className="hint">Dùng phím ← → để chuyển từ.</p>
            </div>
          )}
        </aside>
      )}

      <dialog ref={dialogRef} className="dict-sheet" aria-label="Chi tiết từ" onClose={() => sheetOpen && close()}>
        {sheetOpen && selected && (
          <WordPreview slug={selected} prev={prev} next={next} onSelect={setSelected} onClose={close} variant="sheet" />
        )}
      </dialog>
    </div>
  );
}
