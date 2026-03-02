// Importa Mongoose para trabajar con esquemas y modelos.
import mongoose from "mongoose";

// Define el esquema de especialidades para MongoDB.
export const specialtySchema = new mongoose.Schema(
    {
        // Id de la especialidad (normalmente de PostgreSQL).
        id: String,
        // Nombre de la especialidad.
        name: String
    },
    {
        // Agrega createdAt y updatedAt automáticamente.
        timestamps: true
    }
);

// Crea y exporta el modelo Specialty.
export const Specialty = mongoose.model('Specialty', specialtySchema);