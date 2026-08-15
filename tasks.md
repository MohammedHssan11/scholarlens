# ScholarLens — Codex Task List

Owner of this file: Mohammed Hassan Mahmoud (Integration Lead). Written 2026-08-14
after a full manual audit of every branch. Work through the phases **in order** —
each one gates the next. Check items off as you complete them and leave a short
note under each phase summarizing what you did and any blockers.

## Ground rules — read before touching anything

1. **Never edit a file outside the current phase's explicit file list** without
   asking first. A previous contributor (AlBaraa) edited other people's files
   unilaterally (Mariam Eladawy's `source-register.md`/`taxonomy.ts`/`tool-rules.ts`,
   the frontend components, `architecture.md`, `README.md`) and it caused real
   damage — conflicting data, a broken UI, and a false claim of instructor
   approval that had to be reverted. Do not repeat this. If a task seems to
   require touching a file outside your scope, stop and flag it instead of
   editing it.
2. **Never fabricate content.** No placeholder text presented as real paper
   content, no invented approvals, no invented citations, no marking something
   "done" or "tested" without actually running the command and seeing it pass.
3. **Never commit real API keys or copyrighted PDF files.** `.env.local` and
   `data/corpus/*` (except `README.md` and `manifest.json`) are gitignored on
   purpose — keep it that way.
4. **Before marking any code task complete, all four must pass, for real:**
   `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npx vitest run`.
   Paste the actual output, don't just say "should pass."
5. **Work on a feature/chore branch, never commit directly to `dev` or `main`**
   (both are protected and require a PR). Use small, logically separate commits
   with clear messages.
6. **When a task requires a judgment call that isn't purely technical** —
   approving a new source, inventing UI copy, deciding something on someone
   else's behalf — **stop and ask the Lead instead of deciding it yourself.**
   This is exactly the mistake to avoid repeating.

---

## Phase 1 — Finish AlBaraa's branch (`feat/backend-api`)

Branch is currently at commit `a3de49f`. Two things were already fixed in the
last commit (false "farkadaa" ownership claim removed, broken Ask button
fixed). Everything below is still open, verified live as of 2026-08-14.

- [x] **1.1 — Merge `dev` into `feat/backend-api`.**
  `dev` now has Mariam Eladawy's completed, Lead-approved corpus (10 real
  papers with authors/DOIs in `docs/source-register.md`, real taxonomy in
  `taxonomy.ts`, real thresholds `minPapers: 3` / `minSnippetChars: 30` in
  `tool-rules.ts`) and the new CI workflow. Resolve conflicts by **taking
  dev's version** for any file you don't own: `docs/source-register.md`,
  `src/lib/scholarlens/taxonomy.ts`, `src/lib/scholarlens/tool-rules.ts`,
  `src/components/scholarlens/InputForm.tsx`, `src/components/scholarlens/ResultView.tsx`,
  `docs/architecture.md`, `README.md`. Do not reintroduce edits to these.

- [x] **1.2 — Fix the corpus distribution problem (the core blocker).**
  Right now `data/corpus/manifest.json` lists 10 papers, but the actual text
  files only exist on AlBaraa's own laptop (fetched by `download_papers.py`,
  which is hardcoded to `c:\Users\albar\Downloads\scholarlens\data\corpus`).
  Every other environment gets `503 CORPUS_UNAVAILABLE`. Fix:
  - Make `download_papers.py` portable: read the corpus directory from an
    environment variable or a relative path (e.g. `data/corpus` relative to
    the repo root), never a hardcoded personal path.
  - Turn it into a documented, runnable **setup/build step** (e.g. an npm
    script like `npm run fetch-corpus`) so any environment — a teammate's
    laptop, CI, or the production build — can reproduce the same corpus
    content without committing copyrighted PDFs to git. Document this step in
    `README.md` and in `docs/albaraa's backend.md`.
  - Do **not** commit the actual PDF/text files themselves.

