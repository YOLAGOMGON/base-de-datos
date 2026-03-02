// Importa Router para definir rutas agrupadas en Express.
import { Router } from "express";
// Importa los controladores de doctores.
import { create, deleteById, getAll } from '../controllers/doctor.controller.js';

// Crea el enrutador específico para doctores.
export const doctorRoutes = Router();

// Ruta para obtener todos los doctores.
doctorRoutes.get('/', getAll);
// Ruta para crear un doctor.
doctorRoutes.post('/', create);
// Ruta para eliminar un doctor por su id.
doctorRoutes.delete('/:id', deleteById);