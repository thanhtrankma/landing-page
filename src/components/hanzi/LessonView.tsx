"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { posTitle } from "@/lib/hsk-text";
import type { GrammarPoint, Lesson, LessonLine, LessonWord } from "@/data/lessons";
import HanziDrop from "./HanziDrop";
import HanziWriterPractice from "./HanziWriterPractice";
import SpeakButton from "./SpeakButton";
import VocabMeteor from "./VocabMeteor";
import type { GameWord } from "./vocab-game";

// One class lesson in four tabs: new words, grammar, writing practice and the two games on the lesson's words.
// The open tab follows the URL hash (#tu-moi, #ngu-phap…) so a tab can be linked to directly.

type Tab = "tu-moi" | "ngu-phap" | "luyen-viet" | "tro-choi";
const TABS: [Tab, string][] = [
  ["tu-moi", "Từ mới"],
  ["ngu-phap", "Ngữ pháp"],
  ["luyen-viet", "Luyện viết"],
  ["tro-choi", "Trò chơi"],
];
type Game = "drop" | "meteor";

/** Wraps each occurrence of `marks` in <mark>, longest first so 正在 wins over 正. */
function Marked({ text, marks }: { text: string; marks: string[] }) {
  const terms = marks.filter(Boolean).sort((a, b) => b.length - a.length);
  if (!terms.length) return <>{text}</>;
  const parts: ReactNode[] = [];
  let rest = text;
  while (rest) {
    let at = -1;
    let term = "";
    for (const t of terms) {
      const i = rest.indexOf(t);
      if (i >= 0 && (at < 0 || i < at)) [at, term] = [i, t];
    }
    if (at < 0) {
      parts.push(rest);
      break;
    }
    if (at > 0) parts.push(rest.slice(0, at));
    parts.push(<mark key={parts.length}>{term}</mark>);
    rest = rest.slice(at + term.length);
  }
  return <>{parts}</>;
}

function Line({ line, marks }: { line: LessonLine; marks: string[] }) {
  return (
    <li className={line.who ? "lesson-line has-who" : "lesson-line"}>
      {line.who && <span className="lesson-who">{line.who}</span>}
      <div>
        <p className="zh" lang="zh">
          <Marked text={line.zh} marks={marks} />
        </p>
        <p className="py">{line.pinyin}</p>
        <p className="vi">{line.vi}</p>
      </div>
      <SpeakButton text={line.zh} label="Nghe câu" small />
    </li>
  );
}

function WordCard({ word, index, keyHanzi, dict, onWrite }: { word: LessonWord; index: number; keyHanzi: string; dict?: string; onWrite: () => void }) {
  const marks = [keyHanzi];
  return (
    <article className="lesson-word" id={`tu-${index + 1}`}>
      <span className="lesson-num">{index + 1}</span>
      <div className="lesson-word-head">
        <h3 lang="zh">{word.hanzi}</h3>
        <div className="lesson-word-info">
          <p className="lesson-py">
            {word.pinyin} <SpeakButton text={keyHanzi} small />
          </p>
          <p className="lesson-meaning">
            {word.pos && <span className="lesson-pos" title={posTitle(word.pos)}>【{word.pos}】</span>}
            {word.meaning}
          </p>
          <p className="lesson-hv">Hán Việt {word.hanViet}</p>
        </div>
      </div>

      {word.parts && (
        <ul className="lesson-parts">
          {word.parts.map((p) => (
            <li key={p.hanzi}>
              <b lang="zh">{p.hanzi}</b>
              <span>{p.pinyin}</span>
              <span className="lesson-pos">{p.pos && `【${p.pos}】`}</span>
              <span>{p.meaning}</span>
            </li>
          ))}
        </ul>
      )}
      {word.pattern && (
        <p className="lesson-pattern" lang="zh">
          {word.pattern}
        </p>
      )}
      {word.phrases && (
        <ul className="lesson-phrases">
          {word.phrases.map((p) => (
            <li key={p.hanzi}>
              <span lang="zh">
                <Marked text={p.hanzi} marks={marks} />
              </span>
              <small>
                {p.pinyin} · {p.meaning}
              </small>
            </li>
          ))}
        </ul>
      )}
      {word.sentences && (
        <ul className="lesson-lines lesson-sentences">
          {word.sentences.map((l) => (
            <Line key={l.zh} line={l} marks={marks} />
          ))}
        </ul>
      )}
      {word.dialogues?.map((d, k) => (
        <ul key={k} className="lesson-lines lesson-dialogue">
          {d.map((l, i) => (
            <Line key={i} line={l} marks={marks} />
          ))}
        </ul>
      ))}

      <div className="lesson-actions">
        <button type="button" onClick={onWrite}>
          Luyện viết {keyHanzi}
        </button>
        {dict && (
          <Link href={dict} target="_blank">
            Xem trong từ điển
          </Link>
        )}
      </div>
    </article>
  );
}

