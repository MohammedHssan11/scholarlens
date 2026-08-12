import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

// ─── Corpus Manifest Schema ─────────────────────────────────────────────────

const CorpusPaperSchema = z.object({
  source_id: z.string().regex(/^paper-\d{3}$/),
  title: z.string().min(1),
  content_path: z.string().min(1),
});

const CorpusManifestSchema = z.object({
  version: z.number().int().positive(),
  papers: z.array(CorpusPaperSchema),
});

export type CorpusPaper = z.infer<typeof CorpusPaperSchema>;

// ─── Retrieved Chunk ─────────────────────────────────────────────────────────

export interface RetrievedChunk {
  source_id: string;
  title: string;
  text: string;
  score: number;
}

// ─── Errors ──────────────────────────────────────────────────────────────────

export class CorpusUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CorpusUnavailableError";
  }
}

// ─── Constants ───────────────────────────────────────────────────────────────

const corpusDirectory = path.join(process.cwd(), "data", "corpus");
const manifestPath = path.join(corpusDirectory, "manifest.json");

/** Maximum chunks returned per retrieval call. */
const MAX_CHUNKS = 8;

/** Target size for each text chunk in characters. */
const CHUNK_SIZE = 1_600;

/**
 * Overlap between consecutive chunks in characters.
 * Prevents key sentences from being split across chunk boundaries.
 */
const CHUNK_OVERLAP = 200;

/**
 * Minimum TF-IDF score a chunk must reach to be considered relevant.
 * Filters out noise from low-relevance matches.
 */
const MIN_SCORE_THRESHOLD = 0.01;

/**
 * Common English stop words excluded from TF-IDF scoring.
 * These words appear in virtually every document and carry no
 * discriminative value for retrieval ranking.
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

// ─── Text Processing ─────────────────────────────────────────────────────────

/**
 * Normalise text for search: lowercase, strip non-alphanumeric, collapse whitespace.
 */
