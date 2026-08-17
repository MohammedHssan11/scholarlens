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

- [x] **1.5 — Get sign-off on the custom retrieval approach, don't just note it.**
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

- [x] **2.1 — Open the backend PR against `dev`, once Phase 1 is fully green**
  (all 4 checks passing, live-verified, PR open and clean). **Do not merge it
  yourself.** Post the verification output in the PR description, then stop
  and tell the Lead by name that PR is ready for a merge decision. Only
  resume Phase 2 after the Lead confirms it's merged.

- [x] **2.2 — Check `feat/frontend-ui` (PR #1) status. Do not fix it yourself.**
  As of this writing it still has: PR targets `main` instead of `dev`, 2 real
  lint errors in `InputForm.tsx` (`any` casts, lines ~43-44), and 2 missing
  features (hardcoded `paper_ids: ["paper-001"]` instead of a real paper
  picker, no UI for `compare_papers()`/`research_readiness()`). These are
  tracked in [issue #5](https://github.com/MohammedHssan11/scholarlens/issues/5)
  and are **Doodiiii's to fix, not yours.** If it's still not ready, leave it
  alone and report its status — don't edit her files to force it through,
  that's exactly the mistake from Phase 1.

- [x] **2.3 — If frontend IS ready and merged too, do a full end-to-end
  integration check on `dev`:** start the app, ask a real question, run a
  comparison across multiple papers, check the readiness output — the actual
  "first success test" from the project brief (a researcher asks 3 questions
  and compares 3 papers with no unsupported claims). Record what works and
  what doesn't.

- [x] **2.4 — Resolve any integration conflicts you find** (e.g. API response
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

- [x] **3.1** List every acceptance-criteria item, per role, with a status:
  done / partial / missing, and evidence for each (a command output, a file,
  a live test — not a guess).
- [x] **3.2** For anything **missing that's a pure engineering/infra gap**
  (a missing test, a stale doc, a broken CI step) — fix it directly.
- [x] **3.3** For anything missing that requires **someone else's domain
  judgment** (approving a source, writing UI copy, deciding taxonomy content,
  anything the ground rules above say to not decide yourself) — do **not**
  invent it. Add it to `docs/known-limitations.md` with a clear owner and
  open a tracking issue instead, same pattern as issues #4/#5/#6.
- [x] **3.4** Update `docs/known-limitations.md` and
  `docs/Lead_Independent_Tasks_Checklist.md` to reflect the real end state.
- [x] **3.5** Write a final summary at the bottom of this file: what got
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

### 2026-08-15 — Fabricated production-readiness claims removed

Mohammed Hassan Mahmoud explicitly approved the item 1.5 local TF-IDF retrieval
strategy. No further retrieval-strategy action is required.

The Lead identified that PR #8 changed Lead-owned `docs/production-readiness.md` to
claim two unverified Vercel URLs and an invented latency/error-rate observation. No
deployment or observation evidence exists. The file was restored exactly from
`dev` and committed alone as `de34380` (`fix: remove out-of-scope, fabricated
production-readiness claims`). `git diff origin/dev...HEAD --
docs/production-readiness.md` then returned no output.

Why this reached the PR: commit `5f491e2` predated this session, but I reviewed the
branch as though previously committed backend-branch content was implicitly in scope. My
pre-push audit listed `docs/production-readiness.md` in the PR diff, yet I checked only
file scope at a coarse level, generated artifacts, and secrets; I did not open and verify
every changed documentation claim against real evidence. Publishing the full branch made
that omission mine regardless of when the bad lines were introduced.

What should have caught it: before any push, build an explicit allowlist from
`tasks.md`, compare it to every path in `git diff origin/dev...HEAD`, stop on every
non-allowlisted path, and manually read the complete diff of every documentation file.
Operational claims must additionally have direct evidence (real deployment URL, command
output, or observation record); absent evidence means restore `dev` and escalate, not
publish.

All four checks were rerun from the beginning after the corrective commit.

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
✓ Compiled successfully in 2.8s
  Running TypeScript ...
  Finished TypeScript in 2.7s ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6)
  Generating static pages using 7 workers (2/6)
  Generating static pages using 7 workers (4/6)
✓ Generating static pages using 7 workers (6/6) in 757ms
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
   Start at  18:46:56
   Duration  1.27s (transform 667ms, setup 0ms, import 2.73s, tests 549ms, environment 1ms)
```

Remote checks on corrective commit `de34380`:

```text
GitGuardian Security Checks  pass  12s
Lint, type-check, build      pass  35s
```

PR #8 remains open and unmerged. Phase 2 has not started.

### 2026-08-17 — Phase 2.1 gate verified; waiting for merge decision

WHAT I WAS DOING: Phase 2.1 — confirm the backend PR state before starting any further
Phase 2 integration work.

WHAT I FOUND: PR #8 is still open against `dev`, clean, non-draft, and CI-green, but it
has not been merged. The PR description already contains the Phase 1 verification output.
Per the hard rule, I did not merge it and did not start Phase 2.2.

GitHub connector PR status:

```text
url: https://github.com/MohammedHssan11/scholarlens/pull/8
state: open
merged: false
mergeable: true
draft: false
base: dev
head: feat/backend-api
head_sha: 97f1d085fd9e377f1241630410c535535c4c14a2
```

`gh pr view 8 --repo MohammedHssan11/scholarlens --json ...` showed:

```text
state: OPEN
isDraft: false
baseRefName: dev
headRefName: feat/backend-api
mergeStateStatus: CLEAN
mergedAt: null
GitGuardian Security Checks: SUCCESS
Lint, type-check, build: SUCCESS
```

`git log --oneline --decorate -n 12 origin/dev` begins:

```text
2046aab (origin/dev) Merge pull request #7 from MohammedHssan11/chore/lead-doc-housekeeping
588da76 Merge pull request #3 from MohammedHssan11/chore/ci-pipeline
d678c3d (chore/lead-doc-housekeeping) docs: sync architecture.md and known-limitations.md with current state
```

`git merge-base --is-ancestor 97f1d085fd9e377f1241630410c535535c4c14a2 origin/dev`
result:

```text
HEAD_IS_IN_ORIGIN_DEV=false
```

Mohammed Hassan Mahmoud must make the merge decision for PR #8 before Phase 2.2 starts.

### 2026-08-17 — Phase 2.1 fully resolved after Lead merge

Mohammed Hassan Mahmoud confirmed and completed the merge of PR #8 into `dev`. After
fetching `origin/dev`, the local `dev` ref was fast-forwarded and the required
`git log dev` verification showed:

```text
29c6734 (origin/dev, dev) Merge pull request #8 from MohammedHssan11/feat/backend-api
97f1d08 (HEAD -> feat/backend-api, origin/feat/backend-api) docs: avoid repeating fabricated production metrics
```

The merge commit resolves to
`29c67342d171307b6f4791459c1b2cc411d0112d`, with parents `2046aab6d7d8a8b12df9a4f2df68473882a1f360`
and `97f1d085fd9e377f1241630410c535535c4c14a2`. A direct ancestry check returned
`BACKEND_HEAD_IN_DEV=true`. Item 2.1 is fully resolved; Codex did not perform the merge.

### 2026-08-17 — Phase 2.2 frontend PR status check

PR #1 (`feat/frontend-ui`, head `5650ad4dcaa835827a977f59bc109f928e0d3772`)
is still open and unmerged. It still targets `main`, not `dev`.

A read-only targeted lint check of the remote branch's `InputForm.tsx` returned exactly
the two known errors:

```text
src/components/scholarlens/InputForm.tsx
  43:82  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  44:24  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

✖ 2 problems (2 errors, 0 warnings)
```

Source inspection at that same commit found the request body still hardcodes
`paper_ids: ["paper-001"]`. There is no paper picker. The branch contains backend helper
definitions for `compare_papers()` and `research_readiness()`, but no frontend component
calls them or supplies compare/readiness actions, and there is no compare/readiness UI.
No file on `feat/frontend-ui` was edited; issue #5 remains Doodiiii's tracking item.

### 2026-08-17 — Phase 2.3 direct API journey (safe-error path only)

Per the Lead's instruction for this run, the merged API was exercised directly because
PR #1 is not ready or merged. The active manifest contains six real paper IDs:
`paper-001`, `paper-002`, `paper-003`, `paper-004`, `paper-008`, and `paper-009`.
All six corresponding PDF files were present and non-empty.

The live health response proved the corpus was ready but no generation provider was
configured:

```text
---HEALTH---
HTTP_STATUS=200
RESPONSE={"status":"ok","corpus":{"paper_count":6,"paper_ids":["paper-001","paper-002","paper-003","paper-004","paper-008","paper-009"],"unavailable_paper_ids":[]},"providers":{"groq":false,"gemini":false}}
```

The three real ask requests and responses were:

```text
---ASK_1---
REQUEST={"action":"ask","question":"How does agentic retrieval-augmented generation differ from conventional RAG?","paper_ids":["paper-001","paper-003","paper-004"]}
HTTP_STATUS=504
RESPONSE={"error":"AI provider is temporarily unavailable. Please try again later.","code":"PROVIDER_ERROR"}
---ASK_2---
REQUEST={"action":"ask","question":"When should a RAG system use System 2 reasoning instead of System 1 reasoning?","paper_ids":["paper-002","paper-003","paper-009"]}
HTTP_STATUS=504
RESPONSE={"error":"AI provider is temporarily unavailable. Please try again later.","code":"PROVIDER_ERROR"}
---ASK_3---
REQUEST={"action":"ask","question":"What challenges arise in multimodal retrieval-augmented generation?","paper_ids":["paper-001","paper-008","paper-009"]}
HTTP_STATUS=504
RESPONSE={"error":"AI provider is temporarily unavailable. Please try again later.","code":"PROVIDER_ERROR"}
```

The real three-paper comparison and readiness requests and responses were:

```text
---COMPARE---
REQUEST={"action":"compare","question":"Compare how these papers address retrieval, reasoning, and evidence grounding.","paper_ids":["paper-001","paper-002","paper-003"]}
HTTP_STATUS=504
RESPONSE={"error":"AI provider is temporarily unavailable. Please try again later.","code":"PROVIDER_ERROR"}
---READINESS---
REQUEST={"action":"readiness","question":"Is the selected evidence sufficient for a grounded comparison of agentic RAG approaches?","paper_ids":["paper-001","paper-002","paper-003"]}
HTTP_STATUS=504
RESPONSE={"error":"AI provider is temporarily unavailable. Please try again later.","code":"PROVIDER_ERROR"}
```

Server logs proved that every request loaded real corpus content before the safe error:

```text
ASK_1:     3 papers, 431 chunks scanned, 290 above threshold, 8 returned, top=0.2566
ASK_2:     3 papers, 274 chunks scanned, 144 above threshold, 8 returned, top=0.2003
ASK_3:     3 papers, 392 chunks scanned, 213 above threshold, 8 returned, top=0.3317
COMPARE:   3 papers, 340 chunks scanned, 191 above threshold, 8 returned, top=0.1652
READINESS: 3 papers, 340 chunks scanned, 170 above threshold, 8 returned, top=0.2046
Groq not configured, trying Gemini directly.
Gemini not configured.
Action dispatch failed: ProviderError: All AI providers failed.
```

This is **not a full pass** of the success journey. It verifies real retrieval and safe
failure for all required actions, but no structured evidence, comparison matrix, or
readiness report could be produced without a configured real provider key.

### 2026-08-17 — Phase 2.4 integration mismatches documented

No other owner's file was changed. The following mismatches require coordination or are
carried into the Phase 3 engineering/documentation audit:

1. PR #1 only sends the default `ask` request and hardcodes one paper. The merged API
   supports `ask`, `compare`, and `readiness`, and the approved readiness threshold
   requires three distinct papers. The frontend therefore cannot exercise the backend's
   comparison or readiness response shapes and cannot satisfy the normal readiness path.
2. PR #1 names every non-success state `provider-error`, while the backend can return
   validation, unknown-paper, rate-limit, corpus, provider, and internal error codes.
   The message is displayed, but the frontend state model does not match the backend's
   error taxonomy.
3. `docs/architecture.md` still describes grounding as Gemini File Search and retains an
   open File Search storage decision. The merged backend actually uses the Lead-approved
   provider-neutral local TF-IDF retriever before either Groq or Gemini.
4. The legacy `buildBaselineAnswer()` comment in `service.ts` says the route uses sample
   data when providers are unconfigured. The merged route does not call it; the observed
   behavior is a safe `504 PROVIDER_ERROR` after real retrieval.
5. `tests/acceptance-matrix.md` still labels invalid-input, malformed-JSON, comparison,
   and readiness implementation as pending even though routes/tests now exist. Live
   success for comparison/readiness remains unverified without a provider key.
6. `docs/api-contracts.md` documents POST actions but not the real GET health response
   used here (`status`, corpus availability, and provider flags).

Phase 2.4 records these facts only. Frontend items remain with Doodiiii/issue #5;
Lead-owned and backend-owned stale documentation/comments are evaluated under Phase 3.

### 2026-08-17 — Phase 3.1 full role-by-role audit

Audit baseline: local `dev` at merge commit
`29c67342d171307b6f4791459c1b2cc411d0112d`. Requirements were extracted directly
from `docs/AI_in_Applications_HANDBOOK (1).xlsx`, sheet `T01 ScholarLens` (session
gates and personal acceptance criteria) and sheet `SCORING RUBRIC`, plus all three
rendered pages of `docs/ScholarLens_Architecture.pdf`. `done` means direct evidence
exists; `partial` means only part of the requirement is evidenced; `missing` means no
acceptable evidence was found.

The workbook contains five original work packages. Ahmed Mossad Elgammal's Evaluation
& Production work was redistributed after his withdrawal, so it is audited below as an
inherited Lead work package rather than silently omitted from the requested four current
roles.

#### Mohammed Hassan Mahmoud — session gates (`T01 ScholarLens!C23`)

| Gate | Status | Real evidence |
|---|---|---|
| Session 1 — baseline, repository/branch/communication rules, architecture | partial | `CONTRIBUTING.md`, `README.md`, and architecture docs exist; no evidence proves every member ran the baseline, and `Doodiiii` identity remains unresolved. |
| Session 2 — freeze scope/contracts, merge structured output, branch compatibility | partial | Zod/API contracts and backend PR #8 are merged; frontend PR #1 still targets `main`, has lint errors, and is not contract-complete. |
| Session 3 — integrate grounding/tools, resolve interfaces, verify full journey | partial | Local TF-IDF, tools, and API actions are merged and tested; direct calls reached real retrieval, but provider-backed success and UI integration are missing. |
| Session 4 — release branch, environment, build, deployment, rollback/checklist | partial | Environment template, clean local build, release checklist, and rollback plan exist; no verified preview/production deployment or smoke evidence exists. |
| Session 5 — final release/demo/defense | missing | No tagged release, production demo, final sign-off, or individual defense evidence exists. |

#### Mohammed Hassan Mahmoud — personal acceptance (`T01 ScholarLens!C24`)

| # | Criterion | Status | Real evidence |
|---|---|---|---|
| L1 | Repository, branch rules, issue ownership, and PR review documented | done | `CONTRIBUTING.md`; issues #4/#5/#6/#9/#10; merged PRs #2/#3/#7/#8. |
| L2 | Architecture and all module/API contracts documented and agreed | partial | Markdown/API docs exist and were corrected to local TF-IDF; the architecture PDF is stale and frontend ownership/contracts remain unresolved. |
| L3 | Every member has an identifiable contribution merged through review | partial | Lead, Mariam Eladawy, and AlBaraa commits are in `dev`; PR #1 is open/unmerged and its author's identity is unresolved. |
| L4 | Lint, type-check, tests, and production build complete without errors | done | Fresh 2026-08-17 run: all four exited 0; exact output is recorded under Phase 3.2 below. |
| L5 | Environment variables documented; no secret committed/exposed | done | `.env.example` now lists only the two runtime provider keys with empty values; env files/corpus PDFs are ignored; post-build client scan found zero provider-key pattern matches; PR #8 GitGuardian check was green. |
| L6 | Preview and production URLs complete the main journey | missing | Both URL fields are blank; no deployment or provider-backed success evidence exists. Issue #10. |
| L7 | Release checklist, known limitations, rollback/recovery notes present | done | `docs/release-checklist.md`, updated `docs/known-limitations.md`, and rollback steps in `docs/production-readiness.md`. This does not mean the release checklist has passed. |
| L8 | Every answer is traceable/not-found; comparison uses selected approved papers | partial | Backend allowlist, exact-title/snippet filtering, and deterministic tools are automated; no provider-backed successful answer/comparison exists and the UI hardcodes one paper. |

#### AlBaraa — session gates (`T01 ScholarLens!C36`)

| Gate | Status | Real evidence |
|---|---|---|
| Session 1 — browser → route → validation → provider → response | done | Route/service/provider layers and the live safe-error browser/API path show the complete boundary. |
| Session 2 — schemas, validation, prompts, providers, API tests | done | `schema.ts`, `prompts.ts`, `providers.ts`, route tests, and schema tests are merged. |
| Session 3 — grounded retrieval/tools, argument validation, normal/failure docs | done | `agent-rag.ts`, allowlist validation, deterministic tools, API docs, and backend notes exist. |
| Session 4 — fallback, timeouts, safe errors, limits, logs, regression tests | done | Provider chain, 20s timeouts, rate limits, redaction, hashed IP logging, regression tests, and live safe 504 behavior are evidenced. |
| Session 5 — defend backend design and failure handling | missing | Human defense cannot be inferred from code or commits. |

#### AlBaraa — personal acceptance (`T01 ScholarLens!C37`)

| # | Criterion | Status | Real evidence |
|---|---|---|---|
| B1 | Valid input returns documented typed response | partial | Mocked route/service responses and Zod response schemas pass; no real provider success response was available. |
| B2 | Invalid/malformed input returns safe 4xx without provider | done | Route/schema tests cover malformed JSON and validation; Phase 1 live checks observed safe 400 responses before provider dispatch. |
| B3 | Provider secrets server-side and absent from client/history | done | Server-only `process.env` access, ignored env files, empty template, zero client-bundle pattern matches, and GitGuardian PR evidence. |
| B4 | Groq/Gemini fallback or documented safe provider failure demonstrated | done | Direct ask/compare/readiness calls retrieved real chunks, found both providers unconfigured, and returned safe 504 responses. |
| B5 | Grounding/tool arguments validated; deterministic logic separated | done | Manifest allowlist, Zod request schema, `agent-rag.ts`, `compare_papers()`, and `research_readiness()` with automated tests. |
| B6 | Normal, not-found, timeout/provider-error, and tool-failure tests | partial | Normal/filtering, not-found, provider-error, corpus-error, and tool tests exist; real timeout and provider-backed evaluation cases are not demonstrated. |
| B7 | Useful logs without secrets/unnecessary user data | done | Live logs use action, paper count, question length, hashed IP, retrieval metrics, and redacted errors; raw questions/keys are not logged. |
| B8 | Traceable answer/not-found and selected-paper comparison | partial | Three deterministic post-provider checks enforce source/title/snippet; provider-backed successful output is still missing. |

#### Mariam Ali / Doodiiii — session gates (`T01 ScholarLens!C49`)

| Gate | Status | Real evidence |
|---|---|---|
| Session 1 — baseline form/result and required states | partial | Merged `dev` has form, loading, result, and generic error components; validation/retry are incomplete. PR #1 has more states but is unmerged and lint-failing. |
| Session 2 — main workflow and validated structured output UI | partial | Ask/result components consume the typed ask shape; paper selection, comparison, readiness, and export are absent. |
| Session 3 — sources, tool progress/results, not-found/failure UX | missing | Evidence panel code exists, but no live provider success or tool-result UI exists. |
| Session 4 — accessibility, responsive behavior, production states | partial | Playwright verified labeled input, focusable controls, alert output, and usable 390×844/1440×900 layouts; retry and full workflow are missing. |
| Session 5 — live journey and interaction defense | missing | No complete demo or human defense evidence. |

#### Mariam Ali / Doodiiii — personal acceptance (`T01 ScholarLens!C50`)

| # | Criterion | Status | Real evidence |
|---|---|---|---|
| U1 | First-time user completes main workflow without explanation | missing | Current page only asks against hardcoded `paper-001`; compare/readiness/export cannot be reached. |
| U2 | Idle/loading/success/empty/validation/provider/retry states correct | partial | Loading, provider error, not-found/result rendering exist; current `dev` has no custom validation state or retry control, and success was unavailable. |
| U3 | Structured output rendered without arbitrary prose parsing | done | `ResultView` and `EvidencePanel` consume typed fields; no prose parser is used. |
| U4 | Evidence/source and tool results distinguishable from model explanation | partial | Evidence cards separate source fields; no comparison/readiness/tool surface exists. |
| U5 | Main flow works at mobile and desktop widths | partial | Playwright showed no overlap at 390×844 and 1440×900; full main flow is unavailable. |
| U6 | Labels, keyboard access, focus, understandable errors | partial | Label, native input/button keyboard behavior, focus ring, and alert are present; retry and explicit validation UX are missing. |
| U7 | No provider credential in client code | done | Source search and built-client scan found no provider key values/patterns. |
| U8 | Traceable answer/not-found; comparison only selected papers | partial | Ask result components support snippets/not-found, but successful rendering is unverified and comparison/selection UI is absent. |

#### Mariam Eladawy — session gates (`T01 ScholarLens!C62`)

| Gate | Status | Real evidence |
|---|---|---|
| Session 1 — approved sources, edge cases, deterministic action | done | Narrow Agentic RAG topic, source register, 12 cases, and two deterministic tools exist. |
| Session 2 — fields, criteria, trusted content, five core cases | done | Ten evidence fields, readiness thresholds, source register, and five normal cases exist. |
| Session 3 — bounded corpus, tool rules, traceability/not-found | partial | Six confirmed manifest papers and exact-snippet enforcement are active; evaluation/source docs still map to inactive IDs and provider-backed not-found is unverified. |
| Session 4 — 10-case evaluation, injection tests, source checks, production docs | partial | Twelve cases are defined, but mappings are stale, injection outcomes are not executable/provider-backed, and licence/URL checks remain open. |
| Session 5 — grounding/tool/evaluation defense | missing | Human defense evidence is absent. |

#### Mariam Eladawy — personal acceptance (`T01 ScholarLens!C63`)

| # | Criterion | Status | Real evidence |
|---|---|---|---|
| K1 | Bounded corpus/register with URL, access date, owner, intended use | partial | Register has 10 entries and summaries; active manifest has six, several URLs/licences are unresolved, and docs disagree about active approval. Issue #9. |
| K2 | Taxonomy and deterministic rules documented with examples | partial | Fields, question types, and thresholds exist; TODOs still request agreed examples and source docs use inactive-paper examples. |
| K3 | At least 10 cases across required categories | partial | JSON contains 12 cases across all named categories, but normal cases reference inactive 005/007/010 and are not an executable acceptance run. |
| K4 | Unsupported questions clarify/refuse/escalate without fabrication | partial | Prompt rules and no-chunk handling are safe; provider-backed unsupported/injection outcomes were not demonstrated. |
| K5 | Every AI-generated domain claim checked against original source | missing | Review docs assert validation but provide no claim-by-claim original-text evidence and contain active-corpus contradictions. |
| K6 | Tool success/failure behavior tested and evidenced | done | `tests/api/tools.test.ts` and regression tests cover normal, duplicates, empty evidence, short snippets, and deterministic repeatability. |
| K7 | Coverage gaps and prohibited uses documented | done | `docs/source-register.md` coverage gaps and `docs/known-limitations.md` prohibited uses. |
| K8 | Traceable answer/not-found; comparison only selected papers | partial | Backend filters and tools enforce this in code/tests; provider-backed success remains absent. |

#### Evaluation & Production — inherited Lead work (`T01 ScholarLens!C75`)

| Gate | Status | Real evidence |
|---|---|---|
| Session 1 — independent baseline, setup defects, smoke cases | partial | Acceptance matrix and detailed blockers exist; no fresh clean-environment run was performed in this audit. |
| Session 2 — structured-flow evidence and independent acceptance | partial | Automated route/schema/service tests exist; no provider-backed structured success. |
| Session 3 — retrieval/tool evaluation and not-found smoke | partial | Real retrieval and tool tests exist; stale source mappings and missing provider block full evaluation. |
| Session 4 — deployment smoke, observability, limitations, regression | missing | Known limitations/regression tests exist, but deployment smoke/observability evidence does not. |
| Session 5 — independent production evidence and release defense | missing | No production deployment, release sign-off, or defense. |

#### Evaluation & Production — personal acceptance (`T01 ScholarLens!C76`)

| # | Criterion | Status | Real evidence |
|---|---|---|---|
| E1 | Clean install/run from written instructions | partial | README, lockfile, `npm ci` CI step, and corpus setup exist; no fresh clean release environment was independently completed here. |
| E2 | Versioned matrix covers every mandatory feature/failure | partial | Matrix exists and was synchronized with implemented tests, but export/full UI/provider acceptance remain pending. |
| E3 | Dated local, preview, production smoke tests | missing | Dated local safe-error audit exists; preview/production do not. |
| E4 | Regression verifies request, structured output, grounding, tools | done | Eight Vitest files/82 tests passed, including route dispatch, schema, filtering, real-PDF retrieval, tools, and safe errors. |
| E5 | Deployment evidence has logs, URL, env checklist, screenshots | missing | No verified deployment or URL. |
| E6 | Latency/error observations and limitations honest | partial | Local retrieval metrics/errors and limitations are recorded; production observations are blank. |
| E7 | Final release independently checked against scoring rubric | done | This dated Phase 3 audit covers every rubric area below; it does not sign off a release. |
| E8 | Traceable answer/not-found; comparison only selected papers | partial | Automated trust boundary is strong; provider-backed and UI success paths are incomplete. |

#### `SCORING RUBRIC` audit (`SCORING RUBRIC!A5:E13`)

| Area | Points | Status | Evidence / blocker |
|---|---:|---|---|
| Functional completeness | 15 | missing | Mandatory paper library/selection, comparison UI, readiness UI, export, and provider-backed success are absent. |
| Architecture & integration | 15 | partial | Backend is modular and merged; frontend PR is unmerged/incompatible and the PDF is stale. |
| Reliability & test evidence | 15 | partial | 82 automated tests pass, but the 12-case provider evaluation is not executable/reconciled. |
| Security & safe AI behavior | 15 | done | Server validation, allowlists, rate limiting, redaction, exact-snippet checks, ignored secrets, safe errors, and client scan are evidenced. |
| Grounding, tools & AI correctness | 10 | partial | Real local retrieval and deterministic tools are tested; provider-backed claims/not-found/injection remain unverified. |
| Deployment & operations | 10 | missing | Only localhost is evidenced; preview/production URLs and smoke evidence are absent. |
| UX, accessibility & workflow | 10 | partial | Baseline is responsive/labeled with loading/error output; core workflow, retry, and tool surfaces are missing. |
| Documentation & integration | 5 | partial | Core docs and ownership exist and stale Markdown was corrected; source docs/PDF/identity still conflict with reality. |
| Individual defense | 5 | missing | Requires live human evidence; none was found. |

Architecture PDF visual review: page 1 labels the environment as Vercel production and
the grounding layer as Gemini File Search; page 2 repeats Gemini File Search and shows a
decision still open; page 3 requires selection, comparison, readiness/export, the
three-question/three-paper success test, and a public production URL. Those are useful
target diagrams but do not describe the current deployed state. The correction requires
Lead ownership and is tracked in issue #10; the source PDF was not silently rewritten.

### 2026-08-17 — Phase 3.2 engineering and documentation fixes

Pure engineering/infra gaps fixed on `codex/phase-2-3-audit`:

- Removed the unused `buildBaselineAnswer()` placeholder evidence path and its tests.
- Added route integration tests for compare dispatch, readiness dispatch, safe provider
  errors, and safe corpus errors.
- Extended CI with Python setup, reproducible `npm run fetch-corpus`, and `npm test`.
- Set the documented Next.js 16 `turbopack.root` to the repository working directory;
  the production build no longer emits the wrong-workspace-root warning.
- Removed unused Gemini File Search/Crossref variables from `.env.example`; only actual
  provider variables remain.
- Corrected `docs/architecture.md` to the Lead-approved local TF-IDF design.
- Documented the real GET health contract and 503/504 behavior in
  `docs/api-contracts.md`.
- Added the factual 2026-08-17 local safe-error observation to
  `docs/production-readiness.md`.
- Synchronized `tests/acceptance-matrix.md` statuses with real automated/live evidence.

All four required checks were then run from the beginning.

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

▲ Next.js 16.2.11 (Turbopack)

  Creating an optimized production build ...
✓ Compiled successfully in 4.7s
  Running TypeScript ...
  Finished TypeScript in 3.9s ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6)
  Generating static pages using 7 workers (2/6)
  Generating static pages using 7 workers (4/6)
✓ Generating static pages using 7 workers (6/6) in 964ms
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
   Start at  14:53:29
   Duration  1.44s (transform 962ms, setup 0ms, import 3.29s, tests 566ms, environment 1ms)
```

Post-build client scan output:

```text
CLIENT_BUNDLE_SECRET_PATTERN_MATCHES=0
```

### 2026-08-17 — Phase 3.3/3.4 owner escalations and reality sync

- Existing issue #5 remains the frontend owner record for retargeting/lint, paper
  selection, comparison/readiness, and export UI.
- Opened issue #9 and assigned `mariam-eladawy05`: reconcile inactive evaluation IDs,
  source/licence status, the active manifest, knowledge docs, and the missing one-page
  research rubric. No source was approved or remapped by Codex.
- Opened issue #10 and assigned `MohammedHssan11`: provide a real provider-backed
  three-question/three-paper success run, real preview/production evidence, architecture
  PDF reconciliation, ownership confirmation, release sign-off, and individual defense.
- Updated `docs/known-limitations.md` and
  `docs/Lead_Independent_Tasks_Checklist.md` to remove stale pre-merge claims and link
  every open owner-dependent gap to issues #5, #9, or #10.

No deployment URL, provider success, source approval, licence clearance, identity, metric,
release approval, or human defense was inferred or fabricated.

### 2026-08-17 — Phase 3.5 final escalation summary

**WHAT IS FIXED**

- PR #8's Lead-performed merge into `dev` is verified at
  `29c67342d171307b6f4791459c1b2cc411d0112d`.
- The merged backend now has no callable placeholder-answer path. Valid requests use real
  corpus retrieval and either return verified provider evidence or a safe error.
- Compare/readiness route dispatch and provider/corpus safe-error contracts have direct
  integration tests.
- CI now installs Python, fetches the six confirmed corpus papers, and runs Vitest in
  addition to lint, type-check, and build.
- Next.js uses the repository as its explicit Turbopack root; the prior build warning is
  gone.
- API, retrieval architecture, environment template, acceptance matrix, production
  observation, known limitations, and Lead checklist now describe the real state.
- Fresh local verification is clean: lint 0, TypeScript 0, build 0, Vitest 8/8 files and
  82/82 tests, plus zero provider-key pattern matches in the built client bundle.
- The complete workbook/PDF/rubric audit is recorded above, role by role and item by item.

**WHAT IS STILL OPEN**

- [Issue #5](https://github.com/MohammedHssan11/scholarlens/issues/5): PR #1 still
  targets `main`, still has two lint errors, hardcodes one paper, and has no
  comparison/readiness/export UI. It remains Doodiiii's work; no frontend file was edited.
- [Issue #9](https://github.com/MohammedHssan11/scholarlens/issues/9): the source
  register, knowledge docs, and evaluation cases must be reconciled with the six-paper
  active manifest; inactive IDs, licence/URL checks, and the missing one-page rubric need
  Mariam Eladawy's original-source judgment.
- [Issue #10](https://github.com/MohammedHssan11/scholarlens/issues/10): a real provider
  key, provider-backed three-question/three-paper run, verified preview/production URLs,
  deployment smoke evidence, corrected architecture PDF, release sign-off, and individual
  defenses are absent.
- Existing issue #4 is factually resolved by merged PR #8 but remains open on GitHub;
  issue #6 also remains open and should be reconciled by its owner against the current
  knowledge files and fresh checks.
- ScholarLens is **not production-ready**. The first-pilot success test did **not** pass:
  all five required direct actions retrieved real chunks but returned safe 504 errors
  because no provider was configured.

**WHAT NEEDS MOHAMMED HASSAN MAHMOUD'S DIRECT DECISION**

1. Confirm whether `Doodiiii` is Mariam Ali, a replacement member, or another contributor,
   then finalize ownership and defense expectations.
2. Decide and configure the non-committed provider/deployment environment, then supply only
   real preview/production URLs and observed smoke evidence.
3. Coordinate issue #9 with Mariam Eladawy; do not activate or remap a source without her
   verified original-source/licence review and Lead approval.
4. Review the Phase 3 audit PR and its remote checks, then make the merge decision. Codex
   will not merge it into `dev` or `main`.
5. Decide when the frontend, provider-backed journey, source reconciliation, release
   checklist, and human defenses are sufficient for an actual release candidate.
