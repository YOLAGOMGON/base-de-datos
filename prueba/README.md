README - Guia de estudio y proyecto base

Este repositorio contiene documentacion paso a paso y un proyecto base para
presentar la prueba de desempeno del modulo 4 (bases de datos). Incluye:
Postgres, MongoDB, normalizacion en Excel, carga de Excel a Postgres,
CRUD con Express, procedimientos almacenados, vistas, triggers, pruebas
de API en Thunder Client, documentacion en Postman y entregables finales.

Contenido (docs)
- docs/01-conexiones-postgres-mongo.md
- docs/02-excel-normalizado.md
- docs/03-cargar-excel-a-postgres.md
- docs/04-express-crud-procedimientos-vistas-triggers.md
- docs/05-probar-api-thunder.md
- docs/06-documentacion-postman-json.md
- docs/07-erd-y-descripcion-proyecto.md
- docs/08-guia-prueba-riwi.md
- docs/09-mongo-crud.md
- docs/10-csv-simulacion.md
- docs/11-sql-verificacion.md
- docs/12-newman.md
- docs/13-excel-normalizado-xlsx.md

Coleccion Postman
- docs/postman/riwi_prueba_collection.json
- docs/postman/riwi_prueba_env.json

Excel
- data/clientes.xlsx (generado con npm run excel:generate)
- data/ventas_normalizado.xlsx (generado con npm run excel:normalized)

Pruebas automaticas
- npm run test:api

Carga automatica CSV
- npm run csv:load

Plantillas utiles
- docs/templates/README_TEMPLATE.md
- docs/templates/POSTMAN_COLLECTION_TEMPLATE.json
- docs/templates/ERD_NOTES.md

Estructura del proyecto
- src/ (API Express)
- sql/ (schema, funciones, vistas, triggers, seed)
- docs/ (documentacion paso a paso)

Quick start (Postgres)
1) Crea la base: riwi_prueba
2) Ejecuta scripts en orden:
   - sql/01-schema.sql
   - sql/02-functions.sql
   - sql/03-views.sql
   - sql/04-triggers.sql
   - sql/05-seed.sql (opcional)
3) Copia .env.example a .env y configura credenciales
4) npm install
5) npm run dev

Endpoints
- GET /health
- POST /clientes
- GET /clientes
- GET /clientes/:id
- PUT /clientes/:id
- DELETE /clientes/:id

Entregables sugeridos
- ERD (exportado como PNG o PDF)
- Coleccion Postman (JSON v2.1)
- README con descripcion del proyecto

Notas
- Si no tienes instalado Postgres, MongoDB, Node.js o Excel/LibreOffice,
  revisa el punto "Requisitos" en cada documento.
- Todo el contenido esta pensado para Windows y puede adaptarse a otros SO.
