# Citas medicas - Avance 05 (Final)

Proyecto de API para citas medicas con:
- MongoDB (pacientes)
- PostgreSQL (doctores y citas)
- Procedimientos almacenados
- Colecciones para Postman y Thunder Client
- Tests de API con Jest + Supertest

## Requisitos
- Node.js 18+
- MongoDB en local
- PostgreSQL en local

## Configuracion
1. Copia `.env.example` a `.env` y ajusta credenciales.
2. Ejecuta el schema:
   - `db/postgres/schema.sql`
   - `db/postgres/procedures.sql`
3. Instala dependencias: `npm install`

## Como correr
- `npm run dev`
- `npm start`

## Tests
- `npm test`

## Postman y Thunder Client
- Postman: importa `docs/postman_collection.json`
- Thunder Client: importa `docs/thunder-collection.json`

## Endpoints principales
- `GET /health`
- `GET /patients`
- `GET /doctors`
- `GET /appointments`
- `POST /appointments/sp`
- `GET /doctors/:id/agenda?from=2026-03-01&to=2026-03-31`

## Explicacion linea a linea (codigo)
Este es el avance final: integra MongoDB, PostgreSQL, procedimientos almacenados,
documentacion (Postman/Thunder) y tests. El objetivo es que veas el flujo completo:
configuracion -> conexion -> rutas -> repositorios -> BD -> pruebas -> documentacion.

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
- Carga variables de entorno.
- Importa la app y conecta Mongo/Postgres.
- Define puerto.
- Conecta ambas BD y levanta servidor.
- Maneja errores y termina si falla.

**Por que aqui**: el servidor solo se levanta si **ambas** BD conectan. Esto evita
una API encendida con dependencias rotas.

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
- Configura Express, JSON y rutas.
- Endpoint `/health`.

**Relacion con pruebas**: los tests importan `app` directamente para probar rutas
sin levantar el servidor real.

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
- Conecta a Mongo y expone helpers.

**Relacion con repositorio**: `patientsMongoRepo` usa `getDb()` y `toObjectId()`.

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
- Crea pool y valida conexion.

**Por que pool**: reutiliza conexiones y evita abrir una por request.

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
- CRUD de pacientes en MongoDB.

**Por que separado**: aisla la logica de acceso a datos; las rutas solo llaman funciones.

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
- CRUD de doctores en PostgreSQL.

**Relacion con schema**: estas consultas funcionan sobre la tabla `doctors`.

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

async function createAppointmentSP(data) {
  const result = await pool.query(
    "SELECT * FROM schedule_appointment($1, $2, $3, $4)",
    [data.patientId, data.doctorId, data.appointmentDate, data.reason || null]
  );
  return result.rows[0];
}

async function listDoctorAgenda(doctorId, fromDate, toDate) {
  const result = await pool.query(
    "SELECT * FROM get_doctor_agenda($1, $2, $3)",
    [doctorId, fromDate, toDate]
  );
  return result.rows;
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
  createAppointmentSP,
  listDoctorAgenda,
  updateAppointment,
  deleteAppointment,
};
```
- CRUD de citas y funciones con procedimientos.

**Relacion con procedimientos**: `createAppointmentSP` y `listDoctorAgenda`
usan funciones definidas en `db/postgres/procedures.sql`.

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
- CRUD pacientes (Mongo).

**Relacion con Mongo**: aqui se valida input y se delega el guardado al repositorio.

### `src/routes/doctors.js`
```js
const express = require("express");
const repo = require("../repositories/doctorsPgRepo");
const appointmentsRepo = require("../repositories/appointmentsPgRepo");

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

router.get("/:id/agenda", async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ error: "Missing from/to query params" });
  }
  const agenda = await appointmentsRepo.listDoctorAgenda(
    req.params.id,
    from,
    to
  );
  res.json(agenda);
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
- CRUD doctores y agenda por procedimiento.

**Por que agenda**: muestra como consultar un SP con parametros `from/to`.

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

