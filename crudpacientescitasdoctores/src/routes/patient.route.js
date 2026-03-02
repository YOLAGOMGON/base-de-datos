// Importa Router para definir rutas agrupadas en Express.
import { Router } from "express";
// Importa los controladores de pacientes.
import { create, deleteById, getAll } from "../controllers/patient.controller.js";

// Crea el enrutador específico para pacientes.
export const patientRoutes = Router();

// Ruta para crear un paciente.
patientRoutes.post('/', create);
// Ruta para obtener todos los pacientes.
patientRoutes.get('/', getAll);
// Ruta para eliminar un paciente por su id.
patientRoutes.delete('/:id', deleteById);