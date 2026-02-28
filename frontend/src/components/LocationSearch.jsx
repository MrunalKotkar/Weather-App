import { useState } from 'react';
import { getCurrentWeather, getForecast, getMapData, getYoutubeVideos } from '../services/api';

const SEARCH_TYPES = [
  {
    id: 'city',
    label: '🏙 City / Town',
    placeholder: 'e.g. New York, Paris, Mumbai…',
    hint: 'Enter any city or town name',
    examples: ['New York', 'London', 'Tokyo', 'Sydney', 'Mumbai'],
  },
  {
    id: 'zip',
    label: '📮 Zip / Postal Code',
    placeholder: 'e.g. 10001 or 10001,US',
    hint: 'Enter a zip or postal code — optionally append country code like ,US  ,IN  ,GB',
    examples: ['10001', '90210', '400001', 'EC1A 1BB'],
  },
  {
    id: 'coords',
    label: '📡 GPS Coordinates',
    placeholder: 'e.g. 48.8566,2.3522',
    hint: 'Enter latitude and longitude separated by a comma',
    examples: ['48.8566,2.3522', '40.7128,-74.0060', '35.6762,139.6503'],
  },
  {
    id: 'landmark',
    label: '🗿 Landmark',
    placeholder: 'e.g. Eiffel Tower, Times Square…',
    hint: 'Enter a famous landmark — geocoding will resolve the nearest location',
    examples: ['Eiffel Tower', 'Times Square', 'Colosseum', 'Big Ben'],
  },
];

export default function LocationSearch({
  location, setLocation,
  setCurrentWeather, setForecast,
  setMapData, setVideos,
  setError, setLoading,
}) {
  const [searchTypeId, setSearchTypeId] = useState('city');
  const [inputVal, setInputVal] = useState(location);
  const [gpsLoading, setGpsLoading] = useState(false);

  const activeType = SEARCH_TYPES.find((t) => t.id === searchTypeId);

  const handleTypeChange = (e) => {
    setSearchTypeId(e.target.value);
    setInputVal('');
  };

  const fetchAll = async (loc) => {
    const trimmed = loc.trim();
    if (!trimmed) {
      setError('Please enter a location.');
      return;
    }
    setError(null);
    setLoading(true);
    setCurrentWeather(null);
    setForecast(null);
    setMapData(null);
    setVideos([]);

    try {
      const [weatherRes, forecastRes, mapRes] = await Promise.all([
        getCurrentWeather(trimmed),
        getForecast(trimmed),
        getMapData(trimmed),
      ]);

      setCurrentWeather(weatherRes.data.data);
      setForecast(forecastRes.data.data);
      setMapData(mapRes.data.data);
      setLocation(trimmed);

      // Fetch YouTube videos (non-critical — don't block UI)
      try {
        const resolvedName = weatherRes.data.data?.resolvedName || trimmed;
        const ytRes = await getYoutubeVideos(resolvedName, 6);
        setVideos((ytRes.data.data || []).slice(0, 6));
      } catch (_) {
        setVideos([]);
      }
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch weather data. Please check the location and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchAll(inputVal);
  };

  const handleGPS = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(5)},${pos.coords.longitude.toFixed(5)}`;
        setSearchTypeId('coords');
        setInputVal(coords);
        setGpsLoading(false);
        fetchAll(coords);
      },
      (err) => {
        setGpsLoading(false);
        setError(`GPS error: ${err.message}. Please allow location access or enter manually.`);
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="search-section">
      <h2 className="search-heading">🔍 Search Weather</h2>

      <form className="search-form" onSubmit={handleSubmit}>
        {/* Row 1: type dropdown + text input + action buttons */}
        <div className="search-input-group">
          <select
            className="search-type-select"
            value={searchTypeId}
            onChange={handleTypeChange}
            aria-label="Search type"
          >
            {SEARCH_TYPES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>

          <input
            type="text"
            className="search-input"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={activeType.placeholder}
            aria-label="Location input"
          />

          <button type="submit" className="btn btn-primary search-btn">
            🔍 Search
          </button>

          <button
            type="button"
            className="btn btn-secondary gps-btn"
            onClick={handleGPS}
            disabled={gpsLoading}
            title="Detect my current GPS location"
          >
            {gpsLoading ? '⏳ Locating…' : '📍 My Location'}
          </button>
        </div>

        {/* Contextual hint */}
        <p className="search-hint">{activeType.hint}</p>

        {/* Quick examples for the active search type */}
        <div className="quick-examples">
          <span className="quick-label">Examples:</span>
          {activeType.examples.map((ex) => (
            <button
              key={ex}
              type="button"
              className="quick-tag"
              onClick={() => { setInputVal(ex); fetchAll(ex); }}
            >
              {ex}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
