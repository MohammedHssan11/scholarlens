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

# Deterministic Rule Review

The following deterministic rules have been defined:

- Minimum number of approved papers required for research readiness
- Minimum evidence snippet length
- Required metadata for approved sources
- Licence verification requirement before approval

These rules are deterministic and can be unit tested without relying on AI-generated responses.

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