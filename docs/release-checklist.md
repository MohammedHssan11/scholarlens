# Release checklist

**Owner:** Mohammed Hassan Mahmoud (Integration Lead)

Run through this before every release to `main`.

## Build & quality
- [x] `npm run lint` passes — fresh 2026-08-19 run, exit 0
- [x] `npx tsc --noEmit` passes — fresh 2026-08-19 run, exit 0
- [x] `npm run build` passes — fresh 2026-08-19 production build, exit 0
- [x] Tests pass, output saved as evidence — 8 files and 84 tests passed; see `docs/release-evidence-2026-08-19.md`

## Security
- [x] No secret in the repository or in client bundles — GitGuardian passed on PR #25 and the fresh built-client provider-key-pattern scan found zero matching files
- [x] `.env.example` documents every variable (values empty)
- [ ] Environment variables set in every intended Vercel environment (server-side only) — production is verified; provider-enabled preview remains unverified
- [x] Invalid input returns a safe error and does NOT call the provider — integration tests pass and the fresh local release smoke returned HTTP 400 `INVALID_JSON`

## Product
- [ ] Main user journey works end to end on the preview URL
- [ ] Loading / empty / error / retry states all visible
- [x] Every answer shows a source snippet, or says "no evidence found" — deterministic filtering is tested and the fresh production journey rendered a literal `paper-010` snippet
- [x] Works on mobile width — production was verified at 390×844 with no horizontal overflow on 2026-08-19

## Smoke tests (record date + result)
- [x] local — 2026-08-19: production build health 200, 10/10 corpus, grounded Groq answer, malformed JSON safely rejected
- [ ] preview
- [x] production — 2026-08-19: health 200, 10/10 corpus, API and visible Ask flow returned grounded `paper-010` evidence through Groq

## Evidence collected
- [x] Build logs — `docs/release-evidence-2026-08-19.md` plus successful PR #25 CI
- [x] Public production URL — https://scholarlens-nine.vercel.app
- [ ] Environment checklist
- [ ] Screenshots
- [x] Known limitations updated — Phase 7 audit
- [x] Contribution matrix updated — `tests/acceptance-matrix.md` and `docs/PROJECT_STATUS.md`

## Sign-off
- [ ] Checked independently against the scoring rubric
- [ ] Every member can explain and modify their own module

Signed: ______________________  Date: ____________
