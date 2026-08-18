import type {
  Action,
  ComparisonResponse,
  ReadinessResponse,
  ScholarLensResponse,
} from "@/lib/scholarlens/schema";

type ExportData = ScholarLensResponse | ComparisonResponse | ReadinessResponse;

export default function ExportButton({ action, data }: { action: Action; data: ExportData }) {
  function downloadResult() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scholarlens-${action}-result.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={downloadResult}
      className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
    >
      Export JSON
    </button>
  );
}
