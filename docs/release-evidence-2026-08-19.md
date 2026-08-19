# Release evidence — 2026-08-19

**Candidate branch:** `codex/phase-7-comprehensive-audit`

**Pull request:** [#25](https://github.com/MohammedHssan11/scholarlens/pull/25) against `dev`

**Production:** https://scholarlens-nine.vercel.app

This record contains outcomes only. It contains no environment-variable values, provider
keys, raw IP addresses, or other secrets.

## Local quality checks

| Check | Fresh result |
|---|---|
| `npm run lint` | Passed, exit 0 |
| `npx tsc --noEmit` | Passed, exit 0, no diagnostics |
| `npm run build` | Passed, exit 0; Next.js 16.2.11 compiled successfully and emitted `/`, `/_not-found`, `/api/scholarlens`, and `/scholarlens` |
| `npx vitest run` | Passed, exit 0; 8 test files and 84 tests passed in 2.06 seconds |
| Built-client secret-pattern scan | Zero `.next/static` files matched provider variable names or known Groq/Gemini key prefixes |
| `git diff --check` | Passed; only line-ending conversion warnings were reported |

## Local production-build smoke

The completed production build was started on an isolated local port and then stopped after
the smoke checks.

| Check | Result |
|---|---|
| Health | HTTP 200; 10 papers available; 0 unavailable papers |
| Grounded Ask | HTTP 200; `not_found: false`; 1 evidence item; `provider_used: "groq"` |
| Malformed JSON | HTTP 400; `code: "INVALID_JSON"` |

## Production smoke

| Check | Result |
|---|---|
| Health | HTTP 200; corpus `ok`; 10 papers; 0 unavailable papers; Groq and Gemini configuration flags true |
| API Ask | HTTP 200; `not_found: false`; 1 `paper-010` evidence item through Groq |
| Visible Ask journey | Loaded all 10 titled papers, selected `paper-010`, and rendered one high-confidence result with a literal source snippet and Groq attribution |

## Provider-enabled Preview smoke

The sensitive provider values were added without displaying them and scoped only to
`codex/phase-7-comprehensive-audit`. The pre-existing Production variables remained intact.
Vercel redeployed commit `a1d40e0` as protected Preview deployment
`GnNDKtKo6N46BqGDdQNCzsu941K9`.

| Check | Result |
|---|---|
| Deployment | Ready after a 34-second build; Environment `Preview`; source branch and commit matched PR #25 |
| Corpus/UI | Authenticated UI loaded all 10 titled papers |
| Grounded Ask | Selected `paper-010`; one high-confidence result rendered through Groq with a literal map-reduce community-summary snippet |
| Secret scope | Groq and Gemini entries show `Preview` plus the exact Phase 7 branch; separate Production entries remain present |

## GitHub and Vercel state

- PR #25 is open as a draft against `dev` and was mergeable when checked.
- Its GitHub CI, GitGuardian, Vercel deployment, and Vercel Preview Comments checks were green
  before this evidence update.
- The Vercel preview remains protected by SSO. Its authenticated provider-backed journey is
  now verified; it is intentionally not claimed as a public anonymous URL.
- No GitHub release or repository tag existed when checked.

## Gates that remain open

- Corpus licence/distribution sign-off.
- Independent human release approval and live individual defenses.
- Executable, recorded provider-backed run of the version-2 12-case evaluation dataset.
- Tagged release. A final tag is intentionally not created before the licence and human
  release decisions are complete.
