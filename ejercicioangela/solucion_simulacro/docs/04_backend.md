 # 04 - Backend (Express)
 
 ## Paso 1: Inicializar proyecto
 
 - `npm init -y`
 - Instalar dependencias:
   - express
   - cors
   - dotenv
   - pg o mysql2 (segun motor SQL)
   - mongoose
 
 ## Paso 2: Estructura sugerida
 
 ```
 backend/
   src/
     app.js
     server.js
     config/
       sql.js
       mongo.js
     routes/
       employees.routes.js
       trainings.routes.js
       reports.routes.js
       feedback.routes.js
     controllers/
     services/
 ```
 
 ## Paso 3: Endpoints obligatorios
 
 - Employees
   - GET /employees
   - POST /employees
   - GET /employees/:id/report
 
 - Trainings
   - GET /trainings
   - POST /trainings
   - GET /trainings/:id/stats
 
 - Reports
   - GET /reports/top-employees
   - GET /reports/worst-employee
   - GET /reports/ranking
   - GET /reports/empty-trainings
 
 - Feedback (Mongo)
   - POST /feedback
   - GET /feedback/:employeeId
 
 ## Paso 4: Manejo de errores
 
 - Middleware para errores.
 - Respuestas con status adecuados.
