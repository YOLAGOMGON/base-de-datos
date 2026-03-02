// Importa el pool de PostgreSQL para consultas.
import { pool } from "../config/database/pgconfig.js";
// Importa el modelo de especialidades en MongoDB.
import { Specialty } from "../models/specialty.models.js";
// Importa el error HTTP personalizado.
import { HttpError } from "../Errors/HttpError.js";

// Servicio para crear una especialidad (con o sin id).
export const createSpecialty = async (name, id = null) => {

    // Consulta por defecto: inserta solo el nombre.
    let query = `INSERT INTO test.specialty (name) VALUES ($1) RETURNING *`;
    // Valores para la consulta por defecto.
    let values = [name];

    // Si se proporciona id, se inserta con id explícito.
    if (id !== null) {
        query = `INSERT INTO test.specialty (id, name) VALUES ($1, $2) RETURNING *`;
        values = [id, name];
    }

    try {
        // Ejecuta la inserción.
        const response = await pool.query(query, values);
        // Retorna la fila creada.
        return response.rows[0];
    } catch (error) {
        // Log del error.
        console.error(`Erro al crear la especialidad: ${error}`);
        // Re-lanza el error.
        throw error;
    }

};

// Servicio para obtener todas las especialidades.
export const getAllSpecialitys = async () => {

    // Consulta SQL para listar especialidades.
    const query = `select s.* from test.specialty s`;

    try {
        // Ejecuta la consulta.
        const response = await pool.query(query);
        // Retorna la respuesta completa.
        return response;
    } catch (error) {
        // Log del error.
        console.error('Error al obtener las especialidades:', error);
        // Re-lanza el error.
        throw error;
    }

};

// Servicio para eliminar una especialidad por id.
export const deleteSpeciality = async (id) => {

    // Consulta SQL para eliminar y retornar la especialidad.
    const query = 'DELETE FROM test.specialty WHERE id = $1 RETURNING id, name';
    // Valores para el parámetro.
    const values = [id];

    try {
        // Ejecuta la eliminación.
        const response = await pool.query(query, values);

        // Si no se eliminó ninguna fila, lanza error 404.
        if (response.rowCount === 0) {
            throw new HttpError("La especialidad que intenta eliminar no existe", 404);
        }

        // Guardar registro eliminado en Mongo DB.
        const specialtyDeleted = new Specialty(response.rows[0]);
        await specialtyDeleted.save();

        // Retorna la respuesta de PostgreSQL.
        return response;
    } catch (error) {
        // Log del error.
        console.error('Error al eliminar una especialidad');
        // Re-lanza el error.
        throw error;
    }
};


// Servicio para recuperar una especialidad desde MongoDB.
export const recoverySpecialty = async (specialtyName) => {
    try {
        // 1. Obtener la especialidad a recuperar de MongoDB.
        const specialtyDeleted = await Specialty.findOne({ name: specialtyName });

        // 2. Intentar guardar en PostgreSQL.
        const newSpecialty = await createSpecialty(specialtyDeleted.name, specialtyDeleted.id);

        // 3. Si se guarda en Postgres, eliminar de MongoDB.
        await Specialty.deleteOne({ name: specialtyName });

        // Retorna la especialidad recuperada.
        return newSpecialty;

    } catch (error) {
        // Lanza un error si no se pudo recuperar.
        throw new HttpError("No se pudo recuperar la especialidad");
    }

};