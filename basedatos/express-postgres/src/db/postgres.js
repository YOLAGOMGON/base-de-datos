const { Pool } = require('pg'); // Importa Pool para manejar conexiones con PostgreSQL.
const pool = new Pool({ // Crea un pool de conexiones con la configuracion.
  user: 'postgres', // Usuario de la base de datos.
  host: 'localhost', // Host donde corre PostgreSQL.
  database: 'mi_db', // Nombre de la base de datos a usar.
  password: 'tu_password', // Password del usuario de la BD.
  port: 5432 // Puerto por defecto de PostgreSQL.
}); // Cierra la configuracion del pool.
module.exports = pool; // Exporta el pool para ejecutar consultas.
