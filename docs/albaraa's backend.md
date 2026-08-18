# albaraa's backend

## Decision needed: retrieval strategy

The current backend uses a local TF-IDF retriever instead of the originally agreed
Gemini File Search. This keeps Groq and Gemini grounded on the same approved source
chunks, because Groq cannot query Gemini's managed File Search, but lexical retrieval
can miss semantically related wording. **Mohammed Hassan Mahmoud (Integration Lead):
please confirm whether this provider-independent retrieval tradeoff is approved before
the backend is merged.**

## Purpose

ScholarLens is a research-evidence backend. It does not answer from general AI knowledge. It finds evidence in papers approved by the team, lets the AI explain that evidence in a fixed structure, and proves every displayed quote is actually present in retrieved paper text.

The backend serves `POST /api/scholarlens`. The browser sends a question and selected paper IDs. The backend validates the request, retrieves only from those approved papers, generates a structured response, verifies it, and returns it. API keys and raw provider errors never reach the browser.

## The backend flow

```text
Browser
  -> POST /api/scholarlens
  -> rate limit and request validation
  -> approved-paper check (unknown IDs rejected before any AI call)
  -> AgentRAG retrieval over selected corpus files (TF-IDF keyword ranking)
  -> Groq, then Gemini if Groq fails
  -> evidence verification against retrieved original text
  -> ask / compare / readiness response
```

The request has three fields:

- `action`: `ask` (default), `compare`, or `readiness`.
- `question`: 3–2,000 characters.
- `paper_ids`: one to fifteen selected approved IDs.

Malformed JSON and invalid fields return `400`. More than ten requests from one IP in one minute return `429`. A corpus that has not been configured returns `503`. Provider failure returns `502` or `504`, without exposing implementation details.

## Source of truth and corpus setup

The corpus lives under `data/corpus`. `data/corpus/manifest.json` is the machine-readable source register for the backend. Each approved paper must have one manifest entry:

```json
{
  "source_id": "paper-001",
  "title": "Exact published title",
  "content_path": "papers/paper-001.txt"
}
```

The referenced file must contain text extracted from the approved, legally usable paper. It is intentionally separate from a PDF: a private or unlicensed PDF must not be committed to this public repository. The team must also enter the same paper’s complete publication, licence, and approval details in `docs/source-register.md`.

The committed manifest contains only active papers with confirmed arXiv identifiers.
Run the reproducible setup step from the repository root before starting the app:

```bash
npm run fetch-corpus
```

Python 3 is required. The downloader uses `data/corpus` relative to the repository by
default; set `SCHOLARLENS_CORPUS_DIR` to download into another directory. Paper files
remain gitignored and must not be committed. Papers 005, 006, and 007 are excluded
because their official publication URL/DOI and licence are still unconfirmed and the
old downloader generated fabricated placeholder text for them. Paper 010 is also
excluded because its official publication URL/DOI and licence remain unconfirmed.

## AgentRAG retrieval

`src/lib/scholarlens/agent-rag.ts` is the retrieval layer. It provides a small AgentRAG-style tool sequence:

1. It loads and validates the corpus manifest.
2. It accepts only selected source IDs that exist in that manifest.
3. It reads only the text and PDF files referenced by those source records. `pdf-parse` is used to extract raw text from PDFs on the fly.
4. It splits the original text into overlapping 1,600-character chunks to prevent key sentences from being split at boundaries.
5. It uses TF-IDF scoring to rank chunks against the query. Rare, discriminative terms are weighted higher, drastically improving retrieval precision over simple keyword counts.
6. It returns at most eight chunks that meet the minimum score threshold.
7. It gives those exact chunks, with their paper ID and title, to the generation provider.

This keeps the grounding boundary visible and provider-independent. Groq cannot access Gemini File Search, so relying on provider-managed retrieval would make Groq answers ungrounded. The local retrieval layer gives Groq and Gemini the same approved context. It also makes testing and later replacement with a semantic/vector retriever straightforward: preserve the `RetrievedChunk` contract and replace only the ranking implementation.

If no chunk matches the question, `ask` returns a legitimate `not_found: true` response. That means “the selected papers did not provide matching evidence,” not “the AI could not answer.”

## Provider layer

