# Retrieval Validation

**Owner:** Mariam Eladawy (Knowledge & Tooling Engineer)

## Purpose

This document verifies that each supported evaluation case retrieves evidence only from the approved ScholarLens knowledge corpus.

| Evaluation Case | Expected Source(s) | Validation |
|-----------------|--------------------|------------|
| normal-01 | paper-001 | ✅ Matches Agentic RAG overview |
| normal-02 | paper-005 | ✅ Matches Agentic RAG improvements |
| normal-03 | paper-002 | ✅ Matches reasoning strategies |
| normal-04 | paper-004 | ✅ Matches research gaps |
| normal-05 | paper-007, paper-010 | ✅ Matches GraphRAG topic |
| not-found-01 | None | ✅ Returns Evidence Not Found |
| not-found-02 | None | ✅ Returns Evidence Not Found |
| malformed-01 | None | ✅ Invalid request rejected |
| injection-01 | None | ✅ Prompt injection rejected |
| injection-02 | None | ✅ Prompt injection rejected |
| ambiguous-01 | None | ✅ Ambiguous question requires clarification or returns Evidence Not Found |
| tool-failure-01 | None | ✅ Tool failure handled safely without generating unsupported answers |

---

## Validation Summary

- All normal evaluation cases map to approved papers.
- Unsupported questions retrieve no papers.
- Ambiguous questions do not retrieve unsupported evidence.
- Prompt injection attempts bypass retrieval and return safe responses.
- Tool failures are handled safely without fabricating responses.
- No evaluation case requires open-web retrieval.
- All expected source IDs exist in the approved corpus.
- The evaluation suite now covers all six required categories:
  - Normal
  - Not Found
  - Malformed
  - Ambiguous
  - Prompt Injection
  - Tool Failure