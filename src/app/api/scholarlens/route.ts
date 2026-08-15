/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  SCHOLARLENS — Section 1: Server APIs & Validation                 │
 * │  File: route.ts                                                     │
 * │  Owner: AlBaraa (AI & Backend Engineer)                             │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * POST /api/scholarlens — the single API entry point for evidence queries.
 * GET  /api/scholarlens — corpus health check for deployment smoke tests.
 *
 * REQUEST FLOW (POST):
 *   ┌────────────┐     ┌───────────┐     ┌──────────────┐     ┌──────────┐
 *   │ Rate Limit │────→│ JSON Parse│────→│ Zod Validate │────→│ Dispatch │
 *   │   Check    │     │ try/catch │     │  safeParse   │     │ by action│
 *   └────────────┘     └───────────┘     └──────────────┘     └──────────┘
 *         │ 429              │ 400              │ 400              │
 *         ▼                  ▼                  ▼                  ▼
 *     Too Many          Invalid JSON      Validation Error    handleAsk()
 *     Requests                                                handleCompare()
 *                                                             handleReadiness()
 *
 * SECURITY RULES:
 *   1. Invalid input returns 4xx WITHOUT calling the AI provider.
 *   2. Error responses NEVER contain API keys, stack traces, or internal paths.
 *   3. Rate limiting protects against abuse and cost overruns.
 *   4. Unknown paper_ids are rejected before any provider call.
 *
 * @see docs/api-contracts.md for the full HTTP contract.
 */
import { NextResponse } from "next/server";
import { ScholarLensRequestSchema } from "@/lib/scholarlens/schema";
import {
  handleAsk,
  handleCompare,
  handleReadiness,
  getUnknownPaperIdsForCorpus,
} from "@/lib/scholarlens/service";
import { ProviderError, isProviderConfigured } from "@/lib/ai/providers";
import { apiRateLimiter } from "@/lib/ai/rate-limiter";
import { CorpusUnavailableError, agentRag } from "@/lib/scholarlens/agent-rag";
import crypto from "node:crypto";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extract the client IP from the request headers.
 *
 * Checks common proxy headers in order of reliability.
 * Falls back to "unknown" if no IP can be determined.
 */
function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

/**
 * Hash a client IP for logging. Never log raw IPs — hash them so
 * they can be correlated across requests without exposing PII.
 */
function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 8);
}

/**
 * Redact known secret patterns from error messages before logging.
 *
 * WHY: Even server-side logs should not contain raw API keys.
 */
