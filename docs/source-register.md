# Source register — approved papers

**Owner:** Mariam Eladawy (Knowledge & Tooling Engineer)

**Target:** 8–15 approved papers from ONE narrow research topic, plus a one-page research rubric.

> Only papers listed and approved in this register may be used by the ScholarLens prototype.
> No whole-web retrieval, unpublished work, or confidential documents are permitted.

## Chosen research topic

**Agentic Retrieval-Augmented Generation (Agentic RAG)**

The following papers form the initial trusted knowledge corpus for ScholarLens. During the prototype phase, all evidence retrieval, paper comparison, and research synthesis must use only these approved sources.

| source_id | Title | Author / Organisation | Year | URL / DOI | Accessed | Licence / Usage | Approved by |
|-----------|-------|-----------------------|------|-----------|-----------|-----------------|-------------|
| paper-001 | Agentic Retrieval-Augmented Generation: A Survey on Agentic RAG | **Aditi Singh et al.** | 2025 | arXiv:2501.09136 | 28 Jul 2026 | arXiv licence (verification required before distribution) | Mohammed Hassan Mahmoud |
| paper-002 | Reasoning RAG via System 1 or System 2: A Survey on Reasoning Agentic Retrieval-Augmented Generation for Industry Challenges | **Jintao Liang et al.** | 2025 | arXiv:2506.10408 | 28 Jul 2026 | arXiv licence (verification required before distribution) | Mohammed Hassan Mahmoud |
| paper-003 | Retrieval-Augmented Generation: A Comprehensive Survey of Architectures, Enhancements, and Robustness Frontiers | **Chaitanya Sharma** | 2025 | arXiv:2506.00054 | 28 Jul 2026 | arXiv licence (verification required before distribution) | Mohammed Hassan Mahmoud |
| paper-004 | A Systematic Review of Key Retrieval-Augmented Generation (RAG) Systems: Progress, Gaps, and Future Directions | **Agada Joseph Oche et al.** | 2025 | arXiv:2507.18910 | 28 Jul 2026 | arXiv licence (verification required before distribution) | Mohammed Hassan Mahmoud |
| paper-005 | Towards Agentic RAG with Deep Reasoning: A Survey of RAG-Reasoning Systems in LLMs | **Yangning Li et al.** | 2025 | arXiv:2507.09477 | 18 Aug 2026 | Licence verification pending | Mohammed Hassan Mahmoud |
| paper-006 | CollEX -- A Multimodal Agentic RAG System Enabling Interactive Exploration of Scientific Collections | **Florian Schneider, Narges Baba Ahmadi, Niloufar Baba Ahmadi, Iris Vogel, Martin Semmann & Chris Biemann** | 2025 | arXiv:2504.07643 | 18 Aug 2026 | Licence verification pending | Mohammed Hassan Mahmoud |
| paper-007 | Open-Source Agentic Hybrid RAG Framework for Scientific Literature Review | **Aditya Nagori, Ricardo Accorsi Casonatto, Ayush Gautam, Abhinav Manikantha Sai Cheruvu & Rishikesan Kamaleswaran** | 2025 | arXiv:2508.05660 | 18 Aug 2026 | Licence verification pending | Mohammed Hassan Mahmoud |
| paper-008 | Ask in Any Modality: A Comprehensive Survey on Multimodal Retrieval-Augmented Generation | **Mohammad Mahdi Abootorabi et al.** | 2025 | arXiv:2502.08826 | 28 Jul 2026 | arXiv licence (verification required before distribution) | Mohammed Hassan Mahmoud |
| paper-009 | Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks | **Patrick Lewis et al.** | 2020 | arXiv:2005.11401 | 28 Jul 2026 | arXiv licence (verification required before distribution) | Mohammed Hassan Mahmoud |
| paper-010 | From Local to Global: A Graph RAG Approach to Query-Focused Summarization | **Darren Edge et al.** | 2024 | arXiv:2404.16130 | 18 Aug 2026 | Licence verification pending | Mohammed Hassan Mahmoud |

