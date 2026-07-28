/**
 * Rules behind the deterministic tools.
 * Owner: Mariam Eladawy (Knowledge & Tooling Engineer).
 *
 * These decide WHEN two papers agree, when something counts as a research gap,
 * and when a set of evidence is "research ready". They are rules, not opinions -
 * so they can be unit tested.
 *
 * TODO(Mariam Eladawy): agree these thresholds with the Lead and document
 * one worked example for each rule.
 */

export const READINESS_RULES = {
  /** Minimum distinct approved papers before an answer counts as "ready". */
  minPapers: 3,
  /** Minimum length of a snippet for it to count as real evidence. */
  minSnippetChars: 30,
} as const;

export const SOURCE_QUALITY_RULES = {
  /** A source must have all of these recorded before it can be approved. */
  requiredMetadata: ["source_id", "title", "author_or_org", "year", "url", "accessed"],
  /** Never accept a source we cannot legally use. */
  requireLicenceCheck: true,
} as const;
