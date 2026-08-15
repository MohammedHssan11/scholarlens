# ScholarLens Corpus Index

**Owner:** Mariam Eladawy (Knowledge & Tooling Engineer)

## Purpose

This index provides a high-level overview of the approved research corpus used by ScholarLens.

Each paper is assigned a unique identifier and a primary purpose to simplify evidence retrieval and backend integration.

| Source ID | Primary Topic | Main Purpose |
|-----------|---------------|--------------|
| paper-001 | Agentic RAG Survey | General Agentic RAG concepts and architecture |
| paper-002 | Reasoning Agentic RAG | Reasoning strategies and System 1 / System 2 workflows |
| paper-003 | RAG Survey | General RAG architecture and robustness |
| paper-004 | RAG Systematic Review | Research gaps and current limitations |
| paper-005 | Agentic RAG | Agentic workflow improvements |
| paper-006 | Multimodal Agentic RAG | Multimodal retrieval |
| paper-007 | Graph Agentic RAG | Graph-based retrieval |
| paper-008 | Multimodal RAG | Multimodal RAG background |
| paper-009 | Original RAG | Foundational RAG paper |
| paper-010 | GraphRAG | GraphRAG implementation and summarisation |

---

## Retrieval Priority

When multiple papers answer the same question:

1. Prefer the most specific Agentic RAG paper.
2. Use foundational RAG papers only for background.
3. Use GraphRAG papers only for graph-related questions.
4. Never retrieve papers outside the approved corpus.