import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';
import Alert from '../../components/UI/Alert';
import useDebounce from '../../hooks/useDebounce';

const EMPTY = {
  doctor_name: '', specialty: '', npi: '', insurance: '',
  appointment_date: '', appointment_time: '',
  clinic_name: '', clinic_state: '', clinic_city: '',
  clinic_address: '', clinic_ref_number: '',
};

const AppointmentForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const preloadedPatientId   = searchParams.get('patient_id');
  const preloadedPatientName = searchParams.get('patient_name') || '';

  const [form, setForm]           = useState(EMPTY);
  const [errors, setErrors]       = useState({});
  const [alert, setAlert]         = useState(null);
  const [loading, setLoading]     = useState(false);

  // Búsqueda de paciente (cuando no viene preseleccionado)
  const [patientQuery, setPatientQuery]       = useState(preloadedPatientName);
  const [patientId, setPatientId]             = useState(preloadedPatientId || null);
  const [patientResults, setPatientResults]   = useState([]);
  const [showDropdown, setShowDropdown]       = useState(false);
  const [searchingPatient, setSearchingPatient] = useState(false);
  const debouncedPatient = useDebounce(patientQuery, 300);
  const dropdownRef = useRef(null);

  // Búsqueda de paciente dinámica
  useEffect(() => {
    if (preloadedPatientId || !debouncedPatient.trim() || debouncedPatient === preloadedPatientName) {
      setPatientResults([]);
      return;
    }
    setSearchingPatient(true);
    client.get(`/patients/search?q=${encodeURIComponent(debouncedPatient)}`)
      .then((res) => {
        setPatientResults(res.data.results);
        setShowDropdown(res.data.results.length > 0);
      })
      .catch(() => setPatientResults([]))
      .finally(() => setSearchingPatient(false));
  }, [debouncedPatient, preloadedPatientId]);

  // Cerrar dropdown al hacer clic afuera
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectPatient = (p) => {
    setPatientId(p.id);
    setPatientQuery(p.full_name);
    setShowDropdown(false);
    setPatientResults([]);
    if (errors.patient) setErrors((prev) => ({ ...prev, patient: null }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!patientId) newErrors.patient = 'Debe seleccionar un paciente.';
    const requiredFields = [
      'doctor_name', 'specialty', 'npi', 'insurance',
      'appointment_date', 'appointment_time',
      'clinic_name', 'clinic_state', 'clinic_city', 'clinic_address',
    ];
    requiredFields.forEach((f) => {
      if (!form[f]?.trim()) newErrors[f] = 'Este campo es obligatorio.';
    });
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setAlert({ type: 'error', message: 'Por favor complete todos los campos obligatorios.' });
      return;
    }

    setLoading(true);
    try {
      await client.post('/appointments', { ...form, patient_id: patientId });
      setAlert({ type: 'success', message: '¡Cita agendada exitosamente!' });
      setTimeout(() => navigate(`/patients/${patientId}`), 1400);
    } catch (err) {
      const data = err.response?.data;
      if (data?.conflict) {
        setAlert({ type: 'warning', message: data.error });
      } else {
        setAlert({ type: 'error', message: data?.error || 'Error al agendar la cita.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (f) => errors[f] ? 'input-error' : '';

  return (
    <div className="section-content">
      <h3 className="section-title">Agendar una Cita Médica</h3>

      <div className="form-card">
        <Alert type={alert?.type} message={alert?.message} />

        <form onSubmit={handleSubmit}>
          <div className="form-grid">

            {/* Paciente */}
            <div className="form-group full-width" ref={dropdownRef} style={{ position: 'relative' }}>
              <label>Paciente *</label>
              {preloadedPatientId ? (
                <div style={styles.patientLocked}>
                  <span style={styles.patientName}>{patientQuery}</span>
                  <button type="button" style={styles.changeBtn}
                    onClick={() => navigate('/')}>
                    Cambiar paciente
                  </button>
                </div>
              ) : (
                <>
                  <input
                    value={patientQuery}
                    onChange={(e) => { setPatientQuery(e.target.value); setPatientId(null); }}
                    placeholder="Busque el nombre o Member ID del paciente..."
                    className={inputClass('patient')}
                  />
                  {searchingPatient && (
                    <span style={styles.searchingHint}>Buscando...</span>
                  )}
                  {showDropdown && (
                    <div style={styles.dropdown}>
                      {patientResults.map((p) => (
                        <div key={p.id} style={styles.dropdownItem}
                          onClick={() => selectPatient(p)}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--blanco-fondo)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--blanco)'}>
                          <strong>{p.full_name}</strong>
                          <span style={{ color: 'var(--gris-texto)', fontSize: '0.82rem', marginLeft: '8px' }}>
                            {p.member_id}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              {errors.patient && <span style={errStyle}>{errors.patient}</span>}
            </div>

            {/* Médico */}
            <div className="form-group">
              <label>Nombre del Médico *</label>
              <input name="doctor_name" value={form.doctor_name} onChange={handleChange}
                placeholder="Coloque el Nombre del Médico" className={inputClass('doctor_name')} />
              {errors.doctor_name && <span style={errStyle}>{errors.doctor_name}</span>}
            </div>

            <div className="form-group">
              <label>Especialidad *</label>
              <input name="specialty" value={form.specialty} onChange={handleChange}
                placeholder="Ej: Cardiología, Pediatría..." className={inputClass('specialty')} />
              {errors.specialty && <span style={errStyle}>{errors.specialty}</span>}
            </div>

            <div className="form-group">
              <label>NPI *</label>
              <input name="npi" value={form.npi} onChange={handleChange}
                placeholder="Coloque el NPI" className={inputClass('npi')} />
              {errors.npi && <span style={errStyle}>{errors.npi}</span>}
            </div>

            <div className="form-group">
              <label>Nombre del Seguro *</label>
              <input name="insurance" value={form.insurance} onChange={handleChange}
                placeholder="Coloque el Nombre del Seguro" className={inputClass('insurance')} />
              {errors.insurance && <span style={errStyle}>{errors.insurance}</span>}
            </div>

            <div className="form-group">
              <label>Fecha de la Cita *</label>
              <input type="date" name="appointment_date" value={form.appointment_date}
                onChange={handleChange} className={inputClass('appointment_date')} />
              {errors.appointment_date && <span style={errStyle}>{errors.appointment_date}</span>}
            </div>

            <div className="form-group">
              <label>Hora de la Cita *</label>
              <input type="time" name="appointment_time" value={form.appointment_time}
                onChange={handleChange} className={inputClass('appointment_time')} />
              {errors.appointment_time && <span style={errStyle}>{errors.appointment_time}</span>}
            </div>

            <div className="form-group">
              <label>Nombre de la Clínica *</label>
              <input name="clinic_name" value={form.clinic_name} onChange={handleChange}
                placeholder="Coloque el Nombre de la Clínica" className={inputClass('clinic_name')} />
              {errors.clinic_name && <span style={errStyle}>{errors.clinic_name}</span>}
            </div>

            <div className="form-group">
              <label>Número de Referencia de la Clínica</label>
              <input name="clinic_ref_number" value={form.clinic_ref_number} onChange={handleChange}
                placeholder="Coloque el Número de Referencia" />
            </div>

            <div className="form-group">
              <label>Estado (Clínica) *</label>
              <input name="clinic_state" value={form.clinic_state} onChange={handleChange}
                placeholder="Ej: Florida" className={inputClass('clinic_state')} />
              {errors.clinic_state && <span style={errStyle}>{errors.clinic_state}</span>}
            </div>

            <div className="form-group">
              <label>Ciudad (Clínica) *</label>
              <input name="clinic_city" value={form.clinic_city} onChange={handleChange}
                placeholder="Ej: Miami" className={inputClass('clinic_city')} />
              {errors.clinic_city && <span style={errStyle}>{errors.clinic_city}</span>}
            </div>

            <div className="form-group full-width">
              <label>Dirección de la Clínica *</label>
              <input name="clinic_address" value={form.clinic_address} onChange={handleChange}
                placeholder="Coloque la Dirección de la Clínica" className={inputClass('clinic_address')} />
              {errors.clinic_address && <span style={errStyle}>{errors.clinic_address}</span>}
            </div>

          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Agendando...' : 'Agendar la Cita'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const errStyle = { color: 'var(--rojo-error)', fontSize: '0.8rem' };

const styles = {
  patientLocked: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    border: '1px solid var(--gris-claro)',
    borderRadius: '5px',
    backgroundColor: 'var(--blanco-fondo)',
  },
  patientName: {
    fontWeight: '600',
    color: 'var(--azul-mar)',
    flexGrow: 1,
  },
  changeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--gris-texto)',
    cursor: 'pointer',
    fontSize: '0.82rem',
    textDecoration: 'underline',
  },
  searchingHint: {
    fontSize: '0.8rem',
    color: 'var(--gris-texto)',
    marginTop: '4px',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'var(--blanco)',
    border: '1px solid var(--gris-claro)',
    borderRadius: '5px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    maxHeight: '200px',
    overflowY: 'auto',
  },
  dropdownItem: {
    padding: '10px 14px',
    cursor: 'pointer',
    backgroundColor: 'var(--blanco)',
    borderBottom: '1px solid var(--gris-claro)',
    fontSize: '0.9rem',
    transition: 'background 0.15s',
  },
};

export default AppointmentForm;
