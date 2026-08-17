/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  SCHOLARLENS — Section 5: Tests & Error Handling                   │
 * │  File: providers.test.ts                                            │
 * │  Owner: AlBaraa (AI & Backend Engineer)                             │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * Unit tests for the AI provider layer.
 *
 * WHAT THESE TESTS PROVE:
 *   - ProviderError has correct properties (name, provider, status).
 *   - isProviderConfigured correctly checks environment variables.
 *   - Provider configuration detection works for all states (set, unset, empty).
 *
 * NOTE: Tests for actual Groq/Gemini API calls and the fallback chain
 * require mocking the SDK clients. Those are in the regression test suite
 * to avoid flaky tests in the unit test suite.
 *
 * DETERMINISTIC: These tests do not make any network calls.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  ProviderError,
  isProviderConfigured,
  PROVIDER_TIMEOUT_MS,
} from "../../src/lib/ai/providers";

// ─── ProviderError Tests ─────────────────────────────────────────────────────

describe("ProviderError", () => {
  it("P1: has correct name, provider, and status properties", () => {
    const error = new ProviderError("test message", "groq", 502);

    expect(error.name).toBe("ProviderError");
    expect(error.provider).toBe("groq");
    expect(error.status).toBe(502);
    expect(error.message).toBe("test message");
  });

  it("P2: defaults status to 502 when not specified", () => {
    const error = new ProviderError("test", "gemini");

    expect(error.status).toBe(502);
  });

  it("P3: is an instance of Error", () => {
    const error = new ProviderError("test", "groq");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ProviderError);
  });

  it("P4: supports 504 status for timeout errors", () => {
    const error = new ProviderError("timeout", "groq", 504);

    expect(error.status).toBe(504);
  });
});

// ─── isProviderConfigured Tests ──────────────────────────────────────────────

describe("isProviderConfigured", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Create a fresh copy of env for each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  it("P5: returns true when GROQ_API_KEY is set", () => {
    process.env.GROQ_API_KEY = "gsk_test_key_12345";

    expect(isProviderConfigured("groq")).toBe(true);
  });

  it("P6: returns false when GROQ_API_KEY is undefined", () => {
    delete process.env.GROQ_API_KEY;

    expect(isProviderConfigured("groq")).toBe(false);
  });

  it("P7: returns false when GROQ_API_KEY is empty string", () => {
    process.env.GROQ_API_KEY = "";

    expect(isProviderConfigured("groq")).toBe(false);
  });

  it("P8: returns true when GEMINI_API_KEY is set", () => {
    process.env.GEMINI_API_KEY = "AIzaSyTest12345";

    expect(isProviderConfigured("gemini")).toBe(true);
  });

  it("P9: returns false when GEMINI_API_KEY is undefined", () => {
    delete process.env.GEMINI_API_KEY;

    expect(isProviderConfigured("gemini")).toBe(false);
  });

  it("P10: returns false when GEMINI_API_KEY is empty string", () => {
    process.env.GEMINI_API_KEY = "";

    expect(isProviderConfigured("gemini")).toBe(false);
  });
});

// ─── Constants Tests ─────────────────────────────────────────────────────────

describe("Provider constants", () => {
  it("PROVIDER_TIMEOUT_MS is 20 seconds", () => {
    expect(PROVIDER_TIMEOUT_MS).toBe(20_000);
  });
});
