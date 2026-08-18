import type { ComparisonResponse } from "@/lib/scholarlens/schema";

export default function ComparisonView({ data }: { data: ComparisonResponse }) {
  if (data.matrix.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-700 px-6 py-10 text-center">
        <p className="font-semibold text-slate-100">No comparison rows returned</p>
      </div>
    );
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-3">
        <p className="text-sm text-slate-300">{data.question}</p>
        <span className="text-xs font-semibold text-emerald-400">
          {data.paper_count} papers
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] table-fixed border-collapse text-left text-sm">
          <thead className="bg-slate-950 text-xs uppercase text-slate-400">
            <tr>
              <th scope="col" className="w-[22%] px-4 py-3 font-semibold">Paper</th>
              <th scope="col" className="w-[30%] px-4 py-3 font-semibold">Key finding</th>
              <th scope="col" className="w-[24%] px-4 py-3 font-semibold">Agreement</th>
              <th scope="col" className="w-[24%] px-4 py-3 font-semibold">Disagreement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.matrix.map((row) => (
              <tr key={row.source_id} className="align-top">
                <th scope="row" className="px-4 py-4 font-normal">
                  <span className="block break-words font-semibold text-slate-100">{row.title}</span>
                  <span className="mt-1 block font-mono text-xs text-slate-500">{row.source_id}</span>
                </th>
                <td className="break-words px-4 py-4 leading-6 text-slate-300">{row.key_finding}</td>
                <td className="break-words px-4 py-4 leading-6 text-slate-300">{row.agreement}</td>
                <td className="break-words px-4 py-4 leading-6 text-slate-300">{row.disagreement}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
