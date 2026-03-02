// Importa el pool de PostgreSQL para ejecutar consultas.
import { pool } from "../config/database/pgconfig.js";
// Importa la clase de error HTTP personalizada.
import { HttpError } from "../Errors/HttpError.js";
// Importa el modelo de Doctor (MongoDB).
import { Doctor } from "../models/doctors.models.js";

// Servicio para crear un doctor en PostgreSQL.
export const createDoctor = async ({ name, specialty }) => {

    // Llama a un procedimiento almacenado en PostgreSQL.
    const query = 'CALL test.sp_create_doctor($1::text, $2::text, null, null)';
    // Valores que se pasan a la consulta parametrizada.
    const values = [name, specialty];

    try {
        // Ejecuta la consulta en la base de datos.
        const response = await pool.query(query, values);
        // Retorna la primera fila del resultado.
        return response.rows[0];
    } catch (error) {
        // Log del error para depuración.
        console.error('Error al crear el doctor:', error);
        // Re-lanza el error para que el controlador lo maneje.
        throw error;
    }

};

// Servicio para eliminar un doctor por id.
export const deleteDoctor = async (id) => {

    // Consulta SQL para borrar y retornar el registro eliminado.
    const query = 'DELETE FROM test.doctor WHERE id = $1 RETURNING id, name, specialty_id';
    // Valores para el parámetro de la consulta.
    const values = [id];

    try {

        // Ejecuta la eliminación en la base de datos.
        const response = await pool.query(query, values);

        // Si no se eliminó ninguna fila, lanza un error.
        if (response.rowCount === 0) {
            throw new HttpError("No se elimino el doctor", 500);
        }

        // Guarda el doctor eliminado en MongoDB.
        const doctorDeleted = new Doctor(response.rows[0]).save();

        // Retorna la respuesta completa de PostgreSQL.
        return response;
    } catch (error) {
        // Log del error de eliminación.
        console.error('Error al eliminar un doctor');
        // Re-lanza el error para manejo superior.
        throw error;
    }
};

// Servicio para obtener todos los doctores.
export const getAllDoctors = async () => {

    // Consulta SQL para listar doctores.
    const query = `select d.* from test.doctor d`;

    try {
        // Ejecuta la consulta de listado.
        const response = await pool.query(query);
        // Retorna las filas obtenidas.
        return response.rows;
    } catch (error) {
        // Log de error en la consulta.
        console.error('Error al obtener los doctores:', error);
        // Re-lanza el error.
        throw error;
    }

};