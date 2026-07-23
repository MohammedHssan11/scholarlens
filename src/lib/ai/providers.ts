/**
 * AI provider layer: Groq (primary) -> Gemini (fallback).
 * Owner: AlBaraa (AI & Backend Engineer).
 *
 * Rules:
 *  - API keys are read from the server environment only. Never expose them.
 *  - Every call has a timeout.
 *  - A provider failure returns a safe typed error - it must NEVER invent an answer.
 *
 * TODO(AlBaraa): implement the real calls in Session 2-3.
 */

export type ProviderName = "groq" | "gemini";

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

export const PROVIDER_TIMEOUT_MS = 20_000;

/** Returns true only when the key exists on the server. */
export function isProviderConfigured(provider: ProviderName): boolean {
  const key = provider === "groq" ? process.env.GROQ_API_KEY : process.env.GEMINI_API_KEY;
  return typeof key === "string" && key.length > 0;
}
