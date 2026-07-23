# How we work

## Branches

```
feat/your-task  →  PR  →  dev  (integration + testing)  →  PR  →  main  (production)
```

- **`main`** — always working, deployed to production. Nobody pushes to it directly.
- **`dev`** — where everyone's work is combined and tested together.
- **`feat/...`** — your own work. Branch from `dev`, merge back into `dev`.

## Starting a task

```bash
git checkout dev
git pull origin dev
git checkout -b feat/my-task
```

## Before you open a PR (important)

```bash
git checkout dev
git pull origin dev
git checkout feat/my-task
git merge dev
```

Resolve any conflicts **on your own branch**, never inside `dev`.

## Pull requests

- `base` = `dev` (not `main`)
- Link the issue it closes
- Say what changed and how you verified it
- Small and frequent beats one giant PR at the end

## Rules

1. Every task has a GitHub issue and an owner.
2. Never commit secrets. Keys live in `.env.local` (git-ignored) and in Vercel.
3. AI tools may assist, but you must understand, modify and debug your own code.
4. Blocked? Try, document what you tried, then ask the lead **with logs**.
5. Blocked more than 24 hours → escalate to Dr. Ahmed.
6. Deterministic logic (validation, scoring, tools) is plain code — not model output.
