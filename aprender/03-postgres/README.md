# Citas medicas - Avance 03 (MongoDB + PostgreSQL)

API con Express, pacientes en MongoDB y doctores/citas en PostgreSQL.

## Requisitos
- Node.js 18+
- MongoDB en local
- PostgreSQL en local

## Como correr
1. Copia `.env.example` a `.env` y configura MongoDB y PostgreSQL.
2. Crea las tablas en PostgreSQL con `db/postgres/schema.sql`.
3. Instala dependencias: `npm install`
4. Ejecuta:
   - `npm run dev` (modo desarrollo)
   - `npm start` (modo produccion)

## Endpoints
- `GET /health`
- `GET /patients`
- `POST /patients`
- `GET /patients/:id`
- `PUT /patients/:id`
- `DELETE /patients/:id`
- `GET /doctors`
- `POST /doctors`
- `GET /doctors/:id`
- `PUT /doctors/:id`
- `DELETE /doctors/:id`
- `GET /appointments`
- `POST /appointments`
- `GET /appointments/:id`
- `PUT /appointments/:id`
- `DELETE /appointments/:id`

## Explicacion linea a linea (codigo)
Este avance mezcla **MongoDB (pacientes)** y **PostgreSQL (doctores/citas)**.
La idea es ver como conviven dos bases en una sola API: Mongo para datos flexibles,
Postgres para datos relacionales. Flujo mental: `package.json` -> `.env` -> `server.js`
(conecta a 2 BD) -> `app.js` (monta rutas) -> `routes` -> `repositories` -> `schema.sql`.

### `src/server.js`
```js
require("dotenv").config();

const app = require("./app");
const { connectMongo } = require("./config/mongo");
const { checkPostgres } = require("./config/postgres");

const port = process.env.PORT || 3000;

Promise.all([connectMongo(), checkPostgres()])
  .then(() => {
    app.listen(port, () => {
      console.log(`API escuchando en http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Error iniciando la API", error);
    process.exit(1);
  });
```
- `require("dotenv").config();` carga variables del archivo `.env`.
- `const app = require("./app");` importa la app de Express.
- `const { connectMongo } = require("./config/mongo");` conexion a MongoDB.
- `const { checkPostgres } = require("./config/postgres");` prueba conexion a PostgreSQL.
- `const port = process.env.PORT || 3000;` define el puerto.
- `Promise.all([connectMongo(), checkPostgres()])` conecta a ambas BD.
- `.then(() => { ... })` si ambas conectan, inicia la API.
- `app.listen(port, ...)` levanta el servidor HTTP.
- `console.log(...)` imprime la URL local.
- `.catch((error) => { ... })` maneja errores.
- `console.error(...)` imprime el error.
- `process.exit(1);` termina el proceso si falla.

**Por que `Promise.all`**: necesitas asegurar que **ambas** BD estan listas antes de
recibir requests. Si una falla, se cae todo para no dejar la API incompleta.

### `src/app.js`
```js
const express = require("express");
const patientsRouter = require("./routes/patients");
const doctorsRouter = require("./routes/doctors");
const appointmentsRouter = require("./routes/appointments");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/patients", patientsRouter);
app.use("/doctors", doctorsRouter);
app.use("/appointments", appointmentsRouter);

module.exports = app;
```
- `const express = require("express");` importa Express.
- `const patientsRouter = require("./routes/patients");` rutas pacientes.
- `const doctorsRouter = require("./routes/doctors");` rutas doctores.
- `const appointmentsRouter = require("./routes/appointments");` rutas citas.
- `const app = express();` crea la app.
- `app.use(express.json());` habilita body JSON.
- `app.get("/health", ...)` endpoint de salud.
- `res.json({ status: "ok" });` responde ok.
- `app.use("/patients", patientsRouter);` monta rutas.
- `app.use("/doctors", doctorsRouter);` monta rutas.
- `app.use("/appointments", appointmentsRouter);` monta rutas.
- `module.exports = app;` exporta app.

**Relacion con rutas**: `app.js` solo organiza. La logica de Mongo/Postgres esta en
los repositorios, y las rutas solo orquestan.

### `src/config/mongo.js`
```js
const { MongoClient, ObjectId } = require("mongodb");

let client;
let db;

