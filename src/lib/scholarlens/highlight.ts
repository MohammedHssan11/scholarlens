/**
 * Presentation-only helper: works out which words from the user's question
 * appear inside a verified quote, so the UI can show *why* a passage was a
 * match.
 *
 * IMPORTANT: this is a display aid, not part of retrieval or verification.
 * It never changes the snippet text — it only decides where to draw emphasis.
 * The tokenising rules deliberately mirror `agent-rag.ts` (drop stop words,
 * drop terms under 3 characters) so what the reader sees lines up with what
 * the retriever actually scored on. `agent-rag.ts` itself cannot be imported
 * here because it reads from the filesystem and is server-only.
 */

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "it", "as", "are", "was", "were",
  "be", "been", "being", "have", "has", "had", "do", "does", "did",
  "will", "would", "shall", "should", "may", "might", "must", "can",
  "could", "this", "that", "these", "those", "not", "no", "nor",
  "so", "if", "then", "than", "too", "very", "just", "about", "also",
  "into", "over", "after", "before", "between", "through", "during",
  "above", "below", "up", "down", "out", "off", "such", "only",
  "own", "same", "other", "each", "every", "all", "both", "few",
  "more", "most", "some", "any", "how", "what", "which", "who",
  "when", "where", "why", "here", "there",
]);

/** Extract the meaningful terms from a question, as the retriever would. */
export function queryTerms(question: string): string[] {
  return Array.from(
    new Set(
      question
        .toLocaleLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, " ")
        .trim()
        .split(" ")
        .filter((term) => term.length >= 3 && !STOP_WORDS.has(term)),
    ),
  );
}

export type TextPart = { text: string; match: boolean };

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Split `text` into ordered parts, flagging the ones that match a query term.
 * Concatenating every `part.text` always reproduces the original string.
 */
export function splitOnTerms(text: string, terms: string[]): TextPart[] {
  if (terms.length === 0 || text.length === 0) {
    return [{ text, match: false }];
  }

  // Longest first, so "retrieval" wins over "ret" when both are present.
  const pattern = [...terms]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|");

  let regex: RegExp;
  try {
    // Match whole words only, including plural/possessive-style suffixes.
    regex = new RegExp(`\\b(?:${pattern})\\w{0,3}\\b`, "giu");
  } catch {
    return [{ text, match: false }];
  }

  const parts: TextPart[] = [];
  let lastIndex = 0;

  for (const found of text.matchAll(regex)) {
    const start = found.index ?? 0;
    if (start > lastIndex) {
      parts.push({ text: text.slice(lastIndex, start), match: false });
    }
    parts.push({ text: found[0], match: true });
    lastIndex = start + found[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), match: false });
  }

  return parts.length > 0 ? parts : [{ text, match: false }];
}
