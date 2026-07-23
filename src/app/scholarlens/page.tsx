import InputForm from "@/components/scholarlens/InputForm";

export default function ScholarLensPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">ScholarLens</h1>
        <p className="mt-1 text-slate-600">
          Research Evidence Navigator — Team 01 baseline
        </p>
        <p className="mt-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Every answer shows a traceable source snippet — or clearly says evidence was not
          found.
        </p>
      </header>
      <InputForm />
    </main>
  );
}