async function connectMongo() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB;
  if (!uri || !dbName) {
    throw new Error("Missing MONGO_URI or MONGO_DB");
  }
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  return db;
}

function getDb() {
  if (!db) {
    throw new Error("MongoDB not connected");
  }
  return db;
}

function toObjectId(id) {
  return new ObjectId(id);
}

module.exports = {
  connectMongo,
  getDb,
  toObjectId,
};
```
- `const { MongoClient, ObjectId } = require("mongodb");` importa driver.
- `let client;` cliente Mongo.
- `let db;` referencia a la base.
- `async function connectMongo() { ... }` conecta a Mongo.
- `const uri = process.env.MONGO_URI;` lee URI.
- `const dbName = process.env.MONGO_DB;` lee nombre DB.
- `if (!uri || !dbName) { ... }` valida config.
- `throw new Error(...)` si falta config.
- `client = new MongoClient(uri);` crea cliente.
- `await client.connect();` abre conexion.
- `db = client.db(dbName);` selecciona base.
- `return db;` devuelve la base.
- `function getDb() { ... }` obtiene DB conectada.
- `if (!db) { ... }` valida conexion.
- `throw new Error(...)` error si no hay.
- `return db;` devuelve DB.
- `function toObjectId(id) { ... }` convierte string a ObjectId.
- `return new ObjectId(id);` crea ObjectId.
- `module.exports = { ... };` exporta funciones.

**Por que igual al avance 02**: se reutiliza la misma logica para Mongo, solo que
ahora se combina con Postgres.

### `src/config/postgres.js`
```js
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT || 5432),
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

async function checkPostgres() {
  await pool.query("SELECT 1");
}

module.exports = {
  pool,
  checkPostgres,
};
```
- `const { Pool } = require("pg");` importa pool de PostgreSQL.
- `const pool = new Pool({ ... })` crea pool de conexiones.
- `host` host de la BD.
- `port` puerto de la BD.
- `user` usuario.
- `password` clave.
- `database` nombre de la BD.
- `async function checkPostgres() { ... }` valida conexion.
- `await pool.query("SELECT 1");` consulta simple.
- `module.exports = { ... };` exporta pool y check.

**Relacion con repositorios**: todos los repositorios de Postgres usan este `pool`,
asi no se crean conexiones nuevas en cada request.

### `src/repositories/patientsMongoRepo.js`
```js
const { getDb, toObjectId } = require("../config/mongo");

const collectionName = "patients";

async function listPatients() {
  const db = getDb();
  return db.collection(collectionName).find({}).toArray();
}

async function getPatientById(id) {
  const db = getDb();
  return db.collection(collectionName).findOne({ _id: toObjectId(id) });
}

async function createPatient(data) {
  const db = getDb();
  const result = await db.collection(collectionName).insertOne({
    name: data.name,
    email: data.email || "",
    phone: data.phone || "",
    createdAt: new Date(),
  });
  return getPatientById(result.insertedId.toString());
}

async function updatePatient(id, data) {
  const db = getDb();
  await db
    .collection(collectionName)
    .updateOne(
      { _id: toObjectId(id) },
      { $set: { ...data, updatedAt: new Date() } }
    );
  return getPatientById(id);
}

async function deletePatient(id) {
  const db = getDb();
  const existing = await getPatientById(id);
  if (!existing) return null;
  await db.collection(collectionName).deleteOne({ _id: toObjectId(id) });
  return existing;
}

module.exports = {
  listPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
};
```
- `const { getDb, toObjectId } = require("../config/mongo");` helpers Mongo.
- `const collectionName = "patients";` coleccion.
- `listPatients()` lista todos.
- `getPatientById(id)` busca por id.
- `createPatient(data)` inserta paciente.
- `email: data.email || ""` default si falta.
- `phone: data.phone || ""` default si falta.
- `createdAt: new Date()` fecha creacion.
- `updatePatient(id, data)` actualiza campos.
- `updatedAt: new Date()` fecha update.
- `deletePatient(id)` elimina y devuelve el documento.
- `module.exports = { ... };` exporta funciones.

**Relacion con rutas**: las rutas de pacientes llaman a este repo para no escribir
SQL ni logica de Mongo dentro del endpoint.

### `src/repositories/doctorsPgRepo.js`
```js
const { pool } = require("../config/postgres");

