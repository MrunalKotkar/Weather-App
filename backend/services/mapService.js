const axios = require('axios');
const { resolveLocation } = require('./weatherService');

/**
 * Get rich map metadata for a location using OpenStreetMap Nominatim.
 * No API key required — fully free.
 */
async function getMapData(locationInput) {
  // Resolve coords via OWM geocoding
  const { lat, lon, resolvedName } = await resolveLocation(locationInput);

  // Reverse-geocode with Nominatim for detailed address + OSM data
  let nominatimData = null;
  try {
    const resp = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { lat, lon, format: 'json', addressdetails: 1 },
      headers: { 'User-Agent': 'WeatherApp-MrunalKotkar/1.0' },
    });
    nominatimData = resp.data;
  } catch (_) {
    // Non-fatal — we still return coordinates
  }

  return {
    resolvedName,
    lat,
    lon,
    nominatim: nominatimData,
    // Tile URL pattern for Leaflet (client uses this directly)
    tileLayerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    tileAttribution: '© OpenStreetMap contributors',
    // Direct link to OSM for the location
    osmLink: `https://www.openstreetmap.org/#map=13/${lat}/${lon}`,
    // Google Maps link as alternative
    googleMapsLink: `https://www.google.com/maps?q=${lat},${lon}`,
  };
}

module.exports = { getMapData };
