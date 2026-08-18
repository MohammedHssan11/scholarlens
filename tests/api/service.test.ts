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
 *
 * NOTE: Tests that require AI provider calls (handleAsk, handleCompare,
 * handleReadiness) are in the regression test suite since they need
 * provider mocking or live API keys.
 */
import { describe, it, expect } from "vitest";
import { getUnknownPaperIds } from "../../src/lib/scholarlens/service";

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
