import type { ReadinessResponse } from "@/lib/scholarlens/schema";

/** Mirrors READINESS_RULES.minPapers so the UI can explain the verdict. */
const MIN_PAPERS = 3;

export default function ReadinessView({ data }: { data: ReadinessResponse }) {
  const ready = data.ready;
  const papersMet = data.papers_used >= MIN_PAPERS;

  return (
    <section
      className="animate-fade-slide-in overflow-hidden rounded-card border border-ink-700/70
      bg-ink-900/70 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.95)] backdrop-blur-sm"
    >
      {/* ── Verdict ───────────────────────────────────────────── */}
      <header
        className={`flex items-start gap-3.5 border-b px-5 py-4 ${
          ready
            ? "border-signal-500/25 bg-signal-500/[0.09]"
            : "border-warn-400/25 bg-warn-400/[0.08]"
        }`}
      >
        <span
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${
            ready
              ? "border-signal-500/35 bg-signal-500/15"
              : "border-warn-400/35 bg-warn-400/15"
          }`}
        >
          <svg
            className={`h-4 w-4 ${ready ? "text-signal-400" : "text-warn-300"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.6}
            aria-hidden="true"
          >
            {ready ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" />
            )}
          </svg>
        </span>
        <div className="min-w-0">
          <p className={`text-lead font-semibold ${ready ? "text-signal-400" : "text-warn-300"}`}>
            {ready ? "Research evidence is ready" : "Research evidence needs work"}
          </p>
          <p className="mt-1 text-micro leading-relaxed text-paper-400">
            Ready requires at least {MIN_PAPERS} distinct papers <em>and</em> a source snippet behind
            every claim.
          </p>
        </div>
      </header>

      {/* ── The two conditions, each showing whether it passed ── */}
      <dl className="grid divide-y divide-ink-800 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="px-5 py-4">
          <dt className="text-micro font-semibold uppercase tracking-wider text-paper-600">
            Distinct papers used
          </dt>
          <dd className="mt-1.5 flex items-baseline gap-2">
            <span
              className={`text-[28px] font-bold leading-none tabular-nums ${
                papersMet ? "text-signal-400" : "text-warn-300"
              }`}
            >
              {data.papers_used}
            </span>
            <span className="text-micro text-paper-400">of {MIN_PAPERS} needed</span>
          </dd>
          <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-ink-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                papersMet ? "bg-signal-500" : "bg-warn-400"
              }`}
              style={{ width: `${Math.min(100, (data.papers_used / MIN_PAPERS) * 100)}%` }}
            />
          </div>
        </div>

        <div className="px-5 py-4">
          <dt className="text-micro font-semibold uppercase tracking-wider text-paper-600">
            Claims sourced
          </dt>
          <dd
            className={`mt-1.5 flex items-center gap-2 text-meta font-semibold ${
              data.every_claim_has_a_snippet ? "text-signal-400" : "text-warn-300"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                data.every_claim_has_a_snippet ? "bg-signal-400" : "bg-warn-400"
              }`}
              aria-hidden="true"
            />
            {data.every_claim_has_a_snippet
              ? "Every claim has a snippet"
              : "Missing source snippets"}
          </dd>
        </div>
      </dl>

      {/* ── Gaps ──────────────────────────────────────────────── */}
      <div className="border-t border-ink-800 px-5 py-4">
        <h3 className="text-meta font-semibold text-paper-50">
          Research gaps
          {data.gaps.length > 0 && (
            <span className="ml-2 font-mono text-micro font-normal text-paper-600">
              {data.gaps.length}
            </span>
          )}
        </h3>
        {data.gaps.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {data.gaps.map((gap, index) => (
              <li
                key={`${gap}-${index}`}
                className="rounded-lg border-l-2 border-warn-400/70 bg-ink-950/40 py-2 pl-3 pr-3
                text-meta leading-relaxed text-paper-200"
              >
                {gap}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-meta text-paper-400">No research gaps were returned.</p>
        )}
      </div>
    </section>
  );
}
