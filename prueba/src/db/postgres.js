// Importa Pool para manejar conexiones a Postgres.
const { Pool } = require("pg");

// Guarda el pool en memoria para reutilizarlo.
let pool;

// Retorna el pool (lo crea si no existe).
function getPool() {
  if (!pool) {
    // Crea el pool con variables de entorno.
    pool = new Pool({
      host: process.env.PG_HOST,
      database: process.env.PG_DB,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      port: Number(process.env.PG_PORT || 5432),
    });
  }

  // Devuelve el pool listo para consultas.
  return pool;
}

// Prueba la conexion a Postgres con una consulta simple.
async function connectPostgres() {
  const client = await getPool().connect();
  await client.query("SELECT now()");
  client.release();
  console.log("Postgres conectado");
}

// Exporta funciones para usarlas en rutas.
module.exports = { getPool, connectPostgres };
