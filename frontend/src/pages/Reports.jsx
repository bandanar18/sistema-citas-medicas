import React, { useState, useEffect } from 'react';
import client from '../api/client';
import Alert from '../components/UI/Alert';
import Spinner from '../components/UI/Spinner';

const today = () => new Date().toISOString().split('T')[0];

const formatDate = (iso) => {
  if (!iso) return '—';
  const [y, m, d] = (iso.split('T')[0]).split('-');
  return `${d}/${m}/${y}`;
};

const formatTime = (t) => {
  if (!t) return '—';
  const [h, min] = t.split(':');
  const hour = parseInt(h, 10);
  return `${hour > 12 ? hour - 12 : hour === 0 ? 12 : hour}:${min} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const Reports = () => {
  const [date, setDate]       = useState(today());
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert]     = useState(null);

  const fetchReport = (d) => {
    setLoading(true);
    setAlert(null);
    client.get(`/reports/daily?date=${d}`)
      .then((res) => setData(res.data))
      .catch((err) => setAlert({ type: 'error', message: err.networkError ? err.userMessage : 'Error al generar el reporte. Intente nuevamente.' }))
      .finally(() => setLoading(false));
  };

  // Cargar reporte del día al montar el componente
  useEffect(() => { fetchReport(today()); }, []);

  const handleGenerate = () => fetchReport(date);

  return (
    <div className="section-content">
      <h3 className="section-title">Reportes Diarios</h3>

      <div className="form-card" style={{ marginBottom: '20px' }}>
        <div className="search-bar" style={{ marginBottom: 0 }}>
          <label style={styles.filterLabel}>Seleccionar Fecha:</label>
          <input
            type="date"
            className="search-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ flexGrow: 0, width: '180px' }}
          />
          <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generando...' : 'Generar Reporte'}
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
                ? <><strong>{data.total}</strong> cita{data.total !== 1 ? 's' : ''} agendada{data.total !== 1 ? 's' : ''} para el <strong>{formatDate(data.date)}</strong></>
                : <>Reporte del <strong>{formatDate(data.date)}</strong></>
              }
            </span>
          </div>

          {data.total === 0 ? (
            <div style={styles.emptyBox}>
              <p style={{ color: 'var(--gris-texto)', marginBottom: '6px', fontWeight: '600' }}>
                No hay citas registradas para el {formatDate(data.date)}.
              </p>
              <p style={{ color: 'var(--gris-texto)', fontSize: '0.875rem' }}>
                Seleccione otra fecha o agende una cita nueva desde el módulo de búsqueda.
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Paciente</th>
                    <th>Member ID</th>
                    <th>Médico</th>
                    <th>Especialidad</th>
                    <th>Seguro</th>
                    <th>Clínica</th>
                    <th>Agendado por</th>
                  </tr>
                </thead>
                <tbody>
                  {data.appointments.map((a) => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: '600', color: 'var(--azul-mar)', whiteSpace: 'nowrap' }}>
                        {formatTime(a.appointment_time)}
                      </td>
                      <td style={{ fontWeight: '600' }}>{a.patient_name}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--gris-texto)' }}>{a.member_id}</td>
                      <td>{a.doctor_name}</td>
                      <td>{a.specialty}</td>
                      <td>{a.insurance}</td>
                      <td>
                        <div>{a.clinic_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--gris-texto)' }}>
                          {a.clinic_city}, {a.clinic_state}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--gris-texto)' }}>
                        {a.scheduled_by || '—'}
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
  summaryText: {
    fontSize: '0.9rem',
    color: 'var(--negro)',
  },
  emptyBox: {
    background: 'var(--blanco)',
    borderRadius: '8px',
    padding: '35px 25px',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
  },
};

export default Reports;
