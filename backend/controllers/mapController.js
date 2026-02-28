const { getMapData } = require('../services/mapService');

/**
 * GET /api/map?location=...
 */
async function getMap(req, res, next) {
  try {
    const { location } = req.query;
    if (!location) {
      return res.status(400).json({ success: false, error: 'location query parameter is required.' });
    }
    const data = await getMapData(location);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMap };
