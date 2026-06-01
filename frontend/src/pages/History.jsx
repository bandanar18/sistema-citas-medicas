import React, { useState, useEffect } from 'react';
import client from '../api/client';
import Alert from '../components/UI/Alert';
import Spinner from '../components/UI/Spinner';

const today = () => new Date().toISOString().split('T')[0];

const formatTimestamp = (ts) => {
  if (!ts) return '—';
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  const day   = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year  = d.getFullYear();
  const hour  = d.getHours();
  const min   = pad(d.getMinutes());
  const ampm  = hour >= 12 ? 'PM' : 'AM';
  const h12   = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${day}/${month}/${year} ${h12}:${min} ${ampm}`;
};

const formatDate = (iso) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const ACTION_COLORS = {
  LOGIN:              { bg: '#e8f4fd', color: '#1a6fa8' },
  LOGOUT:             { bg: '#f4f4f4', color: '#666'    },
  PATIENT_CREATE:     { bg: '#e8f8e8', color: '#1a7a1a' },
  PATIENT_UPDATE:     { bg: '#fff8e1', color: '#8a6800' },
  APPOINTMENT_CREATE: { bg: '#f0e8ff', color: '#6a00cc' },
};

const ActionBadge = ({ actionType, label }) => {
  const colors = ACTION_COLORS[actionType] || { bg: 'var(--gris-claro)', color: 'var(--negro)' };
  return (
    <span style={{
      backgroundColor: colors.bg,
      color: colors.color,
      padding: '3px 10px',
      borderRadius: '12px',
      fontSize: '0.8rem',
      fontWeight: '600',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
};

const History = () => {
  const [date, setDate]       = useState(today());
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert]     = useState(null);

  const fetchHistory = (d) => {
    setLoading(true);
    setAlert(null);
    client.get(`/history?date=${d}`)
      .then((res) => setData(res.data))
      .catch(() => setAlert({ type: 'error', message: 'Error al obtener el historial.' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHistory(today()); }, []);

  const handleSearch = () => fetchHistory(date);

  return (
    <div className="section-content">
      <h3 className="section-title">Historial de Acciones</h3>

      <div className="form-card" style={{ marginBottom: '20px' }}>
        <div className="search-bar" style={{ marginBottom: 0 }}>
          <label style={styles.filterLabel}>Filtrar por Fecha:</label>
          <input
            type="date"
            className="search-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ flexGrow: 0, width: '180px' }}
          />
          <button className="btn-primary" onClick={handleSearch} disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
          {loading && <Spinner size={20} />}
        </div>
      </div>

      <Alert type={alert?.type} message={alert?.message} />

      {data && (
        <>
          <div style={styles.summaryBar}>
            <span style={styles.summaryText}>
              {data.total > 0
                ? <><strong>{data.total}</strong> acción{data.total !== 1 ? 'es' : ''} registrada{data.total !== 1 ? 's' : ''} el <strong>{formatDate(data.date)}</strong></>
                : <>Historial del <strong>{formatDate(data.date)}</strong></>
              }
            </span>
          </div>

          {data.total === 0 ? (
            <div style={styles.emptyBox}>
              <p style={{ color: 'var(--gris-texto)', fontWeight: '600', marginBottom: '6px' }}>
                No hay registros de actividad para el {formatDate(data.date)}.
              </p>
              <p style={{ color: 'var(--gris-texto)', fontSize: '0.875rem' }}>
                Seleccione otra fecha para consultar el historial de acciones.
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha y Hora</th>
                    <th>Usuario</th>
                    <th>Acción Realizada</th>
                    <th>Detalle de la Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {data.records.map((r) => (
                    <tr key={r.id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.875rem', color: 'var(--gris-texto)' }}>
                        {formatTimestamp(r.timestamp)}
                      </td>
                      <td style={{ fontWeight: '600' }}>{r.username}</td>
                      <td>
                        <ActionBadge actionType={r.action_type} label={r.action_label} />
                      </td>
                      <td style={{ fontSize: '0.875rem', color: 'var(--negro)' }}>
                        {r.detail_text}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  filterLabel: {
    fontWeight: '600',
    fontSize: '0.9rem',
    color: 'var(--negro)',
    whiteSpace: 'nowrap',
    alignSelf: 'center',
  },
  summaryBar: {
    marginBottom: '12px',
    padding: '10px 14px',
    backgroundColor: 'var(--blanco)',
    borderRadius: '6px',
    border: '1px solid var(--gris-claro)',
  },
  summaryText: { fontSize: '0.9rem', color: 'var(--negro)' },
  emptyBox: {
    background: 'var(--blanco)',
    borderRadius: '8px',
    padding: '35px 25px',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
  },
};

export default History;
