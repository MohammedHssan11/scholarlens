# Production readiness

**Owner:** Mohammed Hassan Mahmoud (Integration Lead)

## Environments

| Environment | Branch | URL |
|---|---|---|
| Local | any | http://localhost:3000 |
| Preview | `dev` / PRs | _(fill in)_ |
| Production | `main` | _(fill in)_ |

## Environment variables

See `.env.example`. All are **server-side only** — never prefixed with `NEXT_PUBLIC_`.

## Observability notes

| Date | Environment | Observation (latency / errors) |
|---|---|---|
| 2026-08-17 | Local | Health returned HTTP 200 with 6/6 manifest papers available. Groq and Gemini flags were both false. Three ask requests plus compare and readiness each retrieved 8 real corpus chunks, then returned the safe HTTP 504 `PROVIDER_ERROR`. This is not a successful provider or release smoke test. |

## Rollback plan

1. Identify the last known-good deployment in Vercel.
2. Promote it back to production.
3. Open an issue describing what broke and why.
4. Fix forward on `dev`, never hotfix directly on `main`.
