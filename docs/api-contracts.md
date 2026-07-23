# API contracts

**Owner:** AlBaraa (AI & Backend Engineer) · frozen with the Lead in Session 2.

Everyone builds against this. Do not change it without telling the Lead.

## POST `/api/scholarlens`

### Request

```json
{
  "question": "What methods are used to measure X?",
  "paper_ids": ["paper-001", "paper-002"]
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `question` | string | yes | Non-empty |
| `paper_ids` | string[] | yes | Must come from the approved corpus |

### Response — 200

```json
{
  "question": "...",
  "not_found": false,
  "evidence": [
    {
      "question": "...",
      "source_id": "paper-001",
      "title": "...",
      "key_finding": "...",
      "evidence_snippet": "exact text taken from the paper",
      "agreement": "...",
      "disagreement": "...",
      "research_gap": "...",
      "limitation": "...",
      "confidence": "medium"
    }
  ]
}
```

### Response — no evidence

```json
{ "question": "...", "not_found": true, "evidence": [], "message": "No supporting evidence found in the approved papers." }
```

### Errors

| Status | When |
|---|---|
| 400 | Missing/invalid `question`, malformed JSON, unknown `paper_ids` |
| 504 | Provider timeout |
| 500 | Unexpected server error (message must be safe — never leak keys) |

**Rule:** invalid input must return 4xx **without calling the AI provider**.

## The 10 required fields

`question` · `source_id` · `title` · `key_finding` · `evidence_snippet` ·
`agreement` · `disagreement` · `research_gap` · `limitation` · `confidence`
