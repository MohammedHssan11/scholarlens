/**
 * Domain vocabulary for ScholarLens.
 * Owner: Mariam Eladawy (Knowledge & Tooling Engineer).
 *
 * This taxonomy defines the vocabulary used to query our RAG/AI agent corpus.
 * See `docs/source-register.md` for specific examples.
 */

/** The structured fields every answer must provide. */
export const EVIDENCE_FIELDS = [
  "question",
  "source_id",
  "title",
  "key_finding",
  "evidence_snippet",
  "agreement",
  "disagreement",
  "research_gap",
  "limitation",
  "confidence",
] as const;

/** Question types the product is expected to handle. */
export const QUESTION_TYPES = ["method", "finding", "comparison", "gap"] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];
