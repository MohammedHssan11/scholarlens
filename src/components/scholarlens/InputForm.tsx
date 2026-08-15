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
    <section>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <label htmlFor="question" className="font-medium text-slate-800">
          Your research question
        </label>
        <input
          id="question"
          name="question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="e.g. Which methods are used to measure X?"
          className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          required
        />
        <button
          type="submit"
          disabled={loading || question.trim().length === 0}
          className="self-start rounded-lg bg-blue-700 px-5 py-2.5 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Searching…" : "Ask"}
        </button>
      </form>

      <div className="mt-8">
        {loading && <LoadingState />}
        {error && <ErrorState message={error} />}
        {data && <ResultView data={data} />}
      </div>
    </section>
  );
}
