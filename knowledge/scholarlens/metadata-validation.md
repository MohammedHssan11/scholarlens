# Metadata Validation

**Owner:** Mariam Eladawy (Knowledge & Tooling Engineer)

## Purpose

This document verifies that every approved source contains the required metadata before it can be used by ScholarLens.

## Required Metadata

The following fields are required according to `tool-rules.ts`:

- source_id
- title
- author_or_org
- year
- url / DOI
- accessed
- licence / usage

---

## Validation Results

| Metadata Field | Status | Notes |
|----------------|--------|-------|
| source_id | ✅ Complete | All papers have unique identifiers. |
| title | ✅ Complete | Every paper has a recorded title. |
| author_or_org | ⚠️ Partial | Some survey papers still require author verification. |
| year | ✅ Complete | Publication year recorded for every paper. |
| url / DOI | ⚠️ Partial | Some publisher URLs or DOIs still need verification. |
| accessed | ✅ Complete | Access dates recorded. |
| licence / usage | ⚠️ Partial | Licence information must be confirmed before production use. |

---

## Overall Status

The metadata is sufficient for prototype development.

Before production release:

- Verify missing author information.
- Replace placeholder publication URLs with official DOI links.
- Confirm licence information for every approved paper.
- Obtain final approval from the Knowledge Lead.