"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import HanziWriter from "hanzi-writer";

type Mode = "demo" | "quiz";

// Colors follow the site's "Airy Sky" tokens (theme.css): ink strokes, deep-sky radical, sky guides.
const INK = "#0b2a3c";
const SKY_700 = "#0b6fa4";
const SKY_600 = "#1a86bd";

// "米字格" (rice-grid) guide used in Chinese writing workbooks: border, center cross and two dashed diagonals,
// drawn as a CSS background so it stays underneath whatever HanziWriter renders into the div.
const GRID_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect x="1" y="1" width="98" height="98" fill="none" stroke="#8fd0ee" stroke-width="2"/>
  <line x1="0" y1="50" x2="100" y2="50" stroke="#8fd0ee" stroke-width="1"/>
  <line x1="50" y1="0" x2="50" y2="100" stroke="#8fd0ee" stroke-width="1"/>
  <line x1="2" y1="2" x2="98" y2="98" stroke="#bbe4f6" stroke-width="1" stroke-dasharray="4 3"/>
  <line x1="98" y1="2" x2="2" y2="98" stroke="#bbe4f6" stroke-width="1" stroke-dasharray="4 3"/>
</svg>`.trim();

const GRID_BACKGROUND = `url("data:image/svg+xml,${encodeURIComponent(GRID_SVG)}")`;

// Calligraphy-brush cursor for quiz mode; the hotspot sits at the tip so that's where drawing registers.
const BRUSH_CURSOR_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect x="13" y="2" width="6" height="13" rx="3" fill="${SKY_700}"/>
  <rect x="12" y="13" width="8" height="4" fill="#bbe4f6"/>
  <path d="M11.5 17 C11.5 22, 14 27, 16 30 C18 27, 20.5 22, 20.5 17 Z" fill="${INK}"/>
</svg>`.trim();

const BRUSH_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(BRUSH_CURSOR_SVG)}") 16 30, crosshair`;

const MAX_CHARS = 6;

const SUGGESTIONS: [hanzi: string, hint: string][] = [
  ["你好", "nǐ hǎo · xin chào"],
  ["谢谢", "xièxie · cảm ơn"],
  ["中国", "Zhōngguó · Trung Quốc"],
  ["学习", "xuéxí · học tập"],
  ["爱", "ài · yêu"],
  ["永", "yǒng · đủ 8 nét cơ bản"],
];

type QuizState = { status: "idle" | "mistake" | "correct" | "done"; stroke: number; total: number };

const IDLE: QuizState = { status: "idle", stroke: 0, total: 0 };

function CharCanvas({
  char,
  mode,
  actionToken,
  size,
  showOutline,
}: {
  char: string;
  mode: Mode;
  actionToken: number;
  size: number;
  showOutline: boolean;
}) {
  const targetRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<ReturnType<typeof HanziWriter.create> | null>(null);
  const lastToken = useRef(actionToken);
  const [quiz, setQuiz] = useState<QuizState>(IDLE);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const target = targetRef.current;
    if (!target || !size) return;
    target.innerHTML = "";
    setLoadError(false);
    setQuiz(IDLE);

    const writer = HanziWriter.create(target, char, {
      width: size,
      height: size,
      padding: size > 200 ? 12 : 8,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 250,
      showOutline,
      showHintAfterMisses: 2,
      outlineColor: "#d3e6f2",
      strokeColor: INK,
      radicalColor: SKY_700,
      highlightColor: "#4fb3e0",
      drawingColor: SKY_600,
      drawingWidth: size > 200 ? 16 : 12,
      onLoadCharDataError: () => setLoadError(true),
    });
    writerRef.current = writer;
    if (mode === "demo") writer.animateCharacter();
    else startQuiz(writer, setQuiz);

    return () => {
      writerRef.current = null;
    };
  }, [char, mode, size, showOutline]);

  // Replay the animation (demo) or start the quiz over (quiz) without rebuilding the writer.
  useEffect(() => {
    if (actionToken === lastToken.current) return;
    lastToken.current = actionToken;
    const writer = writerRef.current;
    if (!writer) return;
    if (mode === "demo") writer.animateCharacter();
    else startQuiz(writer, setQuiz);
  }, [actionToken, mode]);

  const progress = quiz.total ? `Nét ${Math.min(quiz.stroke, quiz.total)}/${quiz.total}` : "";

  return (
    <div className="hanzi-cell" data-status={mode === "quiz" ? quiz.status : undefined} style={{ width: size || undefined }}>
      <div
        ref={targetRef}
        className="hanzi-canvas"
        aria-label={mode === "quiz" ? `Ô viết chữ ${char}` : `Thứ tự nét chữ ${char}`}
        role="img"
        style={{
          width: size || undefined,
          height: size || undefined,
          backgroundImage: GRID_BACKGROUND,
          cursor: mode === "quiz" ? BRUSH_CURSOR : undefined,
        }}
      />
      {loadError ? (
        <p className="hanzi-note warn">Chưa có dữ liệu nét viết cho “{char}”.</p>
      ) : (
        mode === "quiz" && (
          <p className="hanzi-note" aria-live="polite">
            {quiz.status === "done" && <span className="ok">Hoàn thành!</span>}
            {quiz.status === "mistake" && <span className="warn">{progress} · chưa đúng, thử lại</span>}
            {quiz.status === "correct" && <span>{progress} · đúng</span>}
            {quiz.status === "idle" && <span>Viết nét đầu tiên</span>}
          </p>
        )
      )}
    </div>
  );
}

