/**
 * One piece of evidence, presented as a chain the reader can audit:
 *   source  →  what the AI concluded  →  the exact sentence that proves it
 *
 * Two deliberate design decisions carry most of the weight here:
 *
 *  1. The quote is set in a SERIF face. Everything ScholarLens writes is
 *     sans-serif; only words taken from a paper change typeface. The reader
 *     can tell our words from the source's before reading a single label.
 *
 *  2. Words from the question are highlighted inside the quote, so the
 *     reader can see *why* this passage was retrieved.
 *
 * Every snippet reaching this component has already passed the server's
 * literal-substring check in `service.ts`, so "verified" is a statement of
 * fact, not decoration.
 *
 * Owner: Mohammed Hassan Mahmoud (frontend).
 */
import type { EvidenceItem } from "@/lib/scholarlens/schema";
import { queryTerms, splitOnTerms } from "@/lib/scholarlens/highlight";

const CONFIDENCE_STYLE: Record<
  string,
  { dot: string; text: string; ring: string; bar: string; filled: number }
> = {
  high: {
    dot: "bg-signal-400",
    text: "text-signal-400",
    ring: "ring-signal-400/30",
    bar: "bg-signal-400",
    filled: 3,
  },
  medium: {
    dot: "bg-warn-400",
    text: "text-warn-300",
    ring: "ring-warn-400/30",
    bar: "bg-warn-400",
    filled: 2,
  },
  low: {
    dot: "bg-alert-400",
    text: "text-alert-300",
    ring: "ring-alert-400/30",
    bar: "bg-alert-400",
    filled: 1,
  },
};

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-ink-800 bg-ink-950/40 px-3 py-2.5">
      <p className="text-micro font-semibold uppercase tracking-wider text-paper-600">{label}</p>
      <p className="mt-1 break-words text-micro leading-relaxed text-paper-200">{value}</p>
    </div>
  );
}

