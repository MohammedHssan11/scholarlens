/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  SCHOLARLENS — Section 4: Grounding & Tool Execution               │
 * │  File: tools.ts                                                     │
 * │  Owner: AlBaraa (AI & Backend Engineer)                             │
 * │  Rules: Mariam Eladawy (tool-rules.ts) — DO NOT MODIFY HER FILE   │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * Deterministic tools — plain code, NOT model output.
 * The same input ALWAYS gives the same output.
 *
 * CONSISTENCY NOTE:
 *   Types are imported from schema.ts (single source of truth).
 *   Thresholds are imported from tool-rules.ts (Mariam's ownership).
 */
import type { EvidenceItem, ComparisonRow, ReadinessResponse } from "./schema";
import { READINESS_RULES } from "./tool-rules";

/**
 * Builds the evidence comparison matrix used by the comparison view.
 *
 * DETERMINISTIC: Maps each EvidenceItem to a ComparisonRow by extracting
 * the five comparison-relevant fields. No AI involved.
 *
 * @param evidence - Validated evidence items from the provider layer.
 * @returns One row per evidence item.
 */
export function compare_papers(evidence: EvidenceItem[]): ComparisonRow[] {
  return evidence.map((item) => ({
    source_id: item.source_id,
    title: item.title,
    key_finding: item.key_finding,
    agreement: item.agreement,
    disagreement: item.disagreement,
  }));
}

/**
 * Checks coverage, gaps and source traceability.
 *
 * DETERMINISTIC: Evaluates whether the evidence set meets research-readiness
 * criteria defined in tool-rules.ts (Mariam Eladawy's thresholds).
 *
 * Readiness requires:
 *   1. At least `READINESS_RULES.minPapers` distinct papers.
 *   2. Every evidence item has a snippet ≥ `READINESS_RULES.minSnippetChars`.
 *
 * @param evidence - Validated evidence items from the provider layer.
 * @returns Readiness report matching ReadinessResponse schema.
 */
export function research_readiness(evidence: EvidenceItem[]): ReadinessResponse {
  const papersUsed = new Set(evidence.map((item) => item.source_id)).size;

  const everyClaimHasSnippet =
    evidence.length > 0 &&
    evidence.every(
      (item) => item.evidence_snippet.trim().length >= READINESS_RULES.minSnippetChars,
    );

  const gaps = evidence
    .map((item) => item.research_gap)
    .filter((gap) => gap.trim().length > 0);

  return {
    papers_used: papersUsed,
    every_claim_has_a_snippet: everyClaimHasSnippet,
    gaps,
    ready: papersUsed >= READINESS_RULES.minPapers && everyClaimHasSnippet,
  };
}
