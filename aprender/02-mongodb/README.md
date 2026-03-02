# Citas medicas - Avance 02 (MongoDB)

API con Express y pacientes guardados en MongoDB. Las citas siguen en memoria.

## Requisitos
- Node.js 18+
- MongoDB en local

## Como correr
1. Copia `.env.example` a `.env` y configura MongoDB.
2. Instala dependencias: `npm install`
3. Ejecuta:
   - `npm run dev` (modo desarrollo)
   - `npm start` (modo produccion)

## Endpoints
- `GET /health`
- `GET /patients`
- `POST /patients`
- `GET /patients/:id`
- `PUT /patients/:id`
- `DELETE /patients/:id`
- `GET /appointments`
- `POST /appointments`
- `GET /appointments/:id`
- `PUT /appointments/:id`
- `DELETE /appointments/:id`

## Explicacion linea a linea (codigo)
Este avance agrega MongoDB para **pacientes**, pero mantiene **citas en memoria**.
Asi entiendes la conexion a base de datos sin mezclar todo de una vez.
Flujo mental: `package.json` -> `.env` -> `server.js` (conecta) -> `app.js` (monta rutas)
-> `routes` (HTTP) -> `repositories` (Mongo).

### `src/server.js`
```js
require("dotenv").config();

const app = require("./app");
const { connectMongo } = require("./config/mongo");

const port = process.env.PORT || 3000;

connectMongo()
  .then(() => {
    app.listen(port, () => {
      console.log(`API escuchando en http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Error conectando a MongoDB", error);
    process.exit(1);
  });
```
- `require("dotenv").config();` carga variables del archivo `.env`.
- `const app = require("./app");` importa la app de Express.
- `const { connectMongo } = require("./config/mongo");` importa la conexion a MongoDB.
- `const port = process.env.PORT || 3000;` define el puerto.
- `connectMongo()` inicia la conexion a MongoDB.
- `.then(() => { ... })` si conecta, arranca el servidor.
- `app.listen(port, () => { ... })` inicia el servidor HTTP.
- `console.log(...)` imprime la URL local.
- `.catch((error) => { ... })` maneja errores de conexion.
- `console.error(...)` muestra el error.
- `process.exit(1);` termina el proceso si falla la conexion.

**Por que este orden**: primero se conecta a MongoDB y solo si la conexion es exitosa
se levanta el servidor. Asi evitas una API "viva" pero sin base de datos.

### `src/app.js`
```js
const express = require("express");
const appointmentsRouter = require("./routes/appointments");
const patientsRouter = require("./routes/patients");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/patients", patientsRouter);
app.use("/appointments", appointmentsRouter);

