import { useState, useEffect } from 'react';
import Header from './components/Header';
import AboutSection from './components/AboutSection';
import LocationSearch from './components/LocationSearch';
import CurrentWeather from './components/CurrentWeather';
import FiveDayForecast from './components/FiveDayForecast';
import MapView from './components/MapView';
import YoutubeVideos from './components/YoutubeVideos';
import WeatherRecords from './components/WeatherRecords';
import ExportPanel from './components/ExportPanel';
import ErrorMessage from './components/ErrorMessage';

const TABS = [
  { id: 'weather', label: '🌤 Weather' },
  { id: 'records', label: '🗂 Records' },
  { id: 'export', label: '📤 Export' },
  { id: 'about', label: 'ℹ About' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('weather');
  const [theme, setTheme] = useState(() => localStorage.getItem('ww-theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ww-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  // Shared state across weather tab
  const [location, setLocation] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="app-container">
      <Header theme={theme} toggleTheme={toggleTheme} />

      {/* Tab Navigation */}
      <nav className="tab-nav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="main-content">
        {/* ── Weather Tab ── */}
        {activeTab === 'weather' && (
          <div className="weather-tab">
            <LocationSearch
              location={location}
              setLocation={setLocation}
              setCurrentWeather={setCurrentWeather}
              setForecast={setForecast}
              setMapData={setMapData}
              setVideos={setVideos}
              setError={setError}
              setLoading={setLoading}
            />

            {loading && (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Fetching weather data…</p>
              </div>
            )}

            <ErrorMessage error={error} onDismiss={() => setError(null)} />

            {currentWeather && !loading && (
              <>
                <CurrentWeather data={currentWeather} />
                <FiveDayForecast data={forecast} />
                <div className="side-by-side">
                  {mapData && <MapView data={mapData} />}
                  {videos.length > 0 && <YoutubeVideos videos={videos} />}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Records Tab ── */}
        {activeTab === 'records' && <WeatherRecords />}

        {/* ── Export Tab ── */}
        {activeTab === 'export' && <ExportPanel />}

        {/* ── About Tab ── */}
        {activeTab === 'about' && <AboutSection />}
      </main>
    </div>
  );
}