- [x] **1.3 — Remove the 3 fabricated-content papers from the active corpus.**
  `download_papers.py` currently writes this fabricated placeholder for
  papers 005, 006, and 007 instead of real content:
  > "Abstract and details available via external databases. This paper
  > focuses on the specific aspects of Agentic RAG as described in the title."

  This directly risks the project's golden rule (a "verified" quote could
  trace back to invented filler text). Cross-check
  `docs/source-register.md` (now Mariam's real, merged version) for which
  papers have a **confirmed** real URL/DOI. For any paper_id that does not yet
  have a confirmed source (check the "Licence / Usage" and URL columns), remove
  it from `data/corpus/manifest.json` and exclude it from the selectable corpus
  entirely — do not serve placeholder text for it. Note which papers you
  excluded and why, so Mariam/the Lead can follow up on sourcing them for real.

- [x] **1.4 — Fix the health check false positive.**
  `GET /api/scholarlens` currently reports `status: "ok"` and the full
  `paper_count` based on `manifest.json` alone, without checking whether the
  referenced content files actually exist on disk. Update the health check to
  verify file existence (or a successful read) for each manifest entry before
  counting it as available, so a missing-corpus environment reports its real
  state instead of a false positive.

- [ ] **1.5 — Get sign-off on the custom retrieval approach, don't just note it.**
  `src/lib/scholarlens/agent-rag.ts` replaces the originally-agreed Gemini File
  Search with a custom local TF-IDF retriever. The reasoning is already written
  in `docs/albaraa's backend.md` and is solid (Groq can't use Gemini's managed
  File Search, so a shared local retriever keeps both providers grounded
  identically) — but this is a provider/retrieval-strategy change that
  AlBaraa's own acceptance criteria requires Lead sign-off for. **Add a short
  "Decision needed" section at the top of `docs/albaraa's backend.md`**
  summarizing the tradeoff in 3-4 sentences and explicitly asking the Lead to
  confirm. Do not treat this as silently approved.

- [x] **1.6 — Full verification pass.**
  Run and paste real output for: `npm run lint`, `npx tsc --noEmit`,
  `npm run build`, `npx vitest run`. All must be clean. Then start the dev
  server and manually verify: ask a real question through the UI with the
  corpus now actually present, confirm you get a real structured answer (not
  a 503), confirm an unknown paper_id still returns 400, confirm an empty
  question still returns 400.

- [x] **1.7 — Push and open the PR.**
  Push `feat/backend-api`, open a PR against `dev` (not `main`) with an
  accurate description of everything in this phase, and check off the PR's
  own checklist template honestly (lint/build/tests boxes only checked if you
  actually ran them).

---

## Phase 2 — Integrate all team branches (this is the Lead's job — do it carefully)

- [ ] **2.1 — Open the backend PR against `dev`, once Phase 1 is fully green**
  (all 4 checks passing, live-verified, PR open and clean). **Do not merge it
  yourself.** Post the verification output in the PR description, then stop
  and tell the Lead by name that PR is ready for a merge decision. Only
  resume Phase 2 after the Lead confirms it's merged.

- [ ] **2.2 — Check `feat/frontend-ui` (PR #1) status. Do not fix it yourself.**
  As of this writing it still has: PR targets `main` instead of `dev`, 2 real
  lint errors in `InputForm.tsx` (`any` casts, lines ~43-44), and 2 missing
  features (hardcoded `paper_ids: ["paper-001"]` instead of a real paper
  picker, no UI for `compare_papers()`/`research_readiness()`). These are
  tracked in [issue #5](https://github.com/MohammedHssan11/scholarlens/issues/5)
  and are **Doodiiii's to fix, not yours.** If it's still not ready, leave it
  alone and report its status — don't edit her files to force it through,
  that's exactly the mistake from Phase 1.

- [ ] **2.3 — If frontend IS ready and merged too, do a full end-to-end
  integration check on `dev`:** start the app, ask a real question, run a
  comparison across multiple papers, check the readiness output — the actual
  "first success test" from the project brief (a researcher asks 3 questions
  and compares 3 papers with no unsupported claims). Record what works and
  what doesn't.

- [ ] **2.4 — Resolve any integration conflicts you find** (e.g. API response
  shape mismatches between what the backend now returns and what the frontend
  expects) by coordinating through this file — document the mismatch here
  rather than silently picking a side if it touches another owner's file.

---

## Phase 3 — Full project audit against the rubric

Re-check the whole merged `dev` branch against:
- `docs/AI_in_Applications_HANDBOOK (1).xlsx`, sheet "T01 ScholarLens" (session
  gates and personal acceptance criteria for all 4 roles) and sheet
  "SCORING RUBRIC" (100-point breakdown).
- `docs/ScholarLens_Architecture.pdf` (the 3 diagrams — simple, detailed, product).
- `docs/known-limitations.md` and `docs/Lead_Independent_Tasks_Checklist.md`
  (already-tracked open items).

- [ ] **3.1** List every acceptance-criteria item, per role, with a status:
  done / partial / missing, and evidence for each (a command output, a file,
  a live test — not a guess).
- [ ] **3.2** For anything **missing that's a pure engineering/infra gap**
  (a missing test, a stale doc, a broken CI step) — fix it directly.
- [ ] **3.3** For anything missing that requires **someone else's domain
  judgment** (approving a source, writing UI copy, deciding taxonomy content,
  anything the ground rules above say to not decide yourself) — do **not**
  invent it. Add it to `docs/known-limitations.md` with a clear owner and
  open a tracking issue instead, same pattern as issues #4/#5/#6.
- [ ] **3.4** Update `docs/known-limitations.md` and
  `docs/Lead_Independent_Tasks_Checklist.md` to reflect the real end state.
- [ ] **3.5** Write a final summary at the bottom of this file: what got
  fixed, what's still open, and what needs the Lead's direct decision.

---

## Notes / running log

_(Codex: add a dated entry here each time you finish a phase or hit a blocker.)_

### 2026-08-15 — Phase 1 verification blocker

WHAT I WAS DOING: Phase 1.6 — Full verification pass (`npm run lint`).

WHAT I EXPECTED: ESLint would inspect the ScholarLens project sources and exit cleanly.

WHAT ACTUALLY HAPPENED: The exact command exited with code 1 after traversing
pre-existing, untracked audit worktrees under `tmp/`. The command produced 765,010
tokens of output, which the execution tool truncated. The following is verbatim output
from the command, including its final result:

```text
> scholarlens-app@0.1.0 lint
> eslint

C:\Users\mh978\Downloads\scholarlens-app\tmp\team_audit\worktrees\backend\.next\build\94a577c99412f734.js
  1:7  error  A `require()` style import is forbidden  @typescript-eslint/no-require-imports

C:\Users\mh978\Downloads\scholarlens-app\tmp\team_audit\worktrees\knowledge\.next\types\routes.d.ts
  14:8   error  The `{}` ("empty object") type allows any non-nullish value, including literals like `0` and `""`.  @typescript-eslint/no-empty-object-type

✖ 22718 problems (942 errors, 21776 warnings)
  0 errors and 70 warnings potentially fixable with the `--fix` option.
```

WHAT I ALREADY TRIED: No workaround was attempted because `tmp/` existed before this
task, is outside Phase 1's authorized file scope, and the instructions require the exact
`npm run lint` command rather than a narrowed substitute.

WHAT I RECOMMEND: Recommendation only — the Integration Lead should authorize either
(a) adding the generated audit/output directories to ESLint's global ignores, or (b)
temporarily relocating those untracked directories outside the repository while the
exact verification command runs. After that decision, rerun all four checks from the
start; no Phase 1 checkbox should be marked yet.

### 2026-08-15 — Phase 1 TypeScript verification blocker

WHAT I WAS DOING: Phase 1.6 — Fresh full verification pass after the authorized
ESLint-only exception. `npm run lint` exited 0, then `npx tsc --noEmit` was run.

WHAT I EXPECTED: TypeScript would inspect the ScholarLens project sources and exit
cleanly after lint passed.

WHAT ACTUALLY HAPPENED: `npx tsc --noEmit` exited with code 1. Exact output:

```text
tmp/team_audit/worktrees/baseline/src/app/api/scholarlens/route.ts(9,10): error TS2305: Module '"@/lib/scholarlens/schema"' has no exported member 'isValidRequest'.
tmp/team_audit/worktrees/baseline/src/app/api/scholarlens/route.ts(28,38): error TS18046: 'body' is of type 'unknown'.
tmp/team_audit/worktrees/baseline/src/app/api/scholarlens/route.ts(28,53): error TS18046: 'body' is of type 'unknown'.
tmp/team_audit/worktrees/frontend/src/app/api/scholarlens/route.ts(9,10): error TS2305: Module '"@/lib/scholarlens/schema"' has no exported member 'isValidRequest'.
tmp/team_audit/worktrees/frontend/src/app/api/scholarlens/route.ts(28,38): error TS18046: 'body' is of type 'unknown'.
tmp/team_audit/worktrees/frontend/src/app/api/scholarlens/route.ts(28,53): error TS18046: 'body' is of type 'unknown'.
tmp/team_audit/worktrees/knowledge/src/app/api/scholarlens/route.ts(9,10): error TS2305: Module '"@/lib/scholarlens/schema"' has no exported member 'isValidRequest'.
tmp/team_audit/worktrees/knowledge/src/app/api/scholarlens/route.ts(28,38): error TS18046: 'body' is of type 'unknown'.
tmp/team_audit/worktrees/knowledge/src/app/api/scholarlens/route.ts(28,53): error TS18046: 'body' is of type 'unknown'.
```

The preceding lint command's exact output was:

```text
> scholarlens-app@0.1.0 lint
> eslint
```

WHAT I ALREADY TRIED: Added only `tmp/**` and `output/**` to
`eslint.config.mjs` as explicitly authorized; commit `fc873f4` contains only those two
lines. No TypeScript workaround was attempted because the exception did not authorize
editing `tsconfig.json`, moving audit artifacts, or changing another file.

WHAT I RECOMMEND: Recommendation only — authorize adding `tmp` and `output` to the
existing `exclude` array in `tsconfig.json`, or authorize temporarily relocating those
untracked scratch directories outside the repository. Then rerun all four checks from
the beginning. `npm run build` and `npx vitest run` were not run after this failure.

### 2026-08-15 — Phase 1 Vitest verification blocker

WHAT I WAS DOING: Phase 1.6 — Fresh full verification pass after the authorized
TypeScript-only exception.

WHAT I EXPECTED: All four required checks would exit cleanly with the merged
Lead-approved readiness threshold (`minPapers: 3`).

WHAT ACTUALLY HAPPENED: Lint, TypeScript, and the production build exited 0. Vitest
exited 1 because one test still expects two distinct papers to satisfy readiness. Exact
outputs follow.

`npm run lint` (exit 0):

```text
> scholarlens-app@0.1.0 lint
> eslint
```

`npx tsc --noEmit` (exit 0):

```text
```

`npm run build` (exit 0):

```text
> scholarlens-app@0.1.0 build
> next build

⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
 We detected multiple lockfiles and selected the directory of C:\Users\mh978\package-lock.json as the root directory.
 To silence this warning, set `turbopack.root` in your Next.js config, or consider removing one of the lockfiles if it's not needed.
   See https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory for more information.
 Detected additional lockfiles:
   * C:\Users\mh978\Downloads\scholarlens-app\package-lock.json

▲ Next.js 16.2.11 (Turbopack)

  Creating an optimized production build ...
✓ Compiled successfully in 4.0s
  Running TypeScript ...
  Finished TypeScript in 2.9s ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6)
  Generating static pages using 7 workers (2/6)
  Generating static pages using 7 workers (4/6)
✓ Generating static pages using 7 workers (6/6) in 698ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/scholarlens
└ ○ /scholarlens

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

`npx vitest run` (exit 1):

```text
 RUN  v4.1.10 C:/Users/mh978/Downloads/scholarlens-app

 ❯ tests/api/tools.test.ts (12 tests | 1 failed) 24ms
     × T11: counts distinct papers correctly even with duplicates 11ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/api/tools.test.ts > research_readiness > T11: counts distinct papers correctly even with duplicates
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ tests/api/tools.test.ts:192:26
    190|     // 3 evidence items but only 2 distinct papers
    191|     expect(report.papers_used).toBe(2);
    192|     expect(report.ready).toBe(true); // 2 >= minPapers (2), all snippe…
       |                          ^
    193|   });
    194|

 Test Files  1 failed | 7 passed (8)
      Tests  1 failed | 80 passed (81)
   Start at  17:59:32
   Duration  858ms (transform 900ms, setup 0ms, import 2.16s, tests 133ms, environment 1ms)
```

WHAT I ALREADY TRIED: No test edit was attempted. The failure is consistent with the
merged `minPapers: 3` rule, while the stale assertion/comment still encode the previous
two-paper threshold. `tests/api/tools.test.ts` was not included in either narrow local
scratch-directory exception.

WHAT I RECOMMEND: Recommendation only — authorize the backend test owner to update T11
so two distinct papers remain `ready: false` under the approved three-paper threshold,
or identify the owner who should make that change. Then rerun all four checks from the
beginning. No Phase 1 checkbox should be marked yet.

### 2026-08-15 — Phase 1 clean automated verification

The stale T11 assertion was updated in backend-owned
`tests/api/tools.test.ts` to expect `ready: false` for two distinct papers under the
merged `minPapers: 3` rule. A whole-suite search found no other assumptions for the old
`minPapers: 2` or `minSnippetChars: 20` thresholds. All four required checks were then
run again from the beginning.

`npm run lint` (exit 0):

```text
> scholarlens-app@0.1.0 lint
> eslint
```

`npx tsc --noEmit` (exit 0):

```text
```

`npm run build` (exit 0):

```text
> scholarlens-app@0.1.0 build
> next build

⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
 We detected multiple lockfiles and selected the directory of C:\Users\mh978\package-lock.json as the root directory.
 To silence this warning, set `turbopack.root` in your Next.js config, or consider removing one of the lockfiles if it's not needed.
   See https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory for more information.
 Detected additional lockfiles:
   * C:\Users\mh978\Downloads\scholarlens-app\package-lock.json

▲ Next.js 16.2.11 (Turbopack)

  Creating an optimized production build ...
✓ Compiled successfully in 4.5s
  Running TypeScript ...
  Finished TypeScript in 2.8s ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6)
  Generating static pages using 7 workers (2/6)
  Generating static pages using 7 workers (4/6)
