const { body, param, query, validationResult } = require('express-validator');

// Extract and format validation errors into a clean response
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg);
    return res.status(400).json({ message: messages[0], errors: messages });
  }
  next();
};

// ─── Auth validators ──────────────────────────────────────────────────────────
const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .isLength({ max: 100 }).withMessage('Password too long'),
  validate
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate
];

// ─── Note validators ──────────────────────────────────────────────────────────
const uploadNoteValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 1, max: 200 }).withMessage('Title must be 1–200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description max 1000 characters'),
  body('visibility')
    .optional()
    .isIn(['private', 'public']).withMessage('Visibility must be private or public'),
  validate
];

const updateNoteValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 200 }).withMessage('Title max 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description max 1000 characters'),
  body('visibility')
    .optional()
    .isIn(['private', 'public']).withMessage('Visibility must be private or public'),
  validate
];

const chatValidator = [
  body('question')
    .trim()
    .notEmpty().withMessage('Question is required')
    .isLength({ min: 2 }).withMessage('Question too short')
    .isLength({ max: 1000 }).withMessage('Question max 1000 characters'),
  validate
];

const shareValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  validate
];

const searchValidator = [
  query('q')
    .trim()
    .notEmpty().withMessage('Search query is required')
    .isLength({ min: 1, max: 200 }).withMessage('Query must be 1–200 characters'),
  query('type')
    .optional()
    .isIn(['text', 'semantic']).withMessage('Type must be text or semantic'),
  validate
];

module.exports = {
  registerValidator,
  loginValidator,
  uploadNoteValidator,
  updateNoteValidator,
  chatValidator,
  shareValidator,
  searchValidator,
};
