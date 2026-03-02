// Carga data/clientes.csv en la tabla clientes_csv.
const fs = require("fs");
// Importa path para resolver rutas.
const path = require("path");
// Importa Pool de pg para conectarse a Postgres.
const { Pool } = require("pg");
// Carga variables de entorno.
require("dotenv").config();

// Ruta del CSV.
const csvPath = path.join(__dirname, "..", "data", "clientes.csv");

// Crea el pool con variables de entorno.
const pool = new Pool({
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  port: Number(process.env.PG_PORT || 5432),
});

// Parsea el CSV y retorna filas (sin header).
function parseCsv(content) {
  const lines = content.trim().split(/\r?\n/);
  const [, ...dataLines] = lines;
  return dataLines.map((line) => line.split(","));
}

async function main() {
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCsv(csvContent);

  // Inserta fila por fila en clientes_csv.
  for (const [nombre, telefono, ciudad] of rows) {
    await pool.query(
      "INSERT INTO clientes_csv(nombre, telefono, ciudad) VALUES ($1,$2,$3)",
      [nombre, telefono, ciudad]
    );
  }

  await pool.end();
  console.log("CSV cargado en clientes_csv");
}

main().catch((error) => {
  console.error("Error cargando CSV:", error);
  process.exit(1);
});
