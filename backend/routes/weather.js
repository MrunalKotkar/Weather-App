const express = require('express');
const router = express.Router();
const { current, forecast } = require('../controllers/weatherController');

router.get('/current', current);
router.get('/forecast', forecast);

module.exports = router;
