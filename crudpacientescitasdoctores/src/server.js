// Importa la aplicación Express ya configurada.
import app from './app.js';
// Importa las variables de entorno ya cargadas y validadas.
import { env } from './config/env.js';

// Inicia el servidor HTTP en el puerto definido en las variables de entorno.
app.listen(env.APP_PORT, (error) => {
    try {
        // Mensaje informativo cuando el servidor arranca correctamente.
        console.log(`🚀 Servidor corriendo en puerto ${env.APP_PORT}`);
        // Si Express reporta un error al iniciar, lo muestra en consola.
        if (error) {
            console.log(error);
        }
    } catch (error) {
        // Captura errores inesperados durante el arranque.
        console.error('Error al iniciar el servidor:', error);
    }
});