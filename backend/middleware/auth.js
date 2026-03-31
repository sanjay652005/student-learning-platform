const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Note = require('../models/Note');

// Verify JWT token
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user) req.user = user;
    }
  } catch (err) {
    // Silently fail - user just won't be authenticated
  }
  next();
};

// Check note access (owner, public, or shared)
const checkNoteAccess = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id).populate('userId', 'name email');
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const userId = req.user?._id?.toString();
    const ownerId = note.userId._id.toString();
    const isOwner = userId === ownerId;
    const isPublic = note.visibility === 'public';
    const isShared = note.sharedWith.some(id => id.toString() === userId);

    if (!isOwner && !isPublic && !isShared) {
      return res.status(403).json({ message: 'Access denied. This note is private.' });
    }

    req.note = note;
    req.isOwner = isOwner;
    next();
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Note not found' });
    next(err);
  }
};

// Only owner can perform action
const checkOwner = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (note.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can perform this action' });
    }

    req.note = note;
    req.isOwner = true;
    next();
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Note not found' });
    next(err);
  }
};

// Check AI usage limits
const checkAILimit = (type) => async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required for AI features' });

    const user = await User.findById(req.user._id).select('+aiUsage');
    user.resetDailyUsageIfNeeded();

    const limits = { chat: 10, quiz: 5 };
    const countField = type === 'chat' ? 'chatCount' : 'quizCount';
    const limit = limits[type];

    if (user.aiUsage[countField] >= limit) {
      return res.status(429).json({
        message: `Daily ${type} limit reached (${limit}/${type === 'chat' ? 'day' : 'day'}). Resets in 24 hours.`,
        limit,
        used: user.aiUsage[countField]
      });
    }

    // Increment count
    user.aiUsage[countField] += 1;
    await user.save();

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authMiddleware, optionalAuth, checkNoteAccess, checkOwner, checkAILimit };
