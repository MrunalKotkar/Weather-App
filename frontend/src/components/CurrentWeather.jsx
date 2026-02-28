const ICON_BASE = 'https://openweathermap.org/img/wn';

function WindDirection(deg) {
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(deg / 45) % 8];
}

/**
 * Format a Unix timestamp in the CITY's local timezone (using OWM's timezone offset).
 * e.g. sunrise/sunset will show correct local time regardless of browser timezone.
 */
function formatInCityTz(unixSeconds, tzOffsetSeconds) {
  if (!unixSeconds) return '—';
  // Shift to city local time, then read as UTC
  const d = new Date((unixSeconds + tzOffsetSeconds) * 1000);
  const h = String(d.getUTCHours()).padStart(2, '0');
  const m = String(d.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/** Format timezone offset as "UTC+05:30" */
function tzLabel(offsetSeconds) {
  if (offsetSeconds == null) return 'UTC';
  const sign = offsetSeconds >= 0 ? '+' : '-';
  const abs = Math.abs(offsetSeconds);
  const h = String(Math.floor(abs / 3600)).padStart(2, '0');
  const m = String(Math.floor((abs % 3600) / 60)).padStart(2, '0');
  return `UTC${sign}${h}:${m}`;
}

export default function CurrentWeather({ data }) {
  if (!data) return null;

  const {
    resolvedName, name, sys,
    main, weather, wind, visibility,
    clouds, dt, timezone,
  } = data;

  const displayName = resolvedName || `${name}, ${sys?.country}`;
  const desc = weather?.[0]?.description ?? '';
  const icon = weather?.[0]?.icon;
  const tz = timezone ?? 0;
  const localTime = formatInCityTz(dt, tz);
  const tzStr = tzLabel(tz);

  return (
    <div className="current-weather-card">
      <div className="cw-top">
        <div className="cw-location">
          <h2 className="cw-city">📍 {displayName}</h2>
          <p className="cw-time">🕐 Local time {localTime} <span className="cw-tz">({tzStr})</span></p>
        </div>
        {icon && (
          <img
            className="cw-icon"
            src={`${ICON_BASE}/${icon}@4x.png`}
            alt={desc}
            title={desc}
          />
        )}
      </div>

      <div className="cw-temp-row">
        <span className="cw-temp">{Math.round(main?.temp ?? 0)}°C</span>
        <span className="cw-desc">{desc.charAt(0).toUpperCase() + desc.slice(1)}</span>
      </div>
      <p className="cw-feels">Feels like {Math.round(main?.feels_like ?? 0)}°C</p>

      <div className="cw-stats">
        {[
          { label: 'High', val: `${Math.round(main?.temp_max ?? 0)}°C`, icon: '🔺' },
          { label: 'Low', val: `${Math.round(main?.temp_min ?? 0)}°C`, icon: '🔻' },
          { label: 'Humidity', val: `${main?.humidity ?? '—'}%`, icon: '💧' },
          { label: 'Wind', val: `${wind?.speed ?? '—'} m/s ${WindDirection(wind?.deg)}`, icon: '💨' },
          { label: 'Visibility', val: visibility ? `${(visibility / 1000).toFixed(1)} km` : '—', icon: '👁' },
          { label: 'Cloud Cover', val: `${clouds?.all ?? '—'}%`, icon: '☁️' },
          { label: 'Pressure', val: `${main?.pressure ?? '—'} hPa`, icon: '🌡' },
          { label: 'Sunrise', val: sys?.sunrise ? `${formatInCityTz(sys.sunrise, tz)} (${tzStr})` : '—', icon: '🌅' },
          { label: 'Sunset', val: sys?.sunset ? `${formatInCityTz(sys.sunset, tz)} (${tzStr})` : '—', icon: '🌇' },
        ].map(({ label, val, icon: ico }) => (
          <div key={label} className="cw-stat-item">
            <span className="cw-stat-icon">{ico}</span>
            <span className="cw-stat-label">{label}</span>
            <span className="cw-stat-val">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