✓ Generating static pages using 7 workers (6/6) in 649ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/scholarlens
└ ○ /scholarlens

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

`npx vitest run` (exit 0):

```text
 RUN  v4.1.10 C:/Users/mh978/Downloads/scholarlens-app

 Test Files  8 passed (8)
      Tests  81 passed (81)
   Start at  18:14:10
   Duration  844ms (transform 730ms, setup 0ms, import 1.94s, tests 136ms, environment 4ms)
```

Automated verification is clean. Phase 1.6 remains open pending its required live UI
question and API validation interactions.

### 2026-08-15 — Phase 1 live provider blocker

WHAT I WAS DOING: Phase 1.6 — Start the development server and verify a real question
through the UI produces a structured answer from the downloaded corpus rather than a
`503` response.

WHAT I EXPECTED: The health endpoint would report the six corpus files available and at
least one configured generation provider, allowing the required real UI question.

WHAT ACTUALLY HAPPENED: The server started successfully, and `GET
/api/scholarlens` returned HTTP 200 with all six active corpus files available, but both
provider flags were false. Exact output:

```text
ENV_LOCAL_PRESENT=False

> scholarlens-app@0.1.0 dev
> next dev

▲ Next.js 16.2.11 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://192.168.1.4:3000
✓ Ready in 770ms

HTTP_STATUS=200
{"status":"ok","corpus":{"paper_count":6,"paper_ids":["paper-001","paper-002","paper-003","paper-004","paper-008","paper-009"],"unavailable_paper_ids":[]},"providers":{"groq":false,"gemini":false}}
```

