# Lead's Independent Tasks — Checklist

Owner: Mohammed Hassan Mahmoud (Integration Lead) · Generated 2026-08-10

Updated from the 2026-08-17 `dev` audit. Facts below reflect merged history and live
verification; unresolved decisions remain unchecked.

## Done

- [x] **Set up CI** — [PR #3](https://github.com/MohammedHssan11/scholarlens/pull/3) merged into `dev` as `588da76`. The 2026-08-17 audit branch extends the workflow to fetch the approved corpus and run Vitest as well as lint, type-check, and build.
- [x] **Created one GitHub issue per outstanding member:**
  - [#4 — AlBaraa: open a PR for feat/backend-api](https://github.com/MohammedHssan11/scholarlens/issues/4)
  - [#5 — Doodiiii: finish feat/frontend-ui](https://github.com/MohammedHssan11/scholarlens/issues/5)
  - [#6 — Mariam Eladawy: 3 small polish items](https://github.com/MohammedHssan11/scholarlens/issues/6)
- [x] **Merged Lead documentation housekeeping** — [PR #7](https://github.com/MohammedHssan11/scholarlens/pull/7) merged into `dev` as `2046aab`.
- [x] **Approved the local TF-IDF retrieval strategy** — recorded on 2026-08-15; `docs/architecture.md` now reflects the implemented provider-neutral retriever.
- [x] **Merged the grounded backend** — [PR #8](https://github.com/MohammedHssan11/scholarlens/pull/8) merged into `dev` as `29c67342d171307b6f4791459c1b2cc411d0112d`.
- [x] **Verified the direct API safe-error path** — on 2026-08-17, three ask requests plus compare and readiness each retrieved real corpus chunks before returning safe `504 PROVIDER_ERROR` responses because no provider key was configured.
- [x] **Opened audit follow-up issues** — [#9](https://github.com/MohammedHssan11/scholarlens/issues/9) for knowledge/corpus reconciliation and [#10](https://github.com/MohammedHssan11/scholarlens/issues/10) for provider-backed release evidence and architecture/ownership decisions.

## Needs your own input (not something I can do for you)

- [ ] **Confirm who `Doodiiii` actually is** — Mariam Ali, a new member, or someone else. Tracked in [issue #10](https://github.com/MohammedHssan11/scholarlens/issues/10).
- [ ] **Provide a real provider-backed success run** — configure a key outside the repository and verify three questions, a three-paper comparison, and readiness with traceable snippets. Tracked in [issue #10](https://github.com/MohammedHssan11/scholarlens/issues/10).
- [ ] **Provide real preview/production release evidence** — URLs, environment confirmation, dated smoke tests, screenshots, rollback evidence, and release sign-off. Tracked in [issue #10](https://github.com/MohammedHssan11/scholarlens/issues/10).
- [ ] **Resolve the active-corpus/source decisions with Mariam Eladawy** — inactive evaluation IDs, licence/URL verification, and the missing one-page research rubric. Tracked in [issue #9](https://github.com/MohammedHssan11/scholarlens/issues/9).
- [ ] **Obtain individual defense evidence** — every member must explain and modify the part they own; this requires live human participation and cannot be inferred from commits.

## Next actions for you

1. Review and merge the Phase 3 audit PR only after its checks are green; Codex will not merge it.
2. Coordinate [issue #5](https://github.com/MohammedHssan11/scholarlens/issues/5) with Doodiiii and [issue #9](https://github.com/MohammedHssan11/scholarlens/issues/9) with Mariam Eladawy.
3. Complete the Lead-owned decisions and release evidence in [issue #10](https://github.com/MohammedHssan11/scholarlens/issues/10).
4. Close stale [issue #4](https://github.com/MohammedHssan11/scholarlens/issues/4) after confirming PR #8 is the intended resolution.
