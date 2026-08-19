export default function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="animate-fade-slide-in flex items-start gap-3.5 rounded-card border
      border-alert-400/30 bg-alert-400/[0.08] px-5 py-4"
    >
      <span
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl
        border border-alert-400/30 bg-alert-400/10"
      >
        <svg
          className="h-4 w-4 text-alert-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"
          />
        </svg>
      </span>

      <div className="min-w-0">
        <p className="text-lead font-semibold text-alert-300">Something went wrong</p>
        <p className="mt-1 break-words text-meta leading-relaxed text-paper-200">{message}</p>
        <p className="mt-2 text-micro leading-relaxed text-paper-400">
          No answer is shown when the system cannot complete a verified one.
        </p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-alert-400/40
            bg-ink-900/60 px-3.5 py-2 text-meta font-semibold text-alert-300
            transition-colors hover:bg-alert-400/15 focus:outline-none
            focus:ring-2 focus:ring-alert-400 active:scale-[0.98]"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.4}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h5M20 20v-5h-5M20 9A8 8 0 006 5.6M4 15a8 8 0 0014 3.4"
              />
            </svg>
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
