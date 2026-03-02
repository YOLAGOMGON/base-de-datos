 # 06 - Conexiones (SQL + Mongo + Frontend)
 
 ## Backend -> SQL
 
 - Usar un driver (`pg` o `mysql2`).
 - Crear un archivo de configuracion `src/config/sql.js`.
 - Leer credenciales desde variables de entorno:
   - `SQL_HOST`
   - `SQL_PORT`
   - `SQL_USER`
   - `SQL_PASSWORD`
   - `SQL_DATABASE`
 
 ## Backend -> MongoDB
 
 - Usar `mongoose`.
 - Crear `src/config/mongo.js`.
 - Variable de entorno:
   - `MONGO_URI`
 
 ## Frontend -> Backend
 
 - Base URL en un solo lugar:
   - `VITE_API_URL=http://localhost:3000`
 - Usar `fetch` con rutas:
   - `/employees`
   - `/trainings`
   - `/reports/*`
   - `/feedback`
 
 ## Por que usar variables de entorno
 
 - Evitas exponer claves.
 - Puedes cambiar entornos sin tocar codigo.
