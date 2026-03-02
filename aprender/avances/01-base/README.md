# Citas medicas - Avance 01 (Base)

API minima con Express y datos en memoria para practicar CRUD de citas.

## Que se hizo (resumen de codigo)
- Proyecto Express con rutas de citas en memoria.
- Validacion basica de campos requeridos al crear citas.
- CRUD completo para citas con identificador numerico.

## Guia paso a paso para replicar
1. Crea una carpeta vacia y agrega `package.json`.
2. Instala dependencias: `npm install express dotenv` y `npm install -D nodemon`.
3. Crea `src/app.js` con Express, `express.json()` y rutas.
4. Crea `src/routes/appointments.js` con el CRUD en memoria.
5. Crea `src/server.js` para levantar la app.
6. Crea `.env.example` con `PORT=3000`.
7. Ejecuta `npm run dev` y prueba endpoints.

**Idea principal**: primero entiendes el flujo HTTP sin base de datos. Luego,
en avances siguientes, reemplazas el arreglo en memoria por Mongo/Postgres.

## Estructura creada
- `src/server.js`: levanta el servidor y escucha el puerto.
- `src/app.js`: configura Express, `/health` y monta rutas.
- `src/routes/appointments.js`: CRUD de citas en memoria.
- `.env.example`: ejemplo de variable `PORT`.
- `package.json`: scripts y dependencias.

## Explicacion linea a linea (codigo)
Este avance es el "esqueleto" de la API. Todo ocurre en memoria, para que entiendas
el flujo HTTP sin depender de base de datos. El orden mental es:
`package.json` -> `.env` -> `server.js` -> `app.js` -> rutas.

### `src/server.js`
```js
require("dotenv").config();

const app = require("./app");

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});
```
- `require("dotenv").config();` carga variables del archivo `.env` al entorno.
- `const app = require("./app");` importa la app de Express configurada.
- `const port = process.env.PORT || 3000;` define el puerto usando `.env` o 3000.
- `app.listen(port, () => { ... });` inicia el servidor HTTP.
- `console.log(...)` muestra el puerto donde esta corriendo la API.

**Por que existe este archivo**: separa el arranque del servidor de la logica de rutas.
Asi puedes reutilizar `app` en pruebas o en otro servidor sin duplicar codigo.

### `src/app.js`
```js
const express = require("express");
const appointmentsRouter = require("./routes/appointments");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/appointments", appointmentsRouter);

module.exports = app;
```
- `const express = require("express");` importa Express.
- `const appointmentsRouter = require("./routes/appointments");` importa rutas de citas.
- `const app = express();` crea la aplicacion Express.
- `app.use(express.json());` habilita JSON en el body de las requests.
- `app.get("/health", ...)` crea un endpoint de salud.
- `res.json({ status: "ok" });` responde con JSON simple.
- `app.use("/appointments", appointmentsRouter);` monta las rutas en `/appointments`.
- `module.exports = app;` exporta la app para usarla en `server.js`.

**Relacion con otros archivos**: este archivo no conoce detalles de citas; solo monta
el router que vive en `routes/appointments.js`. Eso mantiene responsabilidades separadas.

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
- `const router = express.Router();` crea un router para agrupar rutas.
- `const appointments = [];` array en memoria donde se guardan citas.
- `let nextId = 1;` contador simple para ids incrementales.
- `router.get("/", ...)` lista todas las citas.
- `res.json(appointments);` responde el array completo.
- `router.get("/:id", ...)` busca una cita por id.
- `const id = Number(req.params.id);` convierte el id de string a numero.
- `appointments.find(...)` busca la cita en el array.
- `if (!appointment) ...` valida si existe.
- `return res.status(404)...` devuelve error si no existe.
- `res.json(appointment);` responde la cita encontrada.
- `router.post("/", ...)` crea una nueva cita.
- `const { patientName, doctorName, date, reason } = req.body;` lee datos del body.
- `if (!patientName || !doctorName || !date)` valida campos requeridos.
- `return res.status(400)...` responde error por datos faltantes.
- `const appointment = { ... }` arma el objeto de la cita.
- `id: nextId++` asigna id y aumenta el contador.
- `reason: reason || ""` coloca texto vacio si no hay motivo.
- `status: "scheduled"` estado inicial.
- `appointments.push(appointment);` guarda la cita en memoria.
- `res.status(201).json(appointment);` responde con la cita creada.
- `router.put("/:id", ...)` actualiza una cita existente.
- `const id = Number(req.params.id);` convierte id a numero.
- `appointments.find(...)` busca la cita.
- `if (!appointment) ...` valida existencia.
- `const { patientName, doctorName, date, reason, status } = req.body;` lee campos.
- `if (patientName !== undefined) ...` actualiza solo si viene en el body.
- `if (doctorName !== undefined) ...` idem para doctor.
- `if (date !== undefined) ...` idem para fecha.
- `if (reason !== undefined) ...` idem para motivo.
- `if (status !== undefined) ...` idem para estado.
- `res.json(appointment);` responde la cita actualizada.
- `router.delete("/:id", ...)` elimina una cita.
- `const id = Number(req.params.id);` convierte id a numero.
- `findIndex(...)` obtiene la posicion en el array.
- `if (index === -1) ...` valida si existe.
- `appointments.splice(index, 1)[0];` elimina y devuelve la cita borrada.
- `res.json(deleted);` responde la cita eliminada.
- `module.exports = router;` exporta el router para usarlo en `app.js`.

