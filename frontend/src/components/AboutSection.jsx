export default function AboutSection() {
  return (
    <div className="about-section">
      <div className="about-card">
        <h2>About This Application</h2>
        <p>
          <strong>WeatherWise</strong> is a full-stack weather application built by{' '}
          <strong>Mrunal Kotkar</strong>. It allows users to search for real-time weather by city,
          zip code, GPS coordinates, or landmarks, view 5-day forecasts, explore location maps,
          watch related YouTube videos, and manage weather records through a complete CRUD interface
          with multi-format data export.
        </p>
      </div>

      <div className="about-card pm-card">
        <div className="pm-header">
          <img
            src="https://media.licdn.com/dms/image/C560BAQHrJwuBxq5FRQ/company-logo_200_200/0/1631374490342?e=2147483647&v=beta&t=zm-YX7dCT7hpT8QW8f8tBxv3jUSX2I2r8Y7TQ1m-vb0"
            alt="PM Accelerator Logo"
            className="pm-logo"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div>
            <h2>Product Manager Accelerator</h2>
            <a
              href="https://www.linkedin.com/company/product-manager-accelerator/"
              target="_blank"
              rel="noopener noreferrer"
              className="pm-link"
            >
              🔗 View on LinkedIn
            </a>
          </div>
        </div>

        <p>
          <strong>Product Manager Accelerator (PMA)</strong> is the world's first and most
          comprehensive Product Management career accelerator. PMA helps aspiring and current
          product managers break into top tech companies, advance their careers, and build
          in-demand skills through structured programs, mentorship, and community.
        </p>
        <p>
          With a community of over <strong>15,000+ members</strong> and alumni at companies like
          Google, Meta, Amazon, Microsoft, and hundreds of top startups, PMA provides an
          unparalleled network and proven frameworks for product success.
        </p>

        <div className="pm-features">
          <div className="pm-feature">
            <span className="pm-feature-icon">🎓</span>
            <div>
              <strong>Structured Curriculum</strong>
              <p>End-to-end PM training from strategy to execution</p>
            </div>
          </div>
          <div className="pm-feature">
            <span className="pm-feature-icon">🤝</span>
            <div>
              <strong>1-on-1 Mentorship</strong>
              <p>Guidance from experienced PMs at top companies</p>
            </div>
          </div>
          <div className="pm-feature">
            <span className="pm-feature-icon">💼</span>
            <div>
              <strong>Job Placement Support</strong>
              <p>Resume reviews, mock interviews, referrals</p>
            </div>
          </div>
          <div className="pm-feature">
            <span className="pm-feature-icon">🌐</span>
            <div>
              <strong>Global Community</strong>
              <p>15,000+ members worldwide</p>
            </div>
          </div>
        </div>
      </div>

      <div className="about-card tech-card">
        <h2>Tech Stack</h2>
        <div className="tech-grid">
          {[
            { label: 'Frontend', val: 'React 18 + Vite' },
            { label: 'Backend', val: 'Node.js + Express' },
            { label: 'Database', val: 'PostgreSQL + Sequelize' },
            { label: 'Weather API', val: 'OpenWeatherMap' },
            { label: 'Videos', val: 'YouTube Data API v3' },
            { label: 'Maps', val: 'Leaflet + OpenStreetMap' },
            { label: 'Export', val: 'JSON, XML, CSV, PDF, Markdown' },
          ].map((t) => (
            <div key={t.label} className="tech-item">
              <span className="tech-label">{t.label}</span>
              <span className="tech-val">{t.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
