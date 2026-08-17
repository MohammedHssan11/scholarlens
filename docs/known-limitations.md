# Known limitations

Honest list of what ScholarLens does **not** do well yet. Every member contributes.
Being honest here earns marks; hiding failures loses them.

| # | Limitation | Impact | Owner | Planned fix? |
|---|---|---|---|---|
| 1 | Answers are limited to the approved corpus only | Cannot answer outside the chosen topic | Mariam Eladawy | By design |
| 2 | Paper selection in the UI is hardcoded to `paper-001` | A user cannot choose among the six active manifest papers, so the three-paper journey is unreachable through the UI | Doodiiii (frontend; identity pending Lead confirmation) | [Issue #5](https://github.com/MohammedHssan11/scholarlens/issues/5) |
| 3 | No UI for comparison, readiness, or evidence-matrix export | The backend actions exist, but the mandatory product workflow has no user-facing surface or export | Doodiiii (frontend; identity pending Lead confirmation) | [Issue #5](https://github.com/MohammedHssan11/scholarlens/issues/5) |
| 4 | The source register and evaluation artifacts do not match the active manifest | Evaluation cases still expect inactive papers 005, 007, and 010; source/licence decisions are unresolved and the required one-page research rubric was not found | Mariam Eladawy | [Issue #9](https://github.com/MohammedHssan11/scholarlens/issues/9) |
| 5 | No real provider key is configured in the audited environment | Real retrieval works, but ask, compare, and readiness stop at safe HTTP 504 errors; provider-backed grounded output is not yet demonstrated | Mohammed Hassan Mahmoud | [Issue #10](https://github.com/MohammedHssan11/scholarlens/issues/10) |
| 6 | The first-pilot success test has not passed | Three ask calls plus compare/readiness reached real corpus retrieval, but no provider output was available and the frontend cannot run the journey | Mohammed Hassan Mahmoud + Doodiiii | [Issues #5](https://github.com/MohammedHssan11/scholarlens/issues/5) and [#10](https://github.com/MohammedHssan11/scholarlens/issues/10) |
| 7 | No verified preview URL, production URL, tagged release, or deployment smoke evidence | Deployment and operations rubric evidence is absent; the app must not be represented as production ready | Mohammed Hassan Mahmoud | [Issue #10](https://github.com/MohammedHssan11/scholarlens/issues/10) |
| 8 | The architecture PDF is stale | It depicts Gemini File Search, 8–15 active papers, and Vercel production; the merged backend uses local TF-IDF, has six active papers, and has no evidenced deployment | Mohammed Hassan Mahmoud | [Issue #10](https://github.com/MohammedHssan11/scholarlens/issues/10) |
| 9 | Team ownership for GitHub account `Doodiiii` is unresolved | Contribution ownership and individual-defense evidence cannot be finalized honestly | Mohammed Hassan Mahmoud | [Issue #10](https://github.com/MohammedHssan11/scholarlens/issues/10) |
| 10 | The 12-case evaluation file is not an executable provider-backed acceptance run | Cases are defined, but several mappings are stale and prompt-injection/not-found outcomes have not been demonstrated with a real provider | Mariam Eladawy + Mohammed Hassan Mahmoud | [Issues #9](https://github.com/MohammedHssan11/scholarlens/issues/9) and [#10](https://github.com/MohammedHssan11/scholarlens/issues/10) |

## Resolved during integration

- The backend and provider abstraction were merged through PR #8 on 2026-08-17.
- CI was merged through PR #3. The Phase 3 audit branch extends it to fetch the approved
  corpus and run the Vitest suite, so tests are part of the remote quality gate.
- Dead deterministic placeholder-answer code was removed; an unconfigured provider now
  remains on the verified real-retrieval plus safe-error path.

## Prohibited use cases

- Not for medical, legal or safety decisions.
- Not a replacement for reading the original papers.
- Must not be used with confidential or unpublished work without permission.
