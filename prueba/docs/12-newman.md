12 - Pruebas automaticas con Postman/Newman

Objetivo
Ejecutar pruebas automaticas desde la linea de comandos.

Requisitos
- Node.js 18+ recomendado
- API corriendo en http://localhost:3000
- Dependencia newman instalada

Instalacion
npm install

Ejecucion
npm run test:api

Que valida
- Todas las respuestas deben ser 200 o 201.
- Todas las respuestas deben ser JSON.
- Pruebas negativas esperan 400.

Si falla
- Verifica que la API este arriba.
- Verifica base_url en docs/postman/riwi_prueba_env.json
- Verifica que cliente_id y alumno_id se creen en ejecucion.
