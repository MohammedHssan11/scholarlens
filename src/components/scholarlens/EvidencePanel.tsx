/**
 * Shows one piece of evidence and, most importantly, the exact source snippet.
 * Owner: Mohammed Hassan Mahmoud (frontend).
 */
import type { EvidenceItem } from "@/lib/scholarlens/schema";

const CONFIDENCE_DOT: Record<string, string> = {
  high: "bg-emerald-400",
  medium: "bg-amber-400",
  low: "bg-rose-400",
};

export default function EvidencePanel({ item }: { item: EvidenceItem }) {
  const confidenceKey = String(item.confidence ?? "").toLowerCase();
  const dotColor = CONFIDENCE_DOT[confidenceKey] ?? "bg-slate-400";

  return (
    <article
      className="animate-fade-slide-in max-w-full overflow-hidden rounded-2xl border border-slate-800
      bg-slate-900 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.3),0_6px_20px_rgba(0,0,0,0.35)]
      transition-shadow duration-200 hover:border-slate-700 hover:shadow-[0_2px_4px_rgba(0,0,0,0.4),0_18px_36px_rgba(0,0,0,0.5)] sm:p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold leading-snug tracking-tight text-slate-50 break-words">
          {item.title}
        </h3>
        <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
          <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
          {item.confidence}
        </span>
      </div>

      <p className="mt-1.5 flex items-center gap-1.5 font-mono text-xs text-slate-500">
        <svg
          className="h-3.5 w-3.5 shrink-0 text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.75}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
        {item.source_id}
      </p>

      {/* Key finding */}
      <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-300">
        {item.key_finding}
      </p>

      {/* Source snippet */}
      <blockquote
        className="mt-5 max-h-64 overflow-y-auto overflow-hidden rounded-lg border border-indigo-500/20
        border-l-4 border-l-indigo-400 bg-indigo-500/10 px-4 py-3
        text-sm leading-relaxed text-slate-200 whitespace-pre-wrap break-words"
      >
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-indigo-300">
          Source snippet
        </span>
        {item.evidence_snippet}
      </blockquote>

      {/* Agreement / Disagreement / Research gap */}
      {(item.agreement || item.disagreement || item.research_gap) && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {item.agreement && (
            <p className="rounded-lg bg-slate-800/60 px-3 py-2 text-sm text-slate-300 break-words">
              <span className="font-medium text-slate-100">Agreement: </span>
              {item.agreement}
            </p>
          )}
          {item.disagreement && (
            <p className="rounded-lg bg-slate-800/60 px-3 py-2 text-sm text-slate-300 break-words">
              <span className="font-medium text-slate-100">Disagreement: </span>
              {item.disagreement}
            </p>
          )}
          {item.research_gap && (
            <p className="rounded-lg bg-slate-800/60 px-3 py-2 text-sm text-slate-300 break-words sm:col-span-2">
              <span className="font-medium text-slate-100">Research gap: </span>
              {item.research_gap}
            </p>
          )}
        </div>
      )}

      {item.limitation && (
        <p className="mt-4 border-t border-slate-800 pt-3 text-xs text-slate-500 break-words">
          <span className="font-medium text-slate-400">Limitation: </span>
          {item.limitation}
        </p>
      )}
    </article>
  );
}