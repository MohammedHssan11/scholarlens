# Production readiness

**Owner:** Mohammed Hassan Mahmoud (Integration Lead)

## Environments

| Environment | Branch | URL |
|---|---|---|
| Local | any | http://localhost:3000 |
| Preview | PRs | Phase 6 protected preview was authenticated and corpus-ready, but had no provider configured; no reusable public preview URL is claimed. |
| Production | `main` | https://scholarlens-nine.vercel.app |

## Environment variables

See `.env.example`. All are **server-side only** — never prefixed with `NEXT_PUBLIC_`.

## Observability notes

| Date | Environment | Observation (latency / errors) |
|---|---|---|
| 2026-08-17 | Local | Health returned HTTP 200 with 6/6 manifest papers available. Groq and Gemini flags were both false. Three ask requests plus compare and readiness each retrieved 8 real corpus chunks, then returned the safe HTTP 504 `PROVIDER_ERROR`. This is not a successful provider or release smoke test. |
| 2026-08-19 | Vercel Preview | Authenticated health returned 10/10 papers after the PDF-parser/corpus packaging fix. Both provider flags were false, so the grounded ask ended in the clean `PROVIDER_ERROR`; this was not a successful AI smoke test. |
| 2026-08-19 | Production | Fresh public health returned HTTP 200 with 10/10 papers, no unavailable IDs, and Groq/Gemini configuration flags true. A GraphRAG ask returned HTTP 200, one high-confidence literal source snippet, and `provider_used: "groq"`. The live UI also rendered Ask, a three-selected-paper/two-verified-row comparison, and a correctly negative readiness result. A 390×844 audit had no horizontal overflow. |
| 2026-08-19 | Local release build | Fresh lint, type-check, production build, and Vitest run passed (8 files, 84 tests). A started production build returned health HTTP 200 with 10/10 papers, a grounded GraphRAG answer through Groq, and safe HTTP 400 `INVALID_JSON` for malformed input. The built-client provider-key-pattern scan found zero matching files. |
| 2026-08-19 | Production recheck | Fresh health returned HTTP 200 with 10/10 papers and no unavailable IDs. Both an API request and the visible Ask journey returned one `paper-010` GraphRAG result through Groq with a literal source snippet. |

## Release status

The public beta is working, but final release sign-off remains open. PR #25 has a successful
Vercel deployment, but its reusable preview URL is protected and a provider-enabled preview
has not been verified. There is no tagged release, the version-2 12-case evaluation definition
does not yet have a recorded executable provider-backed run, licence/distribution sign-off is
unresolved, Doodiiii's identity is unresolved, and the required live individual defenses have
not happened. A final tag must not be created while the licence and human release decisions
remain open.

The latest durable check record is in `docs/release-evidence-2026-08-19.md`.

## Rollback plan

1. Identify the last known-good deployment in Vercel.
2. Promote it back to production.
3. Open an issue describing what broke and why.
4. Fix forward on `dev`, never hotfix directly on `main`.
