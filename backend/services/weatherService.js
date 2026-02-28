const axios = require('axios');

const BASE_URL = 'https://api.openweathermap.org';
const API_KEY = process.env.OPENWEATHER_API_KEY;

/**
 * Resolve any location input (city, zip, coordinates, landmark)
 * to { lat, lon, resolvedName } using OWM Geocoding API.
 */
async function resolveLocation(locationInput) {
  if (!API_KEY || API_KEY === 'your_openweathermap_api_key_here') {
    throw Object.assign(new Error('OpenWeatherMap API key is not configured. Please set OPENWEATHER_API_KEY in .env'), { statusCode: 500 });
  }

  const input = locationInput.trim();

  // ── GPS Coordinates: "lat,lon" or "lat lon" ──
  const coordsMatch = input.match(/^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/);
  if (coordsMatch) {
    const lat = parseFloat(coordsMatch[1]);
    const lon = parseFloat(coordsMatch[2]);
    const resp = await axios.get(`${BASE_URL}/geo/1.0/reverse`, {
      params: { lat, lon, limit: 1, appid: API_KEY },
    });
    const place = resp.data?.[0];
    return {
      lat,
      lon,
      resolvedName: place ? `${place.name}, ${place.country}` : `${lat}, ${lon}`,
    };
  }

  // ── ZIP / Postal Code (e.g. "10001" or "10001,US") ──
  const zipMatch = input.match(/^(\d{4,10})(,\s*([A-Z]{2}))?$/i);
  if (zipMatch) {
    try {
      const zip = zipMatch[1];
      const country = zipMatch[3] || 'US';
      const resp = await axios.get(`${BASE_URL}/geo/1.0/zip`, {
        params: { zip: `${zip},${country}`, appid: API_KEY },
      });
      return {
        lat: resp.data.lat,
        lon: resp.data.lon,
        resolvedName: `${resp.data.name}, ${resp.data.country}`,
      };
    } catch (_) {
      // fall through to direct geocoding
    }
  }

  // ── City / Town / Landmark (direct geocoding) ──
  const resp = await axios.get(`${BASE_URL}/geo/1.0/direct`, {
    params: { q: input, limit: 1, appid: API_KEY },
  });
  if (!resp.data || resp.data.length === 0) {
    throw Object.assign(
      new Error(`Location "${input}" not found. Please try a city name, zip code, or coordinates.`),
      { statusCode: 404 }
    );
  }
  const place = resp.data[0];
  return {
    lat: place.lat,
    lon: place.lon,
    resolvedName: `${place.name}${place.state ? ', ' + place.state : ''}, ${place.country}`,
  };
}

/**
 * Get current weather for a location string.
 */
async function getCurrentWeather(locationInput) {
  const { lat, lon, resolvedName } = await resolveLocation(locationInput);
  const resp = await axios.get(`${BASE_URL}/data/2.5/weather`, {
    params: { lat, lon, appid: API_KEY, units: 'metric' },
  });
  return { ...resp.data, resolvedName, lat, lon };
}

/**
 * Get 5-day / 3-hour forecast.
 * - Skips today so the first card is always Tomorrow.
 * - Aggregates ALL 3-hour slots per day to compute true daily min/max.
 * - Uses the noon slot (12:00) as the representative for icon/description.
 */
