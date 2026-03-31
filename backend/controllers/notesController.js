const path = require('path');
const Note = require('../models/Note');
const { upload, extractText } = require('../utils/fileUpload');
const {
  generateSummary, generateTags, generateQuiz,
  chatWithNote, generateEmbedding
} = require('../services/aiService');

// Upload a new note
const uploadNote = async (req, res, next) => {
  try {
    const { title, description, visibility } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    let extractedText = req.body.textContent || '';
    let fileUrl = null;
    let fileName = null;
    let fileType = null;

    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      fileName = req.file.originalname;
      fileType = req.file.mimetype;
      extractedText = await extractText(req.file.path, req.file.mimetype);
    }

    // Generate tags and embeddings in background
    let tags = [];
    let embeddings = [];
    if (extractedText) {
      try {
        tags = await generateTags(extractedText);
        embeddings = generateEmbedding(extractedText);
      } catch (err) {
        console.error('AI tag/embedding error:', err);
      }
    }

    const note = await Note.create({
      title,
      description,
      fileUrl,
      fileName,
      fileType,
      extractedText,
      tags,
      embeddings,
      userId: req.user._id,
      visibility: visibility || 'private'
    });

    res.status(201).json({ message: 'Note created successfully', note });
  } catch (err) {
    next(err);
  }
};

// Get all accessible notes for user
const getNotes = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, filter = 'all' } = req.query;
    const skip = (page - 1) * limit;
    let query = {};

    if (req.user) {
      if (filter === 'mine') {
        query = { userId: req.user._id };
      } else if (filter === 'public') {
        query = { visibility: 'public' };
      } else {
        // All accessible: own + public + shared
        query = {
          $or: [
            { userId: req.user._id },
            { visibility: 'public' },
            { sharedWith: req.user._id }
          ]
        };
      }
    } else {
      query = { visibility: 'public' };
    }

    const [notes, total] = await Promise.all([
      Note.find(query)
        .populate('userId', 'name email')
        .select('-extractedText -embeddings -chatHistory')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Note.countDocuments(query)
    ]);

    // Attach isBookmarked and isOwner per note for the requesting user
    const userId = req.user?._id?.toString();
    const enriched = notes.map(note => {
      const obj = note.toObject();
      obj.isBookmarked = userId ? note.bookmarkedBy.some(id => id.toString() === userId) : false;
      obj.isOwner = userId ? note.userId._id.toString() === userId : false;
      return obj;
    });

    res.json({ notes: enriched, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// Get single note
const getNote = async (req, res, next) => {
  try {
    const note = req.note;
    note.viewCount += 1;
    await note.save();

    const isBookmarked = req.user ? note.bookmarkedBy.includes(req.user._id) : false;

    res.json({
      note: {
        ...note.toObject(),
        isOwner: req.isOwner,
        isBookmarked
      }
    });
  } catch (err) {
    next(err);
  }
};

// Update note
const updateNote = async (req, res, next) => {
  try {
    const { title, description, visibility } = req.body;
    const note = req.note;

    if (title) note.title = title;
    if (description !== undefined) note.description = description;
    if (visibility) note.visibility = visibility;

    await note.save();
    res.json({ message: 'Note updated', note });
  } catch (err) {
    next(err);
  }
};

// Delete note
const deleteNote = async (req, res, next) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Generate AI summary
const generateNoteSummary = async (req, res, next) => {
  try {
    const note = req.note;
    if (!note.extractedText) {
      return res.status(400).json({ message: 'No text content to summarize' });
    }

    const summary = await generateSummary(note.extractedText);
    note.summary = { ...summary, generatedAt: new Date() };
    await note.save();

    res.json({ summary: note.summary });
  } catch (err) {
    next(err);
  }
};

// Chat with note
const chatNote = async (req, res, next) => {
  try {
    const { question } = req.body;
    const note = req.note;

    if (!question?.trim()) {
      return res.status(400).json({ message: 'Question is required' });
    }
    if (!note.extractedText) {
      return res.status(400).json({ message: 'No text content to chat with' });
    }

    const recentHistory = note.chatHistory.slice(-10);
    const answer = await chatWithNote(note.extractedText, question, recentHistory);

    // Save to chat history
    note.chatHistory.push({ role: 'user', content: question });
    note.chatHistory.push({ role: 'assistant', content: answer });
    // Keep only last 50 messages
    if (note.chatHistory.length > 50) {
      note.chatHistory = note.chatHistory.slice(-50);
    }
    await note.save();

    res.json({
      question,
      answer,
      usage: {
        used: req.user.aiUsage.chatCount,
        limit: 10
      }
    });
  } catch (err) {
    next(err);
  }
};

// Generate quiz
const generateNoteQuiz = async (req, res, next) => {
  try {
    const note = req.note;
    if (!note.extractedText) {
      return res.status(400).json({ message: 'No text content to generate quiz from' });
    }

    const quiz = await generateQuiz(note.extractedText);
    res.json({
      quiz,
      usage: {
        used: req.user.aiUsage.quizCount,
        limit: 5
      }
    });
  } catch (err) {
    next(err);
  }
};

// Bookmark toggle
const toggleBookmark = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const userId = req.user._id;
    const idx = note.bookmarkedBy.indexOf(userId);

    if (idx === -1) {
      note.bookmarkedBy.push(userId);
    } else {
      note.bookmarkedBy.splice(idx, 1);
    }

    await note.save();
    res.json({ bookmarked: idx === -1, count: note.bookmarkedBy.length });
  } catch (err) {
    next(err);
  }
};

// Share note with user
const shareNote = async (req, res, next) => {
  try {
    const { email } = req.body;
    const User = require('../models/User');
    const targetUser = await User.findOne({ email });
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const note = req.note;
    if (!note.sharedWith.includes(targetUser._id)) {
      note.sharedWith.push(targetUser._id);
      await note.save();
    }

    res.json({ message: `Note shared with ${targetUser.name}` });
  } catch (err) {
    next(err);
  }
};

// Get user's bookmarked notes
const getBookmarks = async (req, res, next) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;
    const userId = req.user._id;

    const query = {
      bookmarkedBy: userId,
      $or: [
        { userId },
        { visibility: 'public' },
        { sharedWith: userId }
      ]
    };

    const [notes, total] = await Promise.all([
      Note.find(query)
        .populate('userId', 'name email')
        .select('-extractedText -embeddings -chatHistory')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Note.countDocuments(query)
    ]);

    const enriched = notes.map(note => {
      const obj = note.toObject();
      obj.isBookmarked = true;
      obj.isOwner = note.userId._id.toString() === userId.toString();
      return obj;
    });

    res.json({ notes: enriched, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadNote, getNotes, getNote, updateNote, deleteNote,
  generateNoteSummary, chatNote, generateNoteQuiz,
  toggleBookmark, shareNote, upload, getBookmarks
};