WHAT I ALREADY TRIED: Confirmed `.env.local` is absent without reading or exposing any
secret value, started the real development server, and queried its live health endpoint.
The server was stopped after the blocker was confirmed. No UI answer was fabricated,
and the unknown-paper and empty-question interactions were not represented as completed.

WHAT I RECOMMEND: Recommendation only — configure either `GROQ_API_KEY` or
`GEMINI_API_KEY` in the local server environment, then rerun the Phase 1.6 live UI/API
interactions. Do not commit `.env.local`. Phase 1.7 and its PR remain blocked until the
required real structured answer and both 400 responses are observed.

### 2026-08-15 — Phase 1 live PDF integration blocker

WHAT I WAS DOING: Phase 1.6 — Perform the Lead-authorized no-provider substitute: two
validation checks and one well-formed request with a valid paper ID, expecting a clean
provider-not-configured response.

WHAT I EXPECTED: Empty question and unknown paper ID would each return 400. The valid
request would retrieve real corpus text, reach provider dispatch, and return a safe
provider error because no key is configured.

WHAT ACTUALLY HAPPENED: Both validation cases returned the correct 400 responses. The
valid request returned 503 `CORPUS_UNAVAILABLE` before provider dispatch. Exact client
output:

```text
---EMPTY_QUESTION---
REQUEST={"paper_ids":["paper-001"],"question":"","action":"ask"}
HTTP_STATUS=400
RESPONSE={"error":"Request validation failed.","details":{"_errors":[],"question":{"_errors":["Question must be at least 3 characters."]}},"code":"VALIDATION_ERROR"}
---UNKNOWN_PAPER_ID---
REQUEST={"paper_ids":["paper-999"],"question":"What is agentic retrieval-augmented generation?","action":"ask"}
HTTP_STATUS=400
RESPONSE={"error":"Unknown paper_id(s): paper-999. Only approved papers from the source register are accepted.","code":"UNKNOWN_PAPER_IDS"}
---VALID_REQUEST_NO_PROVIDER---
REQUEST={"paper_ids":["paper-001"],"question":"What is agentic retrieval-augmented generation?","action":"ask"}
HTTP_STATUS=503
RESPONSE={"error":"The approved paper corpus is not ready. Add approved paper metadata and text before asking questions.","code":"CORPUS_UNAVAILABLE"}
```

