/**
 * Renders the structured answer.
 * Owner: Mohammed Hassan Mahmoud (frontend).
 */
import type { ScholarLensResponse } from "@/lib/scholarlens/schema";
import EvidencePanel from "./EvidencePanel";

export default function ResultView({ data }: { data: ScholarLensResponse }) {
  if (data.not_found) {
    return (
      <div className="animate-fade-slide-in rounded-lg border border-amber-900/50 bg-amber-500/10 px-6 py-5">
        <div className="flex items-start gap-3">
          <div>
            <p className="font-semibold text-amber-300">No evidence found</p>
            <p className="mt-1 text-sm leading-relaxed text-amber-200/90">
              {data.message ?? "The approved papers do not answer this question."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const evidence = Array.isArray(data.evidence) ? data.evidence : [];

  if (evidence.length === 0) {
    return (
      <div className="animate-fade-slide-in rounded-lg border border-dashed border-slate-700 bg-slate-900/60 px-6 py-10 text-center">
        <p className="font-semibold text-slate-100">No results to show</p>
        <p className="mt-1 text-sm text-slate-400">
          Try rephrasing your question or asking about a different topic.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-slide-in">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-semibold tracking-tight text-slate-100">
          {evidence.length} result{evidence.length === 1 ? "" : "s"}
        </h2>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
          {data.provider_used ? `${data.provider_used} / approved sources` : "Approved sources"}
        </span>
      </div>
      <div className="mt-4 flex flex-col gap-4">
        {evidence.map((item, index) => (
          <EvidencePanel key={`${item.source_id}-${index}`} item={item} />
        ))}
      </div>
    </div>
  );
}
