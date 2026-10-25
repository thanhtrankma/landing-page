"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import {
  bestScope,
  gameWordHref,
  LEVEL_PICKS,
  MODES,
  MODE_PLACEHOLDER,
  isCorrect,
  makeDeck,
  pickWords,
  readBest,
  readPrefs,
  saveBest,
  savePrefs,
  shortMeaning,
  type AnswerMode,
  type GameWord,
  type LevelPick,
} from "./vocab-game";

// "Mưa từ vựng": meteors carrying hanzi fall; type the toneless pinyin or the meaning and press Enter to shoot the lowest
// matching one before it lands. The simulation lives in a ref; each frame copies what is drawn into state.

type Meteor = { id: number; word: GameWord; x: number; y: number; speed: number; hitAt?: number };
type Laser = { id: number; x: number; y: number; at: number };
type Phase = "ready" | "playing" | "paused" | "over";
type Prefs = { mode: AnswerMode; level: LevelPick; hints: boolean };

const LIVES = 3;
const POINTS = 10;
const PER_LEVEL = 100; // points per level
const BOOM_MS = 450;
const LASER_MS = 220;
const PREFS_KEY = "sl_meteor_prefs";
const bestKey = (p: Prefs, set?: string) => `sl_meteor_best_${p.mode}_${bestScope(p.level, set)}`;

/** Seconds a meteor takes to fall the whole way, and seconds between spawns, at a given level. */
const fallSeconds = (level: number) => Math.max(4.2, 11 * Math.pow(0.9, level - 1));
const spawnSeconds = (level: number) => Math.max(0.85, 2.6 * Math.pow(0.88, level - 1));
const maxOnScreen = (level: number) => Math.min(8, 2 + level);

/** Hint under each meteor: whatever the player is NOT asked for, so it helps without giving the answer away. */
function hintFor(word: GameWord, mode: AnswerMode): string {
  const [, pinyin, meaning, hanViet] = word;
  if (mode === "pinyin") return shortMeaning(meaning);
  if (mode === "meaning") return pinyin;
  return hanViet.toLowerCase();
}

type View = { meteors: Meteor[]; lasers: Laser[]; score: number; lives: number; level: number; hits: number; flash: number };
const EMPTY_VIEW: View = { meteors: [], lasers: [], score: 0, lives: LIVES, level: 1, hits: 0, flash: 0 };

