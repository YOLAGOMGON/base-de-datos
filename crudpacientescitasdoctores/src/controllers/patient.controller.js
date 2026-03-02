// Importa funciones del servicio de pacientes.
import { createPatient, deletePatient, getAllPatients } from "../services/patient.service.js";

// Controlador para crear un paciente.
export const create = async (req, res) => {

    // Extrae nombre y fecha de nacimiento desde el body.
    const { name, birth_date } = req.body;

    try {
        // Llama al servicio para crear el paciente.
        const newPatient = await createPatient(name, birth_date);
        // Responde con estado 201 cuando se crea correctamente.
        return res.status(201).json({
            response: "Se ha creado el paciente correctamente"
        });
    } catch (error) {
        // Responde con error si falla la creación.
        res.status(500).json({
            response: error
        });
    }

};

// Controlador para obtener todos los pacientes.
export const getAll = async (req, res) => {

    try {
        // Llama al servicio para listar pacientes.
        const patients = await getAllPatients();
        // Retorna las filas obtenidas desde la base de datos.
        return res.status(200).json({ response: patients.rows });
    } catch (error) {
        // Responde con error si falla la consulta.
        res.status(500).json({
            response: error
        });
    }

};

// Controlador para eliminar un paciente por id.
export const deleteById = async (req, res) => {

    // Extrae el id desde los parámetros de la ruta.
    const { id } = req.params;

    try {
        // Llama al servicio para eliminar el paciente.
        const deletedPatient = await deletePatient(id);
        // Responde con éxito si se elimina correctamente.
        return res.status(200).json({
            response: "Se ha eliminado el usuario correctamente"
        });
    } catch (error) {
        // Responde con error si falla la eliminación.
        res.status(500).json({
            response: error
        });
    }

};