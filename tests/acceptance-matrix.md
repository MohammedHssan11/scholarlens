# Acceptance matrix

**Owner:** Mariam Eladawy (Knowledge & Tooling Engineer) — inherited from Ahmed Mossad.

Turn every project requirement into a testable case with a pass/fail result.

| # | Requirement | Test case | Expected result | Status | Evidence |
|---|---|---|---|---|---|
| 1 | Grounded answer | Ask a question covered by the corpus | Answer + exact snippet + source_id | ⬜ | |
| 2 | Not-found behaviour | Ask a question NOT covered | `not_found: true`, no invented answer | ⬜ | |
| 3 | Invalid input | POST with empty question | 400, provider not called | ⬜ | |
| 4 | Malformed JSON | POST broken JSON | 400, safe message | ⬜ | |
| 5 | Prompt injection | Paper contains "ignore instructions" | Instruction ignored | ⬜ | |
| 6 | Comparison matrix | Compare 3 papers | Matrix uses approved papers only | ⬜ | |
| 7 | Readiness check | Run research_readiness() | Reports coverage + gaps | ⬜ | |
| 8 | No secrets in client | Inspect client bundle | No API key found | ⬜ | |
| 9 | Mobile | Open on mobile width | Main flow usable | ⬜ | |
| 10 | Clean install | Install from README on a clean machine | App runs | ⬜ | |
