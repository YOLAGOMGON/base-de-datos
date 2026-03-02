04 - Express CRUD, procedimientos, vistas y triggers

Objetivo
Crear una API con Express que haga CRUD en Postgres y aplicar:
procedimientos almacenados, vistas y triggers, de forma ordenada.

Requisitos
- Node.js 18+
- Postgres
- Proyecto base del repo (carpetas src/ y sql/)

Parte A: Prepara la base de datos (SQL)

A1) Crea la base
- En psql:
  CREATE DATABASE riwi_prueba;
  \c riwi_prueba

A2) Ejecuta los scripts del repo (orden)
- sql/01-schema.sql
- sql/02-functions.sql
- sql/03-views.sql
- sql/04-triggers.sql
- sql/05-seed.sql (opcional)

Ejemplo en psql:
\i 'C:/programacion/Base de dattos/prueba/sql/01-schema.sql'

Parte B: Configura la API (Express)

B1) Crea un .env basado en .env.example
- Copia .env.example a .env
- Cambia PG_PASSWORD

B2) Instala dependencias
npm install

B3) Inicia la API
npm run dev

Parte C: CRUD usando procedimientos

En este repo el endpoint POST /clientes usa el procedimiento:
SELECT * FROM insertar_cliente('Ana','123','Medellin');

Los endpoints:
- POST /clientes (usa insertar_cliente)
- GET /clientes
- GET /clientes/:id
- PUT /clientes/:id
- DELETE /clientes/:id

Parte D: Vistas

Consulta la vista:
SELECT * FROM vw_clientes_resumen;

Parte E: Triggers

Inserta un cliente y revisa auditoria:
INSERT INTO clientes(nombre, telefono, ciudad)
VALUES ('Carla', '333', 'Cali');

SELECT * FROM auditoria_clientes ORDER BY id DESC;

Checklist rapido
- Scripts SQL ejecutados sin error
- API responde en /health
- CRUD funcionando en /clientes
- Vista y trigger verificados
