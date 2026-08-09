import InputForm from "@/components/scholarlens/InputForm";

export default function ScholarLensPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-10">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.35)]">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 4a7 7 0 100 14 7 7 0 000-14zm0 0v4m0 0h4m-4 0L21 21"
              />
            </svg>
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-slate-50">
            Scholar<span className="text-indigo-400">Lens</span>
          </h1>
        </div>
        <p className="mt-2 text-slate-400">
          Research Evidence Navigator — Team 01 baseline
        </p>

        <div className="mt-5 flex items-start gap-3 rounded-lg border border-emerald-900/60 border-l-4 border-l-emerald-500 bg-emerald-500/10 px-4 py-3">
          <svg
            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          <p className="text-sm leading-relaxed text-emerald-300">
            Every answer shows a traceable source snippet — or clearly says evidence was not
            found.
          </p>
        </div>
      </header>
      <InputForm />
    </main>
  );
}
