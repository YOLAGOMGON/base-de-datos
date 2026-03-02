// Importa el pool de PostgreSQL para ejecutar consultas.
import { pool } from "../config/database/pgconfig.js";

// Servicio para crear un paciente.
export const createPatient = async (name, birth_date) => {

    // Consulta SQL para insertar un paciente y retornar id y nombre.
    const query = `INSERT INTO test.patient (name, birth_date) VALUES ($1, TO_DATE($2, 'DD/MM/YYYY')) RETURNING id, name`;
    // Valores para los parámetros de la consulta.
    const values = [name, birth_date];

    try {

        // Ejecuta la inserción en la base de datos.
        const response = await pool.query(query, values);
        // Si no hay fila retornada, se considera un fallo.
        if (!response.rows[0]) {
            throw Error("No se ha logrado crear el paciente");
        }
        // Retorna la respuesta de la base de datos.
        return response;

    } catch (error) {
        // Log del error con contexto.
        console.error(`No se ha podido crear el paciente: ${error}`);
        // Re-lanza el error para manejo superior.
        throw (error);
    }

};


// Servicio para obtener todos los pacientes.
export const getAllPatients = async () => {
    // Consulta SQL para traer todos los pacientes.
    const query = `SELECT * FROM test.patient`;
    try {
        // Ejecuta la consulta.
        const response = await pool.query(query);
        // Si no hay filas, lanza un error.
        if (!response.rows[0]) {
            throw Error("No se ha logrado obtener los pacientes");
        }
        // Retorna la respuesta con las filas.
        return response;
    } catch (error) {
        // Log del error con contexto.
        console.error(`No se ha podido obtener los pacientes: ${error}`);
        // Re-lanza el error.
        throw (error);
    }
};


// Servicio para eliminar un paciente por id.
export const deletePatient = async (id) => {

    // Consulta SQL para eliminar el paciente.
    const query = `DELETE FROM test.patient WHERE id = $1`;
    // Valores para el parámetro de la consulta.
    const values = [id];

    try {
        // Ejecuta la eliminación.
        const response = await pool.query(query, values);

        // Si no se eliminó ninguna fila, lanza error.
        if (response.rowCount === 0) {
            throw new Error('No se ha logrado eliminar el paciente');
        }

        // Retorna la respuesta de la base de datos.
        return response;

    } catch (error) {
        // Log del error con contexto.
        console.error(`No se ha podido eliminar el paciente: ${error}`);
        // Re-lanza el error.
        throw error;
    }

};