module.exports = app;
```
- `const express = require("express");` importa Express.
- `const appointmentsRouter = require("./routes/appointments");` importa rutas de citas.
- `const patientsRouter = require("./routes/patients");` importa rutas de pacientes.
- `const app = express();` crea la app.
- `app.use(express.json());` habilita body JSON.
- `app.get("/health", ...)` endpoint de salud.
- `res.json({ status: "ok" });` responde estado ok.
- `app.use("/patients", patientsRouter);` monta rutas de pacientes.
- `app.use("/appointments", appointmentsRouter);` monta rutas de citas.
- `module.exports = app;` exporta la app.

**Relacion con rutas**: `app.js` solo organiza, no tiene logica de negocio.
Las rutas de pacientes usan el repositorio Mongo; las citas siguen en memoria.

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
- `const { MongoClient, ObjectId } = require("mongodb");` importa cliente y tipo ObjectId.
- `let client;` variable para el cliente.
- `let db;` variable para la base de datos.
- `async function connectMongo() { ... }` funcion async para conectar.
- `const uri = process.env.MONGO_URI;` lee URI desde `.env`.
- `const dbName = process.env.MONGO_DB;` lee nombre de DB.
- `if (!uri || !dbName) { ... }` valida config.
- `throw new Error(...)` corta si falta config.
- `client = new MongoClient(uri);` crea cliente.
- `await client.connect();` abre conexion.
- `db = client.db(dbName);` selecciona la base.
- `return db;` devuelve la base.
- `function getDb() { ... }` obtiene la base ya conectada.
- `if (!db) { ... }` valida que exista conexion.
- `throw new Error(...)` si no hay conexion.
- `return db;` devuelve la base.
- `function toObjectId(id) { ... }` convierte string a ObjectId.
- `return new ObjectId(id);` crea ObjectId.
- `module.exports = { ... };` exporta funciones.

**Por que un archivo de config**: centraliza la conexion y evita repetir `MongoClient`
en cada archivo. Las rutas nunca crean conexiones directamente, solo usan `getDb()`.

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
- `const { getDb, toObjectId } = require("../config/mongo");` usa helpers de Mongo.
- `const collectionName = "patients";` nombre de coleccion.
- `async function listPatients() { ... }` lista pacientes.
- `const db = getDb();` obtiene DB conectada.
- `db.collection(...).find({}).toArray();` trae todos.
- `async function getPatientById(id) { ... }` busca por id.
- `findOne({ _id: toObjectId(id) })` convierte id y busca.
- `async function createPatient(data) { ... }` crea paciente.
- `insertOne({ ... })` inserta documento con campos.
- `email: data.email || ""` default si no llega email.
- `phone: data.phone || ""` default si no llega telefono.
- `createdAt: new Date()` fecha de creacion.
- `return getPatientById(...)` devuelve el paciente creado.
- `async function updatePatient(id, data) { ... }` actualiza.
- `updateOne({ _id: ... }, { $set: ... })` modifica campos.
- `updatedAt: new Date()` guarda fecha de actualizacion.
- `return getPatientById(id);` devuelve el actualizado.
- `async function deletePatient(id) { ... }` elimina.
- `const existing = await getPatientById(id);` valida existencia.
- `if (!existing) return null;` si no existe, null.
- `deleteOne({ _id: ... })` borra el documento.
- `return existing;` devuelve el borrado.
- `module.exports = { ... };` exporta funciones.

**Por que repositorio**: separa acceso a datos de las rutas HTTP.
Si en el futuro cambias Mongo por otra BD, solo cambias este archivo.

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
- `const repo = require("../repositories/patientsMongoRepo");` repositorio Mongo.
- `const router = express.Router();` crea router.
- `router.get("/", ...)` lista pacientes.
- `repo.listPatients()` obtiene la lista.
- `res.json(patients);` responde la lista.
- `router.get("/:id", ...)` obtiene paciente por id.
- `repo.getPatientById(req.params.id)` busca en Mongo.
- `if (!patient) ...` valida existencia.
- `return res.status(404)...` error si no existe.
- `res.json(patient);` responde el paciente.
- `router.post("/", ...)` crea paciente.
- `const { name, email, phone } = req.body;` lee body.
- `if (!name) ...` valida nombre.
- `return res.status(400)...` error por datos faltantes.
- `repo.createPatient({ name, email, phone })` crea en DB.
- `res.status(201).json(patient);` responde creado.
- `router.put("/:id", ...)` actualiza paciente.
- `repo.updatePatient(req.params.id, { ... })` actualiza datos.
- `if (!patient) ...` valida existencia.
- `res.json(patient);` responde actualizado.
- `router.delete("/:id", ...)` elimina paciente.
- `repo.deletePatient(req.params.id)` borra en DB.
- `if (!patient) ...` valida existencia.
- `res.json(patient);` responde eliminado.
- `module.exports = router;` exporta router.

**Relacion rutas -> repositorio**: aqui decides **que** endpoint existe y
**que** valida, pero el **como** se guarda en DB lo hace el repositorio.

### `src/routes/appointments.js`
```js
const express = require("express");

const router = express.Router();

const appointments = [];
let nextId = 1;

router.get("/", (req, res) => {
  res.json(appointments);
});

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const appointment = appointments.find((item) => item.id === id);
  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  res.json(appointment);
});