function normalise(text: string): string {
  return text.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

/**
 * Extract meaningful query terms, removing stop words and short tokens.
 */
function queryTerms(question: string): string[] {
  return Array.from(
    new Set(
      normalise(question)
        .split(" ")
        .filter((term) => term.length >= 3 && !STOP_WORDS.has(term)),
    ),
  );
}

/**
 * Path traversal guard: ensure the resolved file stays inside the corpus directory.
 */
function isWithinCorpus(filePath: string): boolean {
  const relative = path.relative(corpusDirectory, filePath);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

// ─── Manifest Loading ────────────────────────────────────────────────────────

async function loadManifest(): Promise<CorpusPaper[]> {
  let raw: string;
  try {
    raw = await readFile(manifestPath, "utf8");
  } catch {
    throw new CorpusUnavailableError("The approved corpus manifest is missing.");
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new CorpusUnavailableError("The approved corpus manifest is invalid JSON.");
  }

  const parsed = CorpusManifestSchema.safeParse(json);
  if (!parsed.success) {
    throw new CorpusUnavailableError(
      `The approved corpus manifest failed validation: ${parsed.error.message}`,
    );
  }
  return parsed.data.papers;
}

// ─── Chunking ────────────────────────────────────────────────────────────────

/**
 * Split text into overlapping chunks.
 *
 * Strategy:
 *   1. Split on double-newline (paragraph boundaries).
 *   2. Short paragraphs become a single chunk.
 *   3. Long paragraphs are split at CHUNK_SIZE with CHUNK_OVERLAP overlap.
 *
 * The overlap prevents key sentences at chunk boundaries from being lost.
 */
function splitIntoChunks(text: string): string[] {
  const paragraphs = text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  const chunks: string[] = [];

  for (const paragraph of paragraphs) {
    if (paragraph.length <= CHUNK_SIZE) {
      chunks.push(paragraph);
    } else {
      const step = CHUNK_SIZE - CHUNK_OVERLAP;
      for (let start = 0; start < paragraph.length; start += step) {
        chunks.push(paragraph.slice(start, start + CHUNK_SIZE));
      }
    }
  }
  return chunks;
}

// ─── TF-IDF Scoring ──────────────────────────────────────────────────────────

/**
 * Compute TF-IDF score for a chunk given query terms and corpus-level IDF.
 *
 * TF  = (count of term in chunk) / (total terms in chunk)
 * IDF = log(totalChunks / chunksContainingTerm)
 *
 * This weights rare, discriminative terms higher than common ones,
 * producing significantly better retrieval than raw term counting.
 */
function computeTfIdfScore(
  chunkTerms: string[],
  queryTermList: string[],
  idfMap: Map<string, number>,
): number {
  if (chunkTerms.length === 0) return 0;

  let score = 0;
  for (const term of queryTermList) {
    const termFreq = chunkTerms.filter((t) => t === term).length / chunkTerms.length;
    const idf = idfMap.get(term) ?? 0;
    score += termFreq * idf;
  }
  return score;
}

/**
 * Build an IDF map from all corpus chunks for the given query terms.
 *
 * IDF(term) = log(totalChunks / (1 + chunksContainingTerm))
 * The +1 smoothing prevents division by zero.
 */
function buildIdfMap(
  allChunkTerms: string[][],
  queryTermList: string[],
): Map<string, number> {
  const totalChunks = allChunkTerms.length;
  const idfMap = new Map<string, number>();

  for (const term of queryTermList) {
    const docsWithTerm = allChunkTerms.filter((terms) => terms.includes(term)).length;
    idfMap.set(term, Math.log(totalChunks / (1 + docsWithTerm)));
  }
  return idfMap;
}

// ─── Retrieval Statistics ────────────────────────────────────────────────────

export interface RetrievalStats {
  papersSearched: number;
  totalChunksScanned: number;
  chunksAboveThreshold: number;
  chunksReturned: number;
  topScore: number;
  queryTermCount: number;
  durationMs: number;
}

// ─── AgentRAG ────────────────────────────────────────────────────────────────

/**
 * ScholarLens' AgentRAG retrieval layer.
 *
 * It runs TF-IDF keyword search to find candidate passages, then returns
 * only original text chunks from the approved corpus. No web content or
 * model knowledge can enter the evidence context.
 *
 * Enhancement over baseline:
 *   - TF-IDF scoring (rare terms weighted higher)
 *   - Chunk overlap (no lost boundary sentences)
 *   - Minimum score threshold (filters noise)
 *   - Structured retrieval stats for logging
 */
export class AgentRAG {
  /**
   * Return all approved paper IDs from the corpus manifest.
   */
  async getApprovedPaperIds(): Promise<string[]> {
    return (await loadManifest()).map((paper) => paper.source_id);
  }

  /**
   * Return metadata for the requested paper IDs.
   */
  async getPaperMetadata(sourceIds: string[]): Promise<Map<string, CorpusPaper>> {
    const requested = new Set(sourceIds);
    return new Map(
      (await loadManifest())
        .filter((paper) => requested.has(paper.source_id))
        .map((paper) => [paper.source_id, paper]),
    );
  }

  /**
   * Retrieve the most relevant text chunks from the approved corpus.
   *
   * @param question  - The user's research question.
   * @param sourceIds - Paper IDs to search within (must be approved).
   * @returns Ranked chunks with TF-IDF scores and retrieval stats.
   */
  async retrieve(
    question: string,
    sourceIds: string[],
  ): Promise<{ chunks: RetrievedChunk[]; stats: RetrievalStats }> {
    const startTime = Date.now();

    const selected = new Set(sourceIds);
    const papers = (await loadManifest()).filter((paper) => selected.has(paper.source_id));
    if (papers.length === 0) {
      throw new CorpusUnavailableError("No selected approved papers are available in the corpus.");
    }

    const terms = queryTerms(question);

    // Phase 1: Load and chunk all selected papers
    const allChunksWithMeta: { source_id: string; title: string; text: string; terms: string[] }[] = [];

    for (const paper of papers) {
      const documentPath = path.resolve(corpusDirectory, paper.content_path);
      if (!isWithinCorpus(documentPath)) {
        throw new CorpusUnavailableError(`Corpus entry ${paper.source_id} has an unsafe content path.`);
      }

      let text: string;
      try {
        if (paper.content_path.toLowerCase().endsWith(".pdf")) {
          const buffer = await readFile(documentPath);
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const pdfParse = require("pdf-parse");
          const pdfData = await pdfParse(buffer);
          text = pdfData.text;
        } else {
          text = await readFile(documentPath, "utf8");
        }
      } catch (err) {
        console.error(`[AgentRAG] Error reading ${paper.source_id}:`, err);
        throw new CorpusUnavailableError(`Corpus text for ${paper.source_id} is unavailable.`);
      }

      for (const chunk of splitIntoChunks(text)) {
        const chunkTerms = normalise(chunk).split(" ").filter((t) => t.length >= 3 && !STOP_WORDS.has(t));
        allChunksWithMeta.push({
          source_id: paper.source_id,
          title: paper.title,
          text: chunk,
          terms: chunkTerms,
        });
      }
    }

    // Handle case where no readable papers were found
    if (allChunksWithMeta.length === 0) {
      return {
        chunks: [],
        stats: {
          papersSearched: papers.length,
          totalChunksScanned: 0,
          chunksAboveThreshold: 0,
          chunksReturned: 0,
          topScore: 0,
          queryTermCount: terms.length,
          durationMs: Date.now() - startTime,
        },
      };
    }

    // Phase 2: Build IDF map across all chunks
    const allTermArrays = allChunksWithMeta.map((c) => c.terms);
    const idfMap = buildIdfMap(allTermArrays, terms);

    // Phase 3: Score each chunk with TF-IDF
    const candidates: RetrievedChunk[] = [];
    for (const chunk of allChunksWithMeta) {
      const score = computeTfIdfScore(chunk.terms, terms, idfMap);
      if (score >= MIN_SCORE_THRESHOLD) {
        candidates.push({
          source_id: chunk.source_id,
          title: chunk.title,
          text: chunk.text,
          score,
        });
      }
    }

    // Phase 4: Rank and return top chunks
    const ranked = candidates.sort((a, b) => b.score - a.score).slice(0, MAX_CHUNKS);

    const stats: RetrievalStats = {
      papersSearched: papers.length,
      totalChunksScanned: allChunksWithMeta.length,
      chunksAboveThreshold: candidates.length,
      chunksReturned: ranked.length,
      topScore: ranked.length > 0 ? ranked[0].score : 0,
      queryTermCount: terms.length,
      durationMs: Date.now() - startTime,
    };

    console.log(
      `[AgentRAG] Retrieval: ${stats.papersSearched} papers, ` +
      `${stats.totalChunksScanned} chunks scanned, ` +
      `${stats.chunksAboveThreshold} above threshold, ` +
      `${stats.chunksReturned} returned, ` +
      `top=${stats.topScore.toFixed(4)}, ` +
      `${stats.durationMs}ms`,
    );

    return { chunks: ranked, stats };
  }
}

export const agentRag = new AgentRAG();

// ─── Exported for testing ────────────────────────────────────────────────────

export const _testing = {
  normalise,
  queryTerms,
  isWithinCorpus,
  splitIntoChunks,
  computeTfIdfScore,
  buildIdfMap,
  loadManifest,
  corpusDirectory,
  STOP_WORDS,
  MIN_SCORE_THRESHOLD,
  CHUNK_SIZE,
  CHUNK_OVERLAP,
  MAX_CHUNKS,
};
