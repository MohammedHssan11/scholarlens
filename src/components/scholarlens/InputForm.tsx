"use client";

/**
 * Question form + result flow.
 * Owner: Mohammed Hassan Mahmoud (frontend ownership after Mariam Ali withdrew).
 */
import { useState, type FormEvent } from "react";
import type { ScholarLensResponse } from "@/lib/scholarlens/schema";
import ResultView from "./ResultView";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";

type ViewState = "idle" | "loading" | "success" | "empty" | "validation-error" | "provider-error";

export default function InputForm() {
  const [question, setQuestion] = useState("");
  const [data, setData] = useState<ScholarLensResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  async function runQuery(q: string) {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch("/api/scholarlens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, paper_ids: ["paper-001"] }),
      });

      let json: unknown = null;
      try {
        json = await response.json();
      } catch {
        // Response wasn't valid JSON — fall through to the generic error below.
      }

      if (!response.ok) {
        const message =
          json && typeof json === "object" && "error" in json && typeof (json as any).error === "string"
            ? (json as any).error
            : "Something went wrong. Please try again.";
        setError(message);
        return;
      }

      setData(json as ScholarLensResponse);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;

    const trimmed = question.trim();
    if (trimmed.length === 0) {
      setValidationError("Please enter a question before submitting.");
      setError(null);
      setData(null);
      return;
    }

    setValidationError(null);
    runQuery(trimmed);
  }

  function onRetry() {
    const trimmed = question.trim();
    if (trimmed.length === 0) {
      setValidationError("Please enter a question before submitting.");
      return;
    }
    runQuery(trimmed);
  }

  const evidenceCount = data && !data.not_found && Array.isArray(data.evidence) ? data.evidence.length : null;
  const viewState: ViewState = loading
    ? "loading"
    : validationError
    ? "validation-error"
    : error
    ? "provider-error"
    : data
    ? evidenceCount === 0
      ? "empty"
      : "success"
    : "idle";

  return (
    <section className="max-w-2xl mx-auto mt-12 px-4">
      <form
        onSubmit={onSubmit}
        noValidate
        className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-800
        bg-slate-900 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.3),0_16px_36px_rgba(0,0,0,0.45)]"
      >
        {/* Accent bar signals this is the primary action on the page */}
        <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />

        {/* Label */}
        <label htmlFor="question" className="text-sm font-semibold text-slate-100">
          Your research question
        </label>

        {/* Input */}
        <input
          id="question"
          name="question"
          value={question}
          onChange={(event) => {
            setQuestion(event.target.value);
            if (validationError) setValidationError(null);
          }}
          placeholder="Ask me anything about research or AI..."
          disabled={loading}
          aria-invalid={validationError ? true : undefined}
          aria-describedby={validationError ? "question-error" : undefined}
          className={`w-full rounded-xl border bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:border-transparent
          disabled:bg-slate-900 disabled:text-slate-600
          ${validationError ? "border-red-500/60 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"}`}
        />

        {/* Validation error — distinct from provider/network error state */}
        {validationError ? (
          <p id="question-error" role="alert" className="text-xs font-medium text-red-400">
            {validationError}
          </p>
        ) : (
          question.length === 0 && (
            <p className="text-xs text-slate-500">
              Try asking about machine learning, AI, or research papers
            </p>
          )
        )}

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="self-start rounded-xl bg-indigo-500 px-6 py-3 font-semibold text-white
          shadow-[0_0_0_1px_rgba(99,102,241,0.4),0_8px_20px_rgba(99,102,241,0.35)]
          transition-all duration-200
          hover:bg-indigo-400 hover:shadow-[0_0_0_1px_rgba(129,140,248,0.5),0_10px_28px_rgba(99,102,241,0.5)] hover:scale-105 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-indigo-500"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">🔄</span>
              Searching...
            </span>
          ) : (
            "Ask ScholarLens"
          )}
        </button>
      </form>

      {/* Results — aria-live announces state changes to screen readers */}
      <div className="mt-10 space-y-4" aria-live="polite">
        {viewState === "idle" && (
          <div className="animate-fade-slide-in rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/60 px-6 py-12 text-center">
            <p className="text-3xl" aria-hidden="true">📚</p>
            <p className="mt-3 text-base font-semibold text-slate-100">
              Start by asking a research question
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-400">
              ScholarLens searches the approved paper collection and returns traceable,
              source-backed evidence.
            </p>
          </div>
        )}
        {viewState === "loading" && <LoadingState />}
        {viewState === "provider-error" && error && <ErrorState message={error} onRetry={onRetry} />}
        {(viewState === "success" || viewState === "empty") && data && <ResultView data={data} />}
      </div>
    </section>
  );
}