async function getForecast(locationInput) {
  const { lat, lon, resolvedName } = await resolveLocation(locationInput);
  const resp = await axios.get(`${BASE_URL}/data/2.5/forecast`, {
    params: { lat, lon, appid: API_KEY, units: 'metric', cnt: 40 },
  });

  const nowMs = Date.now();

  // Skip individual slots that are already in the past.
  // Grouping what remains gives the next 5 calendar days starting from the
  // first future slot — this is "tomorrow" regardless of the user's timezone.
  const byDay = {};
  for (const item of resp.data.list) {
    if (item.dt * 1000 <= nowMs) continue; // skip past/present slots
    const day = item.dt_txt.split(' ')[0];

    if (!byDay[day]) {
      byDay[day] = {
        representative: item,          // will be replaced by noon slot if found
        temp_min: item.main.temp,      // track true daily min across all slots
        temp_max: item.main.temp,      // track true daily max across all slots
      };
    } else {
      // Prefer the noon reading as the "face" of the day (icon, description, humidity)
      if (item.dt_txt.includes('12:00:00')) byDay[day].representative = item;
      if (item.main.temp < byDay[day].temp_min) byDay[day].temp_min = item.main.temp;
      if (item.main.temp > byDay[day].temp_max) byDay[day].temp_max = item.main.temp;
    }
  }

  // Merge aggregated min/max back onto each representative item
  const days = Object.values(byDay).slice(0, 5).map(({ representative, temp_min, temp_max }) => ({
    ...representative,
    main: {
      ...representative.main,
      temp_min: parseFloat(temp_min.toFixed(1)),
      temp_max: parseFloat(temp_max.toFixed(1)),
    },
  }));

  return { resolvedName, lat, lon, days, city: resp.data.city };
}

/**
 * Get temperature statistics for a date range.
 * OWM free tier = 5-day forecast only. For date ranges outside that window,
 * we fall back to current weather so the record is still created with real data.
 */
async function getWeatherForDateRange(locationInput, dateFrom, dateTo) {
  const { lat, lon, resolvedName } = await resolveLocation(locationInput);
  const forecastResp = await axios.get(`${BASE_URL}/data/2.5/forecast`, {
    params: { lat, lon, appid: API_KEY, units: 'metric', cnt: 40 },
  });

  const from = new Date(dateFrom);
  const to = new Date(dateTo);

  const inRange = forecastResp.data.list.filter((item) => {
    const d = new Date(item.dt_txt);
    return d >= from && d <= to;
  });

  // If no forecast slots fall in range (e.g. past dates), fall back to current weather
  if (inRange.length === 0) {
    const currentResp = await axios.get(`${BASE_URL}/data/2.5/weather`, {
      params: { lat, lon, appid: API_KEY, units: 'metric' },
    });
    const cur = currentResp.data;
    return {
      resolvedName,
      lat,
      lon,
      dateFrom,
      dateTo,
      temperature_min: parseFloat((cur.main.temp_min ?? cur.main.temp).toFixed(2)),
      temperature_max: parseFloat((cur.main.temp_max ?? cur.main.temp).toFixed(2)),
      temperature_avg: parseFloat(cur.main.temp.toFixed(2)),
      humidity: cur.main.humidity ?? null,
      wind_speed: cur.wind?.speed ?? null,
      description: cur.weather?.[0]?.description ?? null,
      weather_icon: cur.weather?.[0]?.icon ?? null,
      weather_data: cur,
      dataPoints: 1,
      note: 'Date range outside forecast window — current weather used as reference.',
    };
  }

  let tempMin = null, tempMax = null, tempSum = 0, count = 0;
  for (const item of inRange) {
    const t = item.main.temp;
    if (tempMin === null || t < tempMin) tempMin = t;
    if (tempMax === null || t > tempMax) tempMax = t;
    tempSum += t;
    count++;
  }

  return {
    resolvedName,
    lat,
    lon,
    dateFrom,
    dateTo,
    temperature_min: tempMin !== null ? parseFloat(tempMin.toFixed(2)) : null,
    temperature_max: tempMax !== null ? parseFloat(tempMax.toFixed(2)) : null,
    temperature_avg: count > 0 ? parseFloat((tempSum / count).toFixed(2)) : null,
    humidity: inRange[0]?.main?.humidity ?? null,
    wind_speed: inRange[0]?.wind?.speed ?? null,
    description: inRange[0]?.weather?.[0]?.description ?? null,
    weather_icon: inRange[0]?.weather?.[0]?.icon ?? null,
    weather_data: forecastResp.data,
    dataPoints: count,
  };
}

module.exports = { resolveLocation, getCurrentWeather, getForecast, getWeatherForDateRange };
