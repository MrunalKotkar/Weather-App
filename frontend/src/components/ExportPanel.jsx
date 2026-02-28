import { useState } from 'react';
import { getApiBase } from '../services/api';

const FORMATS = [
  { id: 'json', label: 'JSON', icon: '{ }', desc: 'Machine-readable structured format' },
  { id: 'xml', label: 'XML', icon: '< />', desc: 'Extensible Markup Language' },
  { id: 'csv', label: 'CSV', icon: '📊', desc: 'Comma-separated, opens in Excel' },
  { id: 'pdf', label: 'PDF', icon: '📄', desc: 'Formatted document for printing' },
];

export default function ExportPanel() {
  const [exporting, setExporting] = useState(null);
  const [message, setMessage] = useState(null);

  const handleExport = async (format) => {
    setExporting(format);
    setMessage(null);
    try {
      const url = `${getApiBase()}/export?format=${format}`;
      const res = await fetch(url);

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || `Export failed with status ${res.status}`);
      }

      // Get filename from Content-Disposition header or default
      const disposition = res.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match ? match[1] : `weather_records.${format}`;

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      setMessage({ type: 'success', text: `✅ Exported successfully as ${filename}` });
    } catch (err) {
      setMessage({ type: 'error', text: `❌ ${err.message}` });
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="export-section">
      <h2 className="section-title">📤 Export Weather Records</h2>
      <p className="export-desc">
        Download all weather records from the database in your preferred format.
        The export includes all stored fields except raw API response data.
      </p>

      {message && (
        <div className={`export-message ${message.type}`}>
          {message.text}
          <button className="error-dismiss" onClick={() => setMessage(null)}>✕</button>
        </div>
      )}

      <div className="export-grid">
        {FORMATS.map((f) => (
          <div key={f.id} className="export-card">
            <div className="export-icon">{f.icon}</div>
            <h3 className="export-format">{f.label}</h3>
            <p className="export-format-desc">{f.desc}</p>
            <button
              className="btn btn-primary export-btn"
              onClick={() => handleExport(f.id)}
              disabled={exporting === f.id}
            >
              {exporting === f.id ? 'Exporting…' : `Download ${f.label}`}
            </button>
          </div>
        ))}
      </div>

      <div className="export-info">
        <h3>📌 Notes</h3>
        <ul>
          <li>All exports contain the same data — choose the format that fits your use case.</li>
          <li>If there are no records, the export will be empty but still valid.</li>
          <li>Raw API JSON payloads are excluded to keep file sizes manageable.</li>
          <li>Go to the <strong>Records</strong> tab to create, edit, or delete records before exporting.</li>
        </ul>
      </div>
    </div>
  );
}
