/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  SCHOLARLENS — Section 5: Tests & Error Handling                   │
 * │  File: route.integration.test.ts                                    │
 * │  Owner: AlBaraa (AI & Backend Engineer)                             │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * Full HTTP-layer integration tests for the /api/scholarlens route handler.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST, GET } from "../../src/app/api/scholarlens/route";
import { apiRateLimiter } from "../../src/lib/ai/rate-limiter";
import {
  handleAsk,
  handleCompare,
  handleReadiness,
} from "../../src/lib/scholarlens/service";
import { ProviderError } from "../../src/lib/ai/providers";
import { CorpusUnavailableError } from "../../src/lib/scholarlens/agent-rag";

// Mock the service layer so we don't make real AI calls in route tests
vi.mock("../../src/lib/scholarlens/service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/lib/scholarlens/service")>();
  return {
    ...actual,
    handleAsk: vi.fn().mockResolvedValue({
      question: "mocked",
      not_found: false,
      evidence: [],
    }),
    handleCompare: vi.fn().mockResolvedValue({
      question: "mocked",
      matrix: [],
      paper_count: 0,
    }),
    handleReadiness: vi.fn().mockResolvedValue({
      papers_used: 0,
      every_claim_has_a_snippet: false,
      gaps: [],
      ready: false,
    }),
    getUnknownPaperIdsForCorpus: vi.fn().mockImplementation(async (ids: string[]) => {
      // Return empty array (all valid) unless the ID is specifically "FAKE-999"
      return ids.filter(id => id === "FAKE-999");
    }),
  };
});

describe("API Route: GET /api/scholarlens", () => {
  it("returns corpus status and provider configuration", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe("ok");
    expect(data.corpus).toBeDefined();
    expect(data.providers).toBeDefined();
  });
});

describe("API Route: POST /api/scholarlens", () => {
  beforeEach(() => {
    apiRateLimiter.reset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function createRequest(body: unknown, ip = "127.0.0.1") {
    return new Request("http://localhost:3000/api/scholarlens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": ip,
      },
      body: body ? JSON.stringify(body) : null,
    });
  }

  it("accepts a valid request and delegates to handleAsk", async () => {
    const req = createRequest({
      action: "ask",
      question: "What is the impact of AI?",
      paper_ids: ["paper-001"],
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.question).toBe("mocked");
    expect(handleAsk).toHaveBeenCalledWith({
      action: "ask",
      question: "What is the impact of AI?",
      paper_ids: ["paper-001"],
    });
  });

  it("dispatches compare requests and returns the comparison contract", async () => {
    const req = createRequest({
      action: "compare",
      question: "Compare the selected papers",
      paper_ids: ["paper-001", "paper-002", "paper-003"],
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual({ question: "mocked", matrix: [], paper_count: 0 });
    expect(handleCompare).toHaveBeenCalledOnce();
  });

  it("dispatches readiness requests and returns the readiness contract", async () => {
    const req = createRequest({
      action: "readiness",
      question: "Is this evidence research ready?",
      paper_ids: ["paper-001", "paper-002", "paper-003"],
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual({
      papers_used: 0,
      every_claim_has_a_snippet: false,
      gaps: [],
      ready: false,
    });
    expect(handleReadiness).toHaveBeenCalledOnce();
  });

  it("returns a safe provider error without exposing internal details", async () => {
    vi.mocked(handleAsk).mockRejectedValueOnce(
      new ProviderError("sensitive provider detail", "groq", 504),
    );

    const response = await POST(createRequest({
      action: "ask",
      question: "Valid provider failure question",
      paper_ids: ["paper-001"],
    }));

    expect(response.status).toBe(504);
    await expect(response.json()).resolves.toEqual({
      error: "AI provider is temporarily unavailable. Please try again later.",
      code: "PROVIDER_ERROR",
    });
  });

  it("returns a safe corpus error when approved content is unavailable", async () => {
    vi.mocked(handleAsk).mockRejectedValueOnce(
      new CorpusUnavailableError("sensitive corpus path"),
    );

    const response = await POST(createRequest({
      action: "ask",
      question: "Valid corpus failure question",
      paper_ids: ["paper-001"],
    }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "The approved paper corpus is not ready. Add approved paper metadata and text before asking questions.",
      code: "CORPUS_UNAVAILABLE",
    });
  });

  it("rejects invalid JSON", async () => {
    const req = new Request("http://localhost:3000/api/scholarlens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.code).toBe("INVALID_JSON");
  });

  it("rejects invalid schema fields", async () => {
    const req = createRequest({
      action: "ask",
      question: "Too short", // Needs min 3 chars, wait "Too short" is 9 chars.
      // Let's omit paper_ids to trigger schema validation failure
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.code).toBe("VALIDATION_ERROR");
    expect(data.details.paper_ids).toBeDefined();
  });

  it("rejects unknown paper IDs", async () => {
    const req = createRequest({
      action: "ask",
      question: "Valid question",
      paper_ids: ["paper-001", "FAKE-999"],
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.code).toBe("UNKNOWN_PAPER_IDS");
  });

  it("enforces rate limits", async () => {
    // Fire 10 requests (the limit)
    for (let i = 0; i < 10; i++) {
      await POST(createRequest({ action: "ask", question: "Valid question", paper_ids: ["paper-001"] }, "1.2.3.4"));
    }

    // The 11th request should be rate limited
    const response = await POST(createRequest({ action: "ask", question: "Valid question", paper_ids: ["paper-001"] }, "1.2.3.4"));
    expect(response.status).toBe(429);
    
    const data = await response.json();
    expect(data.code).toBe("RATE_LIMITED");
    expect(response.headers.get("Retry-After")).toBeDefined();
  });

  it("does not mix rate limits between IPs", async () => {
    // Fill up IP 1
    for (let i = 0; i < 10; i++) {
      await POST(createRequest({ action: "ask", question: "Valid question", paper_ids: ["paper-001"] }, "10.0.0.1"));
    }

    // IP 2 should still be allowed
    const response = await POST(createRequest({ action: "ask", question: "Valid question", paper_ids: ["paper-001"] }, "10.0.0.2"));
    expect(response.status).toBe(200); // Because it delegates to the mocked successful handleAsk
  });
});
