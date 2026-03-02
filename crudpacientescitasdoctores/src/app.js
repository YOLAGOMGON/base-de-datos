// Importa el framework Express para crear la aplicación HTTP.
import express from 'express';
// Importa las rutas del módulo de doctores.
import { doctorRoutes } from './routes/doctor.route.js';
// Importa las rutas del módulo de citas.
import { appointmentRoutes } from './routes/appoinment.route.js';
// Importa las rutas del módulo de especialidades.
import { specialtyRoutes } from './routes/specialty.route.js';
// Importa las rutas del módulo de pacientes.
import { patientRoutes } from './routes/patient.route.js';
// Importa la función que conecta con MongoDB.
import { connectMongo } from './config/database/mongoconfig.js';
// Importa la función que conecta con PostgreSQL.
import { connectPostgres } from './config/database/pgconfig.js';

// Inicia la conexión a MongoDB (sincrónica o asíncrona según la implementación).
connectMongo();
// Espera a que se complete la conexión a PostgreSQL antes de seguir.
await connectPostgres();

// Crea la instancia principal de la aplicación Express.
const app = express();
// Habilita el middleware para parsear JSON en el body de las solicitudes.
app.use(express.json());

// Monta las rutas de doctores bajo el prefijo /doctors.
app.use('/doctors', doctorRoutes);
// Monta las rutas de citas bajo el prefijo /appointments.
app.use('/appointments', appointmentRoutes);
// Monta las rutas de especialidades bajo el prefijo /specialty.
app.use('/specialty', specialtyRoutes);
// Monta las rutas de pacientes bajo el prefijo /patients.
app.use('/patients', patientRoutes);

// Exporta la app para usarla en el servidor principal o en tests.
export default app;