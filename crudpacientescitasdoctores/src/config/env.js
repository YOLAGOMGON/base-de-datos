// Carga automáticamente las variables de entorno desde el archivo .env.
import 'dotenv/config';

// Exporta un objeto con la configuración centralizada del proyecto.
export const env = {
  // Puerto donde correrá el servidor HTTP.
  APP_PORT: process.env.APP_PORT,
  // Configuración de la base de datos relacional (PostgreSQL).
  DB: {
    // Host del servidor de base de datos.
    HOST: process.env.DB_HOST,
    // Puerto del servidor de base de datos.
    PORT: process.env.DB_PORT,
    // Usuario para autenticación en la base de datos.
    USER: process.env.DB_USER,
    // Contraseña del usuario de base de datos.
    PASSWORD: process.env.DB_PWD,
    // Nombre de la base de datos a utilizar.
    NAME: process.env.DB_NAME
  },
  // Configuración de la base de datos NoSQL (MongoDB).
  MONGO: {
    // URI completa de conexión a MongoDB.
    URI: process.env.MONGO_URI_DB
  },
  // Clave de API para servicios externos (OpenAI en este caso).
  OPENAI_API_KEY: process.env.OPENAI_API_KEY
};