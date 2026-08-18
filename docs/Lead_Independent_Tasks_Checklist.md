# Lead's Independent Tasks — Checklist

Owner: Mohammed Hassan Mahmoud (Integration Lead) · Generated 2026-08-10

Updated from the 2026-08-18 `dev` state. Facts below reflect merged history and live
verification; unresolved decisions remain unchecked.

## Done

- [x] **Set up CI** — [PR #3](https://github.com/MohammedHssan11/scholarlens/pull/3) merged into `dev` as `588da76`. The Phase 3 audit branch extends the workflow to fetch the approved corpus and run Vitest as well as lint, type-check, and build.
- [x] **Created one GitHub issue per outstanding member:**
  - [#4 — AlBaraa: open a PR for feat/backend-api](https://github.com/MohammedHssan11/scholarlens/issues/4) — resolved by PR #8; recommend closing.
  - [#5 — Doodiiii: finish feat/frontend-ui](https://github.com/MohammedHssan11/scholarlens/issues/5) — still open, now the single biggest blocker.
  - [#6 — Mariam Eladawy: 3 small polish items](https://github.com/MohammedHssan11/scholarlens/issues/6)
- [x] **Merged Lead documentation housekeeping** — [PR #7](https://github.com/MohammedHssan11/scholarlens/pull/7) merged into `dev` as `2046aab`.
- [x] **Approved the local TF-IDF retrieval strategy** — recorded on 2026-08-15; `docs/architecture.md` reflects the implemented provider-neutral retriever.
- [x] **Merged the grounded backend** — [PR #8](https://github.com/MohammedHssan11/scholarlens/pull/8) merged into `dev` as `29c67342d171307b6f4791459c1b2cc411d0112d`.
- [x] **Merged the Phase 3 audit** — [PR #11](https://github.com/MohammedHssan11/scholarlens/pull/11) merged into `dev`; opened follow-up issues #9 and #10.
- [x] **Fixed the deprecated Groq model and produced the first real answer** — [PR #12](https://github.com/MohammedHssan11/scholarlens/pull/12) merged 2026-08-18. `ask`, `compare`, and `readiness` all now return real, evidence-verified output with `provider_used: "groq"`. This closes the biggest item that was previously listed under "needs your own input" below.
- [x] **Expanded the corpus to 10 real papers** — [PR #14](https://github.com/MohammedHssan11/scholarlens/pull/14) merged 2026-08-18, Lead-authorized (taken over from Mariam Eladawy for this one action). All 4 additions independently verified against arXiv's real API — no placeholder content.
- [x] **Finished the frontend (issue #5)** — [PR #1](https://github.com/MohammedHssan11/scholarlens/pull/1) merged 2026-08-18, Lead-authorized (completed directly on Doodiiii's existing branch after it stalled). Real paper selection, real Compare/Readiness UI, and export, all verified with screenshots against the real backend.
- [x] **Closed issue #4** — fully resolved by PR #8/#11/#12.

## Needs your own input (not something I can do for you)

- [ ] **Confirm who `Doodiiii` actually is** — Mariam Ali, a new member, or someone else. This account has now delivered the entire product UI, which makes the question more relevant, not less. Tracked in [issue #10](https://github.com/MohammedHssan11/scholarlens/issues/10).
- [ ] **Provide real preview/production release evidence** — deploy to Vercel, then record real URLs, dated smoke tests, screenshots, rollback evidence, and release sign-off. Tracked in [issue #10](https://github.com/MohammedHssan11/scholarlens/issues/10).
- [ ] **Regenerate the architecture PDF** — still shows Gemini File Search, 8-15 papers, and Vercel production; none match the current implementation. Tracked in [issue #10](https://github.com/MohammedHssan11/scholarlens/issues/10).
- [ ] **Resolve the remaining active-corpus/source decisions with Mariam Eladawy** — licence/URL verification for the 4 Phase 4 papers, reconciling the evaluation-case suite against them, and the missing one-page research rubric. Tracked in [issue #9](https://github.com/MohammedHssan11/scholarlens/issues/9).
- [ ] **Obtain individual defense evidence** — every member must explain and modify the part they own; this requires live human participation and cannot be inferred from commits.
- [ ] **Optional: improve comparison-query retrieval/prompting** — a live 3-paper comparison test returned 2 verified rows, not 3 (the verifier correctly declined to fabricate the third rather than a bug). Worth tuning, not blocking.

## Next actions for you

1. The core product now works end to end through the real UI — this is the moment to actually run and record the "3 questions, compare 3 papers" defense demo for real, on camera/screenshots, as your release evidence.
2. Coordinate [issue #9](https://github.com/MohammedHssan11/scholarlens/issues/9) with Mariam Eladawy (licence checks + evaluation-suite reconciliation against the Phase 4 papers).
3. Complete the remaining Lead-owned items in [issue #10](https://github.com/MohammedHssan11/scholarlens/issues/10): deployment, architecture PDF, Doodiiii's identity.
