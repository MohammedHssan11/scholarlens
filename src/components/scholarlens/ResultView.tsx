/**
 * Renders the structured answer.
 * Owner: farkadaa (Frontend Lead)
 */
import type { ScholarLensResponse } from "@/lib/scholarlens/schema";
import EvidencePanel from "./EvidencePanel";

export default function ResultView({ data }: { data: ScholarLensResponse }) {
  if (data.not_found) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-4">
        <p className="font-semibold text-amber-900">No evidence found</p>
        <p className="mt-1 text-sm text-amber-900">
          {data.message ?? "The approved papers do not answer this question."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-900">
        {data.evidence.length} result{data.evidence.length === 1 ? "" : "s"}
      </h2>
      {data.evidence.map((item, index) => (
        <EvidencePanel key={`${item.source_id}-${index}`} item={item} />
      ))}
    </div>
  );
}
