/**
 * Shared data contract for ScholarLens.
 * Owner: AlBaraa (AI & Backend Engineer).
 *
 * TODO(AlBaraa): replace these hand-written types with Zod schemas so the
 * request is validated at runtime, not only at compile time. `npm i zod`
 */

export type Confidence = "low" | "medium" | "high";

/** One piece of evidence, taken from exactly one approved paper. */
export interface EvidenceItem {
  question: string;
  source_id: string;
  title: string;
  key_finding: string;
  /** Exact text copied from the source paper - never a paraphrase. */
  evidence_snippet: string;
  agreement: string;
  disagreement: string;
  research_gap: string;
  limitation: string;
  confidence: Confidence;
}

export interface ScholarLensRequest {
  question: string;
  paper_ids: string[];
}

export interface ScholarLensResponse {
  question: string;
  /** True when the approved corpus contains no supporting evidence. */
  not_found: boolean;
  evidence: EvidenceItem[];
  message?: string;
}

/** Minimal runtime check used by the baseline route handler. */
export function isValidRequest(value: unknown): value is ScholarLensRequest {
  if (typeof value !== "object" || value === null) return false;
  const body = value as Record<string, unknown>;
  if (typeof body.question !== "string" || body.question.trim().length === 0) return false;
  if (!Array.isArray(body.paper_ids)) return false;
  return body.paper_ids.every((id) => typeof id === "string");
}
