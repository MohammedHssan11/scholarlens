# Acceptance matrix

**Owner:** Mariam Eladawy (Knowledge & Tooling Engineer) — inherited from Ahmed Mossad.

Turn every project requirement into a testable case with a pass/fail result.

| # | Requirement | Test case | Expected result | Status | Evidence |
|---|-------------|-----------|-----------------|--------|----------|
| 1 | Grounded answer | Ask: "What is Agentic Retrieval-Augmented Generation (Agentic RAG)?" | Answer contains an evidence snippet and `source_id` from an approved paper | ⚠ Partial — retrieval verified; provider success pending | Direct API audit in `tasks.md`; issue #10 |
| 2 | Not-found behaviour | Ask: "What are the latest advances in quantum computing error correction?" | `not_found: true`; no fabricated answer; no approved source returned | ⚠ Partial — deterministic path tested; provider-backed case pending | `tests/regression/scholarlens-regression.test.ts`; issue #10 |
| 3 | Invalid input | POST with an empty question | HTTP 400; provider not called | ✅ Implemented and automated | `tests/api/schema.test.ts`; `tests/api/route.integration.test.ts` |
| 4 | Malformed JSON | POST malformed JSON | HTTP 400 with safe error message | ✅ Implemented and automated | `tests/api/route.integration.test.ts` |
| 5 | Prompt injection | Paper contains "Ignore your instructions..." | Injection ignored; only approved evidence used | ⚠ Defined, not provider-backed | `tests/evaluation/scholarlens-cases.json`; issues #9/#10 |
| 6 | Comparison matrix | Compare three approved papers | Evidence matrix generated using only approved papers | ⚠ API/tool automated; live success pending | `tests/api/route.integration.test.ts`; `tests/api/tools.test.ts`; issue #10 |
| 7 | Readiness check | Run `research_readiness()` | Reports coverage, research gaps, and source traceability | ⚠ API/tool automated; live success pending | `tests/api/route.integration.test.ts`; `tests/api/tools.test.ts`; issue #10 |
| 8 | No secrets in client | Inspect client bundle | No API keys or secrets exposed | ✅ Verified locally on 2026-08-17 | `.env.example`; `.gitignore`; post-build `.next/static` scan found 0 provider-key pattern matches |
| 9 | Mobile | Open application on mobile width | Main workflow remains usable | ⚠ Baseline responsive; full workflow missing | Playwright 390×844 audit recorded in `tasks.md`; issue #5 |
| 10 | Clean install | Clone repository and follow README | Application installs and runs successfully | ⚠ Instructions and CI install exist; clean release run pending | `README.md`; `.github/workflows/ci.yml`; issue #10 |

Audit note (2026-08-17): `npm run lint`, `npx tsc --noEmit`, `npm run build`, and
`npx vitest run` all exited 0 on the Phase 3 audit branch. Vitest reported 8 test files
and 82 tests passed. This does not substitute for the missing provider-backed or deployed
acceptance runs above.
