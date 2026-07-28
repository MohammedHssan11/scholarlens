/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  SCHOLARLENS — Section 4: Grounding & Tool Execution               │
 * │  File: service.ts                                                   │
 * │  Owner: AlBaraa (AI & Backend Engineer)                             │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * Service orchestration: retrieve evidence → provider call → structured answer.
 *
 * ARCHITECTURE:
 *   This module sits between the route handler and the provider layer.
 *   It is responsible for:
 *     1. Validating paper IDs against the approved corpus manifest.
 *     2. Retrieving context from the approved corpus (or delegating to
 *        Gemini File Search if a store is configured).
 *     3. Calling the provider fallback chain for evidence extraction.
 *     4. Filtering AI output to ensure only approved paper IDs are cited.
 *     5. Assembling the final typed response.
 *     6. Running deterministic tools (compare_papers, research_readiness).
 *
 * DETERMINISTIC vs AI BOUNDARY:
 *   - Paper ID validation: DETERMINISTIC (allowlist check)
 *   - Evidence retrieval: AI (Gemini File Search)
 *   - Evidence extraction: AI (Groq/Gemini structured output)
 *   - Paper comparison: DETERMINISTIC (compare_papers function)
 *   - Readiness check: DETERMINISTIC (research_readiness function)
 *   - Output filtering: DETERMINISTIC (remove unauthorized source_ids)
 *
 * @see docs/architecture.md for the full system flow.
 */
import type {
  ScholarLensRequest,
  ScholarLensResponse,
  ComparisonResponse,
  ReadinessResponse,
  EvidenceItem,
} from "./schema";
import { generateEvidence } from "../ai/providers";
import { compare_papers, research_readiness } from "./tools";

// ─── Corpus Manifest ─────────────────────────────────────────────────────────

/**
 * Approved paper IDs from the source register.
 *
 * TODO(AlBaraa + Mariam Eladawy): Replace this placeholder with real paper
 * IDs once the corpus is finalized. This should eventually be loaded from
 * `data/corpus/manifest.json` at startup.
 *
 * WHY AN ALLOWLIST:
 *   The product must ONLY answer from approved papers. An allowlist ensures
 *   that even if the AI hallucinates a paper ID, it gets filtered out
 *   before reaching the client. This is a deterministic safety boundary.
 */
const APPROVED_PAPER_IDS = new Set<string>([
  "paper-001",
  "paper-002",
  "paper-003",
  "paper-004",
  "paper-005",
  "paper-006",
  "paper-007",
  "paper-008",
  "paper-009",
  "paper-010",
  "paper-011",
  "paper-012",
  "paper-013",
  "paper-014",
  "paper-015",
]);

/**
 * Validate that all paper IDs are in the approved corpus.
 *
 * @param paperIds - Paper IDs from the request.
 * @returns Array of unknown paper IDs (empty if all are valid).
 */
export function getUnknownPaperIds(paperIds: string[]): string[] {
  return paperIds.filter((id) => !APPROVED_PAPER_IDS.has(id));
}

// ─── Context Retrieval ───────────────────────────────────────────────────────

/**
 * Retrieve relevant context chunks from the approved corpus.
 *
 * CURRENT IMPLEMENTATION:
 *   Returns a placeholder context string. When the Gemini File Search store
 *   is configured (GEMINI_FILE_SEARCH_STORE_ID env var), the provider layer
 *   handles retrieval automatically via the file_search tool.
 *
 * FUTURE IMPLEMENTATION:
 *   Could query the Gemini File Search API directly here for more control
 *   over chunk selection and metadata extraction.
 *
 * @param question  - The user's research question.
 * @param paperIds  - Approved paper IDs to search within.
 * @returns Concatenated text chunks from the corpus.
 */
async function retrieveContext(
  _question: string,
  _paperIds: string[],
): Promise<string> {
  /**
   * If GEMINI_FILE_SEARCH_STORE_ID is set, the Gemini provider handles
   * retrieval automatically through its file_search tool configuration.
   * In that case, we pass minimal context here and let Gemini retrieve.
   */
  if (process.env.GEMINI_FILE_SEARCH_STORE_ID) {
    return "Context will be retrieved by Gemini File Search from the approved corpus store.";
  }

  /**
   * BASELINE FALLBACK:
   * When no File Search store is configured, return a placeholder.
   * This allows the system to still function (returning not_found or
   * using whatever context the model can work with).
   *
   * TODO(AlBaraa): Implement direct File Search API retrieval here
   * for when Groq is the primary provider (Groq can't use Gemini's
   * File Search tool, so we need to retrieve chunks first and pass
   * them as context).
   */
  return "No pre-retrieved context available. The system relies on Gemini File Search for retrieval.";
}

// ─── Evidence Filtering ──────────────────────────────────────────────────────

