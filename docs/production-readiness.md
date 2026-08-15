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
| | | |

## Rollback plan

1. Identify the last known-good deployment in Vercel.
2. Promote it back to production.
3. Open an issue describing what broke and why.
4. Fix forward on `dev`, never hotfix directly on `main`.
