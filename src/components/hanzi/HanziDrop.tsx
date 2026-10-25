"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { posLabel, wordHref } from "@/lib/hsk-text";
import SpeakButton from "./SpeakButton";
import { MissedList, Settings } from "./VocabMeteor";
import {
  answerSlots,
  letterMatches,
  makeDeck,
  maskText,
  pickWords,
  readBest,
  readPrefs,
  revealCount,
  revealOrder,
  saveBest,
  savePrefs,
  shortMeaning,
  type AnswerMode,
  type GameWord,
  type LevelPick,
  type Slot,
} from "./vocab-game";

// "Chữ Hán rơi": one word falls at a time and the player shoots its crossword letter by letter from the gun below.
// A right letter lands in the next empty slot, a wrong one bounces off and knocks the card lower. Each depth mark the
// card passes opens more letters (plus the next hint in the list, while there is one) and lowers the points.
// Like VocabMeteor, the round state lives in a ref and each frame copies what is drawn into state.

type Phase = "ready" | "playing" | "paused" | "over";
type Status = "falling" | "correct" | "missed";
/** `letters` are the crossword's letters left to right; `open` holds the indexes the depth marks gave away, `typed` the ones shot in. */
type Round = { word: GameWord; y: number; status: Status; doneAt: number; points: number; slots: Slot[][]; letters: string[]; order: number[]; open: number[]; typed: number[] };
type Shot = { id: number; ch: string; ok: boolean; slot: number; dir: 1 | -1 };
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
const KNOCK = 0.04; // how far a wrong letter pushes the card down
const GUN_PIVOT = 16; // px from the cannon's bottom to the barrel's trunnion, as in drop.css
const GUN_BARREL = 38; // px from the trunnion to the muzzle
const PREFS_KEY = "sl_drop_prefs";
const GUN_PLACEHOLDER: Record<AnswerMode, string> = {
  pinyin: "Gõ từng chữ cái pinyin để bắn",
  meaning: "Gõ từng chữ cái của nghĩa, không cần dấu",
  both: "Gõ từng chữ cái pinyin để bắn",
};
const bestKey = (p: Prefs) => `sl_drop_best_${p.mode}_${p.level}`;

const fallSeconds = (level: number) => Math.max(5, 14 * Math.pow(0.88, level - 1));
const pointsFor = (hints: number) => Math.max(MIN_POINTS, MAX_POINTS - hints * HINT_COST);
const hintsOpen = (y: number) => MARKS.filter((m) => y >= m).length;

function newRound(word: GameWord, mode: AnswerMode): Round {
  const slots = answerSlots(word, mode);
  const letters = slots.flat().filter((s) => s.letter).map((s) => s.c);
  return { word, y: 0, status: "falling", doneAt: 0, points: 0, slots, letters, order: revealOrder(slots, word[5]), open: [], typed: [] };
}

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

/** The crossword under the hanzi, "x_ ____": one underlined group per syllable (or word); `filled` letters show, null shows all. */
function Crossword({ slots, filled }: { slots: Slot[][]; filled: Set<number> | null }) {
  let n = 0;
  const groups = slots.map((g) => g.map((s) => (s.letter ? { c: s.c, shown: !filled || filled.has(n), letter: true, slot: n++ } : { c: s.c, shown: true, letter: false, slot: -1 })));
  const label = groups.map((g) => g.map((s) => (s.shown ? s.c : "_")).join("")).join(" ");
  return (
    <span className="drop-cross" role="img" aria-label={`Gợi ý ô chữ: ${label}`}>
      {groups.map((g, k) => (
        <span key={k} className="drop-cross-word">
          {g.map((s, i) => (
            <i key={i} className={s.letter ? (s.shown ? "on" : "") : "mark"} data-slot={s.letter ? s.slot : undefined}>
              {s.shown ? s.c : ""}
            </i>
          ))}
        </span>
      ))}
    </span>
  );
}

