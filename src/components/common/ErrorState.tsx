export default function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="rounded-lg border border-red-900/50 bg-red-500/10 px-5 py-4">
      <p className="font-semibold text-red-300">Something went wrong</p>
      <p className="mt-1 text-sm text-red-200/90">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg border border-red-800 bg-slate-900 px-4 py-2 text-sm font-semibold
          text-red-300 shadow-sm transition-colors duration-150 hover:bg-red-500/15
          focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Try again
        </button>
      )}
    </div>
  );
}