The exact relevant server output was:

```text
Warning: Cannot load "@napi-rs/canvas" package: "Error: Cannot find module '@napi-rs/canvas'
Require stack:
- C:\ROOT\Downloads\scholarlens-app\node_modules\pdf-parse\dist\pdf-parse\cjs\index.cjs".
Warning: Cannot polyfill `DOMMatrix`, rendering may be broken.
[AgentRAG] Error reading paper-001: ReferenceError: DOMMatrix is not defined
    at AgentRAG.retrieve (src\lib\scholarlens\agent-rag.ts:327:17)
[ScholarLens] Action dispatch failed: CorpusUnavailableError: Corpus text for paper-001 is unavailable.
POST /api/scholarlens 503
```

WHAT I ALREADY TRIED: Confirmed the dependency and PDF outside Next.js using the
package's installed documented API. Exact output:

```text
PARSE_OK=true
TEXT_CHARS=115965
```

This proves the real PDF is readable and the failure is in the Next.js/pdf-parse
integration path. No source or Next.js configuration change was attempted after finding
the regression, and the development server was stopped.

WHAT I RECOMMEND: Recommendation only — authorize a focused integration fix that (1)
updates `agent-rag.ts` from the obsolete function-style `pdf-parse` call to the installed
v2 `PDFParse` class API with cleanup and (2), if required by the verified Next.js
bundling behavior, externalizes `pdf-parse` in `next.config.ts`. Add a regression test
that exercises a real or licensed PDF fixture through retrieval. Then rerun all four
checks and all three live requests. Do not open the PR until the valid request reaches
the safe no-provider error path.

