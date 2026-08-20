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
  /** Minimum papers the current action needs, used for the progress hint. */
  requiredCount: number;
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
  requiredCount,
  onToggle,
  onSelectAll,
  onClear,
  onRetry,
}: PaperSelectorProps) {
  const selectedCount = selectedPaperIds.length;
  const meetsRequirement = selectedCount >= requiredCount;

  return (
    <aside className="lg:sticky lg:top-[76px]">
      <fieldset
        className="sl-panel overflow-hidden rounded-card border border-ink-700/70 bg-ink-900/70
        shadow-[0_20px_50px_-24px_rgba(0,0,0,0.9)] backdrop-blur-sm"
        aria-busy={loading}
        disabled={disabled}
      >
        {/* ── Rail header ─────────────────────────────────────── */}
        <div className="border-b border-ink-800 px-4 pb-3 pt-3.5">
          <div className="flex items-center justify-between gap-2">
            <legend className="text-meta font-semibold text-paper-50">Approved corpus</legend>
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-micro tabular-nums transition-colors ${
                meetsRequirement && selectedCount > 0
                  ? "bg-signal-500/15 text-signal-400"
                  : "bg-ink-800 text-paper-400"
              }`}
            >
              {selectedCount}/{papers.length || 0}
            </span>
          </div>

          {/* Selection progress — quiet, but always answers "am I ready?" */}
          <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-ink-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                meetsRequirement ? "bg-signal-500" : "bg-warn-400"
              }`}
              style={{
                width: papers.length
                  ? `${Math.min(100, (selectedCount / papers.length) * 100)}%`
                  : "0%",
              }}
            />
          </div>

          <div className="mt-2.5 flex items-center gap-3 text-micro">
            <button
              type="button"
              onClick={onSelectAll}
              disabled={loading || papers.length === 0 || disabled}
              className="font-semibold text-signal-400 transition-colors hover:text-signal-300
              focus:outline-none focus:underline disabled:cursor-not-allowed disabled:opacity-40"
            >
              Select all
            </button>
            <span className="h-3 w-px bg-ink-700" aria-hidden="true" />
            <button
              type="button"
              onClick={onClear}
              disabled={selectedCount === 0 || disabled}
              className="font-semibold text-paper-400 transition-colors hover:text-paper-200
              focus:outline-none focus:underline disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear
            </button>
          </div>
        </div>

        {/* ── Loading skeleton ────────────────────────────────── */}
        {loading && (
          <div className="space-y-1.5 p-3" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-skeleton rounded-lg bg-ink-850 px-3 py-2.5">
                <div className="h-2 w-14 rounded bg-ink-800" />
                <div className="mt-2 h-2.5 w-full rounded bg-ink-800" />
                <div className="mt-1.5 h-2.5 w-3/5 rounded bg-ink-800" />
              </div>
            ))}
          </div>
        )}

        {/* ── Corpus unavailable ──────────────────────────────── */}
        {error && (
          <div role="alert" className="m-3 rounded-xl border border-alert-400/40 bg-alert-400/10 p-3">
            <p className="text-meta font-semibold text-alert-300">Corpus unavailable</p>
            <p className="mt-1 text-micro leading-relaxed text-alert-300/85">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-2.5 rounded-lg border border-alert-400/40 px-2.5 py-1.5 text-micro
              font-semibold text-alert-300 transition-colors hover:bg-alert-400/15
              focus:outline-none focus:ring-2 focus:ring-alert-400"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── The papers ──────────────────────────────────────── */}
        {!loading && !error && (
          <div className="sl-scroll max-h-72 space-y-1 overflow-y-auto p-2.5 lg:max-h-[min(58vh,520px)]">
            {papers.map((paper) => {
              const checked = selectedPaperIds.includes(paper.source_id);
              return (
                <label
                  key={paper.source_id}
                  className={`group relative flex cursor-pointer gap-2.5 overflow-hidden rounded-xl
                  border py-2.5 pl-3 pr-2.5 transition-all duration-150
                  focus-within:ring-2 focus-within:ring-signal-400 ${
                    checked
                      ? "border-signal-500/35 bg-signal-500/[0.09]"
                      : "border-transparent hover:border-ink-700 hover:bg-ink-850"
                  }`}
                >
                  {/* Accent bar marks a chosen source */}
                  <span
                    className={`absolute inset-y-0 left-0 w-0.5 transition-colors ${
                      checked ? "bg-signal-500" : "bg-transparent"
                    }`}
                    aria-hidden="true"
                  />
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(paper.source_id)}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-signal-500"
                  />
                  <span className="min-w-0">
                    <span
                      className={`block font-mono text-micro transition-colors ${
                        checked ? "text-signal-400" : "text-paper-600"
                      }`}
                    >
                      {paper.source_id}
                    </span>
                    <span
                      className={`mt-0.5 block break-words text-micro leading-[1.45] transition-colors ${
                        checked ? "text-paper-50" : "text-paper-200"
                      }`}
                    >
                      {paper.title}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        )}

        {/* ── Selection error, anchored to the thing it is about ── */}
        {selectionError && (
          <p
            role="alert"
            className="border-t border-alert-400/25 bg-alert-400/10 px-4 py-2.5 text-micro
            font-medium leading-relaxed text-alert-300"
          >
            {selectionError}
          </p>
        )}
      </fieldset>

      <p className="mt-2.5 px-1 text-micro leading-relaxed text-paper-600">
        Answers can only be drawn from these approved papers — nothing else.
      </p>
    </aside>
  );
}
