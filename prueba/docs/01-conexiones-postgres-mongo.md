01 - Conexiones a Postgres y MongoDB

Objetivo
Aprender a conectar una app con Postgres y MongoDB, validar la conexion
y ejecutar una consulta simple.

Requisitos
- Postgres instalado (usuario y password)
- MongoDB instalado (local o Atlas)
- Node.js 18+ instalado
- Variables de entorno (.env)

Parte A: Postgres (psql y Node.js)

A1) Verifica que Postgres corre
- Abre PowerShell
- Ejecuta:
  psql --version

A2) Conecta con psql
- Ejecuta:
  psql -U postgres
- Si pide password, ingresa la de tu instalacion.
- Crea una base de datos de practica:
  CREATE DATABASE riwi_prueba;

A3) Prueba una consulta
- En psql:
  \c riwi_prueba
  SELECT now();

A4) Conecta desde Node.js
1) Usa el proyecto base de este repo o crea uno nuevo:
   npm init -y
   npm i pg
2) Crea un .env con:
   PG_HOST, PG_DB, PG_USER, PG_PASSWORD, PG_PORT
3) Crea archivo index.js con este ejemplo:
   - Importa pg
   - Crea un pool de conexion
   - Ejecuta SELECT now()

Ejemplo basico (index.js)
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "riwi_prueba",
  password: "TU_PASSWORD",
  port: 5432,
});

async function main() {
  const result = await pool.query("SELECT now()");
  console.log(result.rows[0]);
  await pool.end();
}

main().catch(console.error);

Parte B: MongoDB (shell y Node.js)

B1) Verifica que MongoDB corre
- Si es local: abre PowerShell y ejecuta:
  mongosh
- Si usas Atlas, copia el connection string.

B2) Crea una base y coleccion
En mongosh:
  use riwi_prueba
  db.alumnos.insertOne({ nombre: "Ana", edad: 20 })
  db.alumnos.find()

B3) Conecta desde Node.js
1) En el mismo proyecto:
   npm i mongodb
2) Agrega variables:
   MONGO_URI, MONGO_DB
3) Ejemplo basico (mongo.js)
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function main() {
  await client.connect();
  const db = client.db("riwi_prueba");
  const alumnos = db.collection("alumnos");
  await alumnos.insertOne({ nombre: "Juan", edad: 22 });
  const data = await alumnos.find().toArray();
  console.log(data);
  await client.close();
}

main().catch(console.error);

Checklist rapido
- Puedo conectarme con psql.
- Puedo crear DB y consultar now().
- Puedo conectarme con mongosh o Atlas.
- Puedo insertar y leer en MongoDB desde Node.js.

Errores comunes
- "password authentication failed": revisa usuario y password.
- "database does not exist": crea la DB con CREATE DATABASE.
- "ECONNREFUSED": Postgres o MongoDB no estan corriendo.
