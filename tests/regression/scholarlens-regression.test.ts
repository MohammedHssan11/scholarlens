/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  SCHOLARLENS — Section 5: Tests & Error Handling                   │
 * │  File: scholarlens-regression.test.ts                               │
 * │  Owner: AlBaraa (AI & Backend Engineer)                             │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * Regression tests for ScholarLens API Service Layer.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleAsk } from "../../src/lib/scholarlens/service";
import { compare_papers, research_readiness } from "../../src/lib/scholarlens/tools";
import { generateEvidence, ProviderError } from "../../src/lib/ai/providers";
import { agentRag } from "../../src/lib/scholarlens/agent-rag";
import type { EvidenceItem } from "../../src/lib/scholarlens/schema";

vi.mock("../../src/lib/ai/providers", () => {
  return {
    generateEvidence: vi.fn(),
    ProviderError: class ProviderError extends Error {
      status: number;
      constructor(msg: string, status: number) {
        super(msg);
        this.status = status;
        this.name = "ProviderError";
      }
    }
  };
});

vi.mock("../../src/lib/scholarlens/agent-rag", () => {
  return {
    agentRag: {
      retrieve: vi.fn(),
      getPaperMetadata: vi.fn(),
      getApprovedPaperIds: vi.fn(),
    }
  };
});

// ─── Test Fixtures ───────────────────────────────────────────────────────────

const mockChunks = [
  { source_id: "paper-001", title: "Paper A", text: "Exact quote from paper A — section 3.2.", score: 0.9 },
  { source_id: "paper-002", title: "Paper B", text: "Exact quote from paper B — page 14.", score: 0.8 },
];

const mockPapers = new Map([
  ["paper-001", { source_id: "paper-001", title: "Paper A", content_path: "A.md" }],
  ["paper-002", { source_id: "paper-002", title: "Paper B", content_path: "B.md" }],
]);

const validEvidence: EvidenceItem[] = [
  {
    question: "Q?",
    source_id: "paper-001",
    title: "Paper A",
    key_finding: "Finding A",
    evidence_snippet: "Exact quote from paper A — section 3.2.",
    agreement: "N/A", disagreement: "N/A", research_gap: "N/A", limitation: "N/A", confidence: "high",
  },
  {
    question: "Q?",
    source_id: "paper-002",
    title: "Paper B",
    key_finding: "Finding B",
    evidence_snippet: "Exact quote from paper B — page 14.",
    agreement: "N/A", disagreement: "N/A", research_gap: "N/A", limitation: "N/A", confidence: "medium",
  }
];

describe("Service Layer Evidence Filtering (R9, R10, R11)", () => {
  beforeEach(() => {
    vi.mocked(agentRag.retrieve).mockResolvedValue({
      chunks: mockChunks,
      stats: { papersSearched: 2, totalChunksScanned: 10, chunksAboveThreshold: 2, chunksReturned: 2, topScore: 0.9, queryTermCount: 1, durationMs: 10 }
    });
    vi.mocked(agentRag.getPaperMetadata).mockResolvedValue(mockPapers);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("R9: removes evidence with hallucinated source_ids", async () => {
    vi.mocked(generateEvidence).mockResolvedValue({
      not_found: false,
      provider_used: "groq",
      evidence: [
        ...validEvidence,
        { ...validEvidence[0], source_id: "paper-999" } // Hallucinated ID
      ]
    });

    const response = await handleAsk({ action: "ask", question: "Q?", paper_ids: ["paper-001", "paper-002"] });
    expect(response.not_found).toBe(false);
    expect(response.evidence).toHaveLength(2); // The 3rd item is filtered out
    expect(response.evidence?.map(e => e.source_id)).not.toContain("paper-999");
  });

  it("R10: removes evidence with title mismatch", async () => {
    vi.mocked(generateEvidence).mockResolvedValue({
      not_found: false,
      provider_used: "groq",
      evidence: [
        ...validEvidence,
        { ...validEvidence[0], title: "Wrong Title" } // Title mismatch
      ]
    });

    const response = await handleAsk({ action: "ask", question: "Q?", paper_ids: ["paper-001", "paper-002"] });
    expect(response.evidence).toHaveLength(2); // The 3rd item is filtered out
  });

  it("R11: removes evidence where snippet is not an exact substring", async () => {
    vi.mocked(generateEvidence).mockResolvedValue({
      not_found: false,
      provider_used: "groq",
      evidence: [
        validEvidence[0],
        { ...validEvidence[1], evidence_snippet: "Paraphrased quote from paper B." } // Not in chunks
      ]
    });

    const response = await handleAsk({ action: "ask", question: "Q?", paper_ids: ["paper-001", "paper-002"] });
    expect(response.evidence).toHaveLength(1); // The 2nd item is filtered out
    expect(response.evidence?.[0].source_id).toBe("paper-001");
  });

  it("R5: returns not_found if ALL evidence is filtered out", async () => {
    vi.mocked(generateEvidence).mockResolvedValue({
      not_found: false,
      provider_used: "groq",
      evidence: [
        { ...validEvidence[0], title: "Wrong" },
        { ...validEvidence[1], source_id: "paper-999" }
      ]
    });

    const response = await handleAsk({ action: "ask", question: "Q?", paper_ids: ["paper-001", "paper-002"] });
    expect(response.not_found).toBe(true);
    expect(response.evidence).toHaveLength(0);
  });
});

describe("Provider Failure Handling (R6, R7)", () => {
  beforeEach(() => {
    vi.mocked(agentRag.retrieve).mockResolvedValue({ chunks: mockChunks, stats: { papersSearched: 0, totalChunksScanned: 0, chunksAboveThreshold: 0, chunksReturned: 0, topScore: 0, queryTermCount: 0, durationMs: 0 } });
    vi.mocked(agentRag.getPaperMetadata).mockResolvedValue(mockPapers);
  });

  it("R6/R7: throws ProviderError if generateEvidence fails", async () => {
    vi.mocked(generateEvidence).mockRejectedValue(new ProviderError("Both providers failed", "groq", 502));

    await expect(handleAsk({ action: "ask", question: "Q?", paper_ids: ["paper-001"] }))
      .rejects.toThrow(ProviderError);
  });
});

describe("Tool Path (R8)", () => {
  it("compare_papers handles empty evidence gracefully", () => {
    expect(compare_papers([])).toEqual([]);
  });

  it("research_readiness handles empty evidence gracefully", () => {
    const report = research_readiness([]);
    expect(report.papers_used).toBe(0);
    expect(report.ready).toBe(false);
  });
});
