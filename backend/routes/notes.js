const express = require('express');
const router = express.Router();
const {
  uploadNote, getNotes, getNote, updateNote, deleteNote,
  generateNoteSummary, chatNote, generateNoteQuiz,
  toggleBookmark, shareNote, upload, getBookmarks
} = require('../controllers/notesController');
const { authMiddleware, optionalAuth, checkNoteAccess, checkOwner, checkAILimit } = require('../middleware/auth');
const {
  uploadNoteValidator, updateNoteValidator,
  chatValidator, shareValidator
} = require('../middleware/validators');

// Collection routes
router.get('/',         optionalAuth, getNotes);
router.get('/bookmarks', authMiddleware, getBookmarks);
router.post('/upload',  authMiddleware, upload.single('file'), uploadNoteValidator, uploadNote);

// Single note CRUD
router.get('/:id',    optionalAuth, checkNoteAccess, getNote);
router.put('/:id',    authMiddleware, checkOwner, updateNoteValidator, updateNote);
router.delete('/:id', authMiddleware, checkOwner, deleteNote);

// AI routes
router.post('/:id/summary', authMiddleware, checkNoteAccess, generateNoteSummary);
router.post('/:id/chat',    authMiddleware, checkAILimit('chat'), checkNoteAccess, chatValidator, chatNote);
router.get('/:id/quiz',     authMiddleware, checkAILimit('quiz'), checkNoteAccess, generateNoteQuiz);

// Social routes
router.post('/:id/bookmark', authMiddleware, toggleBookmark);
router.post('/:id/share',    authMiddleware, checkOwner, shareValidator, shareNote);

module.exports = router;
