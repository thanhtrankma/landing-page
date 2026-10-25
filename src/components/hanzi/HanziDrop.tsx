"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { posLabel, wordHref } from "@/lib/hsk-text";
import SpeakButton from "./SpeakButton";
import { MissedList, Settings } from "./VocabMeteor";
import {
  MODE_PLACEHOLDER,
  answerSlots,
  isCorrect,
  makeDeck,
  maskText,
  openLetters,
  pickWords,
  readBest,
  readPrefs,
  saveBest,
  savePrefs,
  shortMeaning,
  type AnswerMode,
  type GameWord,
  type LevelPick,
  type Slot,
} from "./vocab-game";

// "Chữ Hán rơi": one word falls at a time. Each depth mark it passes opens more letters of the crossword on the card
// (plus the next hint in the list, while there is one) and lowers the points.
// Like VocabMeteor, the round state lives in a ref and each frame copies what is drawn into state.

type Phase = "ready" | "playing" | "paused" | "over";
type Status = "falling" | "correct" | "missed";
type Round = { word: GameWord; y: number; status: Status; doneAt: number; points: number };
type Played = { word: GameWord; ok: boolean; points: number; id: number };
type Prefs = { mode: AnswerMode; level: LevelPick };

const LIVES = 3;
const MARKS = [0.2, 0.4, 0.6, 0.8];
const MAX_POINTS = 50;
const HINT_COST = 10;
const MIN_POINTS = 10;
const PER_LEVEL = 5; // correct answers per level
const NEXT_AFTER_OK = 700;
const NEXT_AFTER_MISS = 1800;
const PREFS_KEY = "sl_drop_prefs";
const bestKey = (p: Prefs) => `sl_drop_best_${p.mode}_${p.level}`;

const fallSeconds = (level: number) => Math.max(5, 14 * Math.pow(0.88, level - 1));
const pointsFor = (hints: number) => Math.max(MIN_POINTS, MAX_POINTS - hints * HINT_COST);
const hintsOpen = (y: number) => MARKS.filter((m) => y >= m).length;

/** Hints listed under the field, in opening order. The crossword on the card already spells out the answer letter by
 * letter, so these only add what it doesn't show, and none of them is itself an accepted answer for the mode. */
function hintsFor(word: GameWord, mode: AnswerMode): [label: string, value: string][] {
  const [, pinyin, meaning, hanViet, , , pos] = word;
  const posText = pos.length ? pos.map(posLabel).join(", ") : "—";
  if (mode === "pinyin")
    return [
      ["Hán Việt", hanViet],
      ["Nghĩa", meaning],
    ];
  if (mode === "meaning")
    return [
      ["Từ loại", posText],
      ["Pinyin", pinyin],
    ];
  return [
    ["Từ loại", posText],
    ["Nghĩa", maskText(shortMeaning(meaning))],
  ];
}

/** The crossword under the hanzi, "x_ ____": one underlined group per syllable (or word), letters filled in as they open. */
function Crossword({ slots, open }: { slots: Slot[][]; open: Set<number> | null }) {
  let n = 0;
  const groups = slots.map((g) => g.map((s) => (s.letter ? { c: s.c, shown: !open || open.has(n++), letter: true } : { c: s.c, shown: true, letter: false })));
  const label = groups.map((g) => g.map((s) => (s.shown ? s.c : "_")).join("")).join(" ");
  return (
    <span className="drop-cross" role="img" aria-label={`Gợi ý ô chữ: ${label}`}>
      {groups.map((g, k) => (
        <span key={k} className="drop-cross-word">
          {g.map((s, i) => (
            <i key={i} className={s.letter ? (s.shown ? "on" : "") : "mark"}>
              {s.shown ? s.c : ""}
            </i>
          ))}
        </span>
      ))}
    </span>
  );
}

type View = { round: Round | null; score: number; lives: number; level: number; streak: number };

