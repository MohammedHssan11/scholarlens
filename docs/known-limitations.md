# Known limitations

Honest list of what ScholarLens does **not** do well yet. Every member contributes.
Being honest here earns marks; hiding failures loses them.

| # | Limitation | Impact | Owner | Planned fix? |
|---|---|---|---|---|
| 1 | Answers are limited to the approved corpus only | Cannot answer outside the chosen topic | Mariam Eladawy | By design |
| 2 | ~~Paper selection hardcoded to `paper-001`~~ **Resolved 2026-08-18** | A real multi-select against all 10 active papers is live (PR #1), with select-all/clear/loading/retry states. | Doodiiii (identity pending Lead confirmation) | Done |
| 3 | ~~No UI for comparison, readiness, or export~~ **Resolved 2026-08-18** | Real Compare and Readiness views and a JSON export are live and rendering real backend responses (PR #1). | Doodiiii (identity pending Lead confirmation) | Done |
| 4 | Licence/distribution sign-off remains open for the corpus | All 10 papers are real and arXiv-verified, but the register still says distribution verification is required; the four Phase 4 replacements (005, 006, 007, 010) also need Mariam's evaluation/content reconciliation. No licence approval is inferred. | Mariam Eladawy | [Issue #9](https://github.com/MohammedHssan11/scholarlens/issues/9) |
| 5 | ~~No real provider key is configured~~ **Resolved 2026-08-18** | A real Groq key was configured and a deprecated model name was fixed (PR #12). `ask`, `compare`, and `readiness` now return real, evidence-verified answers — confirmed live, `provider_used: "groq"`. | Mohammed Hassan Mahmoud | Done |
| 6 | The first-pilot journey works, with one honest comparison caveat | The real UI has produced grounded answers, a three-selected-paper comparison with two verified rows, and a correctly negative readiness result. A verified 3-of-3 comparison was not observed: the verifier declined the unsupported third row. This is a tuning opportunity, not permission to fabricate a row. | Mohammed Hassan Mahmoud (retrieval/prompt tuning) | [Issue #10](https://github.com/MohammedHssan11/scholarlens/issues/10) |
| 7 | Public production works, but preview/release evidence is incomplete | Production is live at https://scholarlens-nine.vercel.app and was re-verified 2026-08-19 (health 200; grounded ask 200 via Groq; Ask/Compare/Readiness UI exercised). The earlier protected preview lacked provider configuration, and there is still no tagged release or final human release sign-off. | Mohammed Hassan Mahmoud | [Issue #10](https://github.com/MohammedHssan11/scholarlens/issues/10) |
| 8 | Architecture PDF v2 is current locally but is not a tracked repository artifact | All three locally available pages were rendered on 2026-08-19 and show local TF-IDF, 10 papers, the live UI, and the production URL. The PDF/PNG files are untracked in this checkout, and the PDF's “Gemini ... live-verified” wording is not proven by this audit (Gemini is configured; the observed successful provider was Groq). | Mohammed Hassan Mahmoud | Lead publication/review decision |
| 9 | Team ownership for GitHub account `Doodiiii` is unresolved | Contribution ownership and individual-defense evidence cannot be finalized honestly — notably, this account has now delivered the entire product UI | Mohammed Hassan Mahmoud | [Issue #10](https://github.com/MohammedHssan11/scholarlens/issues/10) |
| 10 | The 12-case evaluation file is not yet re-run against the expanded 10-paper corpus | Cases are defined and the underlying provider path is now proven end to end through both the API and the UI, but the formal evaluation suite still needs Mariam's reconciliation pass against the Phase 4 papers | Mariam Eladawy | [Issue #9](https://github.com/MohammedHssan11/scholarlens/issues/9) |
| 11 | The tracked README still says `fetch-corpus` downloads six papers and assigns the frontend to the Lead | Setup still works, but those two statements are stale relative to the 10-paper corpus and unresolved Doodiiii ownership. Phase 7 did not authorize editing `README.md`, so this remains explicitly open. | Mohammed Hassan Mahmoud | Follow-up documentation PR |

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
- **2026-08-19 — [PR #20](https://github.com/MohammedHssan11/scholarlens/pull/20),
  [PR #21](https://github.com/MohammedHssan11/scholarlens/pull/21), and
  [PR #23](https://github.com/MohammedHssan11/scholarlens/pull/23):** the Vercel PDF-parser/corpus
  deployment defects and root-route dead end were fixed and promoted to production. Fresh
  Phase 7 checks observed the public page, 10-paper health response, and Groq-backed answer.

## Prohibited use cases

- Not for medical, legal or safety decisions.
- Not a replacement for reading the original papers.
- Must not be used with confidential or unpublished work without permission.