router.post("/", (req, res) => {
  const { patientName, doctorName, date, reason } = req.body;
  if (!patientName || !doctorName || !date) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const appointment = {
    id: nextId++,
    patientName,
    doctorName,
    date,
    reason: reason || "",
    status: "scheduled",
  };
  appointments.push(appointment);
  res.status(201).json(appointment);
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const appointment = appointments.find((item) => item.id === id);
  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  const { patientName, doctorName, date, reason, status } = req.body;
  if (patientName !== undefined) appointment.patientName = patientName;
  if (doctorName !== undefined) appointment.doctorName = doctorName;
  if (date !== undefined) appointment.date = date;
  if (reason !== undefined) appointment.reason = reason;
  if (status !== undefined) appointment.status = status;
  res.json(appointment);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = appointments.findIndex((item) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  const deleted = appointments.splice(index, 1)[0];
  res.json(deleted);
});

module.exports = router;
```
- `const express = require("express");` importa Express.
- `const router = express.Router();` crea router.
- `const appointments = [];` array en memoria.
- `let nextId = 1;` id incremental.
- `router.get("/", ...)` lista todas las citas.
- `res.json(appointments);` responde la lista.
- `router.get("/:id", ...)` busca por id.
- `const id = Number(req.params.id);` convierte id a numero.
- `appointments.find(...)` busca la cita.
- `if (!appointment) ...` valida existencia.
- `return res.status(404)...` error si no existe.
- `res.json(appointment);` responde la cita.
- `router.post("/", ...)` crea cita.
- `const { patientName, doctorName, date, reason } = req.body;` lee body.
- `if (!patientName || !doctorName || !date)` valida campos.
- `return res.status(400)...` error por faltantes.
- `const appointment = { ... }` arma la cita.
- `id: nextId++` asigna id y aumenta contador.
- `reason: reason || ""` default si no hay motivo.
- `status: "scheduled"` estado inicial.
- `appointments.push(appointment);` guarda en memoria.
- `res.status(201).json(appointment);` responde creada.
- `router.put("/:id", ...)` actualiza cita.
- `appointments.find(...)` busca la cita.
- `if (!appointment) ...` valida existencia.
- `const { patientName, doctorName, date, reason, status } = req.body;` lee body.
- `if (patientName !== undefined) ...` actualiza si llega.
- `if (doctorName !== undefined) ...` actualiza si llega.
- `if (date !== undefined) ...` actualiza si llega.
- `if (reason !== undefined) ...` actualiza si llega.
- `if (status !== undefined) ...` actualiza si llega.
- `res.json(appointment);` responde actualizada.
- `router.delete("/:id", ...)` elimina cita.
- `const index = appointments.findIndex(...)` busca indice.
- `if (index === -1) ...` valida existencia.
- `appointments.splice(index, 1)[0];` elimina y devuelve.
- `res.json(deleted);` responde eliminada.
- `module.exports = router;` exporta router.

**Por que aun en memoria**: en este avance el foco es MongoDB con pacientes.
Las citas quedan simples para no mezclar dos temas a la vez.

### `package.json`
```json
{
  "name": "citas-medicas-02-mongodb",
  "version": "1.0.0",
  "description": "API con MongoDB para pacientes y memoria para citas",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "dotenv": "latest",
    "express": "latest",
    "mongodb": "latest"
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
- `"scripts"` comandos npm disponibles.
- `"start"` ejecuta la API.
- `"dev"` ejecuta con nodemon.
- `"dependencies"` dependencias de produccion.
- `"dotenv"` lee variables de entorno.
- `"express"` framework de API.
- `"mongodb"` driver oficial.
- `"devDependencies"` dependencias de desarrollo.
- `"nodemon"` reinicia al guardar.

**Relacion con el resto**: `scripts` ejecuta `src/server.js`, por eso ese archivo
es el punto de arranque de toda la app.

### `.env.example`
```bash
PORT=3000
MONGO_URI=mongodb://localhost:27017
MONGO_DB=citas_medicas
```
- `PORT=3000` puerto local por defecto.
- `MONGO_URI=...` URL de conexion a MongoDB.
- `MONGO_DB=...` nombre de la base.

**Por que `.env`**: permite cambiar la base sin tocar codigo. Es la misma idea
que usaras despues con PostgreSQL.
