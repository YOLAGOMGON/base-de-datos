06 - Documentacion en Postman y exportar a JSON

Objetivo
Documentar la API en Postman y exportar la coleccion en formato JSON.

Paso 1: Crea una coleccion
- Abre Postman
- New > Collection
- Nombre: "Prueba CRUD"

Paso 2: Agrega requests
Agrega los endpoints:
- POST /clientes
- GET /clientes
- PUT /clientes/:id
- DELETE /clientes/:id

Paso 3: Documenta cada request
En cada request:
- Description: explica que hace
- Example: guarda ejemplo de respuesta
- Body: define el JSON de entrada

Paso 4: Variables de entorno (opcional)
- Crea entorno "Local"
- Variable: base_url = http://localhost:3000
- Usa {{base_url}} en las URLs

Paso 5: Exportar coleccion a JSON
- Click en la coleccion
- Export
- Formato: Collection v2.1
- Guarda el archivo .json

Tip
- Puedes usar la plantilla en docs/templates/POSTMAN_COLLECTION_TEMPLATE.json
  y luego importarla en Postman.

Checklist rapido
- Requests con descripcion clara
- Examples guardados
- Export JSON listo para entregar
