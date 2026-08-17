# ScholarLens — Architecture

**Owner:** Mohammed Hassan Mahmoud (Integration Lead / Solution Architect)

Diagrams: `arch_1_simple.png`, `arch_2_detailed.png`, `arch_3_product.png`
(see the team briefing pack).

## End-to-end flow

```
Browser (UI)
   │  POST /api/scholarlens   { question, paper_ids }
   ▼
Route handler  →  validation  →  service
                                   ├─→ providers.ts   (Groq → Gemini fallback)
                                   ├─→ agent-rag.ts   (local TF-IDF, approved corpus only)
                                   └─→ tools.ts       (compare_papers, research_readiness)
   ▲
   │  structured answer + exact evidence snippet  (or not_found)
Browser
```

## Trust boundary

API keys and corpus management live **only on the server**. Nothing secret is ever
sent to the browser or included in the client bundle.

## Layers and owners

| Layer | Files | Owner |
|---|---|---|
| UI / workflow | `src/app/scholarlens/`, `src/components/` | GitHub: Doodiiii (identity to be confirmed — see Team changes) |
| API + validation | `src/app/api/scholarlens/route.ts`, `src/lib/scholarlens/schema.ts` | AlBaraa |
| AI providers | `src/lib/ai/providers.ts` | AlBaraa |
| Grounding / retrieval | `src/lib/scholarlens/service.ts` | AlBaraa |
| Deterministic tools | `src/lib/scholarlens/tools.ts` | AlBaraa (wiring) |
| Tool rules / taxonomy | `src/lib/scholarlens/tool-rules.ts`, `taxonomy.ts` | Mariam Eladawy |
| Approved corpus | `data/corpus/`, `docs/source-register.md` | Mariam Eladawy |
| Platform & release | `.github/`, env config, deployment | Mohammed |

## Team changes

- **Ahmed Mossad Elgammal** (Evaluation & Production) withdrew. Work redistributed with
  Dr. Ahmed's approval.
- **Mariam Ali Ahmed** (Product UI & Workflow) was recorded as withdrawn as of 2026-07-23.
  This is now unclear: `feat/frontend-ui` has active, ongoing commits and an open PR,
  all authored by GitHub account **Doodiiii** (`alidreasydody@gmail.com`) — an email that
  doesn't match Mariam Ali's contact email on file. **Open action for the Lead:** confirm
  whether Doodiiii is Mariam Ali, a new member, or someone else, and update this doc once
  known.

## Approved retrieval decision

Mohammed Hassan Mahmoud approved the provider-neutral local TF-IDF retrieval strategy on
2026-08-15. Approved PDFs are downloaded into the gitignored `data/corpus` directory by
`npm run fetch-corpus`; metadata remains in the tracked manifest and source register.
`agent-rag.ts` retrieves the same source-labelled chunks before either Groq or Gemini is
called, so both generation providers use the same bounded evidence context. No Gemini
File Search store or separate metadata database is used by the current prototype.

## External services (approved)

| Service | Use |
|---|---|
| Groq API | Primary structured evidence generation |
| Gemini API | Fallback structured evidence generation |
| Crossref REST API | DOI and publication metadata |
| arXiv | Confirmed paper downloads and metadata |