/** `set` names a fixed word list (a lesson): it is played whole, without the HSK level choice, and keeps its own record. */
export default function VocabMeteor({ words, set }: { words: GameWord[]; set?: string }) {
  const [prefs, setPrefs] = useState<Prefs>({ mode: "pinyin", level: 1, hints: false });
  const [phase, setPhase] = useState<Phase>("ready");
  const [view, setView] = useState<View>(EMPTY_VIEW);
  const [missed, setMissed] = useState<GameWord[]>([]);
  const [best, setBest] = useState(0);
  const [answer, setAnswer] = useState("");
  const [wrong, setWrong] = useState(false);
  const [record, setRecord] = useState(false);
  const [announce, setAnnounce] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const game = useRef({
    meteors: [] as Meteor[],
    lasers: [] as Laser[],
    score: 0,
    lives: LIVES,
    hits: 0,
    flash: 0,
    nextId: 1,
    spawnIn: 0.4,
    clock: 0, // ms of play time, paused while not playing
    deck: makeDeck(words),
    missed: [] as GameWord[],
  });

  // Saved settings and record, read after mount (storage isn't available during server render).
  useEffect(() => {
    const p = readPrefs<Prefs>(PREFS_KEY, { mode: "pinyin", level: 1, hints: false });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from localStorage after hydration
    setPrefs(p);
    setBest(readBest(bestKey(p, set)));
  }, [set]);

  const updatePrefs = (patch: Partial<Prefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    savePrefs(PREFS_KEY, next);
    setBest(readBest(bestKey(next, set)));
  };

  const publish = useCallback(() => {
    const g = game.current;
    setView({
      meteors: g.meteors.map((m) => ({ ...m })),
      lasers: g.lasers.map((l) => ({ ...l })),
      score: g.score,
      lives: g.lives,
      level: 1 + Math.floor(g.score / PER_LEVEL),
      hits: g.hits,
      flash: g.flash,
    });
  }, []);

  const start = () => {
    const pool = set ? words : pickWords(words, prefs.level);
    game.current = {
      meteors: [],
      lasers: [],
      score: 0,
      lives: LIVES,
      hits: 0,
      flash: 0,
      nextId: 1,
      spawnIn: 0.3,
      clock: 0,
      deck: makeDeck(pool.length ? pool : words),
      missed: [],
    };
    setMissed([]);
    setRecord(false);
    setAnswer("");
    publish();
    setPhase("playing");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // Main loop: runs only while playing.
  useEffect(() => {
    if (phase !== "playing") return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const g = game.current;
      g.clock += dt * 1000;
      const level = 1 + Math.floor(g.score / PER_LEVEL);

      // spawn
      g.spawnIn -= dt;
      const live = g.meteors.filter((m) => m.hitAt === undefined);
      if (g.spawnIn <= 0 && live.length < maxOnScreen(level)) {
        const onScreen = new Set(live.map((m) => m.word[0]));
        const word = g.deck.draw((w) => onScreen.has(w[0]));
        // pick the column furthest from meteors still near the top, so labels don't overlap
        const top = live.filter((m) => m.y < 0.35);
        let x = 0.5;
        let bestGap = -1;
        for (let i = 0; i < 6; i++) {
          const cx = 0.1 + Math.random() * 0.8;
          const gap = top.length ? Math.min(...top.map((m) => Math.abs(m.x - cx))) : 1;
          if (gap > bestGap) [bestGap, x] = [gap, cx];
        }
        g.meteors.push({ id: g.nextId++, word, x, y: 0, speed: (1 / fallSeconds(level)) * (0.85 + Math.random() * 0.3) });
        g.spawnIn = spawnSeconds(level) * (0.75 + Math.random() * 0.5);
      }

      // fall, land, clean up
      for (const m of g.meteors) {
        if (m.hitAt !== undefined) continue;
        m.y += m.speed * dt;
        if (m.y >= 1) {
          m.hitAt = -g.clock; // negative marks "landed" (no explosion score)
          g.lives -= 1;
          g.flash = g.clock;
          if (!g.missed.some((w) => w[5] === m.word[5])) g.missed.push(m.word);
        }
      }
      g.meteors = g.meteors.filter((m) => m.hitAt === undefined || g.clock - Math.abs(m.hitAt) < BOOM_MS);
      g.lasers = g.lasers.filter((l) => g.clock - l.at < LASER_MS);
      publish();

      if (g.lives <= 0) {
        setMissed([...g.missed]);
        setRecord(g.score > 0 && g.score > readBest(bestKey(prefs, set)));
        setBest(saveBest(bestKey(prefs, set), g.score));
        setPhase("over");
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [phase, prefs, publish, set]);

  // Pause when the tab is hidden; Esc toggles pause.
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

  const fire = (e: FormEvent) => {
    e.preventDefault();
    if (phase !== "playing" || !answer.trim()) return;
    const g = game.current;
    const target = g.meteors
      .filter((m) => m.hitAt === undefined && isCorrect(m.word, answer, prefs.mode))
      .sort((a, b) => b.y - a.y)[0];
    if (!target) {
      setWrong(true);
      setTimeout(() => setWrong(false), 380);
      return;
    }
    target.hitAt = g.clock;
    g.score += POINTS;
    g.hits += 1;
    g.lasers.push({ id: target.id, x: target.x, y: target.y, at: g.clock });
    setAnswer("");
    setAnnounce(`Đúng: ${target.word[0]}, ${target.word[1]}, ${shortMeaning(target.word[2])}`);
    publish();
  };

  const level = view.level;
  const fallPct = 86; // meteors fall over the top 86% of the field; the ground takes the rest

  return (
    <div className="vg vg-meteor">
      <div className="vg-hud">
        <span>
          Điểm <b>{view.score}</b>
        </span>
        <span>
          Level <b>{level}</b>
        </span>
        <span className="vg-lives" aria-label={`Còn ${view.lives} mạng`}>
          {Array.from({ length: LIVES }, (_, i) => (
            <i key={i} className={i < view.lives ? "on" : ""} aria-hidden="true" />
          ))}
        </span>
        <span className="vg-best">
          Kỷ lục <b>{Math.max(best, view.score)}</b>
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

      <div className="vg-field meteor-field">
        <div className="meteor-stars" aria-hidden="true" />
        {view.flash > 0 && <div key={view.flash} className="vg-hurt" aria-hidden="true" />}
        {view.meteors.map((m) => {
          const landed = m.hitAt !== undefined && m.hitAt < 0;
          const hit = m.hitAt !== undefined && m.hitAt >= 0;
          return (
            <div
              key={m.id}
              className={`meteor${hit ? " boom" : ""}${landed ? " landed" : ""}${m.word[0].length > 2 ? " long" : ""}`}
              style={{ left: `${m.x * 100}%`, top: `${Math.min(m.y, 1) * fallPct}%` }}
              aria-hidden="true"
            >
              <span className="meteor-core">{m.word[0]}</span>
              {prefs.hints && !hit && <span className="meteor-hint">{hintFor(m.word, prefs.mode)}</span>}
              {hit && <span className="meteor-score">+{POINTS}</span>}
            </div>
          );
        })}
        <svg className="meteor-lasers" aria-hidden="true">
          {view.lasers.map((l) => (
            <line key={l.id} x1="50%" y1="100%" x2={`${l.x * 100}%`} y2={`${Math.min(l.y, 1) * fallPct}%`} />
          ))}
        </svg>
        <div className="meteor-ground" aria-hidden="true">
          <span className="meteor-cannon" />
        </div>

        {phase === "ready" && (
          <div className="vg-overlay">
            <h2>Mưa từ vựng</h2>
            <p>Gõ đúng để bắn hạ chữ Hán trước khi chạm đất. Bạn có {LIVES} mạng.</p>
            <Settings prefs={prefs} onChange={updatePrefs} showHints showLevel={!set} />
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
              <b>{view.score}</b> điểm · level {level} · bắn hạ {view.hits} từ
              {record && <em> · Kỷ lục mới!</em>}
            </p>
            <div className="vg-over-actions">
              <button type="button" className="gv-btn vg-start" onClick={start}>
                Chơi lại
              </button>
              <button type="button" className="vg-link" onClick={() => setPhase("ready")}>
                Đổi chế độ
              </button>
            </div>
            {missed.length > 0 && <MissedList words={missed} />}
          </div>
        )}
      </div>

      <form className={`vg-answer${wrong ? " wrong" : ""}`} onSubmit={fire}>
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
          Bắn
        </button>
      </form>
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  );
}

export function Settings({
  prefs,
  onChange,
  showHints = false,
  showLevel = true,
}: {
  prefs: { mode: AnswerMode; level: LevelPick; hints?: boolean };
  onChange: (p: { mode?: AnswerMode; level?: LevelPick; hints?: boolean }) => void;
  showHints?: boolean;
  showLevel?: boolean;
}) {
  return (
    <div className="vg-settings">
      {showLevel && (
        <div className="vg-setting">
          <span>Bộ từ</span>
          <div className="vg-seg" role="group" aria-label="Bộ từ">
            {LEVEL_PICKS.map(([v, label]) => (
              <button key={v} type="button" aria-pressed={prefs.level === v} onClick={() => onChange({ level: v })}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="vg-setting">
        <span>Gõ đáp án</span>
        <div className="vg-seg" role="group" aria-label="Kiểu đáp án">
          {MODES.map(([v, label]) => (
            <button key={v} type="button" aria-pressed={prefs.mode === v} onClick={() => onChange({ mode: v })}>
              {label}
            </button>
          ))}
        </div>
      </div>
      {showHints && (
        <label className="vg-check">
          <input type="checkbox" checked={!!prefs.hints} onChange={(e) => onChange({ hints: e.target.checked })} />
          Hiện gợi ý dưới chữ
        </label>
      )}
    </div>
  );
}

export function MissedList({ words, title = "Ôn lại các từ bị lọt" }: { words: GameWord[]; title?: string }) {
  return (
    <div className="vg-missed">
      <h3>{title}</h3>
      <ul>
        {words.map((w) => (
          <li key={w[5]}>
            <Link href={gameWordHref(w)} target="_blank">
              <b>{w[0]}</b>
              <span>{w[1]}</span>
              <small>{shortMeaning(w[2])}</small>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