`src/lib/ai/providers.ts` calls Groq first and Gemini second. Both receive the same system prompt and retrieved context. Both are asked for JSON matching the shared evidence schema. The model response is parsed by Zod before it can leave the server.

Environment variables are server-only:

- `GROQ_API_KEY` enables Groq as the primary generator.
- `GEMINI_API_KEY` enables Gemini as fallback.

Each provider has a 20-second timeout. If Groq fails, Gemini is tried. If both fail, the user gets a safe provider error. There is no production fallback to sample data.

## Evidence verification: the trust-critical step

Generation is not trusted by itself. In `service.ts`, every candidate evidence item is checked after generation:

- Its `source_id` must be in the papers selected by the user.
- Its title must exactly equal the title in the approved manifest.
- Its `evidence_snippet`, after whitespace normalisation, must be a literal substring of one of the retrieved chunks for that source.
- Its question is overwritten with the validated request question.

Any item that fails one of these checks is discarded. If all items are discarded, the response is `not_found`. This is the final hard boundary that prevents a plausible-looking but invented quote from being shown to the user.

## Actions, logging, and health checks

`ask` returns a structured synthesis. An evidence item contains the question, paper ID, title, key finding, exact quote, agreement, disagreement, gap, limitation, and confidence. The quote is the traceable part; the other explanatory fields are model-generated summaries tied to that quote.

`compare` first performs the same verified `ask` work, then `compare_papers()` creates a deterministic row for each evidence item. The comparison operation itself does not ask a model to invent a table.

`readiness` also starts with verified evidence. `research_readiness()` then deterministically counts distinct papers, checks that snippets meet the minimum length, collects non-empty gaps, and marks the set ready only when it meets `READINESS_RULES`. Current rules require three distinct papers and snippets of at least thirty characters.

**Logging:** The backend logs detailed, structured requests and retrieval stats. To prevent PII leaks, user IPs are hashed and question content is never logged in full.

**Health Check:** `GET /api/scholarlens` provides a safe deployment smoke test, returning corpus health and provider configuration status without leaking secrets. It counts only manifest entries whose referenced file exists and is non-empty, and returns `503` with the unavailable paper IDs when the local corpus is incomplete.

## Main files

| File | Responsibility |
|---|---|
| `src/app/api/scholarlens/route.ts` | HTTP boundary, rate limiting, safe errors, dispatch. |
| `src/lib/scholarlens/schema.ts` | Runtime Zod contracts for requests, evidence, and responses. |
| `src/lib/scholarlens/agent-rag.ts` | Manifest loading, safe corpus access, chunking, and retrieval. |
| `src/lib/scholarlens/service.ts` | Workflow orchestration and final evidence verification. |
| `src/lib/ai/providers.ts` | Groq-to-Gemini provider fallback and model-output parsing. |
| `src/lib/ai/prompts.ts` | Versioned system prompt and provider JSON schema. |
| `src/lib/scholarlens/tools.ts` | Deterministic comparison and readiness functions. |
| `src/lib/ai/rate-limiter.ts` | Per-instance in-memory sliding-window rate limiter. |

## What the team must do before release

1. Agree one narrow research topic.
2. Add 8–15 approved papers to `docs/source-register.md`, including legal-use information.
3. Add each paper’s accurate ID, exact title, and approved extracted text path to `data/corpus/manifest.json`.
4. Put the corresponding text files under `data/corpus`, never outside it.
5. Configure at least one provider key in the deployment environment.
6. Add evaluation questions that are answerable, unanswerable, ambiguous, and prompt-injection attempts using the real corpus.
7. Run `npm.cmd test`, `npm.cmd run lint`, and `npm.cmd run build` before release.

## Current operational limitations

The retrieval ranking is lexical, not semantic. It is transparent and safe for the current small corpus but can miss a relevant chunk that uses different vocabulary. A future semantic index may improve recall, but it must still return original chunks with source IDs and must keep the same literal-quote verification step.

The rate limiter is in memory. It protects a warm single server instance, but it is not a shared production limiter across multiple serverless instances. Use Redis or Upstash before relying on it for public production traffic.

The backend has no paper-upload or corpus-administration endpoint. Corpus changes are intentionally a controlled repository/deployment operation until the team defines authentication, authorisation, licence checks, and an audit trail.
