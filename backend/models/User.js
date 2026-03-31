const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  aiUsage: {
    chatCount: { type: Number, default: 0 },
    quizCount: { type: Number, default: 0 },
    lastReset: { type: Date, default: Date.now }
  },
  avatar: String,
  createdAt: { type: Date, default: Date.now }
});

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Reset AI usage daily
userSchema.methods.resetDailyUsageIfNeeded = function() {
  const now = new Date();
  const lastReset = new Date(this.aiUsage.lastReset);
  const diffHours = (now - lastReset) / (1000 * 60 * 60);
  if (diffHours >= 24) {
    this.aiUsage.chatCount = 0;
    this.aiUsage.quizCount = 0;
    this.aiUsage.lastReset = now;
  }
};

module.exports = mongoose.model('User', userSchema);
