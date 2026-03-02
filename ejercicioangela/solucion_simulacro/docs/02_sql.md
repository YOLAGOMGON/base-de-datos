 # 02 - Modelo relacional (SQL)
 
 ## Paso 1: Disenar el DER
 
 Entidades minimas:
 - employees
 - trainings
 - sessions
 - enrollments
 - grades
 
 Relaciones:
 - employees 1:N enrollments
 - trainings 1:N sessions
 - enrollments 1:1 grades
 
 ## Paso 2: Crear tablas (DDL)
 
 En `sql/database.sql`:
 1. Crear `employees`.
 2. Crear `trainings`.
 3. Crear `sessions` con FK a `trainings`.
 4. Crear `enrollments` con FK a `employees` y `sessions` (o trainings).
 5. Crear `grades` con FK unico a `enrollments`.
 
 ## Paso 3: Cargar datos (DML)
 
 - Insertar empleados.
 - Insertar trainings.
 - Insertar sessions.
 - Insertar enrollments.
 - Insertar grades.
 
 ## Paso 4: Consultas obligatorias
 
 Crear `sql/queries.sql` con las 10 consultas del enunciado.
 Cada consulta luego sera un endpoint en el backend.
 
 ## Paso 5: Vistas
 
 En `sql/views.sql`:
 - `v_employee_performance`
 - `v_training_stats`
 
 Estas vistas tendran endpoints propios.
 
 ## Por que este orden
 
 - Las FKs requieren que las tablas padre existan primero.
 - Los inserts deben respetar las relaciones.
