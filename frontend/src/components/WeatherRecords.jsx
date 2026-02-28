import { useState, useEffect, useCallback } from 'react';
import { getAllRecords, deleteRecord } from '../services/api';
import RecordForm from './RecordForm';
import ErrorMessage from './ErrorMessage';

export default function WeatherRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllRecords();
      setRecords(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    setDeletingId(id);
    try {
      await deleteRecord(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete record.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (record) => {
    setEditRecord(record);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditRecord(null);
    fetchRecords();
  };

  return (
    <div className="records-section">
      <div className="records-header">
        <h2 className="section-title">🗂 Weather Records (CRUD)</h2>
        <button
          className="btn btn-primary"
          onClick={() => { setEditRecord(null); setShowForm(true); }}
        >
          + New Record
        </button>
      </div>

      <ErrorMessage error={error} onDismiss={() => setError(null)} />

      {showForm && (
        <RecordForm
          existing={editRecord}
          onSuccess={handleFormSuccess}
          onCancel={() => { setShowForm(false); setEditRecord(null); }}
        />
      )}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading records…</p>
        </div>
      ) : records.length === 0 ? (
        <div className="empty-state">
          <p>No records yet. Click <strong>+ New Record</strong> to create one.</p>
        </div>
      ) : (
        <div className="records-table-wrapper">
          <table className="records-table">
            <thead>
              <tr>
                <th>Location</th>
                <th>Date From</th>
                <th>Date To</th>
                <th>Avg Temp (°C)</th>
                <th>Min / Max</th>
                <th>Description</th>
                <th>Humidity</th>
                <th>Wind (m/s)</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.resolved_location || r.location_input}</strong>
                    {r.resolved_location && r.resolved_location !== r.location_input && (
                      <small className="record-input-raw"> ({r.location_input})</small>
                    )}
                  </td>
                  <td>{r.date_from}</td>
                  <td>{r.date_to}</td>
                  <td>{r.temperature_avg ?? '—'}</td>
                  <td>{r.temperature_min ?? '—'} / {r.temperature_max ?? '—'}</td>
                  <td>{r.description ?? '—'}</td>
                  <td>{r.humidity != null ? `${r.humidity}%` : '—'}</td>
                  <td>{r.wind_speed ?? '—'}</td>
                  <td className="notes-cell">{r.notes || '—'}</td>
                  <td className="actions-cell">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEdit(r)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(r.id)}
                      disabled={deletingId === r.id}
                    >
                      {deletingId === r.id ? '…' : '🗑 Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
