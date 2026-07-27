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

export default function InputForm() {
  const [question, setQuestion] = useState("");
  const [data, setData] = useState<ScholarLensResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch("/api/scholarlens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, paper_ids: ["paper-001"] }),
      });
      const json = await response.json();

      if (!response.ok) {
        setError(typeof json.error === "string" ? json.error : "Something went wrong.");
        return;
      }
      setData(json as ScholarLensResponse);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-2xl mx-auto mt-12 px-4">
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-md border border-gray-200"
      >
        {/* Label */}
        <label htmlFor="question" className="text-sm font-semibold text-gray-700">
          Your research question
        </label>

        {/* Input */}
        <input
          id="question"
          name="question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask me anything about research or AI..."
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
          transition-all duration-200"
          required
        />

        {/* Helper text */}
        {question.length === 0 && (
          <p className="text-xs text-gray-400">
            Try asking about machine learning, AI, or research papers
          </p>
        )}

        {/* Button */}
        <button
          type="submit"
          disabled={loading || question.trim().length === 0}
          className="self-start rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 
          px-6 py-3 font-semibold text-white shadow-md 
          hover:shadow-lg hover:scale-105 transition-all duration-200 
          disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Results */}
      <div className="mt-8 space-y-4">
        {loading && <LoadingState />}
        {error && <ErrorState message={error} />}
        {data && <ResultView data={data} />}
      </div>
    </section>
  );
}
