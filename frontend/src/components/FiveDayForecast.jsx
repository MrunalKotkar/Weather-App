const ICON_BASE = 'https://openweathermap.org/img/wn';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Map OWM icon code prefix to a CSS color class.
 * Icons: 01=clear, 02=few clouds, 03=scattered, 04=broken,
 *        09=shower rain, 10=rain, 11=thunderstorm, 13=snow, 50=mist
 */
function getWeatherClass(icon) {
  if (!icon) return '';
  const code = icon.replace(/[dn]$/, ''); // strip day/night suffix
  if (code === '01') return 'fc-sunny';
  if (code === '02') return 'fc-partcloud';
  if (code === '03' || code === '04') return 'fc-cloudy';
  if (code === '09' || code === '10') return 'fc-rainy';
  if (code === '11') return 'fc-stormy';
  if (code === '13') return 'fc-snowy';
  if (code === '50') return 'fc-misty';
  return 'fc-cloudy';
}

export default function FiveDayForecast({ data }) {
  if (!data) return null;

  const { days, resolvedName } = data;
  if (!days || days.length === 0) return null;

  return (
    <div className="forecast-section">
      <h2 className="section-title">📅 5-Day Forecast — {resolvedName}</h2>
      <div className="forecast-grid">
        {days.map((item) => {
          const date = new Date(item.dt_txt);
          const dayName = DAY_NAMES[date.getUTCDay()];
          const dateStr = `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]}`;
          const icon = item.weather?.[0]?.icon;
          const desc = item.weather?.[0]?.description ?? '';
          const colorClass = getWeatherClass(icon);

          return (
            <div key={item.dt} className={`forecast-card ${colorClass}`}>
              <p className="fc-day">{dayName}</p>
              <p className="fc-date">{dateStr}</p>
              {icon && (
                <img
                  className="fc-icon"
                  src={`${ICON_BASE}/${icon}@2x.png`}
                  alt={desc}
                  title={desc}
                />
              )}
              <p className="fc-desc">{desc.charAt(0).toUpperCase() + desc.slice(1)}</p>
              <div className="fc-temps">
                <span className="fc-max" title="High">▲ {Math.round(item.main?.temp_max ?? item.main?.temp)}°</span>
                <span className="fc-min" title="Low">▼ {Math.round(item.main?.temp_min ?? item.main?.temp)}°</span>
              </div>
              <div className="fc-extra">
                <span title="Humidity">💧 {item.main?.humidity}%</span>
                <span title="Wind">💨 {item.wind?.speed} m/s</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
