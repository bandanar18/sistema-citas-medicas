const pool = require('../config/db');

const ACTION_LABELS = {
  LOGIN:              'Inicio de Sesión',
  LOGOUT:             'Cierre de Sesión',
  PATIENT_CREATE:     'Registro de Paciente',
  PATIENT_UPDATE:     'Modificación de Paciente',
  APPOINTMENT_CREATE: 'Cita Agendada',
};

const getByDate = async (req, res) => {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];

  try {
    const result = await pool.query(
      `SELECT
         al.id,
         al.timestamp,
         al.username,
         al.action_type,
         al.detail
       FROM audit_log al
       WHERE DATE(al.timestamp) = $1
       ORDER BY al.timestamp DESC`,
      [targetDate]
    );

    const records = result.rows.map((r) => ({
      ...r,
      action_label: ACTION_LABELS[r.action_type] || r.action_type,
      detail_text: buildDetailText(r.action_type, r.detail),
    }));

    res.json({ date: targetDate, total: records.length, records });
  } catch (err) {
    console.error('[History] Error al obtener historial:', err.message);
    res.status(500).json({ error: 'Error al obtener el historial.' });
  }
};

const buildDetailText = (actionType, detail) => {
  if (!detail) return '—';
  switch (actionType) {
    case 'PATIENT_CREATE':
      return `Paciente: ${detail.full_name} | Member ID: ${detail.member_id}`;
    case 'PATIENT_UPDATE':
      return `Paciente ID ${detail.patient_id}: ${detail.full_name}`;
    case 'APPOINTMENT_CREATE':
      return `Paciente: ${detail.patient_name} | Dr./Dra.: ${detail.doctor_name} | ${detail.date} ${detail.time}`;
    case 'LOGIN':
    case 'LOGOUT':
      return 'Acceso al sistema';
    default:
      return JSON.stringify(detail);
  }
};

module.exports = { getByDate };
