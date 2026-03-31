const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  fileUrl: String,
  fileName: String,
  fileType: String,
  extractedText: {
    type: String,
    default: ''
  },
  summary: {
    keyPoints: [String],
    concepts: [String],
    shortExplanation: String,
    generatedAt: Date
  },
  tags: [String],
  embeddings: [Number],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  visibility: {
    type: String,
    enum: ['private', 'public'],
    default: 'private'
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  bookmarkedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  viewCount: { type: Number, default: 0 },
  chatHistory: [{
    role: { type: String, enum: ['user', 'assistant'] },
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update updatedAt
noteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for search
noteSchema.index({ title: 'text', description: 'text', tags: 'text' });
noteSchema.index({ userId: 1, visibility: 1 });
noteSchema.index({ visibility: 1 });

module.exports = mongoose.model('Note', noteSchema);