function redactSecrets(value: unknown): string {
  const str =
    value instanceof Error
      ? `${value.name}: ${value.message}`
      : String(value);

  return str
    .replace(/sk-[a-zA-Z0-9]{20,}/g, "sk-[REDACTED]")
    .replace(/gsk_[a-zA-Z0-9]{20,}/g, "gsk_[REDACTED]")
    .replace(/AIza[a-zA-Z0-9_-]{30,}/g, "AIza[REDACTED]")
    .replace(/key[-_]?[=:]\s*["']?[a-zA-Z0-9_-]{20,}/gi, "key=[REDACTED]");
}

/**
 * Build a safe error response that NEVER leaks internal details.
 */
function safeErrorResponse(error: unknown, context: string): NextResponse {
  console.error(`[ScholarLens] ${context}:`, redactSecrets(error));

  if (error instanceof ProviderError) {
    return NextResponse.json(
      {
        error: "AI provider is temporarily unavailable. Please try again later.",
        code: "PROVIDER_ERROR",
      },
      { status: error.status },
    );
  }

  if (error instanceof CorpusUnavailableError) {
    return NextResponse.json(
      {
        error: "The approved paper corpus is not ready. Add approved paper metadata and text before asking questions.",
        code: "CORPUS_UNAVAILABLE",
      },
      { status: 503 },
    );
  }

  return NextResponse.json(
    {
      error: "An internal error occurred. Please try again later.",
      code: "INTERNAL_ERROR",
    },
    { status: 500 },
  );
}

// ─── GET Handler — Corpus Health Check ───────────────────────────────────────

/**
 * GET /api/scholarlens — returns corpus health status.
 *
 * Used by deployment smoke tests and monitoring to verify the corpus
 * is loaded and providers are configured. Returns NO secrets.
 */
export async function GET() {
  try {
    const { availablePaperIds, unavailablePaperIds } = await agentRag.getCorpusHealth();
    const corpusReady = unavailablePaperIds.length === 0 && availablePaperIds.length > 0;

    return NextResponse.json({
      status: corpusReady ? "ok" : "error",
      corpus: {
        paper_count: availablePaperIds.length,
        paper_ids: availablePaperIds,
        unavailable_paper_ids: unavailablePaperIds,
      },
      providers: {
        groq: isProviderConfigured("groq"),
        gemini: isProviderConfigured("gemini"),
      },
    }, { status: corpusReady ? 200 : 503 });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        corpus: { paper_count: 0, paper_ids: [] },
        providers: {
          groq: isProviderConfigured("groq"),
          gemini: isProviderConfigured("gemini"),
        },
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    );
  }
}

// ─── POST Handler ────────────────────────────────────────────────────────────

/**
 * POST handler for /api/scholarlens.
 *
 * Supports three actions via the `action` field:
 *   - "ask"       → retrieve evidence and return structured synthesis
 *   - "compare"   → build paper comparison matrix
 *   - "readiness" → check research readiness
 *
 * Invalid input is rejected at the Zod validation step (400) before
 * any AI provider is called.
 */
export async function POST(request: Request) {
  const requestStartTime = Date.now();

  // ── Step 1: Rate limiting ──────────────────────────────────────────
  const clientIp = getClientIp(request);
  const ipHash = hashIp(clientIp);
  const rateLimit = apiRateLimiter.check(clientIp);

  if (!rateLimit.allowed) {
    console.warn(`[ScholarLens] Rate limited: client=${ipHash}`);
    return NextResponse.json(
      {
        error: "Too many requests. Please wait before trying again.",
        code: "RATE_LIMITED",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  // ── Step 2: Parse JSON body ────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    console.warn(`[ScholarLens] Invalid JSON from client=${ipHash}`);
    return NextResponse.json(
      {
        error: "Request body must be valid JSON.",
        code: "INVALID_JSON",
      },
      { status: 400 },
    );
  }

  // ── Step 3: Validate with Zod ──────────────────────────────────────
  const parseResult = ScholarLensRequestSchema.safeParse(body);

  if (!parseResult.success) {
    console.warn(
      `[ScholarLens] Validation failed: client=${ipHash}, ` +
      `errors=${parseResult.error.issues.length}`,
    );
    return NextResponse.json(
      {
        error: "Request validation failed.",
        details: parseResult.error.format(),
        code: "VALIDATION_ERROR",
      },
      { status: 400 },
    );
  }

  const validatedRequest = parseResult.data;

  // Log validated request metadata (never log raw question for PII safety)
  console.log(
    `[ScholarLens] Request: action=${validatedRequest.action}, ` +
    `papers=${validatedRequest.paper_ids.length}, ` +
    `qLen=${validatedRequest.question.length}, ` +
    `client=${ipHash}`,
  );

  // ── Step 4: Validate paper IDs against approved corpus ─────────────
  let unknownIds: string[];
  try {
    unknownIds = await getUnknownPaperIdsForCorpus(validatedRequest.paper_ids);
  } catch (error) {
    return safeErrorResponse(error, "Corpus validation failed");
  }
  if (unknownIds.length > 0) {
    console.warn(
      `[ScholarLens] Unknown paper IDs: ${unknownIds.join(", ")}, client=${ipHash}`,
    );
    return NextResponse.json(
      {
        error: `Unknown paper_id(s): ${unknownIds.join(", ")}. Only approved papers from the source register are accepted.`,
        code: "UNKNOWN_PAPER_IDS",
      },
      { status: 400 },
    );
  }

  // ── Step 5: Dispatch by action ─────────────────────────────────────
  try {
    let response: NextResponse;

    switch (validatedRequest.action) {
      case "ask": {
        const result = await handleAsk(validatedRequest);
        response = NextResponse.json(result);
        break;
      }

      case "compare": {
        const result = await handleCompare(validatedRequest);
        response = NextResponse.json(result);
        break;
      }

      case "readiness": {
        const result = await handleReadiness(validatedRequest);
        response = NextResponse.json(result);
        break;
      }

      default: {
        const _exhaustive: never = validatedRequest.action;
        response = NextResponse.json(
          { error: `Unknown action: ${_exhaustive}`, code: "UNKNOWN_ACTION" },
          { status: 400 },
        );
      }
    }

    const elapsed = Date.now() - requestStartTime;
    console.log(
      `[ScholarLens] Response: action=${validatedRequest.action}, ` +
      `status=${response.status}, ${elapsed}ms, client=${ipHash}`,
    );

    return response;
  } catch (error) {
    return safeErrorResponse(error, "Action dispatch failed");
  }
}
