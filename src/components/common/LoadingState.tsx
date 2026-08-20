export default function LoadingState({
  label = "Searching the approved papers",
}: {
  label?: string;
}) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-3.5">
      <span className="sr-only">{label}</span>

      {/* Progress strip — communicates that the corpus is being scanned */}
      <div
        className="relative h-0.5 overflow-hidden rounded-full bg-ink-800"
        aria-hidden="true"
      >
        <span className="animate-sweep absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-signal-400 to-transparent" />
      </div>
      <p className="px-0.5 text-meta text-paper-400" aria-hidden="true">
        {label}…
      </p>

      {[0, 1].map((i) => (
        <div
          key={i}
          className="animate-skeleton rounded-card border border-ink-700/60 bg-ink-900/60 p-4 sm:p-5"
          aria-hidden="true"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="h-2.5 w-20 rounded bg-ink-800" />
              <div className="mt-2.5 h-4 w-2/3 rounded bg-ink-800" />
            </div>
            <div className="h-5 w-16 shrink-0 rounded-full bg-ink-800" />
          </div>
          <div className="mt-5 space-y-2">
            <div className="h-2.5 w-full rounded bg-ink-800" />
            <div className="h-2.5 w-5/6 rounded bg-ink-800" />
          </div>
          {/* The quote block keeps its identity even while loading */}
          <div className="mt-5 rounded-xl border border-cite-500/20 bg-cite-500/[0.07] p-3">
            <div className="h-2 w-36 rounded bg-cite-500/25" />
            <div className="mt-3 h-2.5 w-full rounded bg-ink-800" />
            <div className="mt-2 h-2.5 w-4/5 rounded bg-ink-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
