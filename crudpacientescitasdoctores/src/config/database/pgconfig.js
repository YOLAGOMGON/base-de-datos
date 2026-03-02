// Importa el Pool de PostgreSQL para gestionar conexiones.
import { Pool } from "pg";
// Importa la configuración con variables de entorno.
import { env } from "../env.js";

// Exporta una referencia al pool para usarlo en otros módulos.
export let pool;

// Función asíncrona que crea y conecta el pool de PostgreSQL.
export const connectPostgres = async () => {
    try {
        // Crea el pool con los datos de configuración.
        const poolPg = new Pool({
            host: env.DB.HOST,
            port: env.DB.PORT,
            database: env.DB.NAME,
            user: env.DB.USER,
            password: env.DB.PASSWORD
        });

        // Abre la primera conexión para validar credenciales.
        await poolPg.connect();
        // Mensaje de confirmación en consola.
        console.log("Postgres esta conectado");
        // Guarda el pool en la variable exportada.
        pool = poolPg;
    } catch (error) {
        // Muestra el error de conexión.
        console.error(error);
        // Termina el proceso con código de error.
        process.exit(1);
    }
};