export default function LoadingState({ label = "Searching the approved papers" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <span className="sr-only">{label}</span>
      {[0, 1].map((i) => (
        <div
          key={i}
          className="animate-skeleton rounded-lg border border-slate-800 bg-slate-900 p-5 sm:p-6"
          aria-hidden="true"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="h-5 w-2/3 rounded bg-slate-800" />
            <div className="h-5 w-12 shrink-0 rounded-full bg-slate-800" />
          </div>
          <div className="mt-3 h-3 w-24 rounded bg-slate-800" />
          <div className="mt-5 space-y-2">
            <div className="h-3 w-full rounded bg-slate-800" />
            <div className="h-3 w-5/6 rounded bg-slate-800" />
          </div>
          <div className="mt-5 h-16 rounded-lg bg-indigo-500/10" />
        </div>
      ))}
    </div>
  );
}