---

## Rules for including a source

A source may only be included if:

1. It is publicly published and legally usable.
2. The author(s), publication year, and publication venue are known or can be verified.
3. It falls within the approved research topic: **Agentic Retrieval-Augmented Generation (Agentic RAG)**.
4. Every extracted claim can be traced back to an exact evidence snippet from the original source.

---

## Known coverage gaps

The current corpus does not cover:

- Questions outside the Agentic RAG research domain.
- Research published after this corpus was created.
- Papers not included in the approved corpus, even if they discuss Agentic RAG.
- Proprietary, confidential, or unpublished research.
- Real-time information, news, or whole-web search results.

---

## Source summaries

### paper-001

**Primary contribution:** Provides a comprehensive survey of Agentic RAG architectures, workflows, components, challenges, and future research directions.

**Intended use:** Primary reference for Agentic RAG definitions, terminology, architecture, and high-level comparisons.

---

### paper-002

**Primary contribution:** Reviews reasoning-based Agentic RAG systems, including System 1 and System 2 reasoning strategies and their industrial applications.

**Intended use:** Reference for reasoning mechanisms, planning strategies, and decision-making workflows.

---

### paper-003

**Primary contribution:** Surveys Retrieval-Augmented Generation architectures, enhancement methods, and robustness challenges.

**Intended use:** Background reference for traditional RAG architecture and retrieval techniques.

---

### paper-004

**Primary contribution:** Identifies current progress, limitations, open challenges, and research gaps across RAG systems.

**Intended use:** Primary reference for research-gap analysis and limitation-related questions.

---

### paper-005

**Primary contribution:** Surveys reasoning-enhanced RAG, RAG-enhanced reasoning, and agentic systems that interleave retrieval with multi-step reasoning.

**Intended use:** Reference for deep-reasoning workflows and the interaction between retrieval and agentic reasoning.

---

### paper-006

**Primary contribution:** Presents CollEX, a multimodal Agentic RAG system that uses vision-language agents and tools to explore scientific collections.

**Intended use:** Reference for multimodal Agentic RAG interfaces, agent specialization, and scientific-collection exploration.

---

### paper-007

**Primary contribution:** Presents an autonomous hybrid RAG framework that selects between GraphRAG and VectorRAG and reports uncertainty for scientific literature review.

**Intended use:** Reference for agent-controlled hybrid retrieval, GraphRAG/VectorRAG routing, and uncertainty-aware research workflows.

---

### paper-008

**Primary contribution:** Surveys multimodal Retrieval-Augmented Generation across multiple input modalities.

**Intended use:** Supporting reference for multimodal retrieval techniques.

---

### paper-009

**Primary contribution:** Introduces the original Retrieval-Augmented Generation framework for knowledge-intensive NLP tasks.

**Intended use:** Foundational reference for explaining traditional RAG and comparing it with Agentic RAG.

---

### paper-010

**Primary contribution:** Presents GraphRAG for global query-focused summarization using an entity graph, community detection, and community summaries.

**Intended use:** Reference for GraphRAG workflows and comparisons with Agentic RAG.

---

## Corpus validation checklist

- ✅ Research topic is narrowly defined.
- ✅ Initial corpus contains 10 trusted references.
- ✅ Every source has a unique `source_id`.
- ✅ Coverage gaps are documented.
- ✅ Evaluation test cases reference approved `source_id` values only (the 12-case suite has not yet been formally re-run against the replacement contents for 005–007 and 010).
- ✅ Author metadata fully verified.
- ⏳ Licence/distribution verification remains open; no sign-off is claimed.
- ✅ Final knowledge corpus approved by the project lead.

**Review status:** Topic and sources approved by **Mohammed Hassan Mahmoud**. On 18 Aug 2026, the Phase 4 replacement rows **005–007** and **010** were verified against arXiv's public API and real fetchable PDF text. Their licence status is not determined here; distribution verification remains open before production release.
