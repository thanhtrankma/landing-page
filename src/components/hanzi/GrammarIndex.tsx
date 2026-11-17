"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { plainVi } from "@/lib/hsk-text";
import type { GrammarEntry } from "@/lib/lessons";
import { GrammarCard } from "./LessonParts";

// Every grammar point from the lessons on one page: filter by book, search by Chinese or Vietnamese (accents optional),
// a short list on top to jump to a point, then the full cards with links back to the sessions that taught them.

const searchText = ({ point: p }: GrammarEntry) =>
  plainVi([p.title, p.name, p.summary, p.note ?? "", ...p.structures, ...p.focus, ...p.examples.flatMap((e) => [e.zh, e.pinyin, e.vi])].join(" "));

export default function GrammarIndex({ entries }: { entries: GrammarEntry[] }) {
  const [book, setBook] = useState(0);
  const [query, setQuery] = useState("");
  const books = useMemo(() => [...new Set(entries.flatMap((e) => e.sources.map((s) => s.book)))].sort((a, b) => a - b), [entries]);
  const haystacks = useMemo(() => entries.map(searchText), [entries]);

  const q = plainVi(query.trim());
  const shown = entries.filter((e, i) => (!book || e.sources.some((s) => s.book === book)) && (!q || haystacks[i].includes(q)));

  return (
    <div className="grammar-index">
      <div className="grammar-tools">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm: 了, 是……的, câu hỏi, lượng từ…"
          aria-label="Tìm điểm ngữ pháp"
        />
        <div className="cards-filter" role="group" aria-label="Lọc theo quyển">
          {[0, ...books].map((b) => (
            <button key={b} type="button" className={book === b ? "on" : ""} aria-pressed={book === b} onClick={() => setBook(b)}>
              {b ? `Quyển ${b}` : "Tất cả"}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="grammar-empty">Không có điểm ngữ pháp nào khớp với “{query}”.</p>
      ) : (
        <>
          <ol className="grammar-toc">
            {shown.map((e, i) => (
              <li key={e.anchor}>
                <a href={`#${e.anchor}`}>
                  <span className="lesson-num">{i + 1}</span>
                  <b lang="zh">{e.point.title}</b>
                  <small>{e.point.name}</small>
                </a>
              </li>
            ))}
          </ol>
          <div className="lesson-grammars">
            {shown.map((e, i) => (
              <GrammarCard
                key={e.anchor}
                point={e.point}
                index={i}
                anchor={e.anchor}
                footer={
                  <div className="lesson-actions">
                    {e.sources.map((s) => (
                      <Link key={s.href} href={s.href}>
                        Học ở {s.label}
                      </Link>
                    ))}
                  </div>
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
