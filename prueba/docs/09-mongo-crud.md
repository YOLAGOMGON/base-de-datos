09 - CRUD MongoDB con ejemplos y pruebas

Objetivo
Crear, leer, actualizar y eliminar alumnos en MongoDB desde la API.

Requisitos
- MongoDB local o Atlas
- Variables en .env: MONGO_URI, MONGO_DB
- API levantada con npm run dev

Endpoints disponibles
- POST /alumnos
- GET /alumnos
- GET /alumnos/:id
- PUT /alumnos/:id
- DELETE /alumnos/:id

Ejemplos de pruebas (Thunder o Postman)

1) Crear alumno
POST http://localhost:3000/alumnos
Body JSON:
{
  "nombre": "Diana",
  "edad": 21,
  "ciudad": "Cali"
}

Respuesta esperada (ejemplo)
{
  "_id": "66f000000000000000000001",
  "nombre": "Diana",
  "edad": 21,
  "ciudad": "Cali",
  "creado_en": "2026-03-02T12:00:00.000Z"
}

2) Listar alumnos
GET http://localhost:3000/alumnos

3) Obtener alumno por id
GET http://localhost:3000/alumnos/66f000000000000000000001

4) Actualizar alumno
PUT http://localhost:3000/alumnos/66f000000000000000000001
Body JSON:
{
  "nombre": "Diana Perez",
  "edad": 22,
  "ciudad": "Medellin"
}

5) Eliminar alumno
DELETE http://localhost:3000/alumnos/66f000000000000000000001

Errores comunes
- 503 MongoDB no configurado: revisa .env y reinicia la API.
- 400 id invalido: el id no es un ObjectId valido.
- 404 alumno no encontrado: el id no existe en la coleccion.

Checklist rapido
- CRUD de alumnos responde sin error.
- IDs validos en consultas.
- Documentacion en Postman lista.
