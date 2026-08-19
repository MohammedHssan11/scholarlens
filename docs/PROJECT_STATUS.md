# ScholarLens project status

**Status date:** 2026-08-19

**Prepared for:** Mohammed Hassan Mahmoud (Integration Lead), Dr. Ahmed, and team defense preparation

**Production:** https://scholarlens-nine.vercel.app

**Last verified working:** 2026-08-19

## Current state

ScholarLens is a working public research-evidence beta. The deployed application loads a
10-paper, arXiv-verified Agentic RAG corpus, lets a user select papers, and exposes Ask,
Compare, Readiness, and JSON export. A fresh production health request returned HTTP 200
with all 10 papers available and both provider-configuration flags true. A fresh
`paper-010` GraphRAG request returned HTTP 200, a literal source snippet, and
`provider_used: "groq"`.

The trust boundary is working: invalid JSON, invalid fields, and unknown paper IDs return
safe 400 responses; an unsupported quantum-computing question returned `not_found: true`
with no evidence instead of an invented answer. In the live UI, a comparison across
three selected papers returned two verified rows and omitted the unsupported third row.
Readiness rendered an honest negative result. At 390×844, the production page exposed
all 17 controls with no horizontal document overflow.

This is not final release sign-off. Licence/distribution review, the formal 12-case
provider-backed evaluation, a public/provider-enabled preview or equivalent preview
evidence, a tagged release, Doodiiii's identity, and live individual defenses remain
open.

## Evidence baseline

This report was rebuilt from primary project evidence on 2026-08-19:

- The exact handbook cells were extracted fresh from
  `AI_in_Applications_HANDBOOK (1).xlsx`: role gates/criteria at `T01 ScholarLens!C23:C24`,
  `C36:C37`, `C49:C50`, and `C62:C63`; rubric rows at `SCORING RUBRIC!A5:E13`.
- Production API/UI evidence came from fresh requests and rendered interactions at the
  URL above, not from Phase 3's historical conclusions.
- Current implementation evidence came from `src/`, `tests/`, `data/corpus/manifest.json`,
  `.github/workflows/ci.yml`, `vercel.json`, and the maintained docs.
- Merge evidence came from current GitHub PR metadata: backend PR #8, knowledge PR #2,
  frontend PR #1, corpus PR #14, production fix PR #20, and promotions PR #21/#23.
- All three pages of the local `ScholarLens_Architecture.pdf` v2 were rendered and
  visually inspected. They show the current TF-IDF/10-paper/deployed design, but the
  PDF/PNG assets are untracked and not included in this PR.

Status meanings: **Done** means direct current evidence satisfies the criterion;
**Partial** means a real part is complete but a stated evidence or human gate is still
missing; **Missing** means no acceptable evidence was found.

## Four-role personal acceptance audit

### Mohammed Hassan Mahmoud — Integration Lead / Solution Architect

| ID | Handbook criterion | Status | Current evidence |
|---|---|---|---|
| L1 | Repository, branch rules, issue ownership, and PR review are documented | Done | `CONTRIBUTING.md:3-45`; CI PR rules in `.github/workflows/ci.yml:3-7`; current issues #4/#5/#6/#9/#10; reviewed merge history through PRs #1/#2/#3/#8/#11/#14/#20/#22. |
| L2 | Architecture and all module/API contracts are documented and agreed | Partial | `docs/architecture.md` and `docs/api-contracts.md` match the implemented route/provider/TF-IDF/tools flow. The v2 diagram is current locally but untracked, its Gemini “live-verified” wording is not demonstrated here, and team agreement cannot be inferred beyond recorded Lead approval of TF-IDF. |
| L3 | Every member has an identifiable contribution merged through review | Partial | PR #8 includes AlBaraa's backend commits; PR #2 includes Mariam Eladawy's knowledge commits; PR #1 includes Doodiiii's UI commits and Lead completion; Lead integration commits are merged. Doodiiii cannot be mapped honestly to handbook member Mariam Ali until the Lead resolves the identity. |
| L4 | Lint, type-check, tests, and production build complete without unresolved errors | Done | Fresh Phase 7 final run: `npm run lint`, `npx tsc --noEmit`, `npm run build`, and `npx vitest run` all exited 0; see Verification below. |
| L5 | Environment variables are documented; no secret is committed or exposed | Done | `.env.example:1-9` contains empty server-only variables; `.gitignore:33-53` excludes env files and corpus PDFs; provider keys are read only in `src/lib/ai/providers.ts:103-104,182,281`; the fresh built-client scan found zero provider-key patterns. |
| L6 | Preview and production URLs complete the main journey | Partial | Public production completes the main journey and was re-verified on 2026-08-19. The prior protected preview was corpus-ready but had no provider configured; there is no reusable provider-enabled preview evidence. |
| L7 | Release checklist, limitations, and rollback/recovery notes are present | Done | `docs/release-checklist.md`, `docs/known-limitations.md`, and `docs/production-readiness.md` are present; the latter now records the real environments, observations, open gates, and rollback plan. Presence does not equal final release sign-off. |
| L8 | Answers are traceable/not-found; comparisons use only selected approved papers | Done | Fresh supported and unsupported production responses; deterministic source/title/verbatim checks in `src/lib/scholarlens/service.ts:113-175`; the live three-selection comparison returned only verified selected rows. |