/** The cannon under the lane: an iron barrel on a wooden carriage. The barrel turns on its trunnion toward each shot (--aim). */
function Cannon() {
  return (
    <div className="drop-gun" aria-hidden="true">
      <svg className="drop-gun-barrel" viewBox="0 0 24 48" width="24" height="48">
        <defs>
          <linearGradient id="drop-gun-iron" x1="0" x2="1">
            <stop offset="0" stopColor="#16222e" />
            <stop offset="0.32" stopColor="#5b7894" />
            <stop offset="0.62" stopColor="#2c4157" />
            <stop offset="1" stopColor="#101922" />
          </linearGradient>
        </defs>
        <g className="drop-gun-flash">
          <path d="M12 -11 L14.2 -5.5 L19.5 -7 L16 -2.6 L20 1 L12 -0.6 L4 1 L8 -2.6 L4.5 -7 L9.8 -5.5 Z" fill="#ffb347" />
          <circle cx="12" cy="-3.5" r="3" fill="#fff4c2" />
        </g>
        <circle cx="12" cy="45" r="2.6" fill="url(#drop-gun-iron)" />
        <path d="M5 41 C4 36 5 30 6 26 L8.5 7 H15.5 L18 26 C19 30 20 36 19 41 C17 45 7 45 5 41 Z" fill="url(#drop-gun-iron)" />
        <rect x="5.4" y="25" width="13.2" height="3.6" rx="1.6" fill="url(#drop-gun-iron)" stroke="#0d151d" strokeWidth="0.6" />
        <rect x="7.5" y="13" width="9" height="2.4" rx="1.1" fill="url(#drop-gun-iron)" stroke="#0d151d" strokeWidth="0.5" />
        <rect x="6.4" y="1.4" width="11.2" height="6.2" rx="2" fill="url(#drop-gun-iron)" stroke="#0d151d" strokeWidth="0.6" />
        <ellipse cx="12" cy="2.3" rx="3.4" ry="1.1" fill="#070c11" />
        <path d="M9.2 9 L7.4 25 M8.9 29.5 L8 40" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
      <svg className="drop-gun-carriage" viewBox="0 0 72 34" width="72" height="34">
        <defs>
          <linearGradient id="drop-gun-wood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b8804f" />
            <stop offset="1" stopColor="#7a4a28" />
          </linearGradient>
        </defs>
        <ellipse cx="36" cy="32.6" rx="31" ry="1.8" fill="#0b3c64" fillOpacity="0.18" />
        <path d="M14 25 L24 9 C25 7.6 26.4 7 28 7 H44 C45.6 7 47 7.6 48 9 L58 25 Z" fill="url(#drop-gun-wood)" stroke="#4a2d18" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M21 17 H51" stroke="#4a2d18" strokeOpacity="0.45" strokeWidth="1" />
        <rect x="10" y="22" width="52" height="4" rx="2" fill="#3b2a1d" />
        <circle cx="36" cy="18" r="4.4" fill="url(#drop-gun-iron)" stroke="#0d151d" strokeWidth="0.7" />
        <circle cx="36" cy="18" r="1.5" fill="#0d151d" />
        {[17, 55].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="23" r="9.2" fill="#8a5a33" stroke="#2f2014" strokeWidth="2.2" />
            <path d={`M${cx - 7.4} 23 H${cx + 7.4} M${cx} 15.6 V30.4 M${cx - 5.2} 17.8 L${cx + 5.2} 28.2 M${cx + 5.2} 17.8 L${cx - 5.2} 28.2`} stroke="#2f2014" strokeWidth="1.5" />
            <circle cx={cx} cy="23" r="2.6" fill="url(#drop-gun-iron)" />
          </g>
        ))}
      </svg>
    </div>
  );
}

