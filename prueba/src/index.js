// Importa Express para crear la API HTTP.
const express = require("express");
// Carga variables de entorno desde .env.
const dotenv = require("dotenv");

// Conexion a Postgres para validar que esta disponible.
const { connectPostgres } = require("./db/postgres");
// Conexion a MongoDB (opcional) para validar disponibilidad.
const { connectMongo } = require("./db/mongo");
// Rutas del recurso clientes.
const clientesRouter = require("./routes/clientes");
// Rutas del recurso alumnos (MongoDB).
const alumnosRouter = require("./routes/alumnos");
// Ruta de salud para probar que la API responde.
const healthRouter = require("./routes/health");

// Activa la lectura de .env al iniciar.
dotenv.config();

// Crea la aplicacion Express.
const app = express();
// Habilita lectura de JSON en el body de las peticiones.
app.use(express.json());

// Registra ruta GET /health.
app.use("/health", healthRouter);
// Registra rutas CRUD /clientes.
app.use("/clientes", clientesRouter);
// Registra rutas CRUD /alumnos.
app.use("/alumnos", alumnosRouter);

// Define el puerto desde .env o usa 3000 por defecto.
const port = process.env.PORT || 3000;

// Inicia conexiones y luego levanta el servidor.
async function start() {
  // Verifica conexion a Postgres.
  await connectPostgres();
  // Verifica conexion a Mongo (si esta configurado).
  await connectMongo();

  // Levanta el servidor HTTP.
  app.listen(port, () => {
    console.log(`API en http://localhost:${port}`);
  });
}

// Ejecuta el arranque y captura errores.
start().catch((error) => {
  console.error("Error iniciando la API:", error);
  process.exit(1);
});
