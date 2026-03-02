// Importa Router para definir rutas agrupadas en Express.
import { Router } from "express";
// Importa los controladores de especialidades.
import { create, deleteById, getAll, recovery } from "../controllers/specialty.controller.js";

// Crea el enrutador específico para especialidades.
export const specialtyRoutes = Router();

// Ruta para crear una especialidad.
specialtyRoutes.post('/', create);
// Ruta para obtener todas las especialidades.
specialtyRoutes.get('/', getAll);
// Ruta para eliminar una especialidad por id.
specialtyRoutes.delete('/:id', deleteById);
// Ruta para recuperar especialidades (según lógica del controlador).
specialtyRoutes.post('/recovery', recovery);