const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const connectWithRetry = async (retries = 10, delayMs = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect();
      client.release();
      console.log('Conexión a la base de datos establecida.');
      return;
    } catch (err) {
      console.log(`[DB] Intento ${attempt}/${retries} fallido: ${err.message}`);
      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }
  }
  console.error('No se pudo conectar a la base de datos. Cerrando servidor.');
  process.exit(1);
};

connectWithRetry();

module.exports = pool;
