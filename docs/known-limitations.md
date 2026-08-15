# Known limitations

Honest list of what ScholarLens does **not** do well yet. Every member contributes.
Being honest here earns marks; hiding failures loses them.

| # | Limitation | Impact | Owner | Planned fix? |
|---|---|---|---|---|
| 1 | Answers are limited to the approved corpus only | Cannot answer outside the chosen topic | Mariam Eladawy | By design |
| 2 | Paper selection in the UI is hardcoded to `paper-001` | A user cannot choose which of the 10 approved papers to ask about; the "compare 3 papers" first-success test isn't reachable through the UI yet | Doodiiii (frontend) | Yes — tracked in issue #5 |
| 3 | No UI for `compare_papers()` / `research_readiness()` | The two deterministic tools exist server-side but have no visible surface in the product yet | Doodiiii (frontend) | Yes — tracked in issue #5 |
| 4 | Licence verification incomplete for papers 001–008; publication URL/DOI still pending for papers 005–007 and 010 | These sources are usable for prototype development but not yet cleared for production distribution | Mariam Eladawy | In progress, see `docs/source-register.md` |
| 5 | No AI provider integrated yet (`feat/backend-api` not merged) | The app currently runs on deterministic baseline/sample data only, not real Groq/Gemini answers | AlBaraa | Yes — tracked in issue #4 |
| 6 | No automated CI before now | Lint/type/build regressions could previously reach `dev` unnoticed | Mohammed | Fixed — see PR #3 |

## Prohibited use cases

- Not for medical, legal or safety decisions.
- Not a replacement for reading the original papers.
- Must not be used with confidential or unpublished work without permission.
