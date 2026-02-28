const { getCurrentWeather, getForecast } = require('../services/weatherService');

/**
 * GET /api/weather/current?location=...
 */
async function current(req, res, next) {
  try {
    const location = req.query.location;
    if (!location) {
      return res.status(400).json({ success: false, error: 'location query parameter is required.' });
    }
    const data = await getCurrentWeather(location);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/weather/forecast?location=...
 */
async function forecast(req, res, next) {
  try {
    const location = req.query.location;
    if (!location) {
      return res.status(400).json({ success: false, error: 'location query parameter is required.' });
    }
    const data = await getForecast(location);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = { current, forecast };
