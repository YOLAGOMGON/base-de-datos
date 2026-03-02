// Importa funciones del servicio de doctores (lógica de acceso a datos).
import { createDoctor, getAllDoctors, deleteDoctor } from "../services/doctor.service.js";

// Controlador para crear un doctor.
export const create = async (req, res) => {

    // Extrae los datos necesarios desde el body de la petición.
    const { name, specialty } = req.body;

    try {
        // Llama al servicio para crear el doctor.
        const newDoctor = await createDoctor({ name, specialty });

        // Si el servicio indica falla, retorna error al cliente.
        if (!newDoctor.status) {
            return res.status(500).json({ error: newDoctor.error_message });
        }

        // Responde con estado 201 (creado) y un mensaje.
        res.status(201).json({ response: newDoctor.error_message });

    } catch (error) {
        // Log de error en el servidor.
        console.error('Error al crear el doctor:', error);
        // Respuesta genérica de error al cliente.
        res.status(500).json({ error: error.message });
    }

};

// Controlador para eliminar un doctor por su id.
export const deleteById = async (req, res) => {

    // Obtiene el id desde los parámetros de la ruta.
    const { id } = req.params;

    try {
        // Llama al servicio para eliminar el doctor.
        const deletedDoctor = await deleteDoctor(id);

        // Si no se eliminó ninguna fila, devuelve un error.
        if (!deletedDoctor.rowCount === 0) {
            return res.status(500).json({ error: "No se ha podido eliminar el doctor" });
        }

        // Respuesta exitosa si la eliminación fue correcta.
        res.status(200).json({ response: "Doctor eliminado correctamente" });

    } catch (error) {
        // Log de error en el servidor.
        console.error('Error al eliminar el doctor:', error);
        // Respuesta genérica de error al cliente.
        res.status(500).json({ error: error.message });
    }

};

// Controlador para obtener todos los doctores.
export const getAll = async (req, res) => {

    try {
        // Llama al servicio para listar doctores.
        const doctors = await getAllDoctors();
        // Responde con la lista de doctores.
        res.status(200).json({ response: doctors });
    } catch (error) {
        // Log de error en el servidor.
        console.error('Error al obtener los doctores:', error);
        // Respuesta genérica de error al cliente.
        res.status(500).json({ error: error.message });
    }

};