**Session-gate summary:** Sessions 1-4 have strong repository, integration, deployment,
and live-journey evidence. Session 5 is partial: the public demo works, but the tagged
release, final sign-off, and live human defenses have not happened.

### AlBaraa — AI & Backend Engineer

| ID | Handbook criterion | Status | Current evidence |
|---|---|---|---|
| B1 | Valid input returns the documented typed response | Done | Fresh `paper-010` production POST returned the documented ask shape with all evidence fields and `provider_used: "groq"`; schemas are in `src/lib/scholarlens/schema.ts:54-251`. |
| B2 | Invalid/malformed input returns safe 4xx without provider use | Done | Fresh production empty question, unknown ID, and malformed JSON each returned 400 with `VALIDATION_ERROR`, `UNKNOWN_PAPER_IDS`, and `INVALID_JSON`; dispatch follows validation/allowlisting in `route.ts:184-275`; route tests assert the boundary. |
| B3 | Provider secrets stay server-side and out of bundles/history | Done | Server-only env reads, ignored env files, empty template, GitGuardian evidence on merged PRs, and zero patterns in the fresh built client. No secret value is reproduced in this report. |
| B4 | Groq/Gemini fallback or a safe provider-failure path is demonstrated | Done | Groq succeeded in production. The fallback chain and safe final error are implemented in `providers.ts:358-421`; route tests cover safe provider errors. This audit does not claim a successful live Gemini fallback. |
| B5 | Grounding/tool arguments are validated; deterministic logic is separated | Done | Request schema and manifest allowlist precede dispatch; local TF-IDF returns approved chunks; source/title/snippet filters are deterministic; `compare_papers()` and `research_readiness()` are plain code with rule thresholds of 3 papers/30 characters. |
| B6 | Normal, not-found, timeout/provider-error, and tool-failure tests are included | Partial | Normal, not-found, safe provider-error, corpus-error, rate-limit, empty/tool-failure, and deterministic-tool cases are automated. The timeout constant/error type is tested, but an end-to-end aborted live provider timeout was not demonstrated. |
| B7 | Logs are useful without secrets or unnecessary user data | Done | `route.ts:62-91,184-311` hashes IPs, logs action/paper count/question length, and redacts provider-key patterns; retrieval logs counts/scores/timing rather than question text or secrets. |
| B8 | Answers are traceable/not-found; comparisons use selected approved papers | Done | Fresh production ask/not-found/compare evidence plus the deterministic verifier in `service.ts:113-175`. |

**Session-gate summary:** Sessions 1-4 are evidenced by the current route, schema,
provider, grounding, safe-error, logging, and regression layers. Session 5 is missing
because it requires AlBaraa's live defense.

### Product UI & Workflow role — handbook name Mariam Ali Ahmed; GitHub account Doodiiii

The role implementation is auditable, but this report does not assume that Doodiiii is
Mariam Ali. Identity is a Lead-owned open decision.