function GrammarCard({ point, index }: { point: GrammarPoint; index: number }) {
  return (
    <article className="lesson-grammar" id={point.id}>
      <span className="lesson-num">{index + 1}</span>
      <div className="lesson-grammar-head">
        <h3 lang="zh">“{point.title}”</h3>
        <p>{point.name}</p>
      </div>
      <p className="lesson-summary">{point.summary}</p>
      <div className="lesson-structures">
        <small>Cấu trúc</small>
        {point.structures.map((s) => (
          <p key={s} lang="zh">
            <Marked text={s} marks={[...point.focus, "主语"]} />
          </p>
        ))}
      </div>
      {point.note && <p className="lesson-note">{point.note}</p>}
      <small className="lesson-sub">Ví dụ</small>
      <ul className="lesson-lines">
        {point.examples.map((l) => (
          <Line key={l.zh} line={l} marks={point.focus} />
        ))}
      </ul>
    </article>
  );
}

export default function LessonView({
  lesson,
  keys,
  dict,
  gameWords,
}: {
  lesson: Lesson;
  /** Characters to write and play, per word. */
  keys: string[];
  /** Dictionary link per word, when there is one. */
  dict: (string | undefined)[];
  gameWords: GameWord[];
}) {
  const [tab, setTab] = useState<Tab>("tu-moi");
  const [writing, setWriting] = useState(keys[0]);
  const [game, setGame] = useState<Game>("drop");

  // open the tab named in the URL hash (after hydration, since the server render has no hash)
  useEffect(() => {
    const fromHash = () => {
      const h = location.hash.slice(1);
      if (TABS.some(([t]) => t === h)) setTab(h as Tab);
      else if (/^tu-\d+$/.test(h)) {
        setTab("tu-moi");
        requestAnimationFrame(() => document.getElementById(h)?.scrollIntoView({ block: "start" }));
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const open = (t: Tab) => {
    setTab(t);
    history.replaceState(null, "", `#${t}`);
    document.getElementById("lesson-tabs")?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const write = (hanzi: string) => {
    setWriting(hanzi);
    open("luyen-viet");
  };

  const suggestions = lesson.words.map((w, i): [string, string] => [keys[i], `${w.pinyin} · ${w.meaning}`]);

  return (
    <div className="lesson-view">
      <nav className="lesson-tabs" id="lesson-tabs" role="tablist" aria-label="Nội dung buổi học">
        {TABS.map(([t, label]) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => open(t)}>
            {label}
            {t === "tu-moi" && <small>{lesson.words.length}</small>}
            {t === "ngu-phap" && <small>{lesson.grammar.length}</small>}
          </button>
        ))}
      </nav>

      {tab === "tu-moi" && (
        <div role="tabpanel" aria-label="Từ mới">
          <ol className="lesson-index">
            {lesson.words.map((w, i) => (
              <li key={w.hanzi}>
                <a href={`#tu-${i + 1}`}>
                  <b lang="zh">{keys[i]}</b>
                  <span>{w.pinyin}</span>
                  <small>{w.meaning}</small>
                </a>
              </li>
            ))}
          </ol>
          <div className="lesson-words">
            {lesson.words.map((w, i) => (
              <WordCard key={w.hanzi} word={w} index={i} keyHanzi={keys[i]} dict={dict[i]} onWrite={() => write(keys[i])} />
            ))}
          </div>
        </div>
      )}

      {tab === "ngu-phap" && (
        <div role="tabpanel" aria-label="Ngữ pháp" className="lesson-grammars">
          {lesson.grammar.map((g, i) => (
            <GrammarCard key={g.id} point={g} index={i} />
          ))}
        </div>
      )}

      {tab === "luyen-viet" && (
        <div role="tabpanel" aria-label="Luyện viết" className="lesson-write">
          <p className="lesson-hint">Chọn một từ của buổi học để xem thứ tự nét, rồi bấm “Tự viết” để viết lại và được chấm từng nét.</p>
          <HanziWriterPractice key={writing} initialChar={writing} suggestions={suggestions} />
        </div>
      )}

      {tab === "tro-choi" && (
        <div role="tabpanel" aria-label="Trò chơi" className="lesson-games">
          <div className="lesson-game-pick" role="group" aria-label="Chọn trò chơi">
            <button type="button" aria-pressed={game === "drop"} onClick={() => setGame("drop")}>
              <b>Chữ Hán rơi</b>
              <small>Bắn từng chữ cái vào ô chữ</small>
            </button>
            <button type="button" aria-pressed={game === "meteor"} onClick={() => setGame("meteor")}>
              <b>Mưa từ vựng</b>
              <small>Gõ đáp án bắn hạ thiên thạch</small>
            </button>
          </div>
          <p className="lesson-hint">Chỉ dùng {gameWords.length} từ của buổi này. Kỷ lục được lưu riêng cho buổi học.</p>
          {game === "drop" ? <HanziDrop words={gameWords} set={lesson.slug} /> : <VocabMeteor words={gameWords} set={lesson.slug} />}
        </div>
      )}
    </div>
  );
}
