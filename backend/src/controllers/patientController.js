const pool = require('../config/db');
const logAction = require('../middleware/auditLogger');

const search = async (req, res) => {
  const { q = '' } = req.query;
  const term = q.trim();

  if (!term) {
    return res.json({ results: [], total: 0 });
  }

  try {
    const like = `%${term}%`;
    const result = await pool.query(
      `SELECT id, full_name, member_id, dob, sex, phone, email, state, city
       FROM patients
       WHERE full_name ILIKE $1
          OR member_id ILIKE $1
          OR phone     ILIKE $1
          OR email     ILIKE $1
       ORDER BY full_name ASC
       LIMIT 50`,
      [like]
    );
    res.json({ results: result.rows, total: result.rows.length });
  } catch (err) {
    console.error('[Patients] Error en búsqueda:', err.message);
    res.status(500).json({ error: 'Error al realizar la búsqueda.' });
  }
};

const create = async (req, res) => {
  const {
    full_name, member_id, dob, sex,
    state, city, address, zip_code,
    phone, email,
  } = req.body;

  const required = { full_name, member_id, dob, sex, state, city, address, zip_code, phone };
  const missing = Object.entries(required).filter(([, v]) => !v || !String(v).trim());
  if (missing.length > 0) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios.',
      fields: missing.map(([k]) => k),
    });
  }

  try {
    const dupMember = await pool.query(
      'SELECT id FROM patients WHERE member_id = $1',
      [member_id.trim()]
    );
    if (dupMember.rows.length > 0) {
      return res.status(409).json({
        error: `El Member ID "${member_id}" ya está registrado en el sistema.`,
        field: 'member_id',
      });
    }

    const dupName = await pool.query(
      'SELECT id FROM patients WHERE LOWER(full_name) = LOWER($1) AND dob = $2',
      [full_name.trim(), dob]
    );
    if (dupName.rows.length > 0) {
      return res.status(409).json({
        error: `Ya existe un paciente con el nombre "${full_name}" y la misma fecha de nacimiento.`,
        field: 'full_name',
      });
    }

    const result = await pool.query(
      `INSERT INTO patients
         (full_name, member_id, dob, sex, state, city, address, zip_code, phone, email, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        full_name.trim(), member_id.trim(), dob, sex,
        state.trim(), city.trim(), address.trim(), zip_code.trim(),
        phone.trim(), email?.trim() || null,
        req.user.id,
      ]
    );

    const patient = result.rows[0];
    await logAction(req.user.id, req.user.username, 'PATIENT_CREATE', {
      patient_id: patient.id,
      full_name: patient.full_name,
      member_id: patient.member_id,
    });

    res.status(201).json(patient);
  } catch (err) {
    console.error('[Patients] Error al crear paciente:', err.message);
    res.status(500).json({ error: 'Error interno al registrar el paciente.' });
  }
};

const getById = async (req, res) => {
  const { id } = req.params;

  try {
    const patientResult = await pool.query(
      'SELECT * FROM patients WHERE id = $1',
      [id]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado.' });
    }

    const appointmentsResult = await pool.query(
      `SELECT a.*, u.full_name AS created_by_name
       FROM appointments a
       LEFT JOIN users u ON u.id = a.created_by
       WHERE a.patient_id = $1
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [id]
    );

    res.json({
      ...patientResult.rows[0],
      appointments: appointmentsResult.rows,
    });
  } catch (err) {
    console.error('[Patients] Error al obtener paciente:', err.message);
    res.status(500).json({ error: 'Error interno al obtener el paciente.' });
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const {
    full_name, member_id, dob, sex,
    state, city, address, zip_code,
    phone, email,
  } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado.' });
    }

    if (member_id) {
      const dupMember = await pool.query(
        'SELECT id FROM patients WHERE member_id = $1 AND id != $2',
        [member_id.trim(), id]
      );
      if (dupMember.rows.length > 0) {
        return res.status(409).json({
          error: `El Member ID "${member_id}" ya está en uso por otro paciente.`,
          field: 'member_id',
        });
      }
    }

    const current = existing.rows[0];
    const updated = {
      full_name:  full_name?.trim()  || current.full_name,
      member_id:  member_id?.trim()  || current.member_id,
      dob:        dob                || current.dob,
      sex:        sex                || current.sex,
      state:      state?.trim()      || current.state,
      city:       city?.trim()       || current.city,
      address:    address?.trim()    || current.address,
      zip_code:   zip_code?.trim()   || current.zip_code,
      phone:      phone?.trim()      || current.phone,
      email:      email !== undefined ? (email?.trim() || null) : current.email,
    };

    const result = await pool.query(
      `UPDATE patients SET
         full_name=$1, member_id=$2, dob=$3, sex=$4,
         state=$5, city=$6, address=$7, zip_code=$8,
         phone=$9, email=$10, updated_at=NOW()
       WHERE id=$11
       RETURNING *`,
      [
        updated.full_name, updated.member_id, updated.dob, updated.sex,
        updated.state, updated.city, updated.address, updated.zip_code,
        updated.phone, updated.email, id,
      ]
    );

    await logAction(req.user.id, req.user.username, 'PATIENT_UPDATE', {
      patient_id: Number(id),
      full_name: updated.full_name,
    });

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[Patients] Error al actualizar paciente:', err.message);
    res.status(500).json({ error: 'Error interno al actualizar el paciente.' });
  }
};

module.exports = { search, create, getById, update };
