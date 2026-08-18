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
 *     2. Retrieving context from the approved corpus via AgentRAG.
 *     3. Calling the provider fallback chain for evidence extraction.
 *     4. Filtering AI output to ensure only approved paper IDs are cited.
 *     5. Verifying evidence snippets against original retrieved text.
 *     6. Assembling the final typed response.
 *     7. Running deterministic tools (compare_papers, research_readiness).
 *
 * DETERMINISTIC vs AI BOUNDARY:
 *   - Paper ID validation: DETERMINISTIC (allowlist check)
 *   - Evidence retrieval: DETERMINISTIC (AgentRAG keyword/TF-IDF search)
 *   - Evidence extraction: AI (Groq/Gemini structured output)
 *   - Evidence verification: DETERMINISTIC (snippet substring check)
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
import { agentRag, type CorpusPaper, type RetrievedChunk } from "./agent-rag";

// ─── Corpus Validation ───────────────────────────────────────────────────────

/**
 * Validate paper IDs against the approved corpus manifest.
 *
 * Uses the real corpus manifest as the single source of truth.
 * Falls back to a development allowlist ONLY when the manifest is empty
 * (pre-corpus setup period), so clients get a clear error rather than
 * fabricated evidence.
 *
 * @param paperIds - Paper IDs from the request.
 * @returns Array of unknown paper IDs (empty if all are valid).
 */
const DEVELOPMENT_PAPER_IDS = new Set<string>([
  "paper-001", "paper-002", "paper-003", "paper-004", "paper-005",
  "paper-006", "paper-007", "paper-008", "paper-009", "paper-010",
  "paper-011", "paper-012", "paper-013", "paper-014", "paper-015",
]);

export function getUnknownPaperIds(paperIds: string[]): string[] {
  return paperIds.filter((id) => !DEVELOPMENT_PAPER_IDS.has(id));
}

export async function getUnknownPaperIdsForCorpus(paperIds: string[]): Promise<string[]> {
  const approvedIds = await agentRag.getApprovedPaperIds();
  if (approvedIds.length === 0) return getUnknownPaperIds(paperIds);
  const approved = new Set(approvedIds);
  return paperIds.filter((id) => !approved.has(id));
}

// ─── Context Retrieval ───────────────────────────────────────────────────────

/**
 * Retrieve relevant context chunks from the approved corpus via AgentRAG.
 *
 * The retrieval layer uses TF-IDF scoring over original text from the
 * approved manifest. The result is provider-neutral: Groq and Gemini
 * receive precisely the same source-labelled context.
 *
 * @param question  - The user's research question.
 * @param paperIds  - Approved paper IDs to search within.
 * @returns Formatted context, raw chunks, paper metadata.
 */
async function retrieveContext(question: string, paperIds: string[]): Promise<{
  context: string;
  chunks: RetrievedChunk[];
  papers: Map<string, CorpusPaper>;
}> {
  const startTime = Date.now();

  const [retrieval, papers] = await Promise.all([
    agentRag.retrieve(question, paperIds),
    agentRag.getPaperMetadata(paperIds),
  ]);

  const context = retrieval.chunks
    .map((chunk) => `<source id="${chunk.source_id}" title="${chunk.title}">\n${chunk.text}\n</source>`)
    .join("\n\n");

  const elapsed = Date.now() - startTime;
  console.log(
    `[ScholarLens] Context retrieval: ${retrieval.chunks.length} chunks from ${papers.size} papers in ${elapsed}ms`,
  );

  return { chunks: retrieval.chunks, papers, context };
}

// ─── Evidence Filtering ──────────────────────────────────────────────────────

/**
 * DETERMINISTIC post-processing: filter AI output to only include
 * evidence from approved papers with verified snippets.
 *
 * THREE VERIFICATION CHECKS (all must pass):
 *   1. source_id must be in the user's selected paper list
 *   2. title must exactly match the manifest title for that paper
 *   3. evidence_snippet must be a literal substring of retrieved text
 *
 * Any item failing any check is silently discarded. This is the
 * trust-critical step that prevents hallucinated evidence.
 *
 * @param evidence  - Evidence items from the AI provider.
 * @param paperIds  - The approved paper IDs from the request.
 * @param chunks    - Original retrieved text chunks.
 * @param papers    - Paper metadata from the manifest.
 * @param question  - The validated question (overwrites AI-echoed question).
 * @returns Filtered evidence with only verified items.
 */
