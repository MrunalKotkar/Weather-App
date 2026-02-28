const express = require('express');
const router = express.Router();
const { getMap } = require('../controllers/mapController');

// GET /api/map?location=...
router.get('/', getMap);

module.exports = router;