**Por que en memoria**: al inicio solo practicas HTTP. Luego, en avances siguientes,
el arreglo se reemplaza por base de datos sin cambiar la forma de las rutas.

#### Explicacion detallada (linea por linea)
- `const express = require("express");` importa la libreria Express para crear rutas HTTP.
- `const router = express.Router();` crea un router aislado que luego se monta en `app.js`.
- `const appointments = [];` arreglo en memoria donde se guardan citas.
- `let nextId = 1;` contador simple para IDs incrementales.
- `router.get("/", ...)` endpoint `GET /appointments` que lista todas las citas.
- `res.json(appointments);` responde el arreglo completo como JSON.
- `router.get("/:id", ...)` endpoint `GET /appointments/:id` para buscar una cita.
- `const id = Number(req.params.id);` convierte el id de string a numero.
- `appointments.find(...)` busca la cita por id en el arreglo.
- `if (!appointment) ...` valida si existe.
- `return res.status(404)...` responde error si no existe.
- `res.json(appointment);` responde la cita encontrada.
- `router.post("/", ...)` endpoint `POST /appointments` para crear una cita.
- `const { patientName, doctorName, date, reason } = req.body;` lee datos del body.
- `if (!patientName || !doctorName || !date)` valida campos obligatorios.
- `return res.status(400)...` error por datos faltantes.
- `const appointment = { ... }` crea el objeto de la nueva cita.
- `id: nextId++` asigna id y aumenta el contador.
- `reason: reason || ""` evita `undefined` si no viene motivo.
- `status: "scheduled"` estado inicial por defecto.
- `appointments.push(appointment);` guarda la cita en memoria.
- `res.status(201).json(appointment);` responde 201 con la cita creada.
- `router.put("/:id", ...)` endpoint `PUT /appointments/:id` para actualizar.
- `const id = Number(req.params.id);` convierte id a numero.
- `appointments.find(...)` busca la cita.
- `if (!appointment) ...` valida existencia.
- `const { patientName, doctorName, date, reason, status } = req.body;` lee body.
- `if (patientName !== undefined) ...` actualiza solo si viene el campo.
- `if (doctorName !== undefined) ...` idem para doctor.
- `if (date !== undefined) ...` idem para fecha.
- `if (reason !== undefined) ...` idem para motivo.
- `if (status !== undefined) ...` idem para estado.
- `res.json(appointment);` responde la cita actualizada.
- `router.delete("/:id", ...)` endpoint `DELETE /appointments/:id` para eliminar.
- `const id = Number(req.params.id);` convierte id a numero.
- `const index = appointments.findIndex(...)` busca el indice.
- `if (index === -1) ...` valida existencia.
- `const deleted = appointments.splice(index, 1)[0];` elimina y devuelve la cita.
- `res.json(deleted);` responde la cita eliminada.
- `module.exports = router;` exporta el router para que `app.js` lo monte.

### `package.json`
```json
{
  "name": "citas-medicas-01-base",
  "version": "1.0.0",
  "description": "API base de citas medicas (solo memoria)",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "dotenv": "latest",
    "express": "latest"
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
- `"devDependencies"` dependencias de desarrollo.
- `"nodemon"` reinicia al guardar.

**Relacion con el resto**: `scripts` llama a `src/server.js`, por eso ese archivo
es el punto de entrada real de la app.

### `.env.example`
```bash
PORT=3000
```
- `PORT=3000` puerto local por defecto.

**Por que `.env`**: permite cambiar configuracion sin tocar codigo, y se repite en
los avances con MongoDB/PostgreSQL.

## Requisitos
- Node.js 18+

## Como correr
1. Copia `.env.example` a `.env` y ajusta el puerto si deseas.
2. Instala dependencias: `npm install`
3. Ejecuta:
   - `npm run dev` (modo desarrollo)
   - `npm start` (modo produccion)

## Endpoints
- `GET /health`
- `GET /appointments`
- `POST /appointments`
- `GET /appointments/:id`
- `PUT /appointments/:id`
- `DELETE /appointments/:id`

## Ejemplos de uso
Crear cita:
```json
{
  "patientName": "Juan Perez",
  "doctorName": "Dra. Gomez",
  "date": "2026-03-05T10:00:00Z",
  "reason": "Consulta"
}
```

Actualizar cita:
```json
{
  "status": "completed"
}
```
