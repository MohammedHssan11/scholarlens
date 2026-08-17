/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  SCHOLARLENS — Section 2: Structured Outputs & Data Contracts      │
 * │  File: schema.ts                                                    │
 * │  Owner: AlBaraa (AI & Backend Engineer)                             │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * Shared data contract — Zod runtime schemas.
 *
 * WHY ZOD INSTEAD OF HAND-WRITTEN TYPES:
 *   TypeScript types disappear at runtime. Zod schemas validate the actual
 *   data at the API boundary, so malformed input never reaches the provider
 *   and malformed AI output never reaches the client.
 *
 * RULES:
 *   - Every request field has a max-length or max-count to prevent abuse.
 *   - Every error message is human-readable and safe to show in the UI.
 *   - TypeScript types are INFERRED from Zod schemas (single source of truth).
 *   - AI output is parsed through response schemas before being returned.
 *
 * @see docs/api-contracts.md for the HTTP-level contract.
 */
import { z } from "zod";

// ─── Constants ───────────────────────────────────────────────────────────────

/**
 * Maximum question length in characters.
 * 2000 chars ≈ ~500 tokens — well within model context limits while
 * preventing payload abuse. Increase only with team lead approval.
 */
export const MAX_QUESTION_LENGTH = 2000;

/**
 * Maximum paper IDs per request.
 * Matches the 8–15 approved corpus ceiling from the project briefing.
 * Set to 15 as the upper bound.
 */
export const MAX_PAPER_IDS = 15;

/**
 * Minimum question length in characters.
 * A single character like "?" is not a meaningful research question.
 */
const MIN_QUESTION_LENGTH = 3;

// ─── Shared Enums ────────────────────────────────────────────────────────────

/**
 * Confidence level assigned to each piece of evidence.
 * This is a DETERMINISTIC classification — the AI proposes it but the value
 * must be one of these three strings or the response is rejected.
 */
export const ConfidenceSchema = z.enum(["low", "medium", "high"]);
export type Confidence = z.infer<typeof ConfidenceSchema>;

/**
 * The three actions the API supports via a single POST endpoint.
 *
 *   "ask"       — retrieve evidence and return a structured synthesis
 *   "compare"   — build a paper comparison matrix from evidence
 *   "readiness" — check research readiness (coverage, gaps, traceability)
 */
export const ActionSchema = z.enum(["ask", "compare", "readiness"]);
export type Action = z.infer<typeof ActionSchema>;

// ─── Request Schema ──────────────────────────────────────────────────────────

/**
 * Request body for POST /api/scholarlens.
 *
 * Validation order:
 *   1. JSON parsing (handled in route.ts try/catch)
 *   2. Zod safeParse (this schema)
 *   3. Paper ID allowlist check (handled in service.ts)
 */
export const ScholarLensRequestSchema = z.object({
  /** Which operation to perform. Defaults to "ask" if omitted. */
  action: ActionSchema.default("ask"),

  /**
   * The user's research question. Trimmed and length-bounded.
   * Must be at least 3 characters to be a meaningful question.
   */
  question: z
    .string()
    .trim()
    .min(
      MIN_QUESTION_LENGTH,
      `Question must be at least ${MIN_QUESTION_LENGTH} characters.`,
    )
    .max(
      MAX_QUESTION_LENGTH,
      `Question must be at most ${MAX_QUESTION_LENGTH} characters.`,
    ),

  /**
   * IDs of approved papers to search within.
   * Must reference papers from the approved corpus (source-register.md).
   * Duplicate IDs are silently deduplicated in the service layer.
   */
  paper_ids: z
    .array(z.string().trim().min(1, "Paper ID must not be empty."))
    .min(1, "At least one paper_id is required.")
    .max(MAX_PAPER_IDS, `At most ${MAX_PAPER_IDS} papers per request.`),
});

export type ScholarLensRequest = z.infer<typeof ScholarLensRequestSchema>;

// ─── Evidence Schema ─────────────────────────────────────────────────────────

