const { searchLocationVideos } = require('../services/youtubeService');

/**
 * GET /api/youtube?location=...&maxResults=6
 */
async function getVideos(req, res, next) {
  try {
    const { location, maxResults } = req.query;
    if (!location) {
      return res.status(400).json({ success: false, error: 'location query parameter is required.' });
    }
    const videos = await searchLocationVideos(location, parseInt(maxResults) || 6);
    res.json({ success: true, location, count: videos.length, data: videos });
  } catch (err) {
    next(err);
  }
}

module.exports = { getVideos };
