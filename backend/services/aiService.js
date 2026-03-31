const fetch = require('node-fetch');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Best Groq models for each task:
// llama-3.3-70b-versatile  — best quality, used for summary/quiz
// llama-3.1-8b-instant     — fastest, used for tags
// llama-3.3-70b-versatile  — used for chat (good instruction following)
const MODELS = {
  default: 'llama-3.3-70b-versatile',
  fast:    'llama-3.1-8b-instant',
  chat:    'llama-3.3-70b-versatile',
};

// Core Groq API call — uses OpenAI-compatible /chat/completions format
async function callGroq(systemPrompt, userMessage, options = {}) {
  const {
    model = MODELS.default,
    maxTokens = 1024,
    temperature = 0.3,
    messages: extraMessages = [],
  } = options;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...extraMessages,
    { role: 'user', content: userMessage },
  ];

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const msg = error.error?.message || response.statusText;
    throw new Error(`Groq API error (${response.status}): ${msg}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Safely parse JSON from model output — strips markdown fences if present
function safeParseJSON(raw) {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  return JSON.parse(cleaned);
}

// ─── Generate summary ─────────────────────────────────────────────────────────
async function generateSummary(text) {
  const truncated = text.slice(0, 8000);

  const system = `You are an expert academic summarizer. 
You MUST respond with valid JSON only — no explanation, no markdown fences, no extra text.`;

  const prompt = `Analyze this text and return a JSON object with exactly these keys:
- "keyPoints": array of 5-7 key takeaways (strings)
- "concepts": array of 4-6 important concepts or terms (strings)
- "shortExplanation": a 2-3 sentence plain-language overview

Text:
${truncated}`;

  const raw = await callGroq(system, prompt, { maxTokens: 900, temperature: 0.2 });

  try {
    return safeParseJSON(raw);
  } catch {
    // Fallback: return partial data rather than crashing
    return {
      keyPoints: ['Summary could not be fully parsed'],
      concepts: [],
      shortExplanation: raw.slice(0, 400),
    };
  }
}

// ─── Generate tags ────────────────────────────────────────────────────────────
async function generateTags(text) {
  const truncated = text.slice(0, 3000);

  const system = `You are a content tagger. 
Respond with a JSON array of strings only — no explanation, no markdown.`;

  const prompt = `Generate 5-8 short, relevant tags for this content. 
Return ONLY a JSON array like: ["tag1", "tag2", "tag3"]

Text:
${truncated}`;

  const raw = await callGroq(system, prompt, { model: MODELS.fast, maxTokens: 150, temperature: 0.2 });

  try {
    const parsed = safeParseJSON(raw);
    return Array.isArray(parsed) ? parsed : (parsed.tags || ['general']);
  } catch {
    return ['general', 'notes'];
  }
}

// ─── Generate quiz ────────────────────────────────────────────────────────────
async function generateQuiz(text) {
  const truncated = text.slice(0, 6000);

  const system = `You are an expert quiz creator for students. 
You MUST respond with valid JSON only — no explanation, no markdown fences, no extra text.`;

  const prompt = `Create a quiz based on the content below. Return a JSON object with exactly:
- "mcq": array of exactly 5 objects, each with:
    "question" (string),
    "options" (array of exactly 4 strings),
    "correctAnswer" (integer 0-3, index of correct option),
    "explanation" (1-2 sentence explanation of why it's correct)
- "shortAnswer": array of exactly 3 objects, each with:
    "question" (string),
    "answer" (string, 1-3 sentences)

Content:
${truncated}`;

  const raw = await callGroq(system, prompt, { maxTokens: 2000, temperature: 0.4 });

  try {
    const parsed = safeParseJSON(raw);
    // Validate structure minimally
    if (!parsed.mcq || !parsed.shortAnswer) throw new Error('Missing quiz fields');
    return parsed;
  } catch {
    return { mcq: [], shortAnswer: [], error: 'Failed to generate quiz — try again' };
  }
}

// ─── Chat with note ───────────────────────────────────────────────────────────
async function chatWithNote(noteText, question, chatHistory = []) {
  const truncated = noteText.slice(0, 6000);

  const system = `You are a helpful academic tutor. 
Answer questions using ONLY the note content provided below.
If the answer is not in the notes, say clearly: "I couldn't find that in the notes."
Be concise, clear, and educational. Do not make things up.

--- NOTE CONTENT ---
${truncated}
--- END NOTE ---`;

  // Include recent chat history for conversational context
  const historyMessages = chatHistory
    .slice(-8) // last 4 exchanges
    .map(msg => ({ role: msg.role, content: msg.content }));

  const raw = await callGroq(system, question, {
    model: MODELS.chat,
    maxTokens: 800,
    temperature: 0.5,
    messages: historyMessages,
  });

  return raw;
}

// ─── Embeddings (local, no API call needed) ───────────────────────────────────
// Uses TF-IDF-like word frequency vectors for semantic search
function generateEmbedding(text) {
  const normalized = text.toLowerCase().slice(0, 5000);
  const words = normalized.split(/\s+/).filter(w => w.length > 2);
  const freq = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });

  const totalWords = words.length || 1;
  const topWords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100)
    .map(([, count]) => count / totalWords);

  while (topWords.length < 100) topWords.push(0);
  return topWords;
}

// Cosine similarity between two embedding vectors
function cosineSimilarity(vecA, vecB) {
  if (!vecA?.length || !vecB?.length) return 0;
  const len = Math.min(vecA.length, vecB.length);
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < len; i++) {
    dot   += vecA[i] * vecB[i];
    normA += vecA[i] ** 2;
    normB += vecB[i] ** 2;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

module.exports = {
  generateSummary,
  generateTags,
  generateQuiz,
  chatWithNote,
  generateEmbedding,
  cosineSimilarity,
};