### 2026-08-15 — Phase 1.6 completed verification

The authorized PDF integration fix updated `agent-rag.ts` to the installed
`PDFParse` v2 class API, configured top-level `serverExternalPackages: ["pdf-parse"]`,
and added a real-corpus retrieval regression test. All four required checks were rerun
from the beginning.

`npm run lint` (exit 0):

```text
> scholarlens-app@0.1.0 lint
> eslint
```

`npx tsc --noEmit` (exit 0):

```text
```

`npm run build` (exit 0):

```text
> scholarlens-app@0.1.0 build
> next build

⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
 We detected multiple lockfiles and selected the directory of C:\Users\mh978\package-lock.json as the root directory.
 To silence this warning, set `turbopack.root` in your Next.js config, or consider removing one of the lockfiles if it's not needed.
   See https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory for more information.
 Detected additional lockfiles:
   * C:\Users\mh978\Downloads\scholarlens-app\package-lock.json

▲ Next.js 16.2.11 (Turbopack)

  Creating an optimized production build ...
✓ Compiled successfully in 3.4s
  Running TypeScript ...
  Finished TypeScript in 2.9s ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6)
  Generating static pages using 7 workers (2/6)
  Generating static pages using 7 workers (4/6)
✓ Generating static pages using 7 workers (6/6) in 890ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/scholarlens
└ ○ /scholarlens

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

`npx vitest run` (exit 0):

```text
 RUN  v4.1.10 C:/Users/mh978/Downloads/scholarlens-app

 Test Files  8 passed (8)
      Tests  82 passed (82)
   Start at  18:27:19
   Duration  1.27s (transform 705ms, setup 0ms, import 2.75s, tests 535ms, environment 1ms)