/**
 * DETERMINISTIC post-processing: filter AI output to only include
 * evidence from approved papers.
 *
 * WHY THIS EXISTS:
 *   AI models may hallucinate source_ids that don't exist in the corpus.
 *   This filter is a hard boundary — if the AI claims evidence from a
 *   paper not in paper_ids, that evidence is silently removed.
 *
 * @param evidence  - Evidence items from the AI provider.
 * @param paperIds  - The approved paper IDs from the request.
 * @returns Filtered evidence with only approved source_ids.
 */
function filterToApprovedPapers(
  evidence: EvidenceItem[],
  paperIds: string[],
): EvidenceItem[] {
  const approvedSet = new Set(paperIds);
  return evidence.filter((item) => approvedSet.has(item.source_id));
}

// ─── Action Handlers ─────────────────────────────────────────────────────────

/**
 * Handle action="ask": retrieve evidence and return structured synthesis.
 *
 * FLOW:
 *   1. Deduplicate paper_ids
 *   2. Retrieve context from corpus
 *   3. Call provider fallback chain
 *   4. Filter evidence to approved papers only
 *   5. Assemble typed response
 *
 * @param request - Zod-validated request.
 * @returns Structured evidence response.
 */
export async function handleAsk(
  request: ScholarLensRequest,
): Promise<ScholarLensResponse> {
  // Deduplicate paper IDs deterministically
  const uniquePaperIds = Array.from(new Set(request.paper_ids));

  // Retrieve context from the approved corpus
  const context = await retrieveContext(request.question, uniquePaperIds);

  // Call the AI provider fallback chain
  const result = await generateEvidence(
    request.question,
    context,
    uniquePaperIds,
  );

  // DETERMINISTIC: Filter out any evidence citing unapproved papers
  const filteredEvidence = filterToApprovedPapers(
    result.evidence,
    uniquePaperIds,
  );

  // If the AI said not_found, or all evidence was filtered out → not_found
  const isNotFound = result.not_found || filteredEvidence.length === 0;

  return {
    question: request.question,
    not_found: isNotFound,
    evidence: isNotFound ? [] : filteredEvidence,
    message: isNotFound
      ? "No supporting evidence was found in the selected approved papers."
      : undefined,
    provider_used: result.provider_used,
  };
}

/**
 * Handle action="compare": build paper comparison matrix.
 *
 * This is a TWO-STEP process:
 *   1. AI STEP: Retrieve evidence (same as "ask")
 *   2. DETERMINISTIC STEP: Pass evidence through compare_papers()
 *
 * The comparison matrix itself is ALWAYS deterministic — the same evidence
 * input produces the same matrix output.
 *
 * @param request - Zod-validated request.
 * @returns Comparison matrix response.
 */
export async function handleCompare(
  request: ScholarLensRequest,
): Promise<ComparisonResponse> {
  // Step 1: Get evidence (involves AI)
  const askResult = await handleAsk(request);

  // Step 2: Build matrix DETERMINISTICALLY
  const matrix = compare_papers(askResult.evidence);

  return {
    question: request.question,
    matrix,
    paper_count: new Set(matrix.map((row) => row.source_id)).size,
  };
}

/**
 * Handle action="readiness": check research coverage and gaps.
 *
 * Same two-step pattern as "compare":
 *   1. AI STEP: Retrieve evidence
 *   2. DETERMINISTIC STEP: Run research_readiness()
 *
 * @param request - Zod-validated request.
 * @returns Readiness assessment response.
 */
export async function handleReadiness(
  request: ScholarLensRequest,
): Promise<ReadinessResponse> {
  // Step 1: Get evidence (involves AI)
  const askResult = await handleAsk(request);

  // Step 2: Assess readiness DETERMINISTICALLY
  return research_readiness(askResult.evidence);
}

// ─── Legacy Baseline (kept for Session 1 compatibility) ──────────────────────

/**
 * Session 1 baseline: returns deterministic sample data.
 *
 * KEPT FOR BACKWARD COMPATIBILITY during the transition. The route handler
 * uses this when providers are not configured, so the UI team can still
 * test the full flow without API keys.
 *
 * @param question  - The user's research question.
 * @param paperIds  - Selected paper IDs.
 * @returns Deterministic sample response.
 */
export function buildBaselineAnswer(
  question: string,
  paperIds: string[],
): ScholarLensResponse {
  // No papers selected → "not found" is a first-class result, never a fake answer.
  if (paperIds.length === 0) {
    return {
      question,
      not_found: true,
      evidence: [],
      message:
        "No approved papers were selected, so there is no evidence to answer from.",
    };
  }

  return {
    question,
    not_found: false,
    evidence: [
      {
        question,
        source_id: paperIds[0],
        title: "Sample approved paper (baseline placeholder)",
        key_finding:
          "This is deterministic sample data. It proves the browser → route → response path works.",
        evidence_snippet:
          '"...an exact sentence copied from the approved paper will appear here..."',
        agreement: "Not evaluated yet — baseline data.",
        disagreement: "Not evaluated yet — baseline data.",
        research_gap: "Not evaluated yet — baseline data.",
        limitation: "Sample data only. No real retrieval has run.",
        confidence: "low",
      },
    ],
  };
}
