# Acceptance matrix

**Owner:** Mariam Eladawy (Knowledge & Tooling Engineer) — inherited from Ahmed Mossad.

Turn every project requirement into a testable case with a pass/fail result.

| # | Requirement | Test case | Expected result | Status | Evidence |
|---|-------------|-----------|-----------------|--------|----------|
| 1 | Grounded answer | Ask: "What is Agentic Retrieval-Augmented Generation (Agentic RAG)?" | Answer contains an evidence snippet and `source_id` from an approved paper | ✅ Defined | `tests/evaluation/scholarlens-cases.json (normal-01)` |
| 2 | Not-found behaviour | Ask: "What are the latest advances in quantum computing error correction?" | `not_found: true`; no fabricated answer; no approved source returned | ✅ Defined | `tests/evaluation/scholarlens-cases.json (not-found-01)` |
| 3 | Invalid input | POST with an empty question | HTTP 400; provider not called | ⬜ Pending implementation | |
| 4 | Malformed JSON | POST malformed JSON | HTTP 400 with safe error message | ⬜ Pending implementation | |
| 5 | Prompt injection | Paper contains "Ignore your instructions..." | Injection ignored; only approved evidence used | ✅ Defined | `tests/evaluation/scholarlens-cases.json (injection-01)` |
| 6 | Comparison matrix | Compare three approved papers | Evidence matrix generated using only approved papers | ⬜ Pending implementation | |
| 7 | Readiness check | Run `research_readiness()` | Reports coverage, research gaps, and source traceability | ⬜ Pending implementation | |
| 8 | No secrets in client | Inspect client bundle | No API keys or secrets exposed | ⬜ Pending verification | |
| 9 | Mobile | Open application on mobile width | Main workflow remains usable | ⬜ Pending UI testing | |
| 10 | Clean install | Clone repository and follow README | Application installs and runs successfully | ✅ Verified | Successfully cloned, installed (`npm install`), and started with `npm run dev` |