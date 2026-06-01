import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../../api/client';
import Alert from '../../components/UI/Alert';

const formatDate = (iso) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('T')[0].split('-');
  return `${d}/${m}/${y}`;
};

const formatTime = (t) => {
  if (!t) return '—';
  const [h, min] = t.split(':');
  const hour = parseInt(h, 10);
  return `${hour > 12 ? hour - 12 : hour}:${min} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const Field = ({ label, value }) => (
  <div style={fieldStyles.group}>
    <span style={fieldStyles.label}>{label}</span>
    <span style={fieldStyles.value}>{value || '—'}</span>
  </div>
);

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    client.get(`/patients/${id}`)
      .then((res) => setPatient(res.data))
      .catch(() => setAlert({ type: 'error', message: 'No se pudo cargar el paciente.' }));
  }, [id]);

  if (!patient && !alert) {
    return <div className="section-content"><p style={{ color: 'var(--gris-texto)' }}>Cargando...</p></div>;
  }

  return (
    <div className="section-content">
      <h3 className="section-title">Detalle del Paciente</h3>

      {alert && <Alert type={alert.type} message={alert.message} />}

      {patient && (
        <>
          {/* Datos del paciente */}
          <div className="form-card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h4 style={{ color: 'var(--azul-mar)', fontSize: '1.2rem', marginBottom: '4px' }}>
                  {patient.full_name}
                </h4>
                <span style={styles.badge}>Member ID: {patient.member_id}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-primary" onClick={() => navigate(`/appointments/new?patient_id=${patient.id}&patient_name=${encodeURIComponent(patient.full_name)}`)}>
                  + Agendar Cita
                </button>
                <button className="btn-secondary" onClick={() => navigate(`/patients/${patient.id}/edit`)}>
                  Editar
                </button>
              </div>
            </div>

            <div style={styles.fieldsGrid}>
              <Field label="Fecha de Nacimiento" value={formatDate(patient.dob)} />
              <Field label="Sexo" value={patient.sex === 'M' ? 'Masculino' : 'Femenino'} />
              <Field label="Teléfono" value={patient.phone} />
              <Field label="Correo Electrónico" value={patient.email} />
              <Field label="Estado" value={patient.state} />
              <Field label="Ciudad" value={patient.city} />
              <Field label="Calle / Avenida" value={patient.address} />
              <Field label="Código Postal" value={patient.zip_code} />
              <Field label="Registrado el" value={formatDate(patient.created_at)} />
            </div>
          </div>

          {/* Citas del paciente */}
          <h4 style={{ color: 'var(--azul-mar)', marginBottom: '12px', fontSize: '1rem' }}>
            Citas Médicas ({patient.appointments?.length || 0})
          </h4>

          {patient.appointments?.length === 0 ? (
            <div style={styles.emptyAppts}>
              <p style={{ color: 'var(--gris-texto)', marginBottom: '10px' }}>
                Este paciente no tiene citas registradas.
              </p>
              <button className="btn-link"
                onClick={() => navigate(`/appointments/new?patient_id=${patient.id}&patient_name=${encodeURIComponent(patient.full_name)}`)}>
                + Agendar primera cita
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Médico</th>
                    <th>Especialidad</th>
                    <th>Seguro</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Clínica</th>
                  </tr>
                </thead>
                <tbody>
                  {patient.appointments.map((a) => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: '600' }}>{a.doctor_name}</td>
                      <td>{a.specialty}</td>
                      <td>{a.insurance}</td>
                      <td>{formatDate(a.appointment_date)}</td>
                      <td>{formatTime(a.appointment_time)}</td>
                      <td>{a.clinic_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: '20px' }}>
            <button className="btn-secondary" onClick={() => navigate(-1)}>
              ← Volver
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  badge: {
    backgroundColor: 'var(--blanco-fondo)',
    border: '1px solid var(--gris-claro)',
    borderRadius: '4px',
    padding: '3px 10px',
    fontSize: '0.85rem',
    color: 'var(--gris-texto)',
  },
  fieldsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  emptyAppts: {
    background: 'var(--blanco)',
    borderRadius: '8px',
    padding: '25px',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
  },
};

const fieldStyles = {
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  label: {
    fontSize: '0.78rem',
    color: 'var(--gris-texto)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  value: {
    fontSize: '0.95rem',
    color: 'var(--negro)',
  },
};

export default PatientDetail;