```

The live sequence was rerun from the start. Exact client output:

```text
---EMPTY_QUESTION---
REQUEST={"paper_ids":["paper-001"],"question":"","action":"ask"}
HTTP_STATUS=400
RESPONSE={"error":"Request validation failed.","details":{"_errors":[],"question":{"_errors":["Question must be at least 3 characters."]}},"code":"VALIDATION_ERROR"}
---UNKNOWN_PAPER_ID---
REQUEST={"paper_ids":["paper-999"],"question":"What is agentic retrieval-augmented generation?","action":"ask"}
HTTP_STATUS=400
RESPONSE={"error":"Unknown paper_id(s): paper-999. Only approved papers from the source register are accepted.","code":"UNKNOWN_PAPER_IDS"}
---VALID_REQUEST_NO_PROVIDER---
REQUEST={"paper_ids":["paper-001"],"question":"What is agentic retrieval-augmented generation?","action":"ask"}
HTTP_STATUS=504
RESPONSE={"error":"AI provider is temporarily unavailable. Please try again later.","code":"PROVIDER_ERROR"}
```

Exact retrieval/server evidence for the valid request:

```text
[AgentRAG] Retrieval: 1 papers, 143 chunks scanned, 83 above threshold, 8 returned, top=0.2883, 494ms
[ScholarLens] Context retrieval: 8 chunks from 1 papers in 494ms
[ScholarLens] Groq not configured, trying Gemini directly.
[ScholarLens] Gemini not configured.
[ScholarLens] Action dispatch failed: ProviderError: All AI providers failed.
POST /api/scholarlens 504
```

This proves real corpus retrieval occurred before the safe provider error. Live
provider-response verification remains pending a real API key in a configured
environment; the safe no-provider path was verified instead, as directed by the Lead.
Item 1.5 remains intentionally unchecked pending Mohammed Hassan Mahmoud's explicit
retrieval-strategy sign-off. Phase 1.7 is next; no merge is authorized.

### 2026-08-15 — Phase 1 PR opened; Lead decision required

Phase 1 changes were pushed to `origin/feat/backend-api`. PR #8 was opened against
`dev` (not `main`): https://github.com/MohammedHssan11/scholarlens/pull/8

Remote checks observed on the PR before this tracker update:

```text
GitGuardian Security Checks  pass  1s
Lint, type-check, build      pass  43s
```

No paper PDF/text, `.env.local`, API key, private audit document, `tmp/`, or `output/`
artifact was committed. The PR description records all local automated and live outputs,
including: “Live provider-response verification pending a real API key in a configured
environment — safe no-provider error path verified instead.”

Still open: item 1.5 needs Mohammed Hassan Mahmoud's explicit confirmation of the local
TF-IDF retrieval strategy. Per the no-merge rule, PR #8 has not been merged and Phase 2
has not started.