async function listDoctors() {
  const result = await pool.query(
    "SELECT id, name, specialty, email, created_at FROM doctors ORDER BY id"
  );
  return result.rows;
}

async function getDoctorById(id) {
  const result = await pool.query(
    "SELECT id, name, specialty, email, created_at FROM doctors WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
}

async function createDoctor(data) {
  const result = await pool.query(
    "INSERT INTO doctors (name, specialty, email) VALUES ($1, $2, $3) RETURNING id, name, specialty, email, created_at",
    [data.name, data.specialty, data.email || null]
  );
  return result.rows[0];
}

async function updateDoctor(id, data) {
  const result = await pool.query(
    `UPDATE doctors
     SET name = COALESCE($2, name),
         specialty = COALESCE($3, specialty),
         email = COALESCE($4, email)
     WHERE id = $1
     RETURNING id, name, specialty, email, created_at`,
    [id, data.name || null, data.specialty || null, data.email || null]
  );
  return result.rows[0] || null;
}

async function deleteDoctor(id) {
  const result = await pool.query(
    "DELETE FROM doctors WHERE id = $1 RETURNING id, name, specialty, email, created_at",
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  listDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
```
- `const { pool } = require("../config/postgres");` usa pool.
- `listDoctors()` lista doctores.
- `pool.query("SELECT ...")` consulta SQL.
- `return result.rows;` devuelve filas.
- `getDoctorById(id)` consulta por id.
- `RETURNING ...` devuelve el registro creado/actualizado.
- `createDoctor(data)` inserta doctor.
- `updateDoctor(id, data)` actualiza con `COALESCE`.
- `deleteDoctor(id)` elimina y devuelve.
- `module.exports = { ... };` exporta funciones.

**Por que SQL directo**: en este avance usas consultas SQL sencillas para aprender
CRUD con Postgres sin un ORM.

### `src/repositories/appointmentsPgRepo.js`
```js
const { pool } = require("../config/postgres");

async function listAppointments() {
  const result = await pool.query(
    `SELECT id, patient_id, doctor_id, appointment_date, reason, status, created_at
     FROM appointments
     ORDER BY appointment_date`
  );
  return result.rows;
}

async function getAppointmentById(id) {
  const result = await pool.query(
    `SELECT id, patient_id, doctor_id, appointment_date, reason, status, created_at
     FROM appointments
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function createAppointment(data) {
  const result = await pool.query(
    `INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, patient_id, doctor_id, appointment_date, reason, status, created_at`,
    [
      data.patientId,
      data.doctorId,
      data.appointmentDate,
      data.reason || null,
      data.status || "scheduled",
    ]
  );
  return result.rows[0];
}

async function updateAppointment(id, data) {
  const result = await pool.query(
    `UPDATE appointments
     SET patient_id = COALESCE($2, patient_id),
         doctor_id = COALESCE($3, doctor_id),
         appointment_date = COALESCE($4, appointment_date),
         reason = COALESCE($5, reason),
         status = COALESCE($6, status)
     WHERE id = $1
     RETURNING id, patient_id, doctor_id, appointment_date, reason, status, created_at`,
    [
      id,
      data.patientId || null,
      data.doctorId || null,
      data.appointmentDate || null,
      data.reason || null,
      data.status || null,
    ]
  );
  return result.rows[0] || null;
}

async function deleteAppointment(id) {
  const result = await pool.query(
    `DELETE FROM appointments
     WHERE id = $1
     RETURNING id, patient_id, doctor_id, appointment_date, reason, status, created_at`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  listAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
```
- `listAppointments()` lista todas las citas.
- `getAppointmentById(id)` busca por id.
- `createAppointment(data)` inserta cita.
- `data.status || "scheduled"` estado por defecto.
- `updateAppointment(id, data)` actualiza con `COALESCE`.
- `deleteAppointment(id)` elimina y devuelve.
- `module.exports = { ... };` exporta funciones.

**Relacion con citas**: `patient_id` viene de Mongo (string) y `doctor_id` es
relacional en Postgres. Aqui se ve la integracion entre bases.

### `src/routes/patients.js`
```js
const express = require("express");
const repo = require("../repositories/patientsMongoRepo");

const router = express.Router();

router.get("/", async (req, res) => {
  const patients = await repo.listPatients();
  res.json(patients);
});

router.get("/:id", async (req, res) => {
  const patient = await repo.getPatientById(req.params.id);
  if (!patient) {
    return res.status(404).json({ error: "Patient not found" });
  }
  res.json(patient);
});

router.post("/", async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const patient = await repo.createPatient({ name, email, phone });
  res.status(201).json(patient);
});

router.put("/:id", async (req, res) => {
  const { name, email, phone } = req.body;
  const patient = await repo.updatePatient(req.params.id, {
    name,
    email,
    phone,
  });
  if (!patient) {
    return res.status(404).json({ error: "Patient not found" });
  }
  res.json(patient);
});

router.delete("/:id", async (req, res) => {
  const patient = await repo.deletePatient(req.params.id);
  if (!patient) {
    return res.status(404).json({ error: "Patient not found" });
  }
  res.json(patient);
});

module.exports = router;
```
- `const express = require("express");` importa Express.
- `const repo = require("../repositories/patientsMongoRepo");` repo Mongo.
- `const router = express.Router();` crea router.
- `router.get("/", ...)` lista pacientes.
- `repo.listPatients()` obtiene lista.
- `res.json(patients);` responde lista.
- `router.get("/:id", ...)` obtiene paciente por id.
- `repo.getPatientById(...)` consulta Mongo.
- `if (!patient) ...` valida existencia.
- `return res.status(404)...` error si no existe.
- `router.post("/", ...)` crea paciente.
- `if (!name) ...` valida nombre.
- `router.put("/:id", ...)` actualiza paciente.
- `router.delete("/:id", ...)` elimina paciente.
- `module.exports = router;` exporta router.

**Por que separado**: mantener pacientes (Mongo) separado de doctores/citas (Postgres)
te ayuda a entender responsabilidades.

### `src/routes/doctors.js`
```js
const express = require("express");
const repo = require("../repositories/doctorsPgRepo");

const router = express.Router();

router.get("/", async (req, res) => {
  const doctors = await repo.listDoctors();
  res.json(doctors);
});

router.get("/:id", async (req, res) => {
  const doctor = await repo.getDoctorById(req.params.id);
  if (!doctor) {
    return res.status(404).json({ error: "Doctor not found" });
  }
  res.json(doctor);
});

router.post("/", async (req, res) => {
  const { name, specialty, email } = req.body;
  if (!name || !specialty) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const doctor = await repo.createDoctor({ name, specialty, email });
  res.status(201).json(doctor);
});

router.put("/:id", async (req, res) => {
  const { name, specialty, email } = req.body;
  const doctor = await repo.updateDoctor(req.params.id, {
    name,
    specialty,
    email,
  });
  if (!doctor) {
    return res.status(404).json({ error: "Doctor not found" });
  }
  res.json(doctor);
});

router.delete("/:id", async (req, res) => {
  const doctor = await repo.deleteDoctor(req.params.id);
  if (!doctor) {
    return res.status(404).json({ error: "Doctor not found" });
  }
  res.json(doctor);
});

module.exports = router;
```
- `const repo = require("../repositories/doctorsPgRepo");` repo Postgres.
- `router.get("/", ...)` lista doctores.
- `router.get("/:id", ...)` obtiene doctor.
- `router.post("/", ...)` crea doctor.
- `router.put("/:id", ...)` actualiza doctor.
- `router.delete("/:id", ...)` elimina doctor.
- `module.exports = router;` exporta router.

**Relacion con schema**: estas rutas usan la tabla `doctors` definida en `schema.sql`.

### `src/routes/appointments.js`
```js
const express = require("express");
const repo = require("../repositories/appointmentsPgRepo");

const router = express.Router();

router.get("/", async (req, res) => {
  const appointments = await repo.listAppointments();
  res.json(appointments);
});

router.get("/:id", async (req, res) => {
  const appointment = await repo.getAppointmentById(req.params.id);
  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  res.json(appointment);
});

router.post("/", async (req, res) => {
  const { patientId, doctorId, appointmentDate, reason, status } = req.body;
  if (!patientId || !doctorId || !appointmentDate) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const appointment = await repo.createAppointment({
    patientId,
    doctorId,
    appointmentDate,
    reason,
    status,
  });
  res.status(201).json(appointment);
});

router.put("/:id", async (req, res) => {
  const { patientId, doctorId, appointmentDate, reason, status } = req.body;
  const appointment = await repo.updateAppointment(req.params.id, {
    patientId,
    doctorId,
    appointmentDate,
    reason,
    status,
  });
  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  res.json(appointment);
});

router.delete("/:id", async (req, res) => {
  const appointment = await repo.deleteAppointment(req.params.id);
  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  res.json(appointment);
});

module.exports = router;
```
- `const repo = require("../repositories/appointmentsPgRepo");` repo citas.
- `router.get("/", ...)` lista citas.
- `router.get("/:id", ...)` obtiene cita.
- `router.post("/", ...)` crea cita.
- `router.put("/:id", ...)` actualiza cita.
- `router.delete("/:id", ...)` elimina cita.
- `module.exports = router;` exporta router.

**Relacion con schema**: estas rutas operan sobre `appointments` en Postgres.
El campo `patient_id` es un id de Mongo, por eso es VARCHAR.

### `package.json`
```json
{
  "name": "citas-medicas-03-postgres",
  "version": "1.0.0",
  "description": "API con MongoDB para pacientes y PostgreSQL para doctores/citas",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "dotenv": "latest",
    "express": "latest",
    "mongodb": "latest",
    "pg": "latest"
  },
  "devDependencies": {
    "nodemon": "latest"
  }
}
```
- `"name"` nombre del paquete.
- `"version"` version del proyecto.
- `"description"` descripcion corta.
- `"main"` archivo de entrada.
- `"scripts"` comandos npm.
- `"start"` corre la API.
- `"dev"` corre con nodemon.
- `"dependencies"` dependencias de produccion.
- `"mongodb"` driver Mongo.
- `"pg"` driver Postgres.
- `"devDependencies"` dependencias de desarrollo.
- `"nodemon"` reinicia en cambios.

**Relacion con ejecucion**: `npm start` llama a `src/server.js`, que es el archivo
que conecta ambas BD y arranca la API.

### `.env.example`
```bash
PORT=3000
MONGO_URI=mongodb://localhost:27017
MONGO_DB=citas_medicas
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=postgres
PG_DATABASE=citas_medicas
```
- `PORT=3000` puerto local.
- `MONGO_URI=...` URL MongoDB.
- `MONGO_DB=...` base Mongo.
- `PG_HOST=...` host Postgres.
- `PG_PORT=...` puerto Postgres.
- `PG_USER=...` usuario Postgres.
- `PG_PASSWORD=...` password Postgres.
- `PG_DATABASE=...` base Postgres.

**Por que variables separadas**: Mongo y Postgres tienen configuraciones distintas.
Separarlas evita mezclar credenciales y facilita cambiar entornos.

### `db/postgres/schema.sql`
```sql
CREATE TABLE IF NOT EXISTS doctors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  specialty VARCHAR(120) NOT NULL,
  email VARCHAR(120) UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  patient_id VARCHAR(40) NOT NULL,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id),
  appointment_date TIMESTAMP NOT NULL,
  reason TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS appointments_doctor_idx
  ON appointments(doctor_id);

CREATE INDEX IF NOT EXISTS appointments_patient_idx
  ON appointments(patient_id);
```
- `CREATE TABLE IF NOT EXISTS doctors` crea tabla doctores.
- `id SERIAL PRIMARY KEY` id autoincremental.
- `name ... NOT NULL` nombre requerido.
- `specialty ... NOT NULL` especialidad requerida.
- `email ... UNIQUE` email unico.
- `created_at ... DEFAULT NOW()` fecha de creacion.
- `CREATE TABLE IF NOT EXISTS appointments` crea tabla citas.
- `patient_id VARCHAR(40)` id del paciente (Mongo).
- `doctor_id INTEGER REFERENCES doctors(id)` llave foranea.
- `appointment_date TIMESTAMP` fecha y hora.
- `reason TEXT` motivo.
- `status ... DEFAULT 'scheduled'` estado.
- `CREATE INDEX ... doctor_id` indice por doctor.
- `CREATE INDEX ... patient_id` indice por paciente.

**Por que schema**: define la estructura relacional que las rutas de Postgres usan.
Sin estas tablas, las rutas de doctores/citas fallan.
