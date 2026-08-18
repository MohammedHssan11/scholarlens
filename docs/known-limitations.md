# Known limitations

Honest list of what ScholarLens does **not** do well yet. Every member contributes.
Being honest here earns marks; hiding failures loses them.

| # | Limitation | Impact | Owner | Planned fix? |
|---|---|---|---|---|
| 1 | Answers are limited to the approved corpus only | Cannot answer outside the chosen topic | Mariam Eladawy | By design |
| 2 | ~~Paper selection hardcoded to `paper-001`~~ **Resolved 2026-08-18** | A real multi-select against all 10 active papers is live (PR #1), with select-all/clear/loading/retry states. | Doodiiii (identity pending Lead confirmation) | Done |
| 3 | ~~No UI for comparison, readiness, or export~~ **Resolved 2026-08-18** | Real Compare and Readiness views and a JSON export are live and rendering real backend responses (PR #1). | Doodiiii (identity pending Lead confirmation) | Done |
| 4 | Licence/URL verification incomplete for the 4 papers added in Phase 4 (005, 006, 007, 010) | These sources are real and verified against arXiv, but not yet cleared for production distribution; the evaluation cases and knowledge docs written for the *original* (excluded) versions of these slots still need Mariam's review against the new content | Mariam Eladawy | [Issue #9](https://github.com/MohammedHssan11/scholarlens/issues/9) |
| 5 | ~~No real provider key is configured~~ **Resolved 2026-08-18** | A real Groq key was configured and a deprecated model name was fixed (PR #12). `ask`, `compare`, and `readiness` now return real, evidence-verified answers — confirmed live, `provider_used: "groq"`. | Mohammed Hassan Mahmoud | Done |
| 6 | The first-pilot success test now runs through the real UI, with one honest caveat | A live 3-paper session produced 2 real evidence-backed answers, a real 2-row comparison, and a real (correctly negative) readiness result. A verified 3-of-3 comparison row was not observed in testing — the evidence verifier correctly declined to show an unsupported 3rd row rather than fabricate one. Not a release blocker; a tuning opportunity. | Mohammed Hassan Mahmoud (retrieval/prompt tuning) | [Issue #10](https://github.com/MohammedHssan11/scholarlens/issues/10) |
| 7 | No verified preview URL, production URL, tagged release, or deployment smoke evidence | Deployment and operations rubric evidence is absent; the app must not be represented as production ready | Mohammed Hassan Mahmoud | [Issue #10](https://github.com/MohammedHssan11/scholarlens/issues/10) |
| 8 | The architecture PDF is stale | It depicts Gemini File Search, 8–15 active papers, and Vercel production; the merged app uses local TF-IDF, has **ten** active, provider-verified papers, and a working end-to-end UI, but has no evidenced deployment | Mohammed Hassan Mahmoud | [Issue #10](https://github.com/MohammedHssan11/scholarlens/issues/10) |
| 9 | Team ownership for GitHub account `Doodiiii` is unresolved | Contribution ownership and individual-defense evidence cannot be finalized honestly — notably, this account has now delivered the entire product UI | Mohammed Hassan Mahmoud | [Issue #10](https://github.com/MohammedHssan11/scholarlens/issues/10) |
| 10 | The 12-case evaluation file is not yet re-run against the expanded 10-paper corpus | Cases are defined and the underlying provider path is now proven end to end through both the API and the UI, but the formal evaluation suite still needs Mariam's reconciliation pass against the Phase 4 papers | Mariam Eladawy | [Issue #9](https://github.com/MohammedHssan11/scholarlens/issues/9) |

## Resolved during integration

- The backend and provider abstraction were merged through PR #8 on 2026-08-17.
- CI was merged through PR #3. The Phase 3 audit branch (PR #11) extends it to fetch the
  approved corpus and run the Vitest suite, so tests are part of the remote quality gate.
- Dead deterministic placeholder-answer code was removed; an unconfigured provider now
  remains on the verified real-retrieval plus safe-error path.
- **2026-08-18 — [PR #12](https://github.com/MohammedHssan11/scholarlens/pull/12):**
  fixed a deprecated Groq model name. First real, provider-backed, evidence-verified
  answer produced end to end (retrieval → Groq → verified snippet).
- **2026-08-18 — [PR #14](https://github.com/MohammedHssan11/scholarlens/pull/14):**
  corpus expanded from 6 to 10 active papers, all independently verified against arXiv's
  real API and real fetchable PDF text (no placeholder content).
- **2026-08-18 — [PR #1](https://github.com/MohammedHssan11/scholarlens/pull/1):** the
  frontend's longest-standing gaps are closed — real paper selection, real Compare and
  Readiness UI, and export, all verified against the real backend with screenshots. This
  was completed under explicit Lead authorization directly on the existing branch.

## Prohibited use cases

- Not for medical, legal or safety decisions.
- Not a replacement for reading the original papers.
- Must not be used with confidential or unpublished work without permission.
