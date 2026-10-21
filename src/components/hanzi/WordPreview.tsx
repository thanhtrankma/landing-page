"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import HanziWriterPractice from "@/components/hanzi/HanziWriterPractice";
import { WordExamples, WordSummary, WordUsage } from "@/components/hanzi/WordParts";
import { wordHref } from "@/lib/hsk-text";

type Dictionary = typeof import("@/lib/hsk");

let loading: Promise<Dictionary> | null = null;

/** The full word data (≈280KB) is fetched once, on first use; the list page itself only ships the search fields. */
export const loadDictionary = () => (loading ??= import("@/lib/hsk"));

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

/**
 * Word details shown beside the list (desktop) or in a bottom sheet (phones). `prev`/`next` step through the current
 * search results rather than the whole list.
 */
export default function WordPreview({
  slug,
  prev,
  next,
  onSelect,
  onClose,
}: {
  slug: string;
  prev?: string;
  next?: string;
  onSelect: (slug: string) => void;
  onClose?: () => void;
}) {
  const [dict, setDict] = useState<Dictionary | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    loadDictionary().then((d) => alive && setDict(d));
    return () => {
      alive = false;
    };
  }, []);

  // A new word starts at the top of the panel.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [slug]);

  const w = dict?.getWord(slug);
  const others = dict && w ? dict.related(w) : [];

  return (
    <div className="preview">
      <div className="preview-bar">
        <div className="preview-steps">
          <button type="button" disabled={!prev} onClick={() => prev && onSelect(prev)} aria-label="Từ trước" title="Từ trước (phím ←)">
            <Arrow dir="left" />
          </button>
          <button type="button" disabled={!next} onClick={() => next && onSelect(next)} aria-label="Từ tiếp" title="Từ tiếp (phím →)">
            <Arrow dir="right" />
          </button>
        </div>
        <Link href={wordHref(slug)} className="preview-open">
          Mở trang riêng
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </Link>
        {onClose && (
          <button type="button" className="preview-close" onClick={onClose} aria-label="Đóng">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        )}
      </div>

      <div ref={bodyRef} className="preview-body" aria-live="polite" aria-busy={!w}>
        {!w ? (
          <div className="preview-loading" aria-label="Đang tải">
            <span />
            <span />
            <span />
          </div>
        ) : (
          <>
            <div className="word-head preview-head">
              <WordSummary w={w} level={2} />
            </div>

            <div className="word-block">
              <h2>Cách viết</h2>
              <HanziWriterPractice key={w.slug} initialChar={w.hanzi} compact />
            </div>

            <WordUsage usage={w.usage} />
            <WordExamples examples={w.examples} />

            {others.length > 0 && (
              <div className="word-block">
                <h2>Từ có chữ chung</h2>
                <ul className="word-related">
                  {others.map((o) => (
                    <li key={o.slug}>
                      <button type="button" onClick={() => onSelect(o.slug)}>
                        <b lang="zh">{o.hanzi}</b>
                        <span>{o.meaning}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
