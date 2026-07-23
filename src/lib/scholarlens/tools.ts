/**
 * Deterministic tools - plain code, NOT model output.
 * Owner: AlBaraa (wiring) with rules from Mariam Eladawy (`tool-rules.ts`).
 *
 * These must be predictable and testable: the same input always gives the same output.
 */
import type { EvidenceItem } from "./schema";
import { READINESS_RULES } from "./tool-rules";

export interface ComparisonRow {
  source_id: string;
  title: string;
  key_finding: string;
  agreement: string;
  disagreement: string;
}

/** Builds the evidence matrix used by the comparison view. */
export function compare_papers(evidence: EvidenceItem[]): ComparisonRow[] {
  return evidence.map((item) => ({
    source_id: item.source_id,
    title: item.title,
    key_finding: item.key_finding,
    agreement: item.agreement,
    disagreement: item.disagreement,
  }));
}

export interface ReadinessReport {
  papers_used: number;
  every_claim_has_a_snippet: boolean;
  gaps: string[];
  ready: boolean;
}

/** Checks coverage, gaps and source traceability. */
export function research_readiness(evidence: EvidenceItem[]): ReadinessReport {
  const papersUsed = new Set(evidence.map((item) => item.source_id)).size;
  const everyClaimHasSnippet =
    evidence.length > 0 && evidence.every((item) => item.evidence_snippet.trim().length > 0);
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
