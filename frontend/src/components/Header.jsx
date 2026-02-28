export default function Header({ theme, toggleTheme }) {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-logo">
          <span className="header-icon">🌦</span>
          <div>
            <h1 className="header-title">WeatherWise</h1>
            <p className="header-subtitle">Real-time weather, forecasts &amp; more</p>
          </div>
        </div>
        <div className="header-right">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
          <div className="header-author">
            <span className="author-tag">Built by</span>
            <strong>Mrunal Kotkar</strong>
          </div>
        </div>
      </div>
    </header>
  );
}
