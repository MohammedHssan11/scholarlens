/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  SCHOLARLENS — Section 5: Tests & Error Handling                   │
 * │  File: agent-rag.test.ts                                            │
 * │  Owner: AlBaraa (AI & Backend Engineer)                             │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * Unit tests for the AgentRAG retrieval layer.
 * Covers text normalization, TF-IDF scoring, chunking with overlap,
 * and security bounds (directory traversal).
 */
import { describe, it, expect } from "vitest";
import path from "node:path";
import { _testing, agentRag } from "../../src/lib/scholarlens/agent-rag";

const {
  normalise,
  queryTerms,
  isWithinCorpus,
  splitIntoChunks,
  computeTfIdfScore,
  buildIdfMap,
  corpusDirectory,
  CHUNK_SIZE,
  CHUNK_OVERLAP,
} = _testing;

describe("AgentRAG Text Processing", () => {
  it("normalises text correctly", () => {
    expect(normalise("Hello, World! 123")).toBe("hello world 123");
    expect(normalise("   Multiple    spaces\nand newlines  ")).toBe("multiple spaces and newlines");
  });

  it("extracts query terms without stop words", () => {
    const terms = queryTerms("What is the impact of AI on education?");
    // "what", "is", "the", "of", "on" are stop words. "ai" is < 3 chars (but let's check).
    // Wait, "ai" is 2 chars, so it's filtered.
    // "impact", "education" should remain.
    expect(terms).toContain("impact");
    expect(terms).toContain("education");
    expect(terms).not.toContain("the");
    expect(terms).not.toContain("what");
  });
});

describe("AgentRAG Path Security", () => {
  it("allows paths inside the corpus directory", () => {
    expect(isWithinCorpus(path.join(corpusDirectory, "paper-001.txt"))).toBe(true);
    expect(isWithinCorpus(path.join(corpusDirectory, "sub", "paper.txt"))).toBe(true);
  });

  it("rejects paths outside the corpus directory", () => {
    expect(isWithinCorpus(path.join(corpusDirectory, "..", "secret.txt"))).toBe(false);
    expect(isWithinCorpus("/etc/passwd")).toBe(false);
  });
});

describe("AgentRAG Chunking", () => {
  it("does not split short paragraphs", () => {
    const text = "This is a short paragraph.\n\nThis is another one.";
    const chunks = splitIntoChunks(text);
    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toBe("This is a short paragraph.");
  });

  it("splits long paragraphs with overlap", () => {
    const longText = "a".repeat(CHUNK_SIZE + 100);
    const chunks = splitIntoChunks(longText);
    expect(chunks.length).toBeGreaterThan(1);
    
    // First chunk should be exactly CHUNK_SIZE
    expect(chunks[0].length).toBe(CHUNK_SIZE);
    
    // Overlap check
    const step = CHUNK_SIZE - CHUNK_OVERLAP;
    expect(chunks[1]).toBe(longText.slice(step, step + CHUNK_SIZE));
  });
});

describe("AgentRAG TF-IDF Scoring", () => {
  it("computes correct IDF map", () => {
    const allChunkTerms = [
      ["apple", "banana", "cherry"],
      ["apple", "banana"],
      ["cherry", "date"],
    ];
    const query = ["apple", "cherry"];
    const idfMap = buildIdfMap(allChunkTerms, query);
    
    // 3 total docs. "apple" in 2 docs, "cherry" in 2 docs
    // log(3 / (1+2)) = log(1) = 0
    expect(idfMap.get("apple")).toBeCloseTo(0);
    expect(idfMap.get("cherry")).toBeCloseTo(0);
  });

  it("scores chunks appropriately based on term frequency", () => {
    const idfMap = new Map([
      ["rare", 2.0],
      ["common", 0.5],
    ]);
    
    const chunk1 = ["rare", "word", "word", "word"]; // 1/4 = 0.25 freq
    const chunk2 = ["common", "word", "word", "word"]; // 1/4 = 0.25 freq
    
    const score1 = computeTfIdfScore(chunk1, ["rare", "common"], idfMap);
    const score2 = computeTfIdfScore(chunk2, ["rare", "common"], idfMap);
    
    expect(score1).toBeGreaterThan(score2);
    expect(score1).toBeCloseTo(0.25 * 2.0); // 0.5
    expect(score2).toBeCloseTo(0.25 * 0.5); // 0.125
  });

  it("returns 0 score for chunks without query terms", () => {
    const idfMap = new Map([["test", 1.0]]);
    const score = computeTfIdfScore(["other", "words"], ["test"], idfMap);
    expect(score).toBe(0);
  });
});

describe("AgentRAG PDF Integration", () => {
  it("extracts non-empty retrieval chunks from a real corpus PDF", async () => {
    const result = await agentRag.retrieve(
      "What is agentic retrieval-augmented generation?",
      ["paper-001"],
    );

    expect(result.stats.papersSearched).toBe(1);
    expect(result.stats.totalChunksScanned).toBeGreaterThan(0);
    expect(result.chunks.length).toBeGreaterThan(0);
    expect(result.chunks.every((chunk) => chunk.text.trim().length > 0)).toBe(true);
  }, 15_000);
});
