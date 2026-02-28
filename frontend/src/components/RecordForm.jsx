import { useState } from 'react';
import { createRecord, updateRecord } from '../services/api';
import ErrorMessage from './ErrorMessage';

const today = new Date().toISOString().split('T')[0];

export default function RecordForm({ existing, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    location: existing?.location_input || '',
    date_from: existing?.date_from || today,
    date_to: existing?.date_to || today,
    notes: existing?.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = !!existing;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.location.trim()) {
      setError('Location is required.');
      return;
    }
    if (!form.date_from || !form.date_to) {
      setError('Both date_from and date_to are required.');
      return;
    }
    if (new Date(form.date_from) > new Date(form.date_to)) {
      setError('"Date From" must be before or equal to "Date To".');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await updateRecord(existing.id, form);
      } else {
        await createRecord(form);
      }
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.error
        || err.response?.data?.errors?.[0]?.msg
        || err.message
        || 'Request failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="record-form-wrapper">
      <h3 className="form-title">{isEditing ? '✏️ Edit Record' : '+ New Weather Record'}</h3>
      <ErrorMessage error={error} onDismiss={() => setError(null)} />

      <form className="record-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="rf-location">Location *</label>
          <input
            id="rf-location"
            name="location"
            className="form-input"
            value={form.location}
            onChange={handleChange}
            placeholder="City, zip, coordinates, landmark…"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="rf-date-from">Date From *</label>
            <input
              id="rf-date-from"
              type="date"
              name="date_from"
              className="form-input"
              value={form.date_from}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="rf-date-to">Date To *</label>
            <input
              id="rf-date-to"
              type="date"
              name="date_to"
              className="form-input"
              value={form.date_to}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="rf-notes">Notes (optional)</label>
          <textarea
            id="rf-notes"
            name="notes"
            className="form-input form-textarea"
            value={form.notes}
            onChange={handleChange}
            placeholder="Any additional notes…"
            rows={3}
          />
        </div>

        <p className="form-note">
          ℹ️ Weather data is fetched automatically from OpenWeatherMap and saved to the database.
          For best results, use dates within the <strong>next 5 days</strong> (forecast window).
          Past dates will use current weather as a reference value.
        </p>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving…' : isEditing ? '💾 Save Changes' : '➕ Create Record'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
