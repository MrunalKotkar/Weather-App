const express = require('express');
const router = express.Router();
const { exportData } = require('../controllers/exportController');

// GET /api/export?format=json|xml|csv|pdf|markdown
router.get('/', exportData);

module.exports = router;
