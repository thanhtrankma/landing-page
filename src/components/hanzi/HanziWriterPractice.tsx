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
const SIZE = 240;

const SUGGESTIONS: [hanzi: string, hint: string][] = [
  ["你好", "nǐ hǎo · xin chào"],
  ["谢谢", "xièxie · cảm ơn"],
  ["中国", "Zhōngguó · Trung Quốc"],
  ["学习", "xuéxí · học tập"],
  ["爱", "ài · yêu"],
  ["永", "yǒng · đủ 8 nét cơ bản"],
];

function CharCanvas({ char, mode, replayToken }: { char: string; mode: Mode; replayToken: number }) {
  const targetRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<ReturnType<typeof HanziWriter.create> | null>(null);
  const lastReplayToken = useRef(replayToken);
  const [quizResult, setQuizResult] = useState<"correct" | "mistake" | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;
    target.innerHTML = "";
    setLoadError(false);
    setQuizResult(null);

    const writer = HanziWriter.create(target, char, {
      width: SIZE,
      height: SIZE,
      padding: 12,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 250,
      showOutline: true,
      outlineColor: "#d3e6f2",
      strokeColor: INK,
      radicalColor: SKY_700,
      highlightColor: "#4fb3e0",
      drawingColor: SKY_600,
      drawingWidth: 16,
      onLoadCharDataError: () => setLoadError(true),
    });
    writerRef.current = writer;

    if (mode === "demo") {
      writer.animateCharacter();
    } else {
      writer.quiz({
        onComplete: () => setQuizResult("correct"),
        onMistake: () => setQuizResult("mistake"),
      });
    }

    return () => {
      writerRef.current = null;
    };
  }, [char, mode]);

  useEffect(() => {
    if (replayToken === lastReplayToken.current) return;
    lastReplayToken.current = replayToken;
    writerRef.current?.animateCharacter();
  }, [replayToken]);

  return (
    <div className="hanzi-cell">
      <div
        ref={targetRef}
        className="hanzi-canvas"
        style={{ backgroundImage: GRID_BACKGROUND, cursor: mode === "quiz" ? BRUSH_CURSOR : undefined }}
      />
      {loadError && <p className="hanzi-note warn">Không tìm thấy dữ liệu nét viết cho “{char}”, thử một chữ khác.</p>}
      {mode === "quiz" && (
        <p className="hanzi-note">
          {quizResult === "correct" && <span className="ok">Chính xác! 🎉</span>}
          {quizResult === "mistake" && <span className="warn">Sai nét rồi, thử lại nét đó xem.</span>}
          {quizResult === null && <span>Vẽ từng nét theo đúng thứ tự.</span>}
        </p>
      )}
    </div>
  );
}

function toChars(text: string): string[] {
  return [...text.replace(/\s+/g, "")].slice(0, MAX_CHARS);
}

export default function HanziWriterPractice({ initialChar = "你好" }: { initialChar?: string }) {
  const [chars, setChars] = useState(() => toChars(initialChar));
  const [input, setInput] = useState(initialChar);
  const [mode, setMode] = useState<Mode>("demo");
  const [replayToken, setReplayToken] = useState(0);

  function show(text: string) {
    const next = toChars(text);
    if (next.length > 0) setChars(next);
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    show(input);
  }

  return (
    <div className="hanzi-practice">
      <form onSubmit={handleSearch} className="hanzi-form">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={MAX_CHARS}
          placeholder="Nhập một hoặc nhiều chữ Hán, ví dụ: 贵姓"
          aria-label="Chữ Hán cần luyện"
          lang="zh"
        />
        <button type="submit" className="gv-btn">
          Xem
        </button>
      </form>

      <div className="hanzi-suggest">
        {SUGGESTIONS.map(([hanzi, hint]) => (
          <button
            key={hanzi}
            type="button"
            title={hint}
            className={chars.join("") === hanzi ? "on" : undefined}
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

      <div className="hanzi-board">
        {chars.map((c, i) => (
          <CharCanvas key={`${i}-${c}`} char={c} mode={mode} replayToken={replayToken} />
        ))}
      </div>

      <div className="hanzi-modes">
        <button type="button" onClick={() => setMode("demo")} className={mode === "demo" ? "on" : undefined}>
          Xem mẫu
        </button>
        <button type="button" onClick={() => setMode("quiz")} className={mode === "quiz" ? "on" : undefined}>
          Tự viết (đố vui)
        </button>
        {mode === "demo" && (
          <button type="button" onClick={() => setReplayToken((t) => t + 1)} aria-label="Xem lại" className="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
