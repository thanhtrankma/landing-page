import SpeakButton from "@/components/hanzi/SpeakButton";
import { displayPinyin, posTitle, type HskEntry, type HskExample } from "@/lib/hsk-text";

/** Big character, pinyin with audio, Hán Việt, meaning and tags. Shared by the word page and the dictionary panel. */
export function WordSummary({ w, level = 1 }: { w: HskEntry; level?: 1 | 2 }) {
  const Title = level === 1 ? "h1" : "h2";
  return (
    <>
      <Title className="word-hanzi" lang="zh">
        {w.hanzi}
      </Title>
      <div className="word-head-info">
        <div className="word-pinyin">
          <span>{displayPinyin(w.pinyin)}</span>
          <SpeakButton text={w.hanzi} label="Nghe" />
        </div>
        <p className="word-hv">
          Hán Việt <b>{w.hanViet}</b>
        </p>
        <p className="word-meaning">{w.meaning}</p>
        <div className="word-tags">
          <span>HSK {w.level}</span>
          {w.pos.map((p) => (
            <span key={p}>{posTitle(p)}</span>
          ))}
          {w.pinyin.includes("//") && <span title="Có thể chen thành phần khác vào giữa hai chữ">Ly hợp</span>}
          {w.variants?.map((v) => (
            <span key={v}>
              Còn viết <b lang="zh">{v}</b>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

export function WordUsage({ usage }: { usage: string }) {
  return (
    <div className="word-block">
      <h2>Cách dùng</h2>
      <p>{usage}</p>
    </div>
  );
}

export function WordExamples({ examples }: { examples: HskExample[] }) {
  return (
    <div className="word-block">
      <h2>Ví dụ</h2>
      <ol className="word-examples">
        {examples.map((ex) => (
          <li key={ex.zh}>
            <div className="word-ex-text">
              <p className="zh" lang="zh">
                {ex.zh}
              </p>
              <p className="py">{ex.pinyin}</p>
              <p className="vi">{ex.vi}</p>
            </div>
            <SpeakButton text={ex.zh} label="Nghe câu ví dụ" small />
          </li>
        ))}
      </ol>
    </div>
  );
}
