/**
 * AI Service Unit Tests
 * Tests logic that doesn't require the Anthropic API
 */

const { generateEmbedding, cosineSimilarity } = require('../services/aiService');

describe('generateEmbedding', () => {
  it('returns an array', () => {
    const result = generateEmbedding('hello world this is a test');
    expect(Array.isArray(result)).toBe(true);
  });

  it('returns array of numbers', () => {
    const result = generateEmbedding('machine learning algorithms');
    expect(result.every(n => typeof n === 'number')).toBe(true);
  });

  it('handles empty string gracefully', () => {
    const result = generateEmbedding('');
    expect(Array.isArray(result)).toBe(true);
  });

  it('handles very long text without throwing', () => {
    const long = 'word '.repeat(5000);
    expect(() => generateEmbedding(long)).not.toThrow();
  });

  it('produces different embeddings for different texts', () => {
    const a = generateEmbedding('machine learning neural networks deep learning');
    const b = generateEmbedding('history of ancient rome julius caesar empire');
    // They shouldn't be identical
    const identical = a.every((v, i) => v === b[i]);
    expect(identical).toBe(false);
  });
});

describe('cosineSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    const v = [1, 2, 3, 4, 5];
    expect(cosineSimilarity(v, v)).toBeCloseTo(1, 5);
  });

  it('returns 0 for orthogonal vectors', () => {
    const a = [1, 0, 0];
    const b = [0, 1, 0];
    expect(cosineSimilarity(a, b)).toBeCloseTo(0, 5);
  });

  it('returns 0 for zero vectors', () => {
    const a = [0, 0, 0];
    const b = [1, 2, 3];
    expect(cosineSimilarity(a, b)).toBe(0);
  });

  it('returns value between 0 and 1 for similar text embeddings', () => {
    const a = generateEmbedding('machine learning artificial intelligence');
    const b = generateEmbedding('deep learning AI neural networks');
    const sim = cosineSimilarity(a, b);
    expect(sim).toBeGreaterThanOrEqual(0);
    expect(sim).toBeLessThanOrEqual(1);
  });

  it('similar texts score higher than dissimilar texts', () => {
    const base  = generateEmbedding('photosynthesis chlorophyll plants sunlight glucose');
    const close = generateEmbedding('photosynthesis process plants light energy');
    const far   = generateEmbedding('stock market trading investment portfolio bonds');
    const simClose = cosineSimilarity(base, close);
    const simFar   = cosineSimilarity(base, far);
    expect(simClose).toBeGreaterThan(simFar);
  });

  it('handles null/undefined gracefully', () => {
    expect(cosineSimilarity(null, [1, 2, 3])).toBe(0);
    expect(cosineSimilarity([1, 2, 3], undefined)).toBe(0);
    expect(cosineSimilarity(null, null)).toBe(0);
  });

  it('handles vectors of different lengths', () => {
    const a = [1, 2, 3];
    const b = [1, 2, 3, 4, 5];
    expect(() => cosineSimilarity(a, b)).not.toThrow();
    const result = cosineSimilarity(a, b);
    expect(typeof result).toBe('number');
  });
});

describe('Semantic search accuracy (integration-style)', () => {
  it('embedding similarity respects topic boundaries', () => {
    const biology  = generateEmbedding('cell mitosis division DNA RNA protein synthesis');
    const calculus = generateEmbedding('derivatives integrals limits functions calculus');
    const moreBio  = generateEmbedding('cells chromosomes genes genetics biology organism');

    const bioToBio  = cosineSimilarity(biology, moreBio);
    const bioToMath = cosineSimilarity(biology, calculus);

    // Biology texts should be more similar to each other than to calculus
    expect(bioToBio).toBeGreaterThan(bioToMath);
  });
});
