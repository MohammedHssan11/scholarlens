/**
 * Shows one piece of evidence and, most importantly, the exact source snippet.
 * Owner: Mohammed Hassan Mahmoud (frontend).
 */
import type { EvidenceItem } from "@/lib/scholarlens/schema";

export default function EvidencePanel({ item }: { item: EvidenceItem }) {
  return (
    <article className="rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-slate-900">{item.title}</h3>
        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
          {item.source_id} · {item.confidence}
        </span>
      </div>

      <p className="mt-3 text-slate-800">{item.key_finding}</p>

      <blockquote className="mt-4 border-l-4 border-blue-600 bg-blue-50 px-4 py-3 text-sm text-slate-800">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-blue-800">
          Source snippet
        </span>
        {item.evidence_snippet}
      </blockquote>

      {item.limitation && (
        <p className="mt-3 text-sm text-slate-500">Limitation: {item.limitation}</p>
      )}
    </article>
  );
}
