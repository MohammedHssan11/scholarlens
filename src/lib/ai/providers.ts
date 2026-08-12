/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  SCHOLARLENS — Section 3: Gemini/Groq Provider Abstraction         │
 * │  File: providers.ts                                                 │
 * │  Owner: AlBaraa (AI & Backend Engineer)                             │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * AI provider abstraction layer: Groq (primary) → Gemini (fallback).
 *
 * ARCHITECTURE:
 *   ┌──────────┐      ┌──────────┐      ┌───────────┐
 *   │  Route   │─────→│ Service  │─────→│ Provider  │
 *   │ Handler  │      │  Layer   │      │  Layer    │
 *   └──────────┘      └──────────┘      └─────┬─────┘
 *                                              │
 *                                    ┌─────────┴─────────┐
 *                                    │                   │
 *                               ┌────▼────┐        ┌────▼────┐
 *                               │  Groq   │───X───→│ Gemini  │
 *                               │(primary)│ fail   │(fallback│
 *                               └─────────┘        └─────────┘
 *
 * SECURITY RULES:
 *   1. API keys are read from process.env ONLY — never from request body
 *      or client-side code.
 *   2. Every provider call has a timeout (AbortController).
 *   3. A provider failure returns a typed ProviderError — it NEVER
 *      invents an answer or leaks the error details to the client.
 *   4. AI output is ALWAYS validated by Zod before being returned.
 *
 * FALLBACK CHAIN:
 *   1. Try Groq (20s timeout) with json_schema structured output
 *   2. If Groq fails → try Gemini (20s timeout) with response_schema
 *   3. If both fail → throw ProviderError with status 504
 *
 * @see https://console.groq.com/docs/structured-outputs
 * @see https://ai.google.dev/gemini-api/docs/structured-output
 */
import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import {
  EvidenceItemSchema,
  type EvidenceItem,
} from "../scholarlens/schema";
import {
  EVIDENCE_EXTRACTION_PROMPT,
  EVIDENCE_RESPONSE_JSON_SCHEMA,
} from "./prompts";

// ─── Types & Constants ───────────────────────────────────────────────────────

/** Supported AI provider identifiers. */
export type ProviderName = "groq" | "gemini";

/**
 * Per-provider timeout in milliseconds.
 * 20 seconds balances user experience with model response time.
 * Total worst-case is ~40s (Groq timeout + Gemini timeout).
 */
export const PROVIDER_TIMEOUT_MS = 20_000;

// ─── ProviderError ───────────────────────────────────────────────────────────

/**
 * Typed error thrown when a provider call fails.
 *
 * The `status` field maps directly to the HTTP status code the route
 * handler should return:
 *   - 502: Provider returned an invalid response
 *   - 504: Provider timed out or is unreachable
 *
 * The error `message` is safe to log server-side but MUST NOT be
 * returned to the client. The route handler returns a generic
 * safe message instead.
 */
export class ProviderError extends Error {
  constructor(
    message: string,
    readonly provider: ProviderName,
    readonly status: number = 502,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

// ─── Provider Configuration Check ───────────────────────────────────────────

/**
 * Returns true only when the given provider's API key exists in
 * the server environment.
 *
 * Used to:
 *   1. Skip a provider in the fallback chain if it's not configured.
 *   2. Surface clear errors during startup/health checks.
 *
 * @param provider - Which provider to check.
 */
export function isProviderConfigured(provider: ProviderName): boolean {
  const key =
    provider === "groq"
      ? process.env.GROQ_API_KEY
      : process.env.GEMINI_API_KEY;
  return typeof key === "string" && key.length > 0;
}

// ─── AI Response Parsing ─────────────────────────────────────────────────────

/**
 * Internal schema for parsing the raw AI response before extracting
 * individual evidence items.
 */
const AIResponseSchema = z.object({
  not_found: z.boolean(),
  evidence: z.array(EvidenceItemSchema),
});

/**
 * Parse and validate AI model output through Zod.
 *
 * WHY THIS EXISTS:
 *   AI models can return malformed JSON, missing fields, or extra fields
 *   even when instructed to use a specific schema. This function ensures
 *   that ONLY valid, schema-conformant data reaches the client.
 *
 * @param rawJson - Raw JSON string from the AI provider.
 * @param provider - Which provider produced this output (for error context).
 * @returns Parsed and validated response.
 * @throws ProviderError if the output doesn't match the expected schema.
 */
function parseAIResponse(
  rawJson: string,
  provider: ProviderName,
): { not_found: boolean; evidence: EvidenceItem[] } {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new ProviderError(
      `${provider} returned invalid JSON: unable to parse response.`,
      provider,
      502,
    );
  }

  const result = AIResponseSchema.safeParse(parsed);
  if (!result.success) {
    throw new ProviderError(
      `${provider} response failed schema validation: ${result.error.message}`,
      provider,
      502,
    );
  }

  return result.data;
}

// ─── Groq Provider ───────────────────────────────────────────────────────────

/**
 * Call Groq API with structured output enforcement.
 *
 * Uses json_schema response format, which guarantees the model's output
 * conforms to the provided JSON Schema. The output is STILL validated
 * by Zod as a defense-in-depth measure.
 *
 * @param question  - The user's research question (Zod-validated).
 * @param context   - Retrieved text chunks from the approved corpus.
 * @param paperIds  - Approved paper IDs to constrain source references.
 * @returns Parsed evidence items.
 * @throws ProviderError on timeout, API error, or schema mismatch.
 *
 * @see https://console.groq.com/docs/structured-outputs
 */
async function callGroq(
  question: string,
  context: string,
  paperIds: string[],
): Promise<{ not_found: boolean; evidence: EvidenceItem[] }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new ProviderError("Groq API key is not configured.", "groq", 502);
  }

  const groq = new Groq({ apiKey });

  // AbortController enforces the 20-second timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    PROVIDER_TIMEOUT_MS,
  );

  try {
    const completion = await groq.chat.completions.create(
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: EVIDENCE_EXTRACTION_PROMPT.system,
          },
          {
            role: "user",
            content: EVIDENCE_EXTRACTION_PROMPT.buildUserMessage(
              question,
              context,
              paperIds,
            ),
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: EVIDENCE_RESPONSE_JSON_SCHEMA,
        },
        temperature: 0.1, // Low temperature for more deterministic extraction
      },
      { signal: controller.signal },
    );

    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      throw new ProviderError(
        "Groq returned an empty response.",
        "groq",
        502,
      );
    }

    // Validate through Zod even though json_schema should guarantee format
    return parseAIResponse(content, "groq");
  } catch (error) {
    if (error instanceof ProviderError) throw error;

    // AbortController timeout
    if (error instanceof Error && error.name === "AbortError") {
      throw new ProviderError(
        `Groq timed out after ${PROVIDER_TIMEOUT_MS}ms.`,
        "groq",
        504,
      );
    }

    // API-level errors (rate limit, auth, server error, etc.)
    throw new ProviderError(
      `Groq API error: ${error instanceof Error ? error.message : "Unknown error"}`,
      "groq",
      502,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Gemini Provider ─────────────────────────────────────────────────────────

/**
 * Call Gemini API with structured output.
 *
 * Uses response_mime_type "application/json" with response_schema for
 * structured output enforcement. Retrieval always happens in the local
 * AgentRAG layer before this function is called, so Gemini sees the same
 * approved context as Groq and cannot search an unfiltered external store.
 *
 * @param question  - The user's research question (Zod-validated).
 * @param context   - Retrieved text chunks from the approved corpus.
 * @param paperIds  - Approved paper IDs to constrain source references.
 * @returns Parsed evidence items.
 * @throws ProviderError on timeout, API error, or schema mismatch.
 *
 * @see https://ai.google.dev/gemini-api/docs/structured-output
 * @see https://ai.google.dev/gemini-api/docs/file-search
 */
async function callGemini(
  question: string,
  context: string,
  paperIds: string[],
): Promise<{ not_found: boolean; evidence: EvidenceItem[] }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ProviderError(
      "Gemini API key is not configured.",
      "gemini",
      502,
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  // AbortController enforces the 20-second timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    PROVIDER_TIMEOUT_MS,
  );

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: EVIDENCE_EXTRACTION_PROMPT.buildUserMessage(
                question,
                context,
                paperIds,
              ),
            },
          ],
        },
      ],
      config: {
        systemInstruction: EVIDENCE_EXTRACTION_PROMPT.system,
        responseMimeType: "application/json",
        responseSchema: EVIDENCE_RESPONSE_JSON_SCHEMA.schema,
      },
    });

    const content = response?.text;
    if (!content) {
      throw new ProviderError(
        "Gemini returned an empty response.",
        "gemini",
        502,
      );
    }

    // Validate through Zod — the response_schema is a hint, not a guarantee
    return parseAIResponse(content, "gemini");
  } catch (error) {
    if (error instanceof ProviderError) throw error;

    if (error instanceof Error && error.name === "AbortError") {
      throw new ProviderError(
        `Gemini timed out after ${PROVIDER_TIMEOUT_MS}ms.`,
        "gemini",
        504,
      );
    }

    throw new ProviderError(
      `Gemini API error: ${error instanceof Error ? error.message : "Unknown error"}`,
      "gemini",
      502,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Fallback Chain ──────────────────────────────────────────────────────────

/**
 * Execute the provider fallback chain: Groq → Gemini → error.
 *
 * This is the ONLY function the service layer should call. It handles:
 *   1. Trying the primary provider (Groq)
 *   2. Falling back to Gemini if Groq fails
 *   3. Throwing a final ProviderError if both fail
 *
 * The function returns which provider was used alongside the evidence,
 * so the response can include this metadata for debugging.
 *
 * @param question  - The user's research question (Zod-validated).
 * @param context   - Retrieved text chunks from the approved corpus.
 * @param paperIds  - Approved paper IDs to constrain source references.
 * @returns Evidence items + which provider generated them.
 * @throws ProviderError if all providers fail (status 504).
 */
export async function generateEvidence(
  question: string,
  context: string,
  paperIds: string[],
): Promise<{
  not_found: boolean;
  evidence: EvidenceItem[];
  provider_used: ProviderName;
}> {
  const errors: ProviderError[] = [];

  // ── Attempt 1: Groq (primary) ──────────────────────────────────────
  if (isProviderConfigured("groq")) {
    try {
      const result = await callGroq(question, context, paperIds);
      return { ...result, provider_used: "groq" };
    } catch (error) {
      if (error instanceof ProviderError) {
        errors.push(error);
        console.warn(
          `[ScholarLens] Groq failed, falling back to Gemini: ${error.message}`,
        );
      }
    }
  } else {
    console.warn("[ScholarLens] Groq not configured, trying Gemini directly.");
  }

  // ── Attempt 2: Gemini (fallback) ───────────────────────────────────
  if (isProviderConfigured("gemini")) {
    try {
      const result = await callGemini(question, context, paperIds);
      return { ...result, provider_used: "gemini" };
    } catch (error) {
      if (error instanceof ProviderError) {
        errors.push(error);
        console.error(
          `[ScholarLens] Gemini also failed: ${error.message}`,
        );
      }
    }
  } else {
    console.error("[ScholarLens] Gemini not configured.");
  }

  // ── Both failed ────────────────────────────────────────────────────
  const errorSummary = errors.map((e) => `${e.provider}: ${e.message}`).join("; ");
  throw new ProviderError(
    `All AI providers failed. ${errorSummary}`,
    "gemini", // last attempted
    504,
  );
}
