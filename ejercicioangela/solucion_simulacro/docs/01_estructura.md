 # 01 - Estructura de carpetas
 
 Esta es la estructura recomendada para el simulacro:
 
 ```
 solucion_simulacro/
   backend/
   frontend/
   sql/
   mongo/
   docs/
 ```
 
 ## Que va en cada carpeta
 
 - `backend/`
   - Servidor Express.
   - Rutas y controladores.
   - Conexion a SQL y MongoDB.
 
 - `frontend/`
   - SPA con Vite.
   - Pantallas para CRUD y reportes.
   - Consumo de endpoints del backend.
 
 - `sql/`
   - `database.sql`: DDL con tablas y relaciones.
   - `views.sql`: vistas SQL.
   - `queries.sql`: consultas del enunciado.
 
 - `mongo/`
   - `collections.json`: estructura y ejemplos.
   - `seed.json`: datos de prueba (opcional).
 
 - `docs/`
   - Documentacion paso a paso.
 
 ## Por que esta estructura
 
 - Separa responsabilidades.
 - Facilita evaluacion.
 - Es el estandar del enunciado.