router.post("/sp", async (req, res) => {
  const { patientId, doctorId, appointmentDate, reason } = req.body;
  if (!patientId || !doctorId || !appointmentDate) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const appointment = await repo.createAppointmentSP({
    patientId,
    doctorId,
    appointmentDate,
    reason,
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
- CRUD de citas y endpoint `/appointments/sp`.

**Por que dos formas**: `POST /appointments` usa SQL directo; `POST /appointments/sp`
usa el procedimiento almacenado para comparar enfoques.

### `package.json`
```json
{
  "name": "citas-medicas-05-final",
  "version": "1.0.0",
  "description": "API final con MongoDB, PostgreSQL, procedimientos y tests",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest --runInBand"
  },
  "dependencies": {
    "dotenv": "latest",
    "express": "latest",
    "mongodb": "latest",
    "pg": "latest"
  },
  "devDependencies": {
    "jest": "latest",
    "nodemon": "latest",
    "supertest": "latest"
  }
}
```
- Scripts: `start`, `dev`, `test`.
- Dependencias de runtime y de test.

**Relacion con pruebas**: `npm test` ejecuta Jest y usa Supertest para simular HTTP.

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
- Variables de entorno para Mongo y Postgres.

**Por que importante**: separa configuracion de codigo; puedes cambiar host/usuario
sin tocar archivos fuente.

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
- Tablas y indices de Postgres.

**Relacion con la API**: sin estas tablas, los repositorios de Postgres fallan.

### `db/postgres/procedures.sql`
```sql
CREATE OR REPLACE FUNCTION schedule_appointment(
  p_patient_id VARCHAR,
  p_doctor_id INTEGER,
  p_date TIMESTAMP,
  p_reason TEXT
)
RETURNS TABLE (
  id INTEGER,
  patient_id VARCHAR,
  doctor_id INTEGER,
  appointment_date TIMESTAMP,
  reason TEXT,
  status VARCHAR,
  created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason, status)
  VALUES (p_patient_id, p_doctor_id, p_date, p_reason, 'scheduled')
  RETURNING appointments.id,
            appointments.patient_id,
            appointments.doctor_id,
            appointments.appointment_date,
            appointments.reason,
            appointments.status,
            appointments.created_at;
END;
$$;

CREATE OR REPLACE FUNCTION get_doctor_agenda(
  p_doctor_id INTEGER,
  p_from TIMESTAMP,
  p_to TIMESTAMP
)
RETURNS TABLE (
  id INTEGER,
  patient_id VARCHAR,
  doctor_id INTEGER,
  appointment_date TIMESTAMP,
  reason TEXT,
  status VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT a.id,
         a.patient_id,
         a.doctor_id,
         a.appointment_date,
         a.reason,
         a.status
  FROM appointments a
  WHERE a.doctor_id = p_doctor_id
    AND a.appointment_date BETWEEN p_from AND p_to
  ORDER BY a.appointment_date;
END;
$$;
```
- `schedule_appointment` inserta cita y retorna fila.
- `get_doctor_agenda` devuelve agenda por rango.

**Relacion con rutas**: el endpoint `/doctors/:id/agenda` depende de este SP.

### `docs/normalizacion.md`
```md
# Normalizacion (resumen)

Este ejemplo separa entidades para evitar duplicidad:

- Pacientes viven en MongoDB (flexible para datos personales).
- Doctores viven en PostgreSQL (relacional).
- Citas relacionan paciente (MongoDB) con doctor (PostgreSQL) usando `patient_id` y `doctor_id`.

El archivo `normalizacion.csv` puede abrirse en Excel para revisar columnas y tipos.
```
- Explica la separacion de entidades.

**Por que documentar**: ayuda a entender por que Mongo y Postgres conviven.

### `docs/normalizacion.csv`
```csv
tabla,columna,tipo,descripcion
patients,id,text,Id del paciente (MongoDB)
patients,name,text,Nombre del paciente
patients,email,text,Correo del paciente
patients,phone,text,Telefono del paciente
doctors,id,serial,Id del doctor
doctors,name,text,Nombre del doctor
doctors,specialty,text,Especialidad
doctors,email,text,Correo del doctor
appointments,id,serial,Id de la cita
appointments,patient_id,text,Referencia al paciente (MongoDB)
appointments,doctor_id,int,Referencia al doctor (PostgreSQL)
appointments,appointment_date,timestamp,Fecha y hora de la cita
appointments,reason,text,Motivo de la cita
appointments,status,text,Estado de la cita
```
- CSV para abrir en Excel con estructura normalizada.

**Uso didactico**: sirve como tabla de referencia de columnas y tipos.

### `docs/postman_collection.json`
```json
{
  "info": {
    "name": "Citas Medicas API",
    "_postman_id": "b0d2b0a2-1111-4444-8888-000000000001",
    "description": "Coleccion de prueba para la API de citas medicas",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    { "name": "Health", "request": { "method": "GET", "url": { "raw": "{{baseUrl}}/health", "host": ["{{baseUrl}}"], "path": ["health"] } } },
    { "name": "List Patients", "request": { "method": "GET", "url": { "raw": "{{baseUrl}}/patients", "host": ["{{baseUrl}}"], "path": ["patients"] } } },
    { "name": "Create Doctor", "request": { "method": "POST", "header": [{ "key": "Content-Type", "value": "application/json" }], "body": { "mode": "raw", "raw": "{\\n  \\"name\\": \\"Dra. Perez\\",\\n  \\"specialty\\": \\"Cardiologia\\",\\n  \\"email\\": \\"dra.perez@example.com\\"\\n}" }, "url": { "raw": "{{baseUrl}}/doctors", "host": ["{{baseUrl}}"], "path": ["doctors"] } } },
    { "name": "Create Appointment (SP)", "request": { "method": "POST", "header": [{ "key": "Content-Type", "value": "application/json" }], "body": { "mode": "raw", "raw": "{\\n  \\"patientId\\": \\"<mongoId>\\",\\n  \\"doctorId\\": 1,\\n  \\"appointmentDate\\": \\"2026-03-05T10:00:00Z\\",\\n  \\"reason\\": \\"Consulta\\"\\n}" }, "url": { "raw": "{{baseUrl}}/appointments/sp", "host": ["{{baseUrl}}"], "path": ["appointments", "sp"] } } },
    { "name": "Doctor Agenda", "request": { "method": "GET", "url": { "raw": "{{baseUrl}}/doctors/1/agenda?from=2026-03-01&to=2026-03-31", "host": ["{{baseUrl}}"], "path": ["doctors", "1", "agenda"], "query": [{ "key": "from", "value": "2026-03-01" }, { "key": "to", "value": "2026-03-31" }] } } }
  ]
}
```
- Coleccion Postman con ejemplos y `{{baseUrl}}`.

**Por que existe**: facilita probar la API sin escribir requests manuales.

### `docs/thunder-collection.json`
```json
{
  "client": "Thunder Client",
  "collectionName": "Citas Medicas API",
  "dateExported": "2026-03-01T00:00:00.000Z",
  "version": "1.1",
  "requests": [
    { "_id": "health", "colId": "citas-medicas", "name": "Health", "url": "{{baseUrl}}/health", "method": "GET", "headers": [], "params": [], "body": {} },
    { "_id": "list-patients", "colId": "citas-medicas", "name": "List Patients", "url": "{{baseUrl}}/patients", "method": "GET", "headers": [], "params": [], "body": {} },
    { "_id": "create-doctor", "colId": "citas-medicas", "name": "Create Doctor", "url": "{{baseUrl}}/doctors", "method": "POST", "headers": [{ "name": "Content-Type", "value": "application/json" }], "params": [], "body": { "type": "json", "raw": "{\\n  \\"name\\": \\"Dra. Perez\\",\\n  \\"specialty\\": \\"Cardiologia\\",\\n  \\"email\\": \\"dra.perez@example.com\\"\\n}" } },
    { "_id": "create-appointment-sp", "colId": "citas-medicas", "name": "Create Appointment (SP)", "url": "{{baseUrl}}/appointments/sp", "method": "POST", "headers": [{ "name": "Content-Type", "value": "application/json" }], "params": [], "body": { "type": "json", "raw": "{\\n  \\"patientId\\": \\"<mongoId>\\",\\n  \\"doctorId\\": 1,\\n  \\"appointmentDate\\": \\"2026-03-05T10:00:00Z\\",\\n  \\"reason\\": \\"Consulta\\"\\n}" } },
    { "_id": "doctor-agenda", "colId": "citas-medicas", "name": "Doctor Agenda", "url": "{{baseUrl}}/doctors/1/agenda?from=2026-03-01&to=2026-03-31", "method": "GET", "headers": [], "params": [{ "name": "from", "value": "2026-03-01" }, { "name": "to", "value": "2026-03-31" }], "body": {} }
  ]
}
```
- Coleccion Thunder Client con ejemplos.

**Relacion con pruebas manuales**: es el equivalente de Postman en VS Code.

### `jest.config.js`
```js
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
};
```
- Config de Jest: entorno Node y patron de tests.

**Por que esta**: define donde buscar tests sin configurar cada vez.

### `tests/health.test.js`
```js
const request = require("supertest");

const app = require("../src/app");

describe("GET /health", () => {
  it("returns ok", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
```
- Testea el endpoint `/health`.

**Por que simple**: valida que Express esta funcionando sin tocar la BD.

### `tests/patients.test.js`
```js
jest.mock("../src/repositories/patientsMongoRepo", () => ({
  listPatients: jest.fn(async () => [
    { _id: "mock1", name: "Juan" },
  ]),
  getPatientById: jest.fn(async () => null),
  createPatient: jest.fn(async () => ({})),
  updatePatient: jest.fn(async () => ({})),
  deletePatient: jest.fn(async () => ({})),
}));

const request = require("supertest");
const app = require("../src/app");

describe("GET /patients", () => {
  it("returns list of patients", async () => {
    const response = await request(app).get("/patients");
    expect(response.status).toBe(200);
    expect(response.body[0]).toMatchObject({ _id: "mock1" });
  });
});
```
- Mock del repositorio Mongo para aislar pruebas.
- Verifica que `/patients` responda lista.

**Por que mocks**: evita depender de Mongo real en tests unitarios.

### `tests/doctors.test.js`
```js
jest.mock("../src/repositories/doctorsPgRepo", () => ({
  listDoctors: jest.fn(async () => [
    { id: 1, name: "Dra. Perez", specialty: "Cardiologia" },
  ]),
  getDoctorById: jest.fn(async () => null),
  createDoctor: jest.fn(async () => ({})),
  updateDoctor: jest.fn(async () => ({})),
  deleteDoctor: jest.fn(async () => ({})),
}));

jest.mock("../src/repositories/appointmentsPgRepo", () => ({
  listAppointments: jest.fn(async () => []),
  getAppointmentById: jest.fn(async () => null),
  createAppointment: jest.fn(async () => ({})),
  createAppointmentSP: jest.fn(async () => ({})),
  listDoctorAgenda: jest.fn(async () => [
    {
      id: 10,
      patient_id: "mockPatient",
      doctor_id: 1,
      appointment_date: "2026-03-10T09:00:00.000Z",
      reason: "Control",
      status: "scheduled",
    },
  ]),
  updateAppointment: jest.fn(async () => ({})),
  deleteAppointment: jest.fn(async () => ({})),
}));

const request = require("supertest");
const app = require("../src/app");

describe("GET /doctors", () => {
  it("returns list of doctors", async () => {
    const response = await request(app).get("/doctors");
    expect(response.status).toBe(200);
    expect(response.body[0]).toMatchObject({ id: 1 });
  });
});

describe("GET /doctors/:id/agenda", () => {
  it("returns agenda for doctor", async () => {
    const response = await request(app).get(
      "/doctors/1/agenda?from=2026-03-01&to=2026-03-31"
    );
    expect(response.status).toBe(200);
    expect(response.body[0]).toMatchObject({ doctor_id: 1 });
  });
});
```
- Mock de repositorios Postgres.
- Prueba lista de doctores y agenda.

**Relacion con SP**: el mock simula la respuesta del SP para agenda.

### `tests/appointments.test.js`
```js
jest.mock("../src/repositories/appointmentsPgRepo", () => ({
  listAppointments: jest.fn(async () => [
    {
      id: 1,
      patient_id: "mockPatient",
      doctor_id: 2,
      appointment_date: "2026-03-05T10:00:00.000Z",
      reason: "Consulta",
      status: "scheduled",
      created_at: "2026-03-01T00:00:00.000Z",
    },
  ]),
  getAppointmentById: jest.fn(async () => null),
  createAppointment: jest.fn(async () => ({})),
  createAppointmentSP: jest.fn(async () => ({})),
  listDoctorAgenda: jest.fn(async () => []),
  updateAppointment: jest.fn(async () => ({})),
  deleteAppointment: jest.fn(async () => ({})),
}));

const request = require("supertest");
const app = require("../src/app");

describe("GET /appointments", () => {
  it("returns list of appointments", async () => {
    const response = await request(app).get("/appointments");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      id: 1,
      patient_id: "mockPatient",
    });
  });
});
```
- Mock del repo de citas.
- Verifica respuesta de `/appointments`.

**Por que test**: garantiza que el endpoint devuelve una lista coherente.
