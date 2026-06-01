const pool = require('../config/db');

const logAction = async (userId, username, actionType, detail = null) => {
  try {
    await pool.query(
      `INSERT INTO audit_log (user_id, username, action_type, detail)
       VALUES ($1, $2, $3, $4)`,
      [userId, username, actionType, detail ? JSON.stringify(detail) : null]
    );
  } catch (err) {
    console.error('[Audit] Error al registrar acción:', err.message);
  }
};

module.exports = logAction;
