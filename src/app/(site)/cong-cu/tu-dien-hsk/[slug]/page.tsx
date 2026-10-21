import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import HanziWriterPractice from "@/components/hanzi/HanziWriterPractice";
import WordKeys from "@/components/hanzi/WordKeys";
import { WordExamples, WordSummary, WordUsage } from "@/components/hanzi/WordParts";
import { DICT_PATH, HSK1, displayPinyin as display, getWord, neighbours, related, wordHref, type HskEntry } from "@/lib/hsk";
import { SITE_URL, breadcrumbJsonLd, graph, pageMetadata } from "@/lib/seo";
import "../../cards.css";
import "../../luyen-viet-chu-han/hanzi.css";
import "../dict.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return HSK1.map((w) => ({ slug: w.slug }));
}

const href = (w: HskEntry) => wordHref(w.slug);

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

function StepLink({ word, dir }: { word?: HskEntry; dir: "left" | "right" }) {
  const label = dir === "left" ? "Từ trước" : "Từ tiếp";
  if (!word)
    return (
      <span className="word-step disabled" aria-hidden="true">
        <Arrow dir={dir} />
      </span>
    );
  return (
    <Link
      href={href(word)}
      className="word-step"
      aria-label={`${label}: ${word.hanzi}`}
      title={`${label} (phím ${dir === "left" ? "←" : "→"})`}
    >
      <Arrow dir={dir} />
    </Link>
  );
}

export async function generateMetadata({ params }: PageProps<"/cong-cu/tu-dien-hsk/[slug]">) {
  const { slug } = await params;
  const w = getWord(slug);
  if (!w) return {};
  return pageMetadata({
    title: `${w.hanzi} (${display(w.pinyin)}) nghĩa là gì? Cách viết, ví dụ – Từ điển HSK 1 | SuperLanding`,
    description: `${w.hanzi} – ${display(w.pinyin)} – ${w.hanViet}: ${w.meaning}. ${w.usage}`.slice(0, 300),
    path: `${DICT_PATH}/${w.slug}`,
    keywords: `${w.hanzi}, ${w.hanzi} nghĩa là gì, ${display(w.pinyin)}, cách viết chữ ${w.hanzi}, từ vựng hsk 1`,
  });
}

export default async function HskWordPage({ params }: PageProps<"/cong-cu/tu-dien-hsk/[slug]">) {
  const { slug } = await params;
  const w = getWord(slug);
  if (!w) notFound();
  const [prev, next] = neighbours(w);
  const others = related(w);
  const url = `${SITE_URL}${href(w)}`;

  return (
    <main className="cards-page">
      <JsonLd
        data={graph(
          {
            "@type": "DefinedTerm",
            "@id": `${url}#term`,
            name: w.hanzi,
            alternateName: [display(w.pinyin), ...(w.variants ?? [])],
            description: w.meaning,
            inDefinedTermSet: `${SITE_URL}${DICT_PATH}#set`,
            url,
          },
          breadcrumbJsonLd(url, [
            ["Trang chủ", "/"],
            ["Từ điển HSK 1", DICT_PATH],
            [w.hanzi, `${DICT_PATH}/${w.slug}`],
          ]),
        )}
      />

      <WordKeys prev={prev && href(prev)} next={next && href(next)} />

      <section className="word-page">
        <div className="gv-wrap">
          <nav className="word-crumbs" aria-label="Điều hướng từ điển">
            <Link href={DICT_PATH} className="word-back">
              <Arrow dir="left" /> Từ điển HSK 1
            </Link>
            <div className="word-steps">
              <StepLink word={prev} dir="left" />
              <span>
                {w.n}/{HSK1.length}
              </span>
              <StepLink word={next} dir="right" />
            </div>
          </nav>

          <div className="word-layout">
            <header className="word-card word-head">
              <WordSummary w={w} />
            </header>

            <aside className="word-card word-write" aria-labelledby="cach-viet">
              <h2 id="cach-viet">Cách viết</h2>
              <HanziWriterPractice key={w.slug} initialChar={w.hanzi} compact />
            </aside>

            <div className="word-card word-body">
              <WordUsage usage={w.usage} />
              <WordExamples examples={w.examples} />

              {others.length > 0 && (
                <div className="word-block">
                  <h2>Từ có chữ chung</h2>
                  <ul className="word-related">
                    {others.map((o) => (
                      <li key={o.slug}>
                        <Link href={href(o)}>
                          <b lang="zh">{o.hanzi}</b>
                          <span>{o.meaning}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <nav className="word-pager" aria-label="Từ trước / sau">
            {prev ? (
              <Link href={href(prev)} rel="prev">
                <small>
                  <Arrow dir="left" /> Từ trước
                </small>
                <span>
                  <b lang="zh">{prev.hanzi}</b> {display(prev.pinyin)}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={href(next)} rel="next" className="next">
                <small>
                  Từ tiếp <Arrow dir="right" />
                </small>
                <span>
                  <b lang="zh">{next.hanzi}</b> {display(next.pinyin)}
                </span>
              </Link>
            )}
          </nav>
        </div>
      </section>
    </main>
  );
}
