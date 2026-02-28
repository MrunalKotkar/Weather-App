export default function ErrorMessage({ error, onDismiss }) {
  if (!error) return null;
  return (
    <div className="error-banner" role="alert">
      <span className="error-icon">⚠️</span>
      <span className="error-text">{error}</span>
      <button className="error-dismiss" onClick={onDismiss} aria-label="Dismiss error">
        ✕
      </button>
    </div>
  );
}
