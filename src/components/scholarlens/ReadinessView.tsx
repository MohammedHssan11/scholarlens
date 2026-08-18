import type { ReadinessResponse } from "@/lib/scholarlens/schema";

export default function ReadinessView({ data }: { data: ReadinessResponse }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900">
      <div
        className={`border-b px-5 py-4 ${
          data.ready
            ? "border-emerald-900 bg-emerald-500/10"
            : "border-amber-900 bg-amber-500/10"
        }`}
      >
        <p className={`font-semibold ${data.ready ? "text-emerald-300" : "text-amber-300"}`}>
          {data.ready ? "Research evidence is ready" : "Research evidence needs work"}
        </p>
      </div>

      <dl className="grid divide-y divide-slate-800 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="px-5 py-4">
          <dt className="text-xs font-semibold uppercase text-slate-500">Papers used</dt>
          <dd className="mt-1 text-2xl font-bold text-slate-100">{data.papers_used}</dd>
        </div>
        <div className="px-5 py-4">
          <dt className="text-xs font-semibold uppercase text-slate-500">Claims sourced</dt>
          <dd className="mt-1 text-sm font-semibold text-slate-200">
            {data.every_claim_has_a_snippet ? "Every claim has a snippet" : "Missing source snippets"}
          </dd>
        </div>
      </dl>

      <div className="border-t border-slate-800 px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-100">Research gaps</h3>
        {data.gaps.length > 0 ? (
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
            {data.gaps.map((gap, index) => (
              <li key={`${gap}-${index}`} className="border-l-2 border-amber-500 pl-3">
                {gap}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-400">No research gaps were returned.</p>
        )}
      </div>
    </section>
  );
}
