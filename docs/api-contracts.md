# ScholarLens API Contracts

**Owner:** AlBaraa (AI & Backend Engineer)  
**Version:** 1.0.0 (Corresponds to Session 2-4 Implementation)

This document defines the HTTP API boundaries for the ScholarLens backend. All request and response shapes are strictly enforced via Zod at runtime (see `src/lib/scholarlens/schema.ts`).

---

## Endpoint: `GET /api/scholarlens`

Returns corpus-file availability and provider configuration without exposing secrets.
It returns HTTP 200 only when at least one manifest paper is available and every manifest
entry has a non-empty local content file; otherwise it returns HTTP 503.

```json
{
  "status": "ok",
  "corpus": {
    "paper_count": 6,
    "paper_ids": [
      "paper-001",
      "paper-002",
      "paper-003",
      "paper-004",
      "paper-008",
      "paper-009"
    ],
    "unavailable_paper_ids": []
  },
  "providers": {
    "groq": false,
    "gemini": false
  }
}
```

Provider flags report configuration presence only. They do not expose keys and do not
prove that a provider request will succeed.

---

## Endpoint: `POST /api/scholarlens`

The single endpoint for all ScholarLens actions. It dispatches to specific sub-services based on the `action` field in the request.

### HTTP Rules
- **Rate Limit:** 10 requests per minute per IP. Exceeding returns `429 Too Many Requests`.
- **Validation:** All fields are strictly validated before any AI provider is called.
- **Error Safety:** Errors never leak internal stack traces or API keys. 

### Request Body (JSON)

| Field | Type | Required | Description | Constraints |
|---|---|---|---|---|
| `action` | `string` | No | Which action to perform. Default is `"ask"`. | `"ask"`, `"compare"`, or `"readiness"` |
| `question` | `string` | Yes | The user's research question. | Length between 3 and 2000 characters. |
| `paper_ids` | `string[]` | Yes | List of approved paper IDs to search. | 1 to 15 items. Must be in the approved corpus. |

**Example Request:**
```json
{
  "action": "ask",
  "question": "What methods are used to measure reading comprehension in primary school students?",
  "paper_ids": ["paper-001", "paper-002"]
}
```

---

## Action: `ask`

Retrieves grounded evidence from the approved corpus and returns a structured synthesis.

### Response Body

| Field | Type | Description |
|---|---|---|
| `question` | `string` | Echo of the request question. |
| `not_found` | `boolean` | `true` if no evidence could be found in the provided papers. |
| `evidence` | `EvidenceItem[]` | Array of extracted evidence. Empty if `not_found` is true. |
| `message` | `string` (Optional) | Human-readable explanation (e.g., when `not_found` is true). |
| `provider_used` | `string` (Optional) | `"groq"` or `"gemini"`, indicating which provider succeeded. |

### EvidenceItem Shape

```ts
{
  question: string;
  source_id: string; // E.g., "paper-001"
  title: string;
  key_finding: string;
  evidence_snippet: string; // Exact quote, never paraphrased
  agreement: string;
  disagreement: string;
  research_gap: string;
  limitation: string;
  confidence: "low" | "medium" | "high";
}
```

---

## Action: `compare`

Builds a deterministic comparison matrix across multiple papers based on the extracted evidence.

### Response Body

| Field | Type | Description |
|---|---|---|
| `question` | `string` | Echo of the request question. |
| `matrix` | `ComparisonRow[]` | The comparison data. |
| `paper_count` | `number` | Number of distinct papers evaluated. |

### ComparisonRow Shape

```ts
{
  source_id: string;
  title: string;
  key_finding: string;
  agreement: string;
  disagreement: string;
}
```

---

## Action: `readiness`

Deterministically evaluates whether the selected evidence forms a research-ready foundation.

### Response Body

| Field | Type | Description |
|---|---|---|
| `papers_used` | `number` | Distinct paper count supporting the synthesis. |
| `every_claim_has_a_snippet` | `boolean` | `true` if all evidence items have exact quotes. |
| `gaps` | `string[]` | Array of identified research gaps. |
| `ready` | `boolean` | `true` if requirements are met (min papers + fully traceable). |

---

## HTTP Status Codes & Errors

| Status | Code | Cause | Response Example |
|---|---|---|---|
| **200** | — | Success. | See above schemas. |
| **400** | `INVALID_JSON` | Malformed JSON syntax in request. | `{ "error": "Request body must be valid JSON." }` |
| **400** | `VALIDATION_ERROR` | Schema failure (e.g., missing question, max length exceeded). | `{ "error": "Request validation failed.", "details": { ... } }` |
| **400** | `UNKNOWN_PAPER_IDS` | Included paper IDs that are not in the approved corpus. | `{ "error": "Unknown paper_id(s): fake-id. Only approved papers..." }` |
| **429** | `RATE_LIMITED` | Exceeded 10 requests per minute. | `{ "error": "Too many requests. Please wait before trying again." }` |
| **503** | `CORPUS_UNAVAILABLE` | A selected approved corpus file cannot be loaded. | `{ "error": "The approved paper corpus is not ready..." }` |
| **504** | `PROVIDER_ERROR` | No provider is configured, or both primary (Groq) and fallback (Gemini) failed. | `{ "error": "AI provider is temporarily unavailable. Please try again later." }` |
| **500** | `INTERNAL_ERROR` | Unexpected server crash. | `{ "error": "An internal error occurred. Please try again later." }` |
