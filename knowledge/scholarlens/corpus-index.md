# ScholarLens Corpus Index

**Owner:** Mariam Eladawy (Knowledge & Tooling Engineer)

## Purpose

This index provides a high-level overview of the approved research corpus used by ScholarLens.

Each paper is assigned a unique identifier and a primary purpose to simplify evidence retrieval and backend integration.

| Source ID | Title | Primary Topic | Main Purpose |
|-----------|-------|---------------|--------------|
| paper-001 | Agentic Retrieval-Augmented Generation: A Survey on Agentic RAG | Agentic RAG Survey | General Agentic RAG concepts and architecture |
| paper-002 | Reasoning RAG via System 1 or System 2 | Reasoning Agentic RAG | Reasoning strategies and System 1 / System 2 workflows |
| paper-003 | Retrieval-Augmented Generation: A Comprehensive Survey of Architectures | RAG Survey | General RAG architecture and robustness |
| paper-004 | A Systematic Review of Key Retrieval-Augmented Generation (RAG) Systems | RAG Systematic Review | Research gaps and current limitations |
| paper-005 | Towards Agentic RAG with Deep Reasoning: A Survey of RAG-Reasoning Systems in LLMs | Agentic RAG and deep reasoning | Reasoning-enhanced RAG and agentic retrieval-reasoning workflows |
| paper-006 | CollEX -- A Multimodal Agentic RAG System Enabling Interactive Exploration of Scientific Collections | Multimodal Agentic RAG | Text-and-vision agent exploration of scientific collections |
| paper-007 | Open-Source Agentic Hybrid RAG Framework for Scientific Literature Review | Agentic hybrid RAG | Agent-directed GraphRAG/VectorRAG selection and uncertainty reporting |
| paper-008 | Ask in Any Modality: A Comprehensive Survey on Multimodal Retrieval-Augmented Generation | Multimodal RAG | Multimodal RAG background |
| paper-009 | Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks | Original RAG | Foundational RAG paper |
| paper-010 | From Local to Global: A Graph RAG Approach to Query-Focused Summarization | GraphRAG | Graph-based global query-focused summarization |

---

## Retrieval Priority

When multiple papers answer the same question:

1. Prefer the most specific Agentic RAG paper.
2. Use foundational RAG papers only for background.
3. Use GraphRAG papers only for graph-related questions.
4. Never retrieve papers outside the approved corpus.
