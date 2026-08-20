import type { ComparisonResponse } from "@/lib/scholarlens/schema";

export default function ComparisonView({ data }: { data: ComparisonResponse }) {
  if (data.matrix.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-ink-700 bg-ink-900/40 px-6 py-12 text-center">
        <p className="text-lead font-semibold text-paper-200">No comparison rows returned</p>
        <p className="mt-1.5 text-meta leading-relaxed text-paper-400">
          No claim could be verified against the selected papers, so no row was built.
        </p>
      </div>
    );
  }

  return (
    <section
      className="animate-fade-slide-in overflow-hidden rounded-card border border-ink-700/70
      bg-ink-900/70 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.95)] backdrop-blur-sm"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-800 px-4 py-3 sm:px-5">
        <p className="min-w-0 break-words text-meta leading-relaxed text-paper-200">
          {data.question}
        </p>
        <span
          className="shrink-0 rounded-full bg-signal-500/15 px-2.5 py-1 text-micro font-semibold
          text-signal-400"
        >
          {data.paper_count} {data.paper_count === 1 ? "paper" : "papers"}
        </span>
      </header>

      <div className="sl-scroll overflow-x-auto">
        <table className="w-full min-w-[900px] table-fixed border-collapse text-left">
          <thead>
            <tr className="bg-ink-950/60">
              <th scope="col" className="w-[24%] px-4 py-2.5 text-micro font-semibold uppercase tracking-wider text-paper-600">
                Paper
              </th>
              <th scope="col" className="w-[30%] px-4 py-2.5 text-micro font-semibold uppercase tracking-wider text-paper-600">
                Key finding
              </th>
              <th scope="col" className="w-[23%] px-4 py-2.5 text-micro font-semibold uppercase tracking-wider text-paper-600">
                Agreement
              </th>
              <th scope="col" className="w-[23%] px-4 py-2.5 text-micro font-semibold uppercase tracking-wider text-paper-600">
                Disagreement
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-800">
            {data.matrix.map((row) => (
              <tr key={row.source_id} className="align-top transition-colors hover:bg-ink-850/50">
                <th scope="row" className="px-4 py-3.5 font-normal">
                  <span className="block break-words text-meta font-semibold leading-snug text-paper-50">
                    {row.title}
                  </span>
                  <span className="mt-1 block font-mono text-micro text-cite-300">
                    {row.source_id}
                  </span>
                </th>
                <td className="break-words px-4 py-3.5 text-meta leading-relaxed text-paper-200">
                  {row.key_finding}
                </td>
                <td className="break-words px-4 py-3.5 text-meta leading-relaxed text-paper-200">
                  {row.agreement}
                </td>
                <td className="break-words px-4 py-3.5 text-meta leading-relaxed text-paper-200">
                  {row.disagreement}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="border-t border-ink-800 px-4 py-2.5 text-micro leading-relaxed text-paper-600 sm:px-5">
        Only papers whose claims passed source verification appear here. A selected paper with no
        verifiable quote is deliberately left out rather than filled in.
      </p>
    </section>
  );
}
