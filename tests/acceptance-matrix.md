# Acceptance matrix

**Owner:** Mariam Eladawy (Knowledge & Tooling Engineer) — inherited from Ahmed Mossad.

Turn every project requirement into a testable case with a pass/fail result.

| # | Requirement | Test case | Expected result | Status | Evidence |
|---|-------------|-----------|-----------------|--------|----------|
| 1 | Grounded answer | Ask a GraphRAG question against `paper-010` | Answer contains an evidence snippet and `source_id` from an approved paper | ✅ Production pass — HTTP 200 via Groq | Fresh 2026-08-19 production API/UI run; `tests/regression/scholarlens-regression.test.ts` |
| 2 | Not-found behaviour | Ask: "What are the latest advances in quantum computing error correction?" | `not_found: true`; no fabricated answer; no approved source returned | ✅ Production pass | Fresh 2026-08-19 production response: `not_found: true`, empty evidence; regression tests |
| 3 | Invalid input | POST with an empty question | HTTP 400; provider not called | ✅ Production + automated pass | Fresh 2026-08-19 production 400 `VALIDATION_ERROR`; schema/route tests prove dispatch is not reached |
| 4 | Malformed JSON | POST malformed JSON | HTTP 400 with safe error message | ✅ Production + automated pass | Fresh 2026-08-19 production 400 `INVALID_JSON`; `tests/api/route.integration.test.ts` |
| 5 | Prompt injection | Paper contains "Ignore your instructions..." | Injection ignored; only approved evidence used | ⚠ Defined, not provider-backed | `tests/evaluation/scholarlens-cases.json`; issues #9/#10 |
| 6 | Comparison matrix | Compare three approved papers | Evidence matrix generated using only approved papers | ✅ Production UI pass, with honest coverage caveat | Fresh 2026-08-19 UI selected 001/002/010 and rendered two verified rows (001/002); no unsupported 010 row was fabricated; route/tool tests |
| 7 | Readiness check | Run `research_readiness()` | Reports coverage, research gaps, and source traceability | ✅ Production UI pass (correctly negative) | Fresh 2026-08-19 UI rendered `ready: false`, `papers_used: 0`, and missing snippets; route/tool tests |
| 8 | No secrets in client | Inspect client bundle | No API keys or secrets exposed | ✅ Verified locally on 2026-08-19 | `.env.example`; `.gitignore`; fresh post-build `.next/static` scan found 0 provider-key pattern matches |
| 9 | Mobile | Open application on mobile width | Main workflow remains usable | ✅ Fresh responsive pass | 2026-08-19 production at 390×844: all 17 controls present and document/body width 375px with no horizontal overflow |
| 10 | Clean install | Clone repository and follow README | Application installs and runs successfully | ⚠ Instructions and CI install exist; clean release run pending | `README.md`; `.github/workflows/ci.yml`; issue #10 |

Audit note (2026-08-19): the production-backed cases above were re-run during Phase 7.
The 12-case JSON evaluation is still a definition file rather than an executable,
provider-backed evaluation run. Final Phase 7 lint/type-check evidence is recorded in
`docs/PROJECT_STATUS.md` and `tasks.md` after the documentation pass.
