# Citas medicas - Avance 04 (Procedimientos almacenados)

API con MongoDB + PostgreSQL y uso de procedimientos almacenados para citas.
Incluye un ejemplo de normalizacion en formato CSV para abrir en Excel.

## Requisitos
- Node.js 18+
- MongoDB en local
- PostgreSQL en local

## Como correr
1. Copia `.env.example` a `.env` y configura MongoDB y PostgreSQL.
2. Crea tablas con `db/postgres/schema.sql`.
3. Crea procedimientos con `db/postgres/procedures.sql`.
4. Instala dependencias: `npm install`
5. Ejecuta:
   - `npm run dev` (modo desarrollo)
   - `npm start` (modo produccion)

## Endpoints extra
- `POST /appointments/sp` (usa procedimiento almacenado)
- `GET /doctors/:id/agenda` (agenda por procedimiento almacenado)

## Explicacion linea a linea (codigo)
Este avance agrega **procedimientos almacenados** en PostgreSQL.
La idea es mover parte de la logica a la base de datos, y ver como la API
los consume desde Node.js. Flujo mental: `schema.sql` -> `procedures.sql`
-> `server.js` (conecta) -> `app.js` (monta rutas) -> `routes` -> `repositories`.

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
- `require("dotenv").config();` carga variables del `.env`.
- `const app = require("./app");` importa la app.
- `const { connectMongo } = require("./config/mongo");` conecta a Mongo.
- `const { checkPostgres } = require("./config/postgres");` valida Postgres.
- `const port = process.env.PORT || 3000;` define puerto.
- `Promise.all([...])` conecta ambas BD.
- `.then(() => { ... })` inicia servidor si todo ok.
- `app.listen(...)` levanta el servidor.
- `console.log(...)` imprime URL.
- `.catch((error) => { ... })` maneja errores.
- `process.exit(1);` termina si falla.

**Por que conectar antes**: si los procedimientos no existen o la BD no conecta,
es mejor fallar rapido que recibir requests que no podrian ejecutarse.

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
- `const app = express();` crea app.
- `app.use(express.json());` habilita JSON.
- `app.get("/health", ...)` endpoint salud.
- `res.json({ status: "ok" });` responde ok.
- `app.use("/patients", ...)` monta rutas.
- `app.use("/doctors", ...)` monta rutas.
- `app.use("/appointments", ...)` monta rutas.
- `module.exports = app;` exporta app.

**Relacion con procedimientos**: `app.js` no sabe nada de SP.
Solo monta rutas; el uso de SP esta en repositorios y rutas.

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
- `MongoClient, ObjectId` para conectar y manejar ids.
- `connectMongo()` abre conexion.
- `getDb()` devuelve la DB conectada.
- `toObjectId(id)` convierte string a ObjectId.
- `module.exports` exporta helpers.

**Por que sigue igual**: Mongo no cambia; el foco del avance es Postgres con SP.

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
- `Pool` maneja conexiones Postgres.
- `new Pool({ ... })` configura host/puerto/usuario/clave/BD.
- `checkPostgres()` prueba la conexion.
- `module.exports` exporta.

**Relacion con SP**: este `pool` es el que ejecuta los procedimientos.
No creamos otro cliente separado.

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
- `listPatients()` lista todos.
- `getPatientById(id)` busca por id.
- `createPatient(data)` inserta paciente.
- `updatePatient(id, data)` actualiza campos.
- `deletePatient(id)` elimina y devuelve.
- `module.exports` exporta.

**Por que repo**: mantiene la logica de Mongo separada de las rutas.

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
- `listDoctors()` lista doctores.
- `getDoctorById(id)` busca por id.
- `createDoctor(data)` inserta doctor.
- `updateDoctor(id, data)` actualiza con `COALESCE`.
- `deleteDoctor(id)` elimina.
- `module.exports` exporta.

**Por que no SP aqui**: el CRUD de doctores es directo para no complicar
lo que ya se entiende; los SP se enfocan en citas.

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
- `listAppointments()` lista citas.
- `getAppointmentById(id)` obtiene cita.
- `createAppointment(data)` inserta cita.
- `createAppointmentSP(data)` inserta usando SP.
- `listDoctorAgenda(doctorId, from, to)` agenda por SP.
- `updateAppointment(id, data)` actualiza.
- `deleteAppointment(id)` elimina.
- `module.exports` exporta.

**Parte clave del avance**: `createAppointmentSP` y `listDoctorAgenda`
llaman funciones definidas en `procedures.sql`. Esa es la diferencia principal
con el avance 03.

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
- CRUD de pacientes con MongoDB.
- Validaciones y respuestas 404/400.
- `module.exports` exporta.

**Relacion con Mongo**: sigue igual que antes para no mezclar cambios.

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
- CRUD de doctores.
- `GET /doctors/:id/agenda` usa procedimiento almacenado.
- Validaciones con 400/404.
- `module.exports` exporta.

**Por que agenda**: `GET /doctors/:id/agenda` muestra como consumir un SP
que devuelve multiples filas.

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
- `POST /appointments/sp` crea usando procedimiento almacenado.
- El resto es CRUD normal en Postgres.
- `module.exports` exporta.

**Diferencia clave**: `POST /appointments/sp` usa SP para insertar,
el resto es CRUD normal.

### `package.json`
```json
{
  "name": "citas-medicas-04-procedimientos",
  "version": "1.0.0",
  "description": "API con procedimientos almacenados en PostgreSQL",
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
- `"version"` version.
- `"description"` descripcion.
- `"main"` entrada.
- `"scripts"` comandos npm.
- `"dependencies"` dependencias.
- `"devDependencies"` para desarrollo.

**Relacion con ejecucion**: igual que antes, `npm start` usa `src/server.js`.

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

**Por que se mantiene**: las credenciales cambian por entorno; no van hardcodeadas.

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
- Crea tablas `doctors` y `appointments`.
- Define llaves y tipos.
- Crea indices para busqueda.

**Relacion con rutas**: sin estas tablas, las rutas de doctores/citas fallan.

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
- `schedule_appointment(...)` inserta y retorna una cita.
- `get_doctor_agenda(...)` devuelve citas de un doctor en rango.
- `LANGUAGE plpgsql` indica lenguaje.
- `RETURN QUERY` devuelve resultado.

**Relacion con Node**: estas funciones se llaman desde `appointmentsPgRepo.js`
usando `pool.query("SELECT * FROM ...")`.

### `docs/normalizacion.md`
```md
# Normalizacion (resumen)

Este ejemplo separa entidades para evitar duplicidad:

- Pacientes viven en MongoDB (flexible para datos personales).
- Doctores viven en PostgreSQL (relacional).
- Citas relacionan paciente (MongoDB) con doctor (PostgreSQL) usando `patient_id` y `doctor_id`.

El archivo `normalizacion.csv` puede abrirse en Excel para revisar columnas y tipos.
```
- Explica como se normalizan entidades.
- Indica el CSV para Excel.

**Por que esta aqui**: documenta el modelo de datos y justifica la separacion
entre Mongo (pacientes) y Postgres (doctores/citas).

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
- Primera fila son encabezados.
- Cada fila describe una columna por tabla.

**Uso didactico**: puedes abrirlo en Excel y estudiar columnas y tipos.