| ID | Handbook criterion | Status | Current evidence |
|---|---|---|---|
| U1 | A first-time user completes the main workflow without verbal explanation | Partial | The public UI has explicit action radios, question label, real title-backed paper selector, action-specific buttons, result headings, and export. No independent first-time-user observation was conducted in Phase 7. |
| U2 | Idle, loading, success, empty, validation, provider-error, and retry states are correct | Partial | `InputForm.tsx:24-28,302-430` enumerates and renders the states; the fresh live run re-observed idle/loading/success. Existing recorded Phase 5 evidence covers empty/provider-error/retry, but there is no automated frontend state suite and all states were not re-induced in production. |
| U3 | Structured output renders without arbitrary prose parsing | Done | The client validates unknown JSON with the shared Zod schemas (`InputForm.tsx:110-119`) and sends typed results to `ResultView`, `ComparisonView`, and `ReadinessView`; no prose parser is used. |
| U4 | Evidence/source and tool results are distinguishable from model explanation | Done | Fresh UI showed a titled source card with source ID/confidence/literal blockquote, a separate matrix, a separate readiness definition list, and provider/source label. |
| U5 | Main flow works at mobile and desktop widths | Done | Desktop UI completed Ask/Compare/Readiness; at 390×844 all 17 controls remained present and document/body width was 375px without horizontal overflow. |
| U6 | Inputs have labels, keyboard access, visible focus, understandable errors | Partial | Live DOM exposes a labelled textbox, radio group, named checkboxes, and buttons; native controls provide keyboard semantics and components include focus styles. A complete keyboard-only traversal/accessibility audit was not run. |
| U7 | No provider credential is in client code | Done | Client source receives only responses and health flags; env reads are server-side; fresh built-client scan found zero provider-key patterns. |
| U8 | Answers are traceable/not-found; comparisons use selected papers | Done | Fresh evidence card/not-found response and three-selected-paper comparison; the unsupported third row was not rendered. |

**Session-gate summary:** Sessions 1-4 are substantially implemented, with partial
evidence for formal usability/accessibility testing. Session 5 is missing because the
assigned human must lead and defend the live interaction flow.

### Mariam Eladawy — Knowledge & Tooling Engineer

| ID | Handbook criterion | Status | Current evidence |
|---|---|---|---|
| K1 | Bounded register has URL, access date, owner, and intended use | Done | `docs/source-register.md` contains 10 uniquely identified Agentic RAG papers with arXiv ID, author/year, access date, Lead approval, and per-paper intended-use summaries. Licence/distribution sign-off remains explicitly open. |
| K2 | Taxonomy and deterministic rules are documented with examples | Partial | `taxonomy.ts:9-35` defines 10 evidence fields and 10 question types; `tool-rules.ts:13-24` defines thresholds/metadata/licence rules; knowledge docs contain examples. The code still carries TODOs, and `knowledge-review.md` has an example that does not express the actual three-paper readiness threshold. |
| K3 | At least 10 cases cover normal, malformed, ambiguous, not-found, injection, and tool failure | Done | `tests/evaluation/scholarlens-cases.json` contains 12 cases: 5 normal, 2 not-found, 2 injection, 1 malformed, 1 ambiguous, and 1 tool-failure. |
| K4 | Unsupported questions clarify/refuse/escalate instead of fabricating | Done | Fresh production unsupported question returned HTTP 200 with `not_found: true`, empty evidence, and a bounded message; prompt and no-chunk behavior are also encoded/tested. |
| K5 | Every AI-generated domain claim used by the product is checked against an original source | Partial | Every returned item must use an approved source/title and literal snippet present in retrieved PDF text (`service.ts:113-175`). There is no recorded human or semantic entailment check proving every generated key finding/gap/limitation follows from its snippet. |
| K6 | Tool success/failure behavior is tested and evidenced | Done | `tests/api/tools.test.ts` covers comparison, thresholds, duplicates, empty evidence, short snippets, gaps, and repeatability; route tests cover both tool actions. |
| K7 | Coverage gaps and prohibited uses are documented | Done | `docs/source-register.md` lists coverage gaps; `docs/known-limitations.md` lists prohibited medical/legal/safety, confidential, and original-paper-replacement uses. |
| K8 | Answers are traceable/not-found; comparisons use selected papers | Done | Fresh production evidence plus manifest allowlist, literal-snippet filter, and deterministic tools. |

**Session-gate summary:** Sessions 1-3 are evidenced. Session 4 is partial because the
12 cases are defined but not a reproducible provider-backed evaluation run and licence
checks remain open. Session 5 is missing because it requires Mariam's live defense.

## Scoring rubric self-assessment

