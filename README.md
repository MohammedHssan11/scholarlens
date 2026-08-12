# ScholarLens — Research Evidence Navigator

**Team 01 · AI in Applications (Production Training)**

A research evidence workspace that answers **only from approved papers**, shows the exact
source snippet behind every claim, compares papers, and safely says *"no evidence found"*
instead of inventing an answer.

---

## The golden rule

> Every answer must show at least one traceable source snippet — or clearly state that
> evidence was not found. Never fabricate a source.

---

## Main workflow

1. Upload / select an approved paper collection
2. Ask a research question
3. Retrieve relevant evidence (from the approved corpus only)
4. Return a structured synthesis with source snippets
5. Compare papers
6. Export an evidence matrix

## Mandatory MVP

Paper library · question form · grounded evidence answer · source panel ·
paper-comparison matrix · research-readiness checklist · export

## Out of scope

Open-ended whole-web research · fabricated citations · automatic academic conclusions ·
uploading confidential unpublished work without permission.

---

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in your keys
npm run dev
```

Open http://localhost:3000/scholarlens

```bash
npm run lint     # lint
npm run build    # production build
```

---

## Who owns what

| Area | Owner | Main folders |
|---|---|---|
| Architecture, integration, deployment, release | **Mohammed Hassan Mahmoud** (Lead) | `docs/`, `.github/`, env & deploy |
| Frontend / user workflow | **farkadaa** | `src/app/scholarlens/`, `src/components/` |
| AI & backend | **AlBaraa** | `src/app/api/`, `src/lib/ai/`, `src/lib/scholarlens/` |
| Approved knowledge & tools | **Mariam Eladawy** | `knowledge/`, `data/corpus/`, `docs/source-register.md`, `taxonomy.ts`, `tool-rules.ts` |

> Team note: Ahmed Mossad and Mariam Ali withdrew from the training. Their work was
> redistributed to farkadaa with Dr. Ahmed's approval — see `docs/architecture.md`.

---

## Branch rules

`main` (production) ← `dev` (integration) ← `feat/*` (each person's work).
Never push directly to `main` or `dev`. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Documentation

- [Architecture](docs/architecture.md)
- [API contracts](docs/api-contracts.md)
- [Source register](docs/source-register.md)
- [Release checklist](docs/release-checklist.md)
- [Known limitations](docs/known-limitations.md)
