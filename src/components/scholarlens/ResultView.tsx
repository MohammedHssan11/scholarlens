/**
 * Renders the structured answer as an auditable chain of evidence.
 * Owner: Mohammed Hassan Mahmoud (frontend).
 */
import type { ScholarLensResponse } from "@/lib/scholarlens/schema";
import EvidencePanel from "./EvidencePanel";

export default function ResultView({ data }: { data: ScholarLensResponse }) {
  /* ── Honest "no evidence" answer ───────────────────────────
     This is a correct outcome, not an error, so it is presented as a
     deliberate decision the system made — not as a failure state. */
  if (data.not_found) {
    return (
      <section className="animate-fade-slide-in overflow-hidden rounded-card border border-warn-400/30 bg-warn-400/[0.07]">
        <div className="flex items-start gap-3.5 px-5 py-4">
          <span
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl
            border border-warn-400/30 bg-warn-400/10"
          >
            <svg
              className="h-4 w-4 text-warn-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v4m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z"
              />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-lead font-semibold text-warn-300">No evidence found</p>
            <p className="mt-1 text-meta leading-relaxed text-paper-200">
              {data.message ?? "The approved papers do not answer this question."}
            </p>
            <p className="mt-2.5 text-micro leading-relaxed text-paper-400">
              ScholarLens returns this instead of guessing. Nothing in the selected papers could be
              quoted to support an answer, so no answer is shown.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const evidence = Array.isArray(data.evidence) ? data.evidence : [];

  if (evidence.length === 0) {
    return (
      <div className="animate-fade-slide-in rounded-card border border-dashed border-ink-700 bg-ink-900/40 px-6 py-12 text-center">
        <p className="text-lead font-semibold text-paper-200">No results to show</p>
        <p className="mt-1.5 text-meta text-paper-400">
          Try rephrasing your question, or select a different set of papers.
        </p>
      </div>
    );
  }

  const sources = new Set(evidence.map((item) => item.source_id)).size;

  return (
    <div className="animate-fade-slide-in">
      {/* ── Provenance summary ────────────────────────────────── */}
      <div className="mb-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 px-0.5">
        <span className="flex flex-wrap items-center gap-1.5 text-meta text-paper-200">
          <svg
            className="h-3.5 w-3.5 shrink-0 text-signal-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.6}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          <span className="font-semibold text-paper-50">{evidence.length}</span>
          verified {evidence.length === 1 ? "claim" : "claims"}
          <span className="text-paper-600" aria-hidden="true">
            ·
          </span>
          <span className="font-semibold text-paper-50">{sources}</span>
          {sources === 1 ? "source" : "sources"}
        </span>

        {data.provider_used && (
          <span className="flex items-center gap-1.5 font-mono text-micro text-paper-600">
            <span className="h-1.5 w-1.5 rounded-full bg-cite-400" aria-hidden="true" />
            generated via {data.provider_used}
          </span>
        )}
      </div>

      {/* The spine links each numbered claim into one auditable chain */}
      <div className="sl-chain sl-stagger flex flex-col gap-3.5">
        {evidence.map((item, index) => (
          <EvidencePanel key={`${item.source_id}-${index}`} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}
