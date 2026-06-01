const pool = require('../config/db');

const daily = async (req, res) => {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];

  try {
    const result = await pool.query(
      `SELECT
         a.id,
         a.appointment_date,
         a.appointment_time,
         a.doctor_name,
         a.specialty,
         a.npi,
         a.insurance,
         a.clinic_name,
         a.clinic_state,
         a.clinic_city,
         a.clinic_address,
         a.clinic_ref_number,
         p.id          AS patient_id,
         p.full_name   AS patient_name,
         p.member_id,
         p.phone       AS patient_phone,
         u.full_name   AS scheduled_by
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       LEFT JOIN users u ON u.id = a.created_by
       WHERE a.appointment_date = $1
       ORDER BY a.appointment_time ASC, p.full_name ASC`,
      [targetDate]
    );

    res.json({
      date: targetDate,
      total: result.rows.length,
      appointments: result.rows,
    });
  } catch (err) {
    console.error('[Reports] Error al generar reporte:', err.message);
    res.status(500).json({ error: 'Error al generar el reporte.' });
  }
};

module.exports = { daily };
