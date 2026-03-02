07 - ERD y descripcion del proyecto

Objetivo
Preparar el entregable final con:
- Diagrama entidad-relacion (ERD)
- Descripcion del proyecto
- Como corre y que hace

Parte A: ERD

Que es
Un diagrama que muestra tablas, PK, FK y relaciones.

Como hacerlo rapido
- Usa draw.io, dbdiagram.io o pgAdmin (ERD tool).
- Exporta como PNG o PDF.
- Nombra el archivo: ERD.png o ERD.pdf

Elementos minimos
- Tablas con sus columnas
- PK y FK marcadas
- Relaciones 1 a N o N a N

Parte B: Descripcion del proyecto (plantilla)

Nombre del proyecto:
Descripcion corta (2-3 lineas):
Problema que resuelve:
Alcance (modulos incluidos):
Tecnologias:
- Node.js
- Express
- Postgres
- MongoDB (si aplica)

Parte C: Como corre el proyecto

Requisitos
- Node.js 18+
- Postgres y/o MongoDB

Pasos de ejecucion
1) Clonar repositorio
2) npm install
3) Configurar variables (.env)
4) npm run dev o node index.js

Variables sugeridas (.env)
PORT=3000
PG_HOST=localhost
PG_DB=riwi_prueba
PG_USER=postgres
PG_PASSWORD=TU_PASSWORD
PG_PORT=5432

Parte D: Que hace la API
Ejemplo de endpoints
- POST /clientes (crear)
- GET /clientes (listar)
- PUT /clientes/:id (actualizar)
- DELETE /clientes/:id (eliminar)

Plantillas
- docs/templates/README_TEMPLATE.md
- docs/templates/ERD_NOTES.md

Checklist rapido
- ERD exportado y adjunto
- README con descripcion y pasos
- Variables documentadas
