import type { ReactNode } from "react";
import type { GrammarPoint, LessonLine } from "@/data/lessons";
import SpeakButton from "./SpeakButton";

// Pieces of a lesson shared by the lesson page and the grammar summary: highlighted text, example lines, grammar cards.

/** Wraps each occurrence of `marks` in <mark>, longest first so 正在 wins over 正. */
export function Marked({ text, marks }: { text: string; marks: string[] }) {
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

export function Line({ line, marks }: { line: LessonLine; marks: string[] }) {
  return (
    <li className={line.who ? "lesson-line has-who" : "lesson-line"}>
      {line.who && (
        <span className={[...line.who].length > 1 ? "lesson-who name" : "lesson-who"} lang="zh">
          {line.who}
        </span>
      )}
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

/** One grammar point as taught: structures, note and examples. `anchor` overrides its id, `footer` adds links under it. */
export function GrammarCard({ point, index, anchor, footer }: { point: GrammarPoint; index: number; anchor?: string; footer?: ReactNode }) {
  return (
    <article className="lesson-grammar" id={anchor ?? point.id}>
      <span className="lesson-num">{index + 1}</span>
      <div className="lesson-grammar-head">
        <h3 lang="zh">{/[“”"]/.test(point.title) ? point.title : `“${point.title}”`}</h3>
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
      {footer}
    </article>
  );
}
