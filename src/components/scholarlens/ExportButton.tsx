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
      className="inline-flex items-center gap-1.5 rounded-xl border border-ink-700 bg-ink-900/70
      px-3 py-2 text-micro font-semibold text-paper-200 transition-all duration-150
      hover:border-ink-600 hover:bg-ink-850 hover:text-paper-50
      focus:outline-none focus:ring-2 focus:ring-signal-400 active:scale-[0.98]"
    >
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
        />
      </svg>
      Export JSON
    </button>
  );
}
