const axios = require('axios');

const YOUTUBE_BASE = 'https://www.googleapis.com/youtube/v3/search';

/**
 * Search YouTube for videos related to a location.
 * Returns an array of video objects.
 */
async function searchLocationVideos(locationName, maxResults = 6) {
  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!API_KEY || API_KEY === 'your_youtube_api_key_here') {
    throw Object.assign(
      new Error('YouTube API key is not configured. Please set YOUTUBE_API_KEY in .env'),
      { statusCode: 500 }
    );
  }

  const resp = await axios.get(YOUTUBE_BASE, {
    params: {
      part: 'snippet',
      q: `${locationName} travel weather`,
      type: 'video',
      maxResults,
      key: API_KEY,
    },
  });

  return (resp.data.items || []).map((item) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails?.medium?.url,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
  }));
}

module.exports = { searchLocationVideos };
