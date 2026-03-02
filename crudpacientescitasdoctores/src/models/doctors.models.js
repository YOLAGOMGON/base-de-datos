// Importa Mongoose para definir esquemas y modelos.
import mongoose from "mongoose";

// Define el esquema de Doctor para MongoDB.
export const doctorsSchema = new mongoose.Schema(
    {
        // Id del doctor (normalmente viene de PostgreSQL).
        id: String,
        // Nombre del doctor.
        name: String,
        // Id de la especialidad relacionada.
        specialty_id: String
    },
    {
        // Agrega campos createdAt y updatedAt automáticamente.
        timestamps: true
    }
);

// Crea y exporta el modelo Doctor basado en el esquema.
export const Doctor = mongoose.model('Doctor', doctorsSchema);