function filterToApprovedPapers(
  evidence: EvidenceItem[],
  paperIds: string[],
  chunks: RetrievedChunk[],
  papers: Map<string, CorpusPaper>,
  question: string,
): EvidenceItem[] {
  const approvedSet = new Set(paperIds);
  const normaliseForMatch = (value: string) => value.replace(/\s+/g, " ").trim();

  const filtered = evidence.filter((item) => {
    // Check 1: source_id must be approved
    if (!approvedSet.has(item.source_id)) {
      console.warn(`[ScholarLens] Discarded evidence: unknown source_id "${item.source_id}"`);
      return false;
    }

    // Check 2: title must match manifest
    const manifestTitle = papers.get(item.source_id)?.title;
    if (manifestTitle !== item.title) {
      console.warn(
        `[ScholarLens] Discarded evidence: title mismatch for ${item.source_id}. ` +
        `Expected "${manifestTitle}", got "${item.title}"`,
      );
      return false;
    }

    // Check 3: snippet must be a literal substring of retrieved text
    const snippet = normaliseForMatch(item.evidence_snippet);
    const matchFound = chunks
      .filter((chunk) => chunk.source_id === item.source_id)
      .some((chunk) => normaliseForMatch(chunk.text).includes(snippet));

    if (!matchFound) {
      console.warn(
        `[ScholarLens] Discarded evidence: snippet not found in retrieved text for ${item.source_id}`,
      );
      return false;
    }

    return true;
  });

  // Overwrite AI-echoed question with the validated request question
  return filtered.map((item) => ({ ...item, question }));
}

// ─── Action Handlers ─────────────────────────────────────────────────────────

/**
 * Handle action="ask": retrieve evidence and return structured synthesis.
 *
 * FLOW:
 *   1. Deduplicate paper_ids
 *   2. Retrieve context from corpus (TF-IDF ranked)
 *   3. Call provider fallback chain
 *   4. Filter evidence to approved papers only (3-check verification)
 *   5. Assemble typed response
 *
 * @param request - Zod-validated request.
 * @returns Structured evidence response.
 */
export async function handleAsk(
  request: ScholarLensRequest,
): Promise<ScholarLensResponse> {
  const startTime = Date.now();

  // Deduplicate paper IDs deterministically
  const uniquePaperIds = Array.from(new Set(request.paper_ids));

  // Retrieve context from the approved corpus
  const retrieval = await retrieveContext(request.question, uniquePaperIds);

  if (retrieval.chunks.length === 0) {
    console.log(
      `[ScholarLens] ask: not_found (no matching chunks) in ${Date.now() - startTime}ms`,
    );
    return {
      question: request.question,
      not_found: true,
      evidence: [],
      message: "No supporting evidence was found in the selected approved papers.",
    };
  }

  // Call the AI provider fallback chain
  const result = await generateEvidence(
    request.question,
    retrieval.context,
    uniquePaperIds,
  );

  // DETERMINISTIC: Filter out any evidence citing unapproved papers
  // or with unverified snippets
  const filteredEvidence = filterToApprovedPapers(
    result.evidence,
    uniquePaperIds,
    retrieval.chunks,
    retrieval.papers,
    request.question,
  );

  // If the AI said not_found, or all evidence was filtered out → not_found
  const isNotFound = result.not_found || filteredEvidence.length === 0;

  const elapsed = Date.now() - startTime;
  console.log(
    `[ScholarLens] ask: ${isNotFound ? "not_found" : `${filteredEvidence.length} evidence items`} ` +
    `via ${result.provider_used} in ${elapsed}ms`,
  );

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
 * TWO-STEP process:
 *   1. AI STEP: Retrieve evidence (same as "ask")
 *   2. DETERMINISTIC STEP: Pass evidence through compare_papers()
 *
 * @param request - Zod-validated request.
 * @returns Comparison matrix response.
 */
export async function handleCompare(
  request: ScholarLensRequest,
): Promise<ComparisonResponse> {
  const askResult = await handleAsk(request);
  const matrix = compare_papers(askResult.evidence);

  console.log(
    `[ScholarLens] compare: ${matrix.length} rows, ${new Set(matrix.map((r) => r.source_id)).size} papers`,
  );

  return {
    question: request.question,
    matrix,
    paper_count: new Set(matrix.map((row) => row.source_id)).size,
  };
}

/**
 * Handle action="readiness": check research coverage and gaps.
 *
 * TWO-STEP process:
 *   1. AI STEP: Retrieve evidence
 *   2. DETERMINISTIC STEP: Run research_readiness()
 *
 * @param request - Zod-validated request.
 * @returns Readiness assessment response.
 */
export async function handleReadiness(
  request: ScholarLensRequest,
): Promise<ReadinessResponse> {
  const askResult = await handleAsk(request);
  const readiness = research_readiness(askResult.evidence);

  console.log(
    `[ScholarLens] readiness: ${readiness.papers_used} papers, ready=${readiness.ready}`,
  );

  return readiness;
}
