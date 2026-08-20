"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ComparisonResponseSchema,
  ReadinessResponseSchema,
  ScholarLensResponseSchema,
  MAX_QUESTION_LENGTH,
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

const ACTION_LABELS: Record<
  Action,
  { button: string; loading: string; result: string; hint: string; placeholder: string }
> = {
  ask: {
    button: "Ask ScholarLens",
    loading: "Searching selected papers",
    result: "Evidence answer",
    hint: "Find evidence for one question across the papers you select.",
    placeholder: "e.g. How does the survey define Agentic Retrieval-Augmented Generation?",
  },
  compare: {
    button: "Compare papers",
    loading: "Building comparison",
    result: "Paper comparison",
    hint: "See where the selected papers agree and where they disagree.",
    placeholder: "e.g. How do these papers describe the role of the retrieval step?",
  },
  readiness: {
    button: "Check readiness",
    loading: "Checking research readiness",
    result: "Readiness result",
    hint: "Check whether your evidence is broad enough and properly sourced.",
    placeholder: "e.g. What evidence supports agent-controlled retrieval routing?",
  },
};

/** Starting points, so a first-time user is never facing an empty box. */
const EXAMPLE_QUESTIONS: Record<Action, string[]> = {
  ask: [
    "How does the survey define Agentic Retrieval-Augmented Generation?",
    "What limitations do these papers report for current RAG systems?",
  ],
  compare: [
    "How does each paper describe the role of the retrieval step?",
    "Where do these papers disagree about agent autonomy?",
  ],
  readiness: [
    "What evidence supports agent-controlled retrieval routing?",
    "How well is multimodal RAG evaluated across these papers?",
  ],
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

  function submitNow() {
    if (loading) return;
    const request = validateRequest();
    if (request) void runQuery(request);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    submitNow();
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

  const required = minimumPaperCount(action);
  const shortBy = Math.max(0, required - selectedPaperIds.length);

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
      {/* ══ Left rail: the approved corpus ══════════════════════ */}
      <PaperSelector
        papers={papers}
        selectedPaperIds={selectedPaperIds}
        loading={papersLoading}
        disabled={loading}
        error={papersError}
        selectionError={selectionError}
        requiredCount={required}
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

      {/* ══ Right column: composer + results ════════════════════ */}
      <div className="min-w-0">
        <form
          onSubmit={onSubmit}
          noValidate
          className="sl-panel overflow-hidden rounded-card border border-ink-700/70 bg-ink-900/70
          shadow-[0_20px_50px_-24px_rgba(0,0,0,0.9)] backdrop-blur-sm"
        >
          {/* Action switcher */}
          <fieldset className="border-b border-ink-800 px-4 pb-3.5 pt-4 sm:px-5">
            <legend className="sr-only">Research action</legend>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-ink-950/70 p-1">
              {ACTION_OPTIONS.map((option) => {
                const isActive = action === option.value;
                return (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-lg px-3 py-2 text-center text-meta font-semibold
                    transition-all duration-150 focus-within:ring-2 focus-within:ring-signal-400 ${
                      isActive
                        ? "bg-ink-800 text-paper-50 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_6px_16px_-8px_rgba(0,0,0,0.9)]"
                        : "text-paper-400 hover:bg-ink-800/50 hover:text-paper-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="action"
                      value={option.value}
                      checked={isActive}
                      onChange={() => changeAction(option.value)}
                      disabled={loading}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
            <p className="mt-2.5 text-micro leading-relaxed text-paper-400">
              {ACTION_LABELS[action].hint}
            </p>
          </fieldset>

          {/* Question */}
          <div className="px-4 py-4 sm:px-5">
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="question" className="text-meta font-semibold text-paper-50">
                Research question
              </label>
              <span
                className={`font-mono text-micro tabular-nums ${
                  question.length > MAX_QUESTION_LENGTH ? "text-alert-400" : "text-paper-600"
                }`}
              >
                {question.length}/{MAX_QUESTION_LENGTH}
              </span>
            </div>

            <textarea
              id="question"
              name="question"
              value={question}
              onChange={(event) => {
                setQuestion(event.target.value);
                if (questionError) setQuestionError(null);
              }}
              onKeyDown={(event) => {
                // Power-user submit, matching the hint shown beside the button
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  event.preventDefault();
                  submitNow();
                }
              }}
              placeholder={ACTION_LABELS[action].placeholder}
              disabled={loading}
              rows={4}
              aria-invalid={questionError ? true : undefined}
              aria-describedby={questionError ? "question-error" : undefined}
              className={`mt-2 w-full resize-y rounded-xl border bg-ink-950/60 px-3.5 py-3
              text-lead leading-relaxed text-paper-50 transition-colors
              placeholder:text-paper-600 focus:outline-none focus:ring-2
              disabled:cursor-not-allowed disabled:opacity-60 ${
                questionError
                  ? "border-alert-400/60 focus:ring-alert-400/60"
                  : "border-ink-700 hover:border-ink-600 focus:border-transparent focus:ring-signal-400/70"
              }`}
            />
            {questionError && (
              <p
                id="question-error"
                role="alert"
                className="mt-2 flex items-center gap-1.5 text-micro font-medium text-alert-300"
              >
                <svg
                  className="h-3.5 w-3.5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.4}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
                </svg>
                {questionError}
              </p>
            )}

            {/* Example questions — removes the blank-page problem */}
            {question.trim().length === 0 && (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-micro text-paper-600">Try:</span>
                {EXAMPLE_QUESTIONS[action].map((example) => (
                  <button
                    key={example}
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setQuestion(example);
                      setQuestionError(null);
                    }}
                    className="max-w-full truncate rounded-lg border border-ink-700 bg-ink-950/50
                    px-2.5 py-1 text-micro text-paper-400 transition-colors
                    hover:border-ink-600 hover:bg-ink-850 hover:text-paper-200
                    focus:outline-none focus:ring-2 focus:ring-signal-400
                    disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {example}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={loading || papersLoading || papers.length === 0}
                aria-busy={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-signal-500 px-5 py-2.5
                text-meta font-bold text-ink-950 transition-all duration-150
                hover:bg-signal-400 hover:shadow-[0_8px_24px_-8px_rgba(16,185,129,0.7)]
                focus:outline-none focus:ring-2 focus:ring-signal-400 focus:ring-offset-2
                focus:ring-offset-ink-900 active:scale-[0.98]
                disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
              >
                {loading ? (
                  <>
                    <span
                      className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink-950/30 border-t-ink-950"
                      aria-hidden="true"
                    />
                    {ACTION_LABELS[action].loading}
                  </>
                ) : (
                  <>
                    {ACTION_LABELS[action].button}
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.6}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>

              <kbd
                className="hidden rounded-md border border-ink-700 bg-ink-950/60 px-1.5 py-1
                font-mono text-micro text-paper-600 sm:inline-block"
                aria-hidden="true"
              >
                ⌘ ↵
              </kbd>

              {/* Live requirement feedback, before the user can get it wrong */}
              <p className="text-micro text-paper-400">
                {shortBy > 0 ? (
                  <span className="text-warn-300">
                    {ACTION_OPTIONS.find((o) => o.value === action)?.label} needs {required}{" "}
                    {required === 1 ? "paper" : "papers"} — select {shortBy} more
                  </span>
                ) : (
                  <>
                    <span className="font-semibold text-paper-200">
                      {selectedPaperIds.length}
                    </span>{" "}
                    paper{selectedPaperIds.length === 1 ? "" : "s"} selected
                  </>
                )}
              </p>
            </div>
          </div>
        </form>

        {/* ══ Results ═══════════════════════════════════════════ */}
        <div className="mt-5" aria-live="polite">
          {viewState === "idle" && (
            <div
              className="rounded-card border border-dashed border-ink-700/80 bg-ink-900/30
              px-6 py-14 text-center"
            >
              <span
                className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl
                border border-ink-700 bg-ink-850"
              >
                <svg
                  className="h-5 w-5 text-paper-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.9}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 4a7 7 0 100 14 7 7 0 000-14zm0 0v4m0 0h4m-4 0L21 21"
                  />
                </svg>
              </span>
              <p className="text-lead font-semibold text-paper-200">Ready when you are</p>
              <p className="mx-auto mt-1.5 max-w-sm text-meta leading-relaxed text-paper-400">
                Select papers on the left, write your question, and every claim in the answer will
                come back with the exact sentence that supports it.
              </p>
            </div>
          )}

          {viewState === "loading" && <LoadingState label={ACTION_LABELS[action].loading} />}

          {viewState === "provider-error" && error && (
            <ErrorState message={error} onRetry={lastRequest ? onRetry : undefined} />
          )}

          {(viewState === "success" || viewState === "empty") && result && (
            <div className="animate-fade-slide-in">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-ink-800 pb-3">
                <h2 className="text-title font-semibold tracking-tight text-paper-50">
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
      </div>
    </div>
  );
}
