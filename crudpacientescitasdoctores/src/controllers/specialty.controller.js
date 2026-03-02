// Importa funciones del servicio de especialidades.
import { createSpecialty, deleteSpeciality, getAllSpecialitys, recoverySpecialty } from "../services/specialty.service.js";

// Controlador para crear una especialidad.
export const create = async (req, res) => {

    // Extrae el nombre desde el body.
    const { name } = req.body;

    try {
        // Llama al servicio para crear la especialidad.
        const createSpecialtyResult = await createSpecialty(name);
        // Responde con éxito si la creación fue correcta.
        res.status(200).json({ response: "Especialidad creada correctamente" });
    } catch (error) {
        // Responde con error en caso de fallo.
        res.status(500).json({ error });
    }

};

// Controlador para eliminar una especialidad por id.
export const deleteById = async (req, res) => {

    // Obtiene el id desde los parámetros.
    const { id } = req.params;

    try {
        // Llama al servicio para eliminar.
        const deletedSpecialty = await deleteSpeciality(id);

        // Si no se eliminó ninguna fila, devuelve error.
        if (!deletedSpecialty.rowCount === 0) {
            return res.status(500).json({ error: "No se ha podido eliminar la especialidad" });
        }

        // Respuesta exitosa.
        res.status(200).json({ response: "Especialidad eliminado correctamente" });

    } catch (error) {
        // Log del error en servidor.
        console.log(error);
        // Respuesta con el código y mensaje del error.
        res.status(error.statusCode).json({ error: error.message });
    }

};

// Controlador para obtener todas las especialidades.
export const getAll = async (req, res) => {

    try {
        // Llama al servicio para listar especialidades.
        const specialities = await getAllSpecialitys();

        // Si no hay filas, responde con error.
        if (!specialities.rows) {
            return res.status(500).json({ error: "No se ha podido obtener las especialidades" });
        }

        // Responde con las filas encontradas.
        res.status(200).json({ response: specialities.rows });
    } catch (error) {
        // Log de error en servidor.
        console.error('Error al obtener las especialidades:', error);
        // Respuesta genérica de error.
        res.status(500).json({ error: error.message });
    }

};

// Controlador para recuperar una especialidad (según lógica del servicio).
export const recovery = async (req, res) => {

    try {
        // Llama al servicio de recuperación usando el nombre recibido.
        const specialty = await recoverySpecialty(req.body.name);
        // Responde con la especialidad recuperada.
        res.status(201).json({ response: specialty });
    } catch (error) {
        // Log del error.
        console.error("Error al recuperar la especialidad: " + error);
        // Responde con código de estado del error.
        res.status(error.statusCode).json({ response: error.message });
    }

};