/**
 * One piece of evidence extracted from exactly one approved paper.
 *
 * These 10 fields are the project's shared data shape (briefing p.3).
 * The AI provider MUST return data matching this schema. If it doesn't,
 * the response is rejected and the fallback provider is tried.
 */
export const EvidenceItemSchema = z.object({
  /** The research question this evidence answers. */
  question: z.string(),

  /** Unique identifier of the approved source paper (e.g. "paper-001"). */
  source_id: z.string(),

  /** Full title of the source paper. */
  title: z.string(),

  /** The key finding extracted from this paper relevant to the question. */
  key_finding: z.string(),

  /**
   * Exact text copied from the source paper — NEVER a paraphrase.
   * This is what makes the answer traceable. Must be non-empty.
   */
  evidence_snippet: z
    .string()
    .min(1, "Evidence snippet must not be empty — every claim needs a source."),

  /** How this paper's findings agree with other papers in the set. */
  agreement: z.string(),

  /** How this paper's findings disagree with other papers in the set. */
  disagreement: z.string(),

  /** Research gaps identified from this paper. */
  research_gap: z.string(),

  /** Limitations of the evidence or methodology in this paper. */
  limitation: z.string(),

  /** AI-assessed confidence in the evidence quality. */
  confidence: ConfidenceSchema,
});

export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;

// ─── Response Schemas ────────────────────────────────────────────────────────

/**
 * Success response for action="ask".
 * Every answer either has evidence[] or not_found=true — never both.
 */
export const ScholarLensResponseSchema = z.object({
  /** Echo of the original question for client-side correlation. */
  question: z.string(),

  /**
   * True when the approved corpus contains no supporting evidence.
   * When true, evidence[] MUST be empty and message SHOULD explain why.
   */
  not_found: z.boolean(),

  /** Zero or more evidence items, all from approved papers. */
  evidence: z.array(EvidenceItemSchema),

  /** Optional human-readable message (e.g. "No evidence found."). */
  message: z.string().optional(),

  /** Which provider generated this response. Useful for debugging. */
  provider_used: z.enum(["groq", "gemini"]).optional(),
});

export type ScholarLensResponse = z.infer<typeof ScholarLensResponseSchema>;

/**
 * One row in the paper comparison matrix.
 * Built by the DETERMINISTIC compare_papers() function — not by AI.
 */
export const ComparisonRowSchema = z.object({
  source_id: z.string(),
  title: z.string(),
  key_finding: z.string(),
  agreement: z.string(),
  disagreement: z.string(),
});

export type ComparisonRow = z.infer<typeof ComparisonRowSchema>;

/** Response for action="compare". */
export const ComparisonResponseSchema = z.object({
  /** Echo of the original question. */
  question: z.string(),

  /** The evidence comparison matrix rows. */
  matrix: z.array(ComparisonRowSchema),

  /** Number of distinct papers in the comparison. */
  paper_count: z.number().int().nonnegative(),
});

export type ComparisonResponse = z.infer<typeof ComparisonResponseSchema>;

/**
 * Response for action="readiness".
 * Built by the DETERMINISTIC research_readiness() function — not by AI.
 */
export const ReadinessResponseSchema = z.object({
  /** Number of distinct approved papers referenced in the evidence. */
  papers_used: z.number().int().nonnegative(),

  /** True when every evidence item has a non-empty snippet. */
  every_claim_has_a_snippet: z.boolean(),

  /** List of identified research gaps from the evidence set. */
  gaps: z.array(z.string()),

  /** Overall readiness — true when min papers met AND all claims sourced. */
  ready: z.boolean(),
});

export type ReadinessResponse = z.infer<typeof ReadinessResponseSchema>;

// ─── Error Response Schema ───────────────────────────────────────────────────

/**
 * All error responses follow this shape.
 * The `error` message is always SAFE to display — never contains secrets.
 */
export const ErrorResponseSchema = z.object({
  /** Human-readable error message, safe to display in UI. */
  error: z.string(),

  /** Structured validation details (only for 400 responses). */
  details: z.any().optional(),

  /** Machine-readable error code for client-side handling. */
  code: z.string().optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
