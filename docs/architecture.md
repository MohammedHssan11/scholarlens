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
                                   ├─→ grounding      (Gemini File Search, approved corpus only)
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

## Open decision

> **Where are papers and chunks stored?** Gemini File Search store only, or also a
> database for metadata? — to be decided by the Lead with AlBaraa.

**Proposed answer (not yet confirmed):** Gemini File Search store only for the prototype/beta.
The approved corpus is small (10 papers) and fully described in `docs/source-register.md`,
so a separate metadata database would add operational cost (another service to secure,
deploy, and back up) without a clear benefit at this scale. Revisit if the corpus grows
past what one narrow topic needs, or if the team needs to query metadata outside of what
File Search's retrieval already returns. **This is a suggestion, not a decision — needs
sign-off from the Lead and AlBaraa before it's final.**

## External services (approved)

| Service | Use |
|---|---|
| Gemini File Search | Grounded retrieval over the approved corpus |
| Groq API | Fast generation (primary), Gemini as fallback |
| Crossref REST API | DOI and publication metadata |
| arXiv API | Paper metadata and abstracts |