| Rubric category | Score | What is solid | Remaining risk |
|---|---:|---|---|
| Functional completeness | 13/15 | The public 10-paper Ask/Compare/Readiness/export workflow is real and provider-backed; no core surface is mock-only. | The full three-question defense pilot was not freshly recorded end to end, the three-selected-paper comparison yielded two verified rows, and there is no tagged release. |
| Architecture & integration | 13/15 | Clear browser/server boundary, shared Zod contracts, modular Groq→Gemini layer, local TF-IDF, deterministic tools, reviewed merges, and working Vercel packaging. | Diagram assets are untracked, one Gemini wording is unverified, README ownership/count is stale, and Doodiiii identity is unresolved. |
| Reliability & test evidence | 11/15 | Fresh lint/type/build/Vitest pass; 84 tests cover schemas, routes, rate limits, provider errors, retrieval, literal verification, tools, and regressions; production positive/negative cases pass. | The handbook's 10-case evaluation is JSON data, not a reproducible provider-backed runner; real timeout and full adversarial outcomes are not demonstrated. |
| Security & safe AI behavior | 13/15 | Server-only secrets, validation/allowlist, 10/minute rate limit, hashed IPs, redaction, safe errors, bounded corpus, literal snippet verification, ignored PDFs/env files, and zero client-key patterns. | Prompt-injection cases are defined but not re-run as a formal provider-backed adversarial suite; no claim-level semantic entailment checker exists. |
| Grounding, tools & AI correctness | 9/10 | Approved PDF retrieval, selected-paper/title enforcement, literal snippet verification, safe not-found, and deterministic comparison/readiness have live and automated evidence. | Generated summaries/gaps/limitations are tied to snippets but not independently semantically verified claim by claim. |
| Deployment & operations | 8/10 | Public Vercel production, custom corpus build, output tracing, root redirect, documented env template, dated health/ask/UI smoke, limitations, and rollback plan. | No reusable provider-enabled preview evidence, tagged release, final release sign-off, or sustained latency/error observation set. |
| UX, accessibility & workflow quality | 8/10 | Clear action flow, title-backed selector, structured evidence/matrix/readiness, export, loading/error/empty architecture, labelled native controls, and fresh mobile no-overflow evidence. | No independent first-time-user test, automated frontend suite, or complete keyboard/screen-reader audit. |
| Documentation & team integration | 4/5 | Seven maintained docs are synchronized; setup, contracts, source ownership, PR history, limitations, deployment, and acceptance evidence are explicit. | README still says six papers and assigns frontend to the Lead; v2 diagram assets are untracked; identity and some issue titles/statuses remain stale. |
| Individual defense | 0/5 | No score can be awarded from code, PRs, or this audit. | The rubric requires each human member to explain/modify their part live. That participation has not happened and cannot be completed by Codex. |
| **Total** | **79/100** | **Good Prototype** under the handbook score band. | **Not final production/release approval; the open human, licence, evaluation, preview, and release gates still apply.** |

## What remains and who owns it

1. **Mohammed Hassan Mahmoud:** confirm who Doodiiii is; do not infer the mapping from
   commit email. Close or rewrite stale issue #5 after that decision.
2. **Mariam Eladawy + Lead:** complete licence/distribution sign-off for the corpus and
   re-run/reconcile the 12-case evaluation against the actual Phase 4 replacement papers.
3. **Mohammed Hassan Mahmoud:** decide whether to publish the untracked architecture v2
   artifacts after correcting or proving the Gemini “live-verified” wording.
4. **Mohammed Hassan Mahmoud:** authorize a follow-up README correction for the stale
   six-paper count and frontend-owner line; Phase 7 did not permit editing that file.
5. **Lead/release owner:** obtain provider-enabled preview evidence (or formally document
   the chosen preview policy), create a tagged release when appropriate, and record final
   release sign-off.
6. **Every human team member:** perform the live individual defense/question/change task.
   Until then, Individual defense remains 0/5.
7. **Optional backend tuning:** improve comparison retrieval/prompt coverage only if it
   preserves the rule that unsupported rows are omitted rather than fabricated.

## Verification

Fresh final checks from the repository root on 2026-08-19:

- `npm run lint` — exit 0.
- `npx tsc --noEmit` — exit 0, no output.
- `npm run build` — exit 0; Next.js 16.2.11 compiled the static pages and dynamic
  `/api/scholarlens` route.
- `npx vitest run` — exit 0; 8 test files and 84 tests passed.
- Built-client provider-key pattern scan — 0 matches.
- `git diff --check` — no whitespace errors.

Live production checks on the same date:

- `GET /api/scholarlens` — HTTP 200; 10 papers; no unavailable IDs; Groq and Gemini
  configuration flags true.
- Supported `paper-010` ask — HTTP 200; high-confidence literal evidence;
  `provider_used: "groq"`.
- Empty question, unknown paper, malformed JSON — safe HTTP 400 responses.
- Unsupported quantum-computing question — HTTP 200 `not_found: true`, empty evidence.
- UI — Ask, Compare, Readiness, and export controls present; the three-selected-paper
  comparison rendered two verified rows; readiness rendered a correct negative result.
- Responsive check — 390×844, no horizontal document/body overflow.

These checks establish the technical state recorded above. They do not resolve the
explicitly human or judgment-based gates.
