const { validationResult } = require('express-validator');
const WeatherRecord = require('../models/WeatherRecord');
const { getWeatherForDateRange, resolveLocation } = require('../services/weatherService');

// ─── CREATE ───────────────────────────────────────────────────────────────────
/**
 * POST /api/records
 * Body: { location, date_from, date_to, notes? }
 */
async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { location, date_from, date_to, notes } = req.body;

    // Validate date range
    const from = new Date(date_from);
    const to = new Date(date_to);
    if (isNaN(from) || isNaN(to)) {
      return res.status(400).json({ success: false, error: 'Invalid date format. Use YYYY-MM-DD.' });
    }
    if (from > to) {
      return res.status(400).json({ success: false, error: 'date_from must be before or equal to date_to.' });
    }

    // Fetch weather data + validate location
    const weatherData = await getWeatherForDateRange(location, date_from, date_to);

    const record = await WeatherRecord.create({
      location_input: location,
      resolved_location: weatherData.resolvedName,
      latitude: weatherData.lat,
      longitude: weatherData.lon,
      date_from,
      date_to,
      temperature_min: weatherData.temperature_min,
      temperature_max: weatherData.temperature_max,
      temperature_avg: weatherData.temperature_avg,
      humidity: weatherData.humidity,
      wind_speed: weatherData.wind_speed,
      description: weatherData.description,
      weather_icon: weatherData.weather_icon,
      weather_data: weatherData.weather_data,
      notes: notes || null,
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

// ─── READ ALL ─────────────────────────────────────────────────────────────────
/**
 * GET /api/records
 */
async function readAll(req, res, next) {
  try {
    const records = await WeatherRecord.findAll({
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['weather_data'] }, // exclude heavy JSON from list
    });
    res.json({ success: true, count: records.length, data: records });
  } catch (err) {
    next(err);
  }
}

// ─── READ ONE ─────────────────────────────────────────────────────────────────
/**
 * GET /api/records/:id
 */
async function readOne(req, res, next) {
  try {
    const record = await WeatherRecord.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Record not found.' });
    }
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────
/**
 * PUT /api/records/:id
 * Body: { location?, date_from?, date_to?, notes? }
 * If location or dates change, re-fetches weather data.
 */
async function update(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const record = await WeatherRecord.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Record not found.' });
    }

    const { location, date_from, date_to, notes } = req.body;

    const newLocation = location || record.location_input;
    const newDateFrom = date_from || record.date_from;
    const newDateTo = date_to || record.date_to;

    // Validate dates if provided
    if (date_from || date_to) {
      const from = new Date(newDateFrom);
      const to = new Date(newDateTo);
      if (isNaN(from) || isNaN(to)) {
        return res.status(400).json({ success: false, error: 'Invalid date format. Use YYYY-MM-DD.' });
      }
      if (from > to) {
        return res.status(400).json({ success: false, error: 'date_from must be before or equal to date_to.' });
      }
    }

    // Re-fetch weather if location or dates changed
    let weatherData = null;
    if (location || date_from || date_to) {
      weatherData = await getWeatherForDateRange(newLocation, newDateFrom, newDateTo);
    }

    await record.update({
      location_input: newLocation,
      resolved_location: weatherData?.resolvedName || record.resolved_location,
      latitude: weatherData?.lat || record.latitude,
      longitude: weatherData?.lon || record.longitude,
      date_from: newDateFrom,
      date_to: newDateTo,
      temperature_min: weatherData?.temperature_min ?? record.temperature_min,
      temperature_max: weatherData?.temperature_max ?? record.temperature_max,
      temperature_avg: weatherData?.temperature_avg ?? record.temperature_avg,
      humidity: weatherData?.humidity ?? record.humidity,
      wind_speed: weatherData?.wind_speed ?? record.wind_speed,
      description: weatherData?.description ?? record.description,
      weather_icon: weatherData?.weather_icon ?? record.weather_icon,
      weather_data: weatherData?.weather_data ?? record.weather_data,
      notes: notes !== undefined ? notes : record.notes,
    });

    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
/**
 * DELETE /api/records/:id
 */
async function remove(req, res, next) {
  try {
    const record = await WeatherRecord.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Record not found.' });
    }
    await record.destroy();
    res.json({ success: true, message: 'Record deleted successfully.', id: req.params.id });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, readAll, readOne, update, remove };
