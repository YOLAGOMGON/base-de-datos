// Importa Router para definir rutas agrupadas en Express.
import { Router } from "express";
// Importa el controlador de citas.
import { create } from "../controllers/appoinment.controller.js";

// Crea el enrutador específico para citas.
export const appointmentRoutes = Router();

// Ruta para crear una cita.
appointmentRoutes.post('/', create);