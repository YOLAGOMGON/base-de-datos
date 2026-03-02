// Importa Mongoose, el ODM para trabajar con MongoDB en Node.js.
import mongoose from "mongoose";
// Importa la configuración de entorno para obtener la URI de MongoDB.
import { env } from "../env.js";

// Función asíncrona que establece la conexión con MongoDB.
export const connectMongo = async () => {
    try {
        // Intenta conectarse usando la URI configurada.
        await mongoose.connect(env.MONGO.URI);
        // Mensaje de confirmación si la conexión fue exitosa.
        console.log("Mongo esta conectado");
    } catch (error) {
        // Muestra el error de conexión en consola.
        console.error(error);
        // Finaliza el proceso con código de error.
        process.exit(1);
    }
};

// Crea y exporta un "pool" (promesa de conexión) reutilizable.
export const poolMongo = mongoose.connect(env.MONGO.URI);