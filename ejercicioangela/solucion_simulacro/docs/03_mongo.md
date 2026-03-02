 # 03 - Modelo NoSQL (MongoDB)
 
 ## Colecciones minimas
 
 - `feedback`
 - `logs`
 
 ## Paso 1: Definir estructura
 
 En `mongo/collections.json` documenta:
 
 - feedback
   - employeeId (number)
   - trainingId (number)
   - comment (string)
   - rating (number)
   - createdAt (date)
 
 - logs
   - action (string)
   - user (string)
   - timestamp (string o date)
 
 ## Paso 2: Semilla de datos
 
 Crea ejemplos reales (5 a 10) para cada coleccion.
 
 ## Por que Mongo aqui
 
 - Feedback y logs cambian su estructura con el tiempo.
 - Mongo permite flexibilidad y rapidez en escritura.