export default function EvidencePanel({
  item,
  index,
}: {
  item: EvidenceItem;
  index?: number;
}) {
  const confidenceKey = String(item.confidence ?? "").toLowerCase();
  const confidence = CONFIDENCE_STYLE[confidenceKey] ?? {
    dot: "bg-paper-400",
    text: "text-paper-400",
    ring: "ring-paper-400/30",
    bar: "bg-paper-400",
    filled: 0,
  };

  const terms = queryTerms(item.question ?? "");
  const quoteParts = splitOnTerms(item.evidence_snippet, terms);
  const matchedTerms = new Set(
    quoteParts.filter((p) => p.match).map((p) => p.text.toLocaleLowerCase()),
  );

  return (
    <article
      className="sl-panel group relative overflow-hidden rounded-card border border-ink-700/70
      bg-ink-900/70 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.95)] backdrop-blur-sm
      transition-all duration-300 hover:border-ink-600
      hover:shadow-[0_26px_60px_-24px_rgba(0,0,0,1)]"
    >
      {/* ── Source header ────────────────────────────────────── */}
      <header className="flex items-start justify-between gap-3 border-b border-ink-800 px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          {typeof index === "number" && (
            <span
              className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center
              rounded-full border border-ink-600 bg-ink-850 font-mono text-micro font-bold
              text-paper-200 shadow-[0_0_0_4px_var(--color-ink-900)]"
              aria-hidden="true"
            >
              {index + 1}
            </span>
          )}
          <div className="min-w-0">
            <span className="flex items-center gap-1.5 font-mono text-micro text-cite-300">
              <svg
                className="h-3 w-3 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25V11.6a3.4 3.4 0 00-3.4-3.4h-1.5a1.1 1.1 0 01-1.1-1.1V5.6a3.4 3.4 0 00-3.4-3.4H8.25M10.5 2.25H5.6c-.6 0-1.1.5-1.1 1.1v17.3c0 .6.5 1.1 1.1 1.1h12.8c.6 0 1.1-.5 1.1-1.1V11.25a9 9 0 00-9-9z"
                />
              </svg>
              {item.source_id}
            </span>
            <h3 className="mt-1 break-words text-lead font-semibold leading-snug tracking-tight text-paper-50">
              {item.title}
            </h3>
          </div>
        </div>

        {/* Confidence as a small meter, not just a word */}
        <span
          className={`flex shrink-0 items-center gap-2 rounded-full bg-ink-950/70 px-2.5 py-1.5
          text-micro font-semibold capitalize ring-1 ${confidence.text} ${confidence.ring}`}
          title={`Model confidence: ${item.confidence}`}
        >
          <span className="flex items-end gap-[2px]" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`w-[3px] rounded-sm transition-colors ${
                  i < confidence.filled ? confidence.bar : "bg-ink-700"
                }`}
                style={{ height: `${5 + i * 3}px` }}
              />
            ))}
          </span>
          {item.confidence}
        </span>
      </header>

      <div className="px-4 py-4 sm:px-5">
        {/* ── What ScholarLens concluded (clearly ours) ───────── */}
        {item.key_finding && (
          <section>
            <p className="flex items-center gap-1.5 text-micro font-semibold uppercase tracking-wider text-paper-600">
              <span className="h-1 w-1 rounded-full bg-paper-600" aria-hidden="true" />
              Key finding
              <span className="font-normal normal-case tracking-normal text-paper-600/70">
                — ScholarLens&rsquo; reading
              </span>
            </p>
            <p className="mt-1.5 whitespace-pre-wrap break-words text-lead leading-relaxed text-paper-200">
              {item.key_finding}
            </p>
          </section>
        )}

        {/* ── The hero: the paper's own words ─────────────────── */}
        <section className="relative mt-4">
          <div
            className="sl-panel overflow-hidden rounded-xl border border-cite-500/30 bg-cite-500/[0.08]
            shadow-[0_0_0_1px_rgba(99,102,241,0.05),0_14px_36px_-18px_rgba(99,102,241,0.6)]"
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-cite-500/20 bg-cite-500/[0.07] px-3.5 py-2">
              <span
                className="animate-verify flex h-4 w-4 shrink-0 items-center justify-center
                rounded-full bg-signal-500"
                aria-hidden="true"
              >
                <svg
                  className="h-2.5 w-2.5 text-ink-950"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              <p className="text-micro font-bold uppercase tracking-wider text-cite-300">
                Verified quote from source
              </p>
              {matchedTerms.size > 0 && (
                <span className="ml-auto text-micro text-cite-300/70">
                  {matchedTerms.size} question {matchedTerms.size === 1 ? "term" : "terms"} found
                </span>
              )}
            </div>

            <blockquote
              className="sl-scroll max-h-72 overflow-y-auto px-4 py-4 font-quote text-[17px]
              leading-[1.62] text-paper-50"
            >
              <span
                className="mr-0.5 select-none align-[-0.15em] text-2xl leading-none text-cite-400"
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <span className="whitespace-pre-wrap break-words">
                {quoteParts.map((part, i) =>
                  part.match ? (
                    <mark key={i} className="sl-term">
                      {part.text}
                    </mark>
                  ) : (
                    <span key={i}>{part.text}</span>
                  ),
                )}
              </span>
              <span
                className="ml-0.5 select-none align-[-0.15em] text-2xl leading-none text-cite-400"
                aria-hidden="true"
              >
                &rdquo;
              </span>
            </blockquote>
          </div>

          <p className="mt-2 flex flex-wrap items-center gap-x-1.5 px-1 text-micro leading-relaxed text-paper-600">
            <svg
              className="h-3 w-3 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Matched word-for-word against the retrieved text of {item.source_id}
            {matchedTerms.size > 0 && <> · highlights mark words from your question</>}
          </p>
        </section>

        {/* ── Supporting context ──────────────────────────────── */}
        {(item.agreement || item.disagreement || item.research_gap) && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {item.agreement && <MetaCell label="Agreement" value={item.agreement} />}
            {item.disagreement && <MetaCell label="Disagreement" value={item.disagreement} />}
            {item.research_gap && (
              <div className="sm:col-span-2">
                <MetaCell label="Research gap" value={item.research_gap} />
              </div>
            )}
          </div>
        )}

        {item.limitation && (
          <p className="mt-3.5 flex flex-wrap gap-x-2 gap-y-1 border-t border-ink-800 pt-3 text-micro leading-relaxed text-paper-600">
            <span className="font-semibold uppercase tracking-wider">Limitation</span>
            <span className="break-words">{item.limitation}</span>
          </p>
        )}
      </div>
    </article>
  );
}
