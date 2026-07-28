/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  SCHOLARLENS — Section 5: Tests & Error Handling                   │
 * │  File: tools.test.ts                                                │
 * │  Owner: AlBaraa (AI & Backend Engineer)                             │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * Unit tests for deterministic tools: compare_papers() and research_readiness().
 *
 * WHAT THESE TESTS PROVE:
 *   - compare_papers() maps evidence items to comparison rows correctly.
 *   - research_readiness() correctly evaluates coverage, gaps, and traceability.
 *   - Both functions are DETERMINISTIC: same input → same output, always.
 *   - Edge cases (empty input, missing snippets, duplicate papers) are handled.
 *
 * These tools are PURE FUNCTIONS — they do not call any AI provider.
 */
import { describe, it, expect } from "vitest";
import { compare_papers, research_readiness } from "../../src/lib/scholarlens/tools";
import type { EvidenceItem } from "../../src/lib/scholarlens/schema";
import evidenceFixtures from "../fixtures/scholarlens/evidence.json";

// Cast fixtures to typed arrays
const threePapers = evidenceFixtures.three_papers as unknown as EvidenceItem[];
const singlePaper = evidenceFixtures.single_paper as unknown as EvidenceItem[];
const emptySnippets = evidenceFixtures.empty_snippets as unknown as EvidenceItem[];

// ─── compare_papers Tests ────────────────────────────────────────────────────

describe("compare_papers", () => {
  it("T1: returns correct matrix for 3 evidence items", () => {
    const matrix = compare_papers(threePapers);

    expect(matrix).toHaveLength(3);
    expect(matrix[0].source_id).toBe("paper-001");
    expect(matrix[1].source_id).toBe("paper-002");
    expect(matrix[2].source_id).toBe("paper-003");

    // Verify each row has the required fields
    for (const row of matrix) {
      expect(row).toHaveProperty("source_id");
      expect(row).toHaveProperty("title");
      expect(row).toHaveProperty("key_finding");
      expect(row).toHaveProperty("agreement");
      expect(row).toHaveProperty("disagreement");
    }
  });

  it("T2: returns empty matrix for empty evidence", () => {
    const matrix = compare_papers([]);

    expect(matrix).toEqual([]);
  });

  it("T3: preserves key_finding content accurately", () => {
    const matrix = compare_papers(threePapers);

    expect(matrix[0].key_finding).toBe(
      "Standardized tests remain the dominant assessment tool despite growing criticism.",
    );
  });

  it("T4: is deterministic — same input always gives same output", () => {
    const result1 = compare_papers(threePapers);
    const result2 = compare_papers(threePapers);

    expect(result1).toEqual(result2);
  });
});

// ─── research_readiness Tests ────────────────────────────────────────────────

describe("research_readiness", () => {
  it("T5: reports ready when ≥ minPapers and all snippets present", () => {
    const report = research_readiness(threePapers);

    expect(report.papers_used).toBe(3);
    expect(report.every_claim_has_a_snippet).toBe(true);
    expect(report.ready).toBe(true);
  });

  it("T6: reports NOT ready when only 1 paper (below minPapers)", () => {
    const report = research_readiness(singlePaper);

    expect(report.papers_used).toBe(1);
    expect(report.ready).toBe(false);
  });

  it("T7: reports NOT ready when a snippet is empty", () => {
    const report = research_readiness(emptySnippets);

    expect(report.every_claim_has_a_snippet).toBe(false);
    expect(report.ready).toBe(false);
  });

  it("T8: collects research gaps correctly", () => {
    const report = research_readiness(threePapers);

    // Three papers, each with a non-empty research_gap (except possibly some)
    expect(report.gaps.length).toBeGreaterThan(0);
    expect(report.gaps).toContain(
      "Does not address alternative assessment methods.",
    );
  });

  it("T9: returns empty gaps when all research_gap fields are empty", () => {
    const evidenceNoGaps: EvidenceItem[] = [
      {
        question: "What is X?",
        source_id: "paper-001",
        title: "Paper A",
        key_finding: "Finding",
        evidence_snippet: '"A sufficiently long exact quote from the approved paper for testing."',
        agreement: "",
        disagreement: "",
        research_gap: "",
        limitation: "",
        confidence: "high",
      },
      {
        question: "What is X?",
        source_id: "paper-002",
        title: "Paper B",
        key_finding: "Finding",
        evidence_snippet: '"Another sufficiently long exact quote from an approved paper source."',
        agreement: "",
        disagreement: "",
        research_gap: "",
        limitation: "",
        confidence: "medium",
      },
    ];

    const report = research_readiness(evidenceNoGaps);

    expect(report.gaps).toEqual([]);
  });

  it("T10: reports 0 papers_used for empty evidence", () => {
    const report = research_readiness([]);

    expect(report.papers_used).toBe(0);
    expect(report.every_claim_has_a_snippet).toBe(false);
    expect(report.ready).toBe(false);
    expect(report.gaps).toEqual([]);
  });

  it("T11: counts distinct papers correctly even with duplicates", () => {
    const duplicateEvidence: EvidenceItem[] = [
      {
        question: "Q",
        source_id: "paper-001",
        title: "A",
        key_finding: "F1",
        evidence_snippet: '"Exact evidence snippet from paper one section three point two."',
        agreement: "",
        disagreement: "",
        research_gap: "",
        limitation: "",
        confidence: "high",
      },
      {
        question: "Q",
        source_id: "paper-001",
        title: "A",
        key_finding: "F2",
        evidence_snippet: '"Another exact evidence snippet from paper one section four."',
        agreement: "",
        disagreement: "",
        research_gap: "",
        limitation: "",
        confidence: "medium",
      },
      {
        question: "Q",
        source_id: "paper-002",
        title: "B",
        key_finding: "F3",
        evidence_snippet: '"Exact evidence snippet from paper two page fourteen results."',
        agreement: "",
        disagreement: "",
        research_gap: "",
        limitation: "",
        confidence: "low",
      },
    ];

    const report = research_readiness(duplicateEvidence);

    // 3 evidence items but only 2 distinct papers
    expect(report.papers_used).toBe(2);
    expect(report.ready).toBe(true); // 2 >= minPapers (2), all snippets >= minSnippetChars (20)
  });

  it("T12: is deterministic — same input always gives same output", () => {
    const result1 = research_readiness(threePapers);
    const result2 = research_readiness(threePapers);

    expect(result1).toEqual(result2);
  });
});
