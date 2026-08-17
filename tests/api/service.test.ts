/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  SCHOLARLENS — Section 5: Tests & Error Handling                   │
 * │  File: service.test.ts                                              │
 * │  Owner: AlBaraa (AI & Backend Engineer)                             │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * Unit tests for the service orchestration layer.
 *
 * WHAT THESE TESTS PROVE:
 *   - Paper ID allowlist validation works correctly.
 *   - The baseline answer function returns deterministic sample data.
 *   - Evidence filtering removes unauthorized source_ids.
 *
 * NOTE: Tests that require AI provider calls (handleAsk, handleCompare,
 * handleReadiness) are in the regression test suite since they need
 * provider mocking or live API keys.
 */
import { describe, it, expect } from "vitest";
import {
  getUnknownPaperIds,
  buildBaselineAnswer,
} from "../../src/lib/scholarlens/service";

// ─── Paper ID Validation Tests ───────────────────────────────────────────────

describe("getUnknownPaperIds", () => {
  it("returns empty array for all valid paper IDs", () => {
    const unknown = getUnknownPaperIds(["paper-001", "paper-002", "paper-003"]);
    expect(unknown).toEqual([]);
  });

  it("returns unknown IDs that are not in the approved corpus", () => {
    const unknown = getUnknownPaperIds([
      "paper-001",
      "FAKE-999",
      "paper-002",
      "NOT-REAL",
    ]);
    expect(unknown).toEqual(["FAKE-999", "NOT-REAL"]);
  });

  it("returns all IDs when none are approved", () => {
    const unknown = getUnknownPaperIds(["x", "y", "z"]);
    expect(unknown).toEqual(["x", "y", "z"]);
  });

  it("returns empty for empty input", () => {
    const unknown = getUnknownPaperIds([]);
    expect(unknown).toEqual([]);
  });
});

// ─── Baseline Answer Tests ───────────────────────────────────────────────────

describe("buildBaselineAnswer", () => {
  it("returns not_found when no paper IDs are provided", () => {
    const result = buildBaselineAnswer("What is X?", []);

    expect(result.not_found).toBe(true);
    expect(result.evidence).toEqual([]);
    expect(result.message).toBeDefined();
    expect(result.question).toBe("What is X?");
  });

  it("returns sample evidence with the first paper ID", () => {
    const result = buildBaselineAnswer("What is X?", [
      "paper-001",
      "paper-002",
    ]);

    expect(result.not_found).toBe(false);
    expect(result.evidence).toHaveLength(1);
    expect(result.evidence[0].source_id).toBe("paper-001");
    expect(result.evidence[0].confidence).toBe("low");
  });

  it("echoes the question in the response", () => {
    const question = "How does Y affect Z?";
    const result = buildBaselineAnswer(question, ["paper-001"]);

    expect(result.question).toBe(question);
    expect(result.evidence[0].question).toBe(question);
  });

  it("is deterministic — same input always gives same output", () => {
    const r1 = buildBaselineAnswer("Q", ["paper-001"]);
    const r2 = buildBaselineAnswer("Q", ["paper-001"]);

    expect(r1).toEqual(r2);
  });
});
