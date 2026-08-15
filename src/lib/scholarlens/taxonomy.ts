/**
 * Domain vocabulary for ScholarLens.
 * Owner: Mariam Eladawy (Knowledge & Tooling Engineer).
 *
 * TODO(Mariam Eladawy): fill these in for the chosen narrow research topic,
 * and document each one with an example in `docs/source-register.md`.
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
