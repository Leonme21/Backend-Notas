const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // En conexiones a Supabase desde la nube suele ser necesario habilitar SSL:
  ssl: {
    rejectUnauthorized: false
  }
});

// Comprobamos la conexión apenas inicie el archivo
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err.message);
  } else {
    console.log('✅ Conectado a la base de datos PostgreSQL/Supabase');
    release(); // siempre liberar el cliente
  }
});

module.exports = pool;
