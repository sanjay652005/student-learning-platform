const express = require('express');
const router = express.Router();
const { searchNotes } = require('../controllers/searchController');
const { optionalAuth } = require('../middleware/auth');
const { searchValidator } = require('../middleware/validators');

router.get('/', optionalAuth, searchValidator, searchNotes);

module.exports = router;
