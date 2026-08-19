import InputForm from "@/components/scholarlens/InputForm";

export default function ScholarLensPage() {
  return (
    <>
      {/* ── App bar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-ink-800/80 bg-ink-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
              bg-gradient-to-br from-cite-400 to-signal-500
              shadow-[0_4px_16px_-4px_rgba(99,102,241,0.7)]"
            >
              <svg
                className="h-[18px] w-[18px] text-ink-950"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.4}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 4a7 7 0 100 14 7 7 0 000-14zm0 0v4m0 0h4m-4 0L21 21"
                />
              </svg>
            </span>
            <div className="min-w-0">
              <h1 className="text-[17px] font-semibold leading-tight tracking-tight text-paper-50">
                Scholar<span className="text-cite-300">Lens</span>
              </h1>
              <p className="text-micro leading-tight text-paper-400">
                Research Evidence Navigator
              </p>
            </div>
          </div>

          {/* The product promise, stated in the chrome itself */}
          <div
            className="hidden items-center gap-2 rounded-full border border-signal-500/25
            bg-signal-500/10 py-1.5 pl-2.5 pr-3.5 md:flex"
          >
            <svg
              className="h-3.5 w-3.5 shrink-0 text-signal-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.6}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <p className="text-micro font-medium text-signal-400">
              Every claim carries a quote verified against its source
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-16 pt-6 sm:px-6">
        {/* Compact promise for small screens, where the pill is hidden */}
        <p
          className="mb-4 flex items-start gap-2 rounded-xl border border-signal-500/20
          bg-signal-500/[0.07] px-3.5 py-2.5 text-meta leading-relaxed text-signal-400 md:hidden"
        >
          <svg
            className="mt-0.5 h-3.5 w-3.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.6}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Every answer shows a traceable source snippet — or clearly says evidence was not found.
        </p>

        <InputForm />
      </main>
    </>
  );
}