function startQuiz(writer: ReturnType<typeof HanziWriter.create>, set: (q: QuizState | ((q: QuizState) => QuizState)) => void) {
  set(IDLE);
  writer.quiz({
    onCorrectStroke: ({ strokeNum, strokesRemaining }) =>
      set({ status: "correct", stroke: strokeNum + 1, total: strokeNum + strokesRemaining + 1 }),
    onMistake: ({ strokeNum, strokesRemaining }) =>
      set({ status: "mistake", stroke: strokeNum + 1, total: strokeNum + strokesRemaining + 1 }),
    onComplete: () => set((q) => ({ ...q, status: "done" })),
  });
}

function toChars(text: string): string[] {
  return [...text.replace(/\s+/g, "")].slice(0, MAX_CHARS);
}

const GAP = 12;

/** Fits the canvases to the board: one big box for a single character, otherwise at least two per row on phones. */
function useCanvasSize(count: number, compact: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const target = count === 1 ? 260 : compact ? 160 : 220;
      let cols = Math.max(1, Math.min(count, Math.floor((w + GAP) / (target + GAP))));
      if (count > 1 && cols < 2) cols = 2;
      const next = Math.floor(Math.min(target, (w - GAP * (cols - 1)) / cols));
      setSize((prev) => (prev === next ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [count, compact]);
  return [ref, size] as const;
}

const ICONS = {
  replay: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
};

/** `compact` drops the input and suggestions, for embedding next to a dictionary entry. */
export default function HanziWriterPractice({ initialChar = "你好", compact = false }: { initialChar?: string; compact?: boolean }) {
  const [chars, setChars] = useState(() => toChars(initialChar));
  const [input, setInput] = useState(initialChar);
  const [mode, setMode] = useState<Mode>("demo");
  const [showOutline, setShowOutline] = useState(true);
  const [actionToken, setActionToken] = useState(0);
  const [boardRef, size] = useCanvasSize(chars.length, compact);

  function show(text: string) {
    const next = toChars(text);
    if (next.length > 0) setChars(next);
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    show(input);
  }

  return (
    <div className={compact ? "hanzi-practice compact" : "hanzi-practice"}>
      {!compact && (
        <>
          <form onSubmit={handleSearch} className="hanzi-form">
            <label htmlFor="hanzi-input" className="hanzi-label">
              Chữ cần luyện <small>(tối đa {MAX_CHARS} chữ)</small>
            </label>
            <div className="hanzi-form-row">
              <input
                id="hanzi-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={MAX_CHARS}
                placeholder="Ví dụ: 贵姓"
                lang="zh"
                autoComplete="off"
              />
              <button type="submit" className="gv-btn">
                Xem
              </button>
            </div>
          </form>

          <div className="hanzi-suggest" aria-label="Gợi ý">
            {SUGGESTIONS.map(([hanzi, hint]) => (
              <button
                key={hanzi}
                type="button"
                title={hint}
                aria-pressed={chars.join("") === hanzi}
                onClick={() => {
                  setInput(hanzi);
                  show(hanzi);
                }}
              >
                <span lang="zh">{hanzi}</span>
                <small>{hint}</small>
              </button>
            ))}
          </div>
        </>
      )}

      <div className="hanzi-toolbar">
        <div className="hanzi-seg" role="group" aria-label="Chế độ">
          <button type="button" aria-pressed={mode === "demo"} onClick={() => setMode("demo")}>
            Xem mẫu
          </button>
          <button type="button" aria-pressed={mode === "quiz"} onClick={() => setMode("quiz")}>
            Tự viết
          </button>
        </div>
        <button type="button" className="hanzi-action" onClick={() => setActionToken((t) => t + 1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d={ICONS.replay} />
          </svg>
          {mode === "demo" ? "Phát lại" : "Viết lại"}
        </button>
      </div>

      <div ref={boardRef} className="hanzi-board" style={{ gap: GAP }}>
        {chars.map((c, i) => (
          <CharCanvas key={`${i}-${c}`} char={c} mode={mode} actionToken={actionToken} size={size} showOutline={mode === "demo" || showOutline} />
        ))}
      </div>

      {mode === "quiz" && (
        <label className="hanzi-toggle">
          <input type="checkbox" checked={showOutline} onChange={(e) => setShowOutline(e.target.checked)} />
          <span>Hiện chữ mờ để tô theo</span>
        </label>
      )}
    </div>
  );
}
