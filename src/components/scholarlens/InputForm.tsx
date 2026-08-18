"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ComparisonResponseSchema,
  ReadinessResponseSchema,
  ScholarLensResponseSchema,
  type Action,
  type ComparisonResponse,
  type ReadinessResponse,
  type ScholarLensRequest,
  type ScholarLensResponse,
} from "@/lib/scholarlens/schema";
import ErrorState from "@/components/common/ErrorState";
import LoadingState from "@/components/common/LoadingState";
import ComparisonView from "./ComparisonView";
import ExportButton from "./ExportButton";
import PaperSelector, { type PaperOption } from "./PaperSelector";
import ReadinessView from "./ReadinessView";
import ResultView from "./ResultView";

type ViewState =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "validation-error"
  | "provider-error";

type ActionResult =
  | { action: "ask"; data: ScholarLensResponse }
  | { action: "compare"; data: ComparisonResponse }
  | { action: "readiness"; data: ReadinessResponse };

const ACTION_OPTIONS: Array<{ value: Action; label: string }> = [
  { value: "ask", label: "Ask" },
  { value: "compare", label: "Compare" },
  { value: "readiness", label: "Readiness" },
];

const ACTION_LABELS: Record<Action, { button: string; loading: string; result: string }> = {
  ask: {
    button: "Ask ScholarLens",
    loading: "Searching selected papers",
    result: "Evidence answer",
  },
  compare: {
    button: "Compare papers",
    loading: "Building comparison",
    result: "Paper comparison",
  },
  readiness: {
    button: "Check readiness",
    loading: "Checking research readiness",
    result: "Readiness result",
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseHealthResponse(value: unknown): PaperOption[] {
  if (!isRecord(value) || !isRecord(value.corpus)) return [];

  const paperIds = Array.isArray(value.corpus.paper_ids)
    ? value.corpus.paper_ids.filter((paperId): paperId is string => typeof paperId === "string")
    : [];
  const papers = Array.isArray(value.corpus.papers)
    ? value.corpus.papers.filter(
        (paper): paper is PaperOption =>
          isRecord(paper) &&
          typeof paper.source_id === "string" &&
          typeof paper.title === "string",
      )
    : [];

  if (papers.length > 0) return papers;
  return paperIds.map((sourceId) => ({ source_id: sourceId, title: sourceId }));
}

async function fetchAvailablePapers(): Promise<PaperOption[]> {
  const response = await fetch("/api/scholarlens", { method: "GET" });
  const json: unknown = await response.json();
  if (!response.ok) {
    throw new Error(getErrorPayload(json).message);
  }

  const availablePapers = parseHealthResponse(json);
  if (availablePapers.length === 0) {
    throw new Error("No approved papers are currently available.");
  }
  return availablePapers;
}

function getErrorPayload(value: unknown): { message: string; code?: string } {
  if (!isRecord(value)) {
    return { message: "Something went wrong. Please try again." };
  }

  return {
    message:
      typeof value.error === "string"
        ? value.error
        : "Something went wrong. Please try again.",
    code: typeof value.code === "string" ? value.code : undefined,
  };
}

function parseActionResult(action: Action, value: unknown): ActionResult {
  switch (action) {
    case "ask":
      return { action, data: ScholarLensResponseSchema.parse(value) };
    case "compare":
      return { action, data: ComparisonResponseSchema.parse(value) };
    case "readiness":
      return { action, data: ReadinessResponseSchema.parse(value) };
  }
}

function minimumPaperCount(action: Action): number {
  if (action === "compare") return 2;
  if (action === "readiness") return 3;
  return 1;
}

function isEmptyResult(result: ActionResult): boolean {
  if (result.action === "ask") {
    return result.data.not_found || result.data.evidence.length === 0;
  }
  if (result.action === "compare") return result.data.matrix.length === 0;
  return false;
}

export default function InputForm() {
  const [action, setAction] = useState<Action>("ask");
  const [question, setQuestion] = useState("");
  const [papers, setPapers] = useState<PaperOption[]>([]);
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [lastRequest, setLastRequest] = useState<ScholarLensRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [papersLoading, setPapersLoading] = useState(true);
  const [papersError, setPapersError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void fetchAvailablePapers()
      .then((availablePapers) => {
        if (!active) return;
        setPapers(availablePapers);
        setPapersError(null);
        const availableIds = new Set(availablePapers.map((paper) => paper.source_id));
        setSelectedPaperIds((current) => current.filter((paperId) => availableIds.has(paperId)));
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setPapersError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load the approved paper collection.",
        );
      })
      .finally(() => {
        if (active) setPapersLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function reloadPapers() {
    setPapersLoading(true);
    setPapersError(null);
    try {
      const availablePapers = await fetchAvailablePapers();
      setPapers(availablePapers);
      setPapersError(null);
      const availableIds = new Set(availablePapers.map((paper) => paper.source_id));
      setSelectedPaperIds((current) => current.filter((paperId) => availableIds.has(paperId)));
    } catch (loadError) {
      setPapersError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load the approved paper collection.",
      );
    } finally {
      setPapersLoading(false);
    }
  }

  async function runQuery(request: ScholarLensRequest) {
    setLoading(true);
    setError(null);
    setQuestionError(null);
    setSelectionError(null);
    setResult(null);
    setLastRequest(request);

    try {
      const response = await fetch("/api/scholarlens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      let json: unknown = null;
      try {
        json = await response.json();
      } catch {
        // The generic safe error below handles a non-JSON response.
      }

      if (!response.ok) {
        const payload = getErrorPayload(json);
        if (payload.code === "VALIDATION_ERROR" || payload.code === "UNKNOWN_PAPER_IDS") {
          setSelectionError(payload.message);
        } else {
          setError(payload.message);
        }
        return;
      }

      try {
        setResult(parseActionResult(request.action, json));
      } catch {
        setError("The server returned an unexpected response. Please try again.");
      }
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function validateRequest(): ScholarLensRequest | null {
    const trimmed = question.trim();
    const requiredPapers = minimumPaperCount(action);
    let valid = true;

    if (trimmed.length < 3) {
      setQuestionError("Enter a research question with at least 3 characters.");
      valid = false;
    } else {
      setQuestionError(null);
    }

    if (selectedPaperIds.length < requiredPapers) {
      const actionLabel = ACTION_OPTIONS.find((option) => option.value === action)?.label.toLowerCase();
      setSelectionError(
        `Select at least ${requiredPapers} paper${requiredPapers === 1 ? "" : "s"} for ${actionLabel}.`,
      );
      valid = false;
    } else {
      setSelectionError(null);
    }

    if (!valid) {
      setError(null);
      setResult(null);
      return null;
    }

    return { action, question: trimmed, paper_ids: selectedPaperIds };
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;

    const request = validateRequest();
    if (request) void runQuery(request);
  }

  function onRetry() {
    if (lastRequest && !loading) void runQuery(lastRequest);
  }

  function changeAction(nextAction: Action) {
    setAction(nextAction);
    setError(null);
    setQuestionError(null);
    setSelectionError(null);
    setResult(null);
  }

  function togglePaper(paperId: string) {
    setSelectedPaperIds((current) =>
      current.includes(paperId)
        ? current.filter((selectedId) => selectedId !== paperId)
        : [...current, paperId],
    );
    setSelectionError(null);
  }

  const hasValidationError = Boolean(questionError || selectionError);
  const viewState: ViewState = loading
    ? "loading"
    : hasValidationError
      ? "validation-error"
      : error
        ? "provider-error"
        : result
          ? isEmptyResult(result)
            ? "empty"
            : "success"
          : "idle";

  return (
    <section className="mx-auto mt-8 max-w-5xl">
      <form
        onSubmit={onSubmit}
        noValidate
        className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900 shadow-[0_12px_32px_rgba(0,0,0,0.3)]"
      >
        <fieldset className="border-b border-slate-800 px-5 py-4 sm:px-6">
          <legend className="sr-only">Research action</legend>
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-950 p-1">
            {ACTION_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer rounded-md px-3 py-2 text-center text-sm font-semibold transition-colors focus-within:ring-2 focus-within:ring-emerald-400 ${
                  action === option.value
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <input
                  type="radio"
                  name="action"
                  value={option.value}
                  checked={action === option.value}
                  onChange={() => changeAction(option.value)}
                  disabled={loading}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.78fr)]">
          <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
            <div>
              <label htmlFor="question" className="text-sm font-semibold text-slate-100">
                Research question
              </label>
              <textarea
                id="question"
                name="question"
                value={question}
                onChange={(event) => {
                  setQuestion(event.target.value);
                  if (questionError) setQuestionError(null);
                }}
                placeholder="What evidence do the selected papers provide?"
                disabled={loading}
                rows={5}
                aria-invalid={questionError ? true : undefined}
                aria-describedby={questionError ? "question-error" : undefined}
                className={`mt-2 w-full resize-y rounded-lg border bg-slate-950 px-4 py-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                  questionError
                    ? "border-red-500/70 focus:ring-red-500"
                    : "border-slate-700 focus:border-transparent focus:ring-emerald-500"
                }`}
              />
              {questionError && (
                <p id="question-error" role="alert" className="mt-2 text-xs font-medium text-red-400">
                  {questionError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || papersLoading || papers.length === 0}
              aria-busy={loading}
              className="w-full rounded-lg bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {loading ? ACTION_LABELS[action].loading : ACTION_LABELS[action].button}
            </button>
          </div>

          <PaperSelector
            papers={papers}
            selectedPaperIds={selectedPaperIds}
            loading={papersLoading}
            disabled={loading}
            error={papersError}
            selectionError={selectionError}
            onToggle={togglePaper}
            onSelectAll={() => {
              setSelectedPaperIds(papers.map((paper) => paper.source_id));
              setSelectionError(null);
            }}
            onClear={() => setSelectedPaperIds([])}
            onRetry={() => {
              void reloadPapers();
            }}
          />
        </div>
      </form>

      <div className="mt-8 space-y-4" aria-live="polite">
        {viewState === "idle" && (
          <div className="rounded-lg border border-dashed border-slate-700 px-6 py-10 text-center">
            <p className="text-base font-semibold text-slate-200">No result yet</p>
          </div>
        )}
        {viewState === "loading" && <LoadingState label={ACTION_LABELS[action].loading} />}
        {viewState === "provider-error" && error && (
          <ErrorState message={error} onRetry={lastRequest ? onRetry : undefined} />
        )}
        {(viewState === "success" || viewState === "empty") && result && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <h2 className="text-base font-semibold text-slate-100">
                {ACTION_LABELS[result.action].result}
              </h2>
              <ExportButton action={result.action} data={result.data} />
            </div>
            {result.action === "ask" && <ResultView data={result.data} />}
            {result.action === "compare" && <ComparisonView data={result.data} />}
            {result.action === "readiness" && <ReadinessView data={result.data} />}
          </div>
        )}
      </div>
    </section>
  );
}
