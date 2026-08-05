# Knowledge Review

**Owner:** Mariam Eladawy (Knowledge & Tooling Engineer)

## Purpose

This document records the validation of the initial trusted knowledge corpus used by ScholarLens. The review ensures that the approved sources, deterministic rules, and evaluation cases satisfy the project requirements before backend integration.

---

# Corpus Review

**Research domain**

- Agentic Retrieval-Augmented Generation (Agentic RAG)

**Corpus size**

- 10 approved research papers

**Review outcome**

- All papers have a unique `source_id`.
- All papers belong to the selected research domain.
- Coverage gaps have been documented.
- Evaluation cases reference only approved `source_id` values.
- No evaluation case depends on open-web retrieval.

**Corpus composition**

- 10 approved research papers
- 1 narrow research topic: Agentic Retrieval-Augmented Generation (Agentic RAG)
- Includes survey papers, systematic reviews, GraphRAG papers, multimodal RAG papers, and the foundational RAG paper.

---

# Evaluation Review

The evaluation suite currently contains:

- 5 normal retrieval cases
- 2 not-found cases
- 1 malformed input case
- 2 prompt injection cases

These cases verify:

- Retrieval from approved papers
- Unsupported question handling
- Invalid input handling
- Prompt injection resistance

---

## Deterministic Rule Review

The following deterministic rules have been defined and validated.

### Rule 1 — Minimum Approved Papers

**Rule**

Research answers must be supported using approved papers from the trusted corpus.

**Example**

Question:
> "How does Agentic RAG improve traditional RAG?"

Evidence:
- paper-001
- paper-005

Result:
The answer is considered valid because it references approved sources only.

---

### Rule 2 — Evidence Traceability

**Rule**

Every factual statement must be traceable to an exact evidence snippet from an approved paper.

**Example**

Claim:
> "Agentic RAG introduces autonomous planning."

Supporting evidence:
paper-001

Result:
The claim can be traced directly to the approved corpus.

---

### Rule 3 — Required Source Metadata

**Rule**

Every approved source must contain:

- source_id
- title
- author(s)
- publication year
- URL or DOI
- access date
- licence information

**Example**

paper-003 contains all required metadata.

Result:
Metadata validation passes.

---

### Rule 4 — Licence Verification

**Rule**

Only legally usable publications may become part of the trusted corpus.

**Example**

paper-001

Licence:
arXiv licence (verification required before distribution)

Result:
The paper may be used during development while licence verification remains tracked before production release.

---

# Coverage Limitations

The current knowledge corpus does not support:

- Questions outside the Agentic RAG domain
- Newly published papers outside the approved corpus
- Whole-web research
- Proprietary or confidential research
- Real-time information

Unsupported requests must return **Evidence Not Found** rather than generating unsupported answers.

---

# Outstanding Actions

Before production release:

- Verify author metadata for all approved papers.
- Verify publication URLs and DOI information where required.
- Verify licence information for each source.
- Obtain final approval from the Knowledge Lead.
- Replace placeholder metadata where applicable.

---

# Review Status

| Item | Status |
|------|--------|
| Domain taxonomy | ✅ Reviewed |
| Deterministic rules | ✅ Reviewed |
| Trusted corpus | ✅ Reviewed |
| Evaluation cases | ✅ Reviewed |
| Coverage gaps | ✅ Reviewed |
| Final metadata verification | ⏳ Pending |
| Knowledge Lead approval | ⏳ Pending |