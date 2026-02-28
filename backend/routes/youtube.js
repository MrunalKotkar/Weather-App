const express = require('express');
const router = express.Router();
const { getVideos } = require('../controllers/youtubeController');

// GET /api/youtube?location=...
router.get('/', getVideos);

module.exports = router;
