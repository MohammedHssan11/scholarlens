/**
 * Orchestration: retrieve evidence -> build the structured answer.
 * Owner: AlBaraa (AI & Backend Engineer).
 *
 * This is the Session 1 BASELINE: it returns deterministic sample data so the
 * whole team can run the app end to end before any provider is wired up.
 *
 * TODO(AlBaraa): replace `buildBaselineAnswer` with real retrieval
 * (Gemini File Search over the approved corpus) + provider call.
 */
import type { ScholarLensResponse } from "./schema";

export function buildBaselineAnswer(
  question: string,
  paperIds: string[],
): ScholarLensResponse {
  // No papers selected -> "not found" is a first-class result, never a fake answer.
  if (paperIds.length === 0) {
    return {
      question,
      not_found: true,
      evidence: [],
      message: "No approved papers were selected, so there is no evidence to answer from.",
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
          "This is deterministic sample data. It proves the browser -> route -> response path works.",
        evidence_snippet:
          "\"...an exact sentence copied from the approved paper will appear here...\"",
        agreement: "Not evaluated yet - baseline data.",
        disagreement: "Not evaluated yet - baseline data.",
        research_gap: "Not evaluated yet - baseline data.",
        limitation: "Sample data only. No real retrieval has run.",
        confidence: "low",
      },
    ],
  };
}