export default function HanziDrop({ words }: { words: GameWord[] }) {
  const [prefs, setPrefs] = useState<Prefs>({ mode: "pinyin", level: 1 });
  const [phase, setPhase] = useState<Phase>("ready");
  const [view, setView] = useState<View>({ round: null, score: 0, lives: LIVES, level: 1, streak: 0 });
  const [history, setHistory] = useState<Played[]>([]);
  const [summary, setSummary] = useState({ correct: 0, bestStreak: 0, record: false });
  const [best, setBest] = useState(0);
  const [answer, setAnswer] = useState("");
  const [wrong, setWrong] = useState(false);
  const [announce, setAnnounce] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const game = useRef({
    round: null as Round | null,
    score: 0,
    lives: LIVES,
    correct: 0,
    streak: 0,
    bestStreak: 0,
    clock: 0,
    nextId: 1,
    deck: makeDeck(words),
    played: [] as Played[],
  });

  useEffect(() => {
    const p = readPrefs<Prefs>(PREFS_KEY, { mode: "pinyin", level: 1 });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from localStorage after hydration
    setPrefs(p);
    setBest(readBest(bestKey(p)));
  }, []);

  const updatePrefs = (patch: Partial<Prefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    savePrefs(PREFS_KEY, next);
    setBest(readBest(bestKey(next)));
  };

  const publish = useCallback(() => {
    const g = game.current;
    setView({ round: g.round && { ...g.round }, score: g.score, lives: g.lives, level: 1 + Math.floor(g.correct / PER_LEVEL), streak: g.streak });
  }, []);

  const record = useCallback((word: GameWord, ok: boolean, points: number) => {
    const g = game.current;
    g.played = [{ word, ok, points, id: g.nextId++ }, ...g.played].slice(0, 60);
    setHistory(g.played);
  }, []);

  const start = () => {
    const pool = pickWords(words, prefs.level);
    const deck = makeDeck(pool.length ? pool : words);
    game.current = { round: { word: deck.draw(), y: 0, status: "falling", doneAt: 0, points: 0 }, score: 0, lives: LIVES, correct: 0, streak: 0, bestStreak: 0, clock: 0, nextId: 1, deck, played: [] };
    setHistory([]);
    setAnswer("");
    publish();
    setPhase("playing");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  useEffect(() => {
    if (phase !== "playing") return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const g = game.current;
      g.clock += dt * 1000;
      const r = g.round;
      if (r) {
        if (r.status === "falling") {
          r.y += dt / fallSeconds(1 + Math.floor(g.correct / PER_LEVEL));
          if (r.y >= 1) {
            r.y = 1;
            r.status = "missed";
            r.doneAt = g.clock;
            g.lives -= 1;
            g.streak = 0;
            record(r.word, false, 0);
            setAnnounce(`Lọt: ${r.word[0]}, ${r.word[1]}, ${shortMeaning(r.word[2])}`);
          }
        } else if (g.clock - r.doneAt > (r.status === "correct" ? NEXT_AFTER_OK : NEXT_AFTER_MISS)) {
          if (g.lives <= 0) {
            publish();
            setSummary({ correct: g.correct, bestStreak: g.bestStreak, record: g.score > 0 && g.score > readBest(bestKey(prefs)) });
            setBest(saveBest(bestKey(prefs), g.score));
            setPhase("over");
            return;
          }
          g.round = { word: g.deck.draw((w) => w[0] === r.word[0]), y: 0, status: "falling", doneAt: 0, points: 0 };
        }
      }
      publish();
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [phase, prefs, publish, record]);

  useEffect(() => {
    const onHide = () => document.hidden && setPhase((p) => (p === "playing" ? "paused" : p));
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setPhase((p) => (p === "playing" ? "paused" : p === "paused" ? "playing" : p));
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (phase === "playing") inputRef.current?.focus();
  }, [phase]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const g = game.current;
    const r = g.round;
    if (phase !== "playing" || !r || r.status !== "falling" || !answer.trim()) return;
    if (!isCorrect(r.word, answer, prefs.mode)) {
      setWrong(true);
      setTimeout(() => setWrong(false), 380);
      return;
    }
    const points = pointsFor(hintsOpen(r.y));
    r.status = "correct";
    r.doneAt = g.clock;
    r.points = points;
    g.score += points;
    g.correct += 1;
    g.streak += 1;
    g.bestStreak = Math.max(g.bestStreak, g.streak);
    record(r.word, true, points);
    setAnswer("");
    setAnnounce(`Đúng, cộng ${points} điểm: ${r.word[0]}, ${r.word[1]}`);
    publish();
  };

  const skip = () => {
    const g = game.current;
    const r = g.round;
    if (phase !== "playing" || !r || r.status !== "falling") return;
    r.status = "missed";
    r.doneAt = g.clock;
    g.lives -= 1;
    g.streak = 0;
    record(r.word, false, 0);
    setAnswer("");
    publish();
    inputRef.current?.focus();
  };

  const r = view.round;
  const open = r ? (r.status === "falling" ? hintsOpen(r.y) : 4) : 0;
  const hints = r ? hintsFor(r.word, prefs.mode) : [];
  const slots = r ? answerSlots(r.word, prefs.mode) : [];
  const letters = r && r.status === "falling" ? openLetters(slots, open, MARKS.length, r.word[5]) : null;
  const nowPoints = r && r.status === "falling" ? pointsFor(open) : 0;

  return (
    <div className="vg vg-drop">
      <div className="drop-main">
        <div className="vg-hud">
          <span>
            Điểm <b>{view.score}</b>
          </span>
          <span>
            Level <b>{view.level}</b>
          </span>
          <span>
            Chuỗi <b>{view.streak}</b>
          </span>
          <span className="vg-lives" aria-label={`Còn ${view.lives} mạng`}>
            {Array.from({ length: LIVES }, (_, i) => (
              <i key={i} className={i < view.lives ? "on" : ""} aria-hidden="true" />
            ))}
          </span>
          {(phase === "playing" || phase === "paused") && (
            <button type="button" className="vg-pause" onClick={() => setPhase(phase === "playing" ? "paused" : "playing")} aria-label={phase === "playing" ? "Tạm dừng" : "Tiếp tục"}>
              {phase === "playing" ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M7 5v14l12-7z" /></svg>
              )}
            </button>
          )}
        </div>

        <div className="vg-field drop-field">
          <div className="drop-depth" aria-hidden="true">
            <i style={{ height: `${(r?.y ?? 0) * 100}%` }} />
            {MARKS.map((m, k) => (
              <span key={m} className={open > k ? "on" : ""} style={{ top: `${m * 100}%` }}>
                {k + 1}
              </span>
            ))}
          </div>
          <div className="drop-lane">
            {view.lives < LIVES && <div key={view.lives} className="vg-hurt" aria-hidden="true" />}
            {r && (
              <div className={`drop-card ${r.status}`} style={{ top: `${r.y * 100}%`, "--y": r.y } as CSSProperties}>
                <span className="drop-hanzi">{r.word[0]}</span>
                {r.status !== "missed" && <Crossword slots={slots} open={letters} />}
                {r.status === "falling" && <span className="drop-points">+{nowPoints}</span>}
                {r.status === "correct" && <span className="drop-points ok">+{r.points}</span>}
                {r.status === "missed" && (
                  <span className="drop-reveal">
                    {r.word[1]} · {shortMeaning(r.word[2])}
                  </span>
                )}
              </div>
            )}
            <div className="drop-floor" aria-hidden="true" />
          </div>

          {phase === "ready" && (
            <div className="vg-overlay">
              <h2>Chữ Hán rơi</h2>
              <p>Đoán từ trước khi chữ chạm đáy. Càng đoán sớm càng nhiều điểm, mỗi mốc độ sâu lộ thêm chữ cái trong ô chữ và bớt {HINT_COST} điểm.</p>
              <Settings prefs={prefs} onChange={updatePrefs} />
              <button type="button" className="gv-btn vg-start" onClick={start}>
                Bắt đầu chơi
              </button>
              {best > 0 && <small>Kỷ lục của bạn: {best} điểm</small>}
            </div>
          )}
          {phase === "paused" && (
            <div className="vg-overlay">
              <h2>Tạm dừng</h2>
              <button type="button" className="gv-btn vg-start" onClick={() => setPhase("playing")}>
                Tiếp tục
              </button>
              <button type="button" className="vg-link" onClick={() => setPhase("ready")}>
                Chơi lại từ đầu
              </button>
            </div>
          )}
          {phase === "over" && (
            <div className="vg-overlay vg-over">
              <h2>Hết mạng!</h2>
              <p className="vg-final">
                <b>{view.score}</b> điểm · đúng {summary.correct} từ · chuỗi dài nhất {summary.bestStreak}
                {summary.record && <em> · Kỷ lục mới!</em>}
              </p>
              <div className="vg-over-actions">
                <button type="button" className="gv-btn vg-start" onClick={start}>
                  Chơi lại
                </button>
                <button type="button" className="vg-link" onClick={() => setPhase("ready")}>
                  Đổi chế độ
                </button>
              </div>
              {history.some((h) => !h.ok) && <MissedList words={[...new Map(history.filter((h) => !h.ok).map((h) => [h.word[5], h.word])).values()]} />}
            </div>
          )}
        </div>

        <ol className="drop-hints" aria-label="Gợi ý">
          {(hints.length ? hints : hintsFor(["", "", "", "", 1, "", []], prefs.mode).map(([label]) => [label, ""] as [string, string])).map(([label, value], k) => (
            <li key={k} className={open > k ? "on" : ""}>
              <small>
                {k + 1}. {label}
              </small>
              <b>{open > k ? value : "?"}</b>
            </li>
          ))}
        </ol>

        <form className={`vg-answer${wrong ? " wrong" : ""}`} onSubmit={submit}>
          <input
            ref={inputRef}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={MODE_PLACEHOLDER[prefs.mode]}
            aria-label="Đáp án"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="send"
            disabled={phase !== "playing"}
          />
          <button type="submit" className="gv-btn" disabled={phase !== "playing"}>
            Trả lời
          </button>
          <button type="button" className="vg-skip" onClick={skip} disabled={phase !== "playing" || r?.status !== "falling"} title="Bỏ qua từ này (mất 1 mạng)">
            Bỏ qua
          </button>
        </form>
        <p className="sr-only" aria-live="polite">
          {announce}
        </p>
      </div>

      <aside className="drop-history" aria-label="Từ đã rơi">
        <h3>
          Từ đã rơi <small>{history.length}</small>
        </h3>
        {history.length === 0 ? (
          <p className="drop-empty">Các từ đã rơi qua sẽ hiện ở đây, kèm pinyin và nghĩa để bạn ôn lại.</p>
        ) : (
          <ul>
            {history.map((h) => (
              <li key={h.id} className={h.ok ? "ok" : "miss"}>
                <span className="drop-mark" aria-label={h.ok ? "Đúng" : "Lọt"}>
                  {h.ok ? "✓" : "✗"}
                </span>
                <Link href={wordHref(h.word[5])} target="_blank" title="Mở trong Từ điển HSK">
                  <b>{h.word[0]}</b>
                  <span>
                    {h.word[1]}
                    <small>{shortMeaning(h.word[2])}</small>
                  </span>
                </Link>
                {h.ok && <em>+{h.points}</em>}
                <SpeakButton text={h.word[0]} small />
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
