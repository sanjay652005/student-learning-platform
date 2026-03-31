const Note = require('../models/Note');
const { generateEmbedding, cosineSimilarity } = require('../services/aiService');

const searchNotes = async (req, res, next) => {
  try {
    const { q, type = 'text' } = req.query;
    if (!q?.trim()) return res.status(400).json({ message: 'Search query is required' });

    // Build base access query
    const accessQuery = req.user
      ? { $or: [{ userId: req.user._id }, { visibility: 'public' }, { sharedWith: req.user._id }] }
      : { visibility: 'public' };

    let results = [];

    if (type === 'semantic') {
      // Semantic search using cosine similarity
      const queryEmbedding = generateEmbedding(q);
      const notes = await Note.find({ ...accessQuery, embeddings: { $exists: true, $not: { $size: 0 } } })
        .populate('userId', 'name email')
        .select('-chatHistory')
        .limit(100);

      results = notes
        .map(note => ({
          ...note.toObject(),
          score: cosineSimilarity(queryEmbedding, note.embeddings)
        }))
        .filter(n => n.score > 0.1)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);
    } else {
      // Text search
      results = await Note.find({
        ...accessQuery,
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { tags: { $in: [new RegExp(q, 'i')] } }
        ]
      })
        .populate('userId', 'name email')
        .select('-extractedText -embeddings -chatHistory')
        .sort({ createdAt: -1 })
        .limit(20);
    }

    res.json({ results, query: q, type, count: results.length });
  } catch (err) {
    next(err);
  }
};

module.exports = { searchNotes };