/** One fired letter: flies from the gun's muzzle to the slot it aims at, then lands there or bounces off the card. */
function ShotFx({ shot, onDone }: { shot: Shot; onDone: (id: number) => void }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    const field = el?.parentElement;
    const gun = field?.querySelector<HTMLElement>(".drop-gun");
    const card = field?.querySelector<HTMLElement>(".drop-card");
    const target = field?.querySelector(`[data-slot="${shot.slot}"]`) ?? card;
    if (!el || !field || !gun || !card || !target) return onDone(shot.id);
    const box = field.getBoundingClientRect();
    const g = gun.getBoundingClientRect();
    const t = target.getBoundingClientRect();
    const pivot = { x: g.left + g.width / 2 - box.left, y: g.bottom - GUN_PIVOT - box.top };
    const to = { x: t.left + t.width / 2 - box.left, y: t.top + t.height / 2 - box.top };
    const angle = Math.max(-1.2, Math.min(1.2, Math.atan2(to.x - pivot.x, pivot.y - to.y)));
    const from = { x: pivot.x + Math.sin(angle) * GUN_BARREL, y: pivot.y - Math.cos(angle) * GUN_BARREL };
    gun.style.setProperty("--aim", `${angle}rad`);
    // the barrel kicks back along its own axis, the carriage bumps, the muzzle flashes
    const kick = `${-Math.sin(angle) * 6}px ${Math.cos(angle) * 6}px`;
    gun.querySelector(".drop-gun-barrel")?.animate([{ translate: kick }, { translate: "0 0" }], { duration: 220, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" });
    gun.querySelector(".drop-gun-carriage")?.animate([{ translate: "0 2px" }, { translate: "0 0" }], { duration: 160, easing: "ease-out" });
    gun.querySelector(".drop-gun-flash")?.animate([{ opacity: 1, scale: "0.6" }, { opacity: 0, scale: "1.6" }], { duration: 200, easing: "ease-out" });

    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const at = ({ x, y }: { x: number; y: number }, turn = 0) => `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${turn}deg)`;
    const flight = still ? 1 : Math.max(110, Math.hypot(to.x - from.x, to.y - from.y) / 2.6);
    let anim: Animation;
    if (shot.ok) {
      anim = el.animate([{ transform: at(from), opacity: 1 }, { transform: at(to), opacity: 1 }], { duration: flight, easing: "cubic-bezier(0.2, 0.6, 0.4, 1)" });
    } else {
      // hits the underside of the card, pops up and away, then falls out of the field
      const hit = { x: to.x, y: card.getBoundingClientRect().bottom - box.top };
      const d = still ? 0 : shot.dir;
      const bounce = 600;
      const total = flight + bounce;
      anim = el.animate(
        [
          { transform: at(from), opacity: 1, easing: "linear" },
          { transform: at(hit), opacity: 1, offset: flight / total, easing: "ease-out" },
          { transform: at({ x: hit.x + d * 80, y: hit.y - 36 * Math.abs(d) }, d * 220), opacity: 1, offset: (flight + bounce * 0.35) / total, easing: "ease-in" },
          { transform: at({ x: hit.x + d * 170, y: hit.y + 150 * Math.abs(d) }, d * 520), opacity: 0 },
        ],
        { duration: total },
      );
      card.animate([{ rotate: "0deg" }, { rotate: `${-shot.dir * 5}deg` }, { rotate: `${shot.dir * 3}deg` }, { rotate: "0deg" }], { duration: still ? 1 : 320, delay: flight });
    }
    anim.onfinish = () => onDone(shot.id);
    return () => anim.cancel();
  }, [shot, onDone]);
  return (
    <span ref={ref} className={`drop-shot ${shot.ok ? "ok" : "bad"}`} aria-hidden="true">
      {shot.ch}
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
  const [shots, setShots] = useState<Shot[]>([]);
  const [wrong, setWrong] = useState(false);
  const [announce, setAnnounce] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const composing = useRef(false);

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
    game.current = { round: newRound(deck.draw(), prefs.mode), score: 0, lives: LIVES, correct: 0, streak: 0, bestStreak: 0, clock: 0, nextId: 1, deck, played: [] };
    setHistory([]);
    setShots([]);
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
          // open the letters this depth allows, but never the last one the player still has to shoot
          const want = revealCount(r.letters.length, hintsOpen(r.y), MARKS.length);
          while (r.open.length < want) {
            const hidden = r.order.filter((i) => !r.open.includes(i) && !r.typed.includes(i));
            if (hidden.length <= 1) break;
            r.open = [...r.open, hidden[0]];
          }
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
          g.round = newRound(g.deck.draw((w) => w[0] === r.word[0]), prefs.mode);
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

  /** Fires one typed character at the next empty slot: lands if it is that letter, bounces off and knocks the card down if not. */
  const shoot = (ch: string) => {
    const g = game.current;
    const r = g.round;
    if (phase !== "playing" || !r || r.status !== "falling" || !/\p{L}/u.test(ch)) return;
    const slot = r.letters.findIndex((_, i) => !r.open.includes(i) && !r.typed.includes(i));
    if (slot < 0) return;
    const ok = letterMatches(r.letters[slot], ch, prefs.mode);
    // typing the whole word passes over the opened letters just before the next blank instead of missing on them
    for (let k = slot - 1; !ok && k >= 0 && r.open.includes(k); k--) if (letterMatches(r.letters[k], ch, prefs.mode)) return;
    setShots((list) => [...list, { id: g.nextId++, ch, ok, slot, dir: Math.random() < 0.5 ? -1 : 1 }]);
    if (!ok) {
      r.y = Math.min(0.99, r.y + KNOCK);
      setWrong(true);
      setTimeout(() => setWrong(false), 380);
      setAnnounce(`Trượt: ${ch}`);
    } else {
      r.typed = [...r.typed, slot];
      if (r.typed.length + r.open.length === r.letters.length) {
        const points = pointsFor(hintsOpen(r.y));
        r.status = "correct";
        r.doneAt = g.clock;
        r.points = points;
        g.score += points;
        g.correct += 1;
        g.streak += 1;
        g.bestStreak = Math.max(g.bestStreak, g.streak);
        record(r.word, true, points);
        setAnnounce(`Đúng, cộng ${points} điểm: ${r.word[0]}, ${r.word[1]}`);
      }
    }
    publish();
  };

  const fire = (text: string) => {
    for (const ch of text) shoot(ch);
    setAnswer("");
  };

  const shotDone = useCallback((id: number) => setShots((list) => list.filter((s) => s.id !== id)), []);

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
  const flying = new Set(shots.filter((s) => s.ok).map((s) => s.slot));
  const filled = r && r.status === "falling" ? new Set([...r.open, ...r.typed.filter((i) => !flying.has(i))]) : null;
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

        <div className="vg-field drop-field" onClick={() => phase === "playing" && inputRef.current?.focus()}>
          <div className={`drop-time${r?.status === "falling" && r.y > 0.75 ? " low" : ""}`} aria-hidden="true">
            <i style={{ top: `${(r?.y ?? 0) * 100}%` }} />
          </div>
          <div className="drop-lane">
            {view.lives < LIVES && <div key={view.lives} className="vg-hurt" aria-hidden="true" />}
            {r && (
              <div className={`drop-card ${r.status}`} style={{ top: `${r.y * 100}%`, "--y": r.y } as CSSProperties}>
                <span className="drop-hanzi">{r.word[0]}</span>
                {r.status !== "missed" && <Crossword slots={r.slots} filled={filled} />}
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
          <Cannon />
          {shots.map((s) => (
            <ShotFx key={s.id} shot={s} onDone={shotDone} />
          ))}

          {phase === "ready" && (
            <div className="vg-overlay">
              <h2>Chữ Hán rơi</h2>
              <p>Bắn đủ ô chữ trước khi thẻ chạm đáy, càng sớm càng nhiều điểm. Gõ từng chữ cái để súng bắn vào ô chữ: đúng thì chữ xếp vào, sai thì nảy ra và thẻ bị đẩy xuống. Mỗi khi thẻ rơi qua một vạch ngang, ô chữ lộ thêm chữ cái và bớt {HINT_COST} điểm.</p>
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

        <form className={`vg-answer${wrong ? " wrong" : ""}`} onSubmit={(e) => e.preventDefault()}>
          {/* each character fires as it is typed; an IME (e.g. Vietnamese Telex) fires once its letter is composed */}
          <input
            ref={inputRef}
            value={answer}
            onChange={(e) => (composing.current ? setAnswer(e.target.value) : fire(e.target.value))}
            onCompositionStart={() => (composing.current = true)}
            onCompositionEnd={(e) => {
              composing.current = false;
              fire(e.currentTarget.value);
            }}
            placeholder={GUN_PLACEHOLDER[prefs.mode]}
            aria-label="Gõ chữ cái để bắn"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            disabled={phase !== "playing"}
          />
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
