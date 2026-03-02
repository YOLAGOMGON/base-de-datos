05 - Probar API en Thunder Client

Objetivo
Probar endpoints CRUD usando Thunder Client en VS Code/Cursor.

Paso 1: Instala la extension
- Busca "Thunder Client" e instala.

Paso 2: Crea una coleccion
- Abre Thunder Client
- New Collection > "Prueba CRUD"

Paso 3: Prueba endpoints

CREATE (POST)
- Metodo: POST
- URL: http://localhost:3000/clientes
- Body (JSON):
  {
    "nombre": "Laura",
    "telefono": "555",
    "ciudad": "Cali"
  }

READ (GET)
- Metodo: GET
- URL: http://localhost:3000/clientes

UPDATE (PUT)
- Metodo: PUT
- URL: http://localhost:3000/clientes/1
- Body (JSON):
  {
    "nombre": "Laura Gomez",
    "telefono": "555",
    "ciudad": "Cali"
  }

DELETE (DELETE)
- Metodo: DELETE
- URL: http://localhost:3000/clientes/1

Paso 4: Verifica respuestas
- Status 200 o 201
- JSON correcto en cada respuesta
- Si sale 500, revisa consola de la API
- Si sale 404, revisa la URL

Ejemplos de respuesta esperada
POST /clientes
{
  "id_cliente": 1,
  "nombre": "Laura",
  "telefono": "555",
  "ciudad": "Cali"
}

Checklist rapido
- Endpoints responden sin error
- Body y headers correctos
- Coleccion guardada para evidencias
