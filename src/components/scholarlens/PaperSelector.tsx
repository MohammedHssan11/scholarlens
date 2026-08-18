export type PaperOption = {
  source_id: string;
  title: string;
};

type PaperSelectorProps = {
  papers: PaperOption[];
  selectedPaperIds: string[];
  loading: boolean;
  disabled: boolean;
  error: string | null;
  selectionError: string | null;
  onToggle: (paperId: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
  onRetry: () => void;
};

export default function PaperSelector({
  papers,
  selectedPaperIds,
  loading,
  disabled,
  error,
  selectionError,
  onToggle,
  onSelectAll,
  onClear,
  onRetry,
}: PaperSelectorProps) {
  return (
    <fieldset
      className="border-t border-slate-800 px-5 py-5 lg:border-l lg:border-t-0 lg:px-6"
      aria-busy={loading}
      disabled={disabled}
    >
      <div className="flex items-center justify-between gap-3">
        <legend className="text-sm font-semibold text-slate-100">Approved papers</legend>
        <span className="text-xs font-medium text-slate-400">
          {selectedPaperIds.length} selected
        </span>
      </div>

      <div className="mt-3 flex gap-3 text-xs">
        <button
          type="button"
          onClick={onSelectAll}
          disabled={loading || papers.length === 0 || disabled}
          className="font-semibold text-emerald-400 hover:text-emerald-300 focus:outline-none focus:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          Select all
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={selectedPaperIds.length === 0 || disabled}
          className="font-semibold text-slate-400 hover:text-slate-200 focus:outline-none focus:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear
        </button>
      </div>

      {loading && <p className="mt-5 text-sm text-slate-400">Loading approved papers...</p>}

      {error && (
        <div role="alert" className="mt-4 border-l-2 border-red-500 pl-3">
          <p className="text-sm text-red-300">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-xs font-semibold text-red-300 underline underline-offset-2"
          >
            Retry paper list
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="mt-4 max-h-72 space-y-1 overflow-y-auto pr-1">
          {papers.map((paper) => {
            const checked = selectedPaperIds.includes(paper.source_id);
            return (
              <label
                key={paper.source_id}
                className={`flex cursor-pointer items-start gap-3 rounded-md px-3 py-2.5 transition-colors focus-within:ring-2 focus-within:ring-emerald-500 ${
                  checked ? "bg-emerald-500/10" : "hover:bg-slate-800/80"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(paper.source_id)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-500"
                />
                <span className="min-w-0">
                  <span className="block font-mono text-[11px] text-slate-500">
                    {paper.source_id}
                  </span>
                  <span className="mt-0.5 block break-words text-xs leading-5 text-slate-200">
                    {paper.title}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      )}

      {selectionError && (
        <p role="alert" className="mt-3 text-xs font-medium text-red-400">
          {selectionError}
        </p>
      )}
    </fieldset>
  );
}
