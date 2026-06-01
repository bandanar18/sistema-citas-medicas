const pool = require('../config/db');
const logAction = require('../middleware/auditLogger');

const create = async (req, res) => {
  const {
    patient_id,
    doctor_name,
    specialty,
    npi,
    insurance,
    appointment_date,
    appointment_time,
    clinic_name,
    clinic_state,
    clinic_city,
    clinic_address,
    clinic_ref_number,
  } = req.body;

  const required = {
    patient_id, doctor_name, specialty, npi, insurance,
    appointment_date, appointment_time, clinic_name,
    clinic_state, clinic_city, clinic_address,
  };
  const missing = Object.entries(required).filter(([, v]) => !v || !String(v).trim());
  if (missing.length > 0) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios.',
      fields: missing.map(([k]) => k),
    });
  }

  try {
    const patientCheck = await pool.query('SELECT id, full_name FROM patients WHERE id = $1', [patient_id]);
    if (patientCheck.rows.length === 0) {
      return res.status(404).json({ error: 'El paciente seleccionado no existe.' });
    }
    const patientName = patientCheck.rows[0].full_name;

    // Detección de conflicto: mismo médico, misma fecha y hora, distinto paciente
    const conflict = await pool.query(
      `SELECT a.id, p.full_name AS patient_name
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       WHERE LOWER(a.doctor_name) = LOWER($1)
         AND a.appointment_date = $2
         AND a.appointment_time = $3
         AND a.patient_id != $4`,
      [doctor_name.trim(), appointment_date, appointment_time, patient_id]
    );

    if (conflict.rows.length > 0) {
      const conflictPatient = conflict.rows[0].patient_name;
      return res.status(409).json({
        error: `Choque de horarios: El/La Dr./Dra. ${doctor_name} ya tiene una cita el ${appointment_date} a las ${appointment_time} con el/la paciente "${conflictPatient}".`,
        conflict: true,
      });
    }

    const result = await pool.query(
      `INSERT INTO appointments
         (patient_id, doctor_name, specialty, npi, insurance,
          appointment_date, appointment_time, clinic_name,
          clinic_state, clinic_city, clinic_address, clinic_ref_number, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        patient_id,
        doctor_name.trim(), specialty.trim(), npi.trim(), insurance.trim(),
        appointment_date, appointment_time,
        clinic_name.trim(), clinic_state.trim(), clinic_city.trim(),
        clinic_address.trim(), clinic_ref_number?.trim() || null,
        req.user.id,
      ]
    );

    const appt = result.rows[0];
    await logAction(req.user.id, req.user.username, 'APPOINTMENT_CREATE', {
      appointment_id: appt.id,
      patient_id,
      patient_name: patientName,
      doctor_name: appt.doctor_name,
      date: appointment_date,
      time: appointment_time,
    });

    res.status(201).json(appt);
  } catch (err) {
    console.error('[Appointments] Error al crear cita:', err.message);
    res.status(500).json({ error: 'Error interno al agendar la cita.' });
  }
};

const listByPatient = async (req, res) => {
  const { patient_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT a.*, p.full_name AS patient_name
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       WHERE a.patient_id = $1
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [patient_id]
    );
    res.json({ appointments: result.rows, total: result.rows.length });
  } catch (err) {
    console.error('[Appointments] Error al listar citas:', err.message);
    res.status(500).json({ error: 'Error al obtener las citas.' });
  }
};

module.exports = { create, listByPatient };
