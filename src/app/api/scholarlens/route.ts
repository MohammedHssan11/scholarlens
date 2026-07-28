/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  SCHOLARLENS — Section 1: Server APIs & Validation                 │
 * │  File: route.ts                                                     │
 * │  Owner: AlBaraa (AI & Backend Engineer)                             │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * POST /api/scholarlens — the single API entry point.
 *
 * REQUEST FLOW:
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
  buildBaselineAnswer,
  getUnknownPaperIds,
} from "@/lib/scholarlens/service";
import { ProviderError, isProviderConfigured } from "@/lib/ai/providers";
import { apiRateLimiter } from "@/lib/ai/rate-limiter";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extract the client IP from the request headers.
 *
 * Checks common proxy headers in order of reliability.
 * Falls back to "unknown" if no IP can be determined.
 *
 * @param request - The incoming HTTP request.
 * @returns Client IP string for rate limiting.
 */
function getClientIp(request: Request): string {
  // Vercel and most reverse proxies set these headers
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for may contain multiple IPs; the first is the client
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

/**
 * Redact known secret patterns from error messages before logging.
 *
 * WHY: Even server-side logs should not contain raw API keys.
 * If a log aggregator is compromised, keys would be exposed.
 *
 * @param value - Any value that might contain secrets.
 * @returns Stringified value with secrets redacted.
 */
function redactSecrets(value: unknown): string {
  const str =
    value instanceof Error
      ? `${value.name}: ${value.message}`
      : String(value);

  // Redact patterns that look like API keys
  return str
    .replace(/sk-[a-zA-Z0-9]{20,}/g, "sk-[REDACTED]")
    .replace(/gsk_[a-zA-Z0-9]{20,}/g, "gsk_[REDACTED]")
    .replace(/AIza[a-zA-Z0-9_-]{30,}/g, "AIza[REDACTED]")
    .replace(/key[-_]?[=:]\s*["']?[a-zA-Z0-9_-]{20,}/gi, "key=[REDACTED]");
}

/**
 * Build a safe error response that NEVER leaks internal details.
 *
 * @param error   - The caught error (any type).
 * @param context - Human-readable context for the server log.
 * @returns NextResponse with appropriate status code and safe message.
 */
function safeErrorResponse(error: unknown, context: string): NextResponse {
  // Log full error server-side (redacted)
  console.error(`[ScholarLens] ${context}:`, redactSecrets(error));

  // Provider errors have a meaningful status code
  if (error instanceof ProviderError) {
    return NextResponse.json(
      {
        error: "AI provider is temporarily unavailable. Please try again later.",
        code: "PROVIDER_ERROR",
      },
      { status: error.status },
    );
  }

  // Everything else is a generic 500
  return NextResponse.json(
    {
      error: "An internal error occurred. Please try again later.",
      code: "INTERNAL_ERROR",
    },
    { status: 500 },
  );
}

// ─── Route Handler ───────────────────────────────────────────────────────────

/**
 * POST handler for /api/scholarlens.
 *
 * Supports three actions via the `action` field:
 *   - "ask"       → retrieve evidence and return structured synthesis
 *   - "compare"   → build paper comparison matrix
 *   - "readiness" → check research readiness
 *
 * Invalid input is rejected at the Zod validation step (400) before
 * any AI provider is called. This is a HARD RULE from the project
 * briefing and scoring rubric.
 */
export async function POST(request: Request) {
  // ── Step 1: Rate limiting ──────────────────────────────────────────
  const clientIp = getClientIp(request);
  const rateLimit = apiRateLimiter.check(clientIp);

  if (!rateLimit.allowed) {
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

  // ── Step 4: Validate paper IDs against approved corpus ─────────────
  const unknownIds = getUnknownPaperIds(validatedRequest.paper_ids);
  if (unknownIds.length > 0) {
    return NextResponse.json(
      {
        error: `Unknown paper_id(s): ${unknownIds.join(", ")}. Only approved papers from the source register are accepted.`,
        code: "UNKNOWN_PAPER_IDS",
      },
      { status: 400 },
    );
  }

  // ── Step 5: Baseline mode (no providers configured) ────────────────
  /**
   * If neither Groq nor Gemini is configured, fall back to the Session 1
   * baseline. This lets the UI team test the full flow without API keys.
   *
   * This is NOT a production path — it's a development convenience.
   */
  if (
    !isProviderConfigured("groq") &&
    !isProviderConfigured("gemini")
  ) {
    console.warn(
      "[ScholarLens] No AI provider configured. Returning baseline sample data.",
    );
    const baseline = buildBaselineAnswer(
      validatedRequest.question,
      validatedRequest.paper_ids,
    );
    return NextResponse.json(baseline);
  }

  // ── Step 6: Dispatch by action ─────────────────────────────────────
  try {
    switch (validatedRequest.action) {
      case "ask": {
        const result = await handleAsk(validatedRequest);
        return NextResponse.json(result);
      }

      case "compare": {
        const result = await handleCompare(validatedRequest);
        return NextResponse.json(result);
      }

      case "readiness": {
        const result = await handleReadiness(validatedRequest);
        return NextResponse.json(result);
      }

      default: {
        // TypeScript exhaustive check — this should never happen
        // because Zod already validated the action field.
        const _exhaustive: never = validatedRequest.action;
        return NextResponse.json(
          { error: `Unknown action: ${_exhaustive}`, code: "UNKNOWN_ACTION" },
          { status: 400 },
        );
      }
    }
  } catch (error) {
    return safeErrorResponse(error, "Action dispatch failed");
  }
}
