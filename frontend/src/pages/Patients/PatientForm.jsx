import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../../api/client';
import Alert from '../../components/UI/Alert';

const EMPTY = {
  full_name: '', member_id: '', dob: '', sex: '',
  state: '', city: '', address: '', zip_code: '',
  phone: '', email: '',
};

const PatientForm = ({ mode }) => {
  const isEdit = mode === 'edit';
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    client.get(`/patients/${id}`)
      .then((res) => {
        const p = res.data;
        setForm({
          full_name: p.full_name || '',
          member_id: p.member_id || '',
          dob: p.dob ? p.dob.split('T')[0] : '',
          sex: p.sex || '',
          state: p.state || '',
          city: p.city || '',
          address: p.address || '',
          zip_code: p.zip_code || '',
          phone: p.phone || '',
          email: p.email || '',
        });
      })
      .catch(() => setAlert({ type: 'error', message: 'No se pudo cargar la información del paciente.' }))
      .finally(() => setLoadingData(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const required = ['full_name', 'member_id', 'dob', 'sex', 'state', 'city', 'address', 'zip_code', 'phone'];
    const newErrors = {};
    required.forEach((field) => {
      if (!form[field]?.trim()) newErrors[field] = 'Este campo es obligatorio.';
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
      if (isEdit) {
        await client.put(`/patients/${id}`, form);
        setAlert({ type: 'success', message: 'Paciente actualizado correctamente.' });
        setTimeout(() => navigate(`/patients/${id}`), 1200);
      } else {
        const res = await client.post('/patients', form);
        setAlert({ type: 'success', message: '¡Paciente registrado exitosamente!' });
        setTimeout(() => navigate(`/patients/${res.data.id}`), 1200);
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al guardar el paciente.';
      const field = err.response?.data?.field;
      if (field) setErrors((prev) => ({ ...prev, [field]: msg }));
      setAlert({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    errors[field] ? 'input-error' : '';

  if (loadingData) {
    return (
      <div className="section-content">
        <p style={{ color: 'var(--gris-texto)' }}>Cargando datos del paciente...</p>
      </div>
    );
  }

  return (
    <div className="section-content">
      <h3 className="section-title">
        {isEdit ? 'Editar Paciente' : 'Registrar a un Paciente Nuevo'}
      </h3>

      <div className="form-card">
        <Alert type={alert?.type} message={alert?.message} />

        <form onSubmit={handleSubmit}>
          <div className="form-grid">

            <div className="form-group">
              <label>Nombre del Paciente *</label>
              <input name="full_name" value={form.full_name} onChange={handleChange}
                placeholder="Coloque el Nombre del Paciente" className={inputClass('full_name')} />
              {errors.full_name && <span style={errStyle}>{errors.full_name}</span>}
            </div>

            <div className="form-group">
              <label>Member ID *</label>
              <input name="member_id" value={form.member_id} onChange={handleChange}
                placeholder="Coloque su Member ID" className={inputClass('member_id')} />
              {errors.member_id && <span style={errStyle}>{errors.member_id}</span>}
            </div>

            <div className="form-group">
              <label>Fecha de Nacimiento *</label>
              <input type="date" name="dob" value={form.dob} onChange={handleChange}
                className={inputClass('dob')} />
              {errors.dob && <span style={errStyle}>{errors.dob}</span>}
            </div>

            <div className="form-group">
              <label>Sexo *</label>
              <select name="sex" value={form.sex} onChange={handleChange}
                className={inputClass('sex')}>
                <option value="">Seleccione una opción...</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
              {errors.sex && <span style={errStyle}>{errors.sex}</span>}
            </div>

            <div className="form-group">
              <label>Teléfono *</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                placeholder="Coloque su Teléfono" className={inputClass('phone')} />
              {errors.phone && <span style={errStyle}>{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label>Correo Electrónico</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="Coloque su Correo Electrónico" />
            </div>

            <div className="form-group">
              <label>Estado *</label>
              <input name="state" value={form.state} onChange={handleChange}
                placeholder="Ej: Florida" className={inputClass('state')} />
              {errors.state && <span style={errStyle}>{errors.state}</span>}
            </div>

            <div className="form-group">
              <label>Ciudad *</label>
              <input name="city" value={form.city} onChange={handleChange}
                placeholder="Ej: Miami" className={inputClass('city')} />
              {errors.city && <span style={errStyle}>{errors.city}</span>}
            </div>

            <div className="form-group full-width">
              <label>Calle / Avenida *</label>
              <input name="address" value={form.address} onChange={handleChange}
                placeholder="Coloque la Calle o Avenida" className={inputClass('address')} />
              {errors.address && <span style={errStyle}>{errors.address}</span>}
            </div>

            <div className="form-group">
              <label>Código Postal *</label>
              <input name="zip_code" value={form.zip_code} onChange={handleChange}
                placeholder="Coloque su Código Postal" className={inputClass('zip_code')} />
              {errors.zip_code && <span style={errStyle}>{errors.zip_code}</span>}
            </div>

          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading
                ? (isEdit ? 'Actualizando...' : 'Registrando...')
                : (isEdit ? 'Guardar Cambios' : 'Registrar al Paciente')}
            </button>
            <button type="button" className="btn-secondary"
              onClick={() => navigate(isEdit ? `/patients/${id}` : '/')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const errStyle = { color: 'var(--rojo-error)', fontSize: '0.8rem' };

export default PatientForm;
