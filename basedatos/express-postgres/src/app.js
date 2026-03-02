const express = require('express'); // Importa la libreria Express para crear la app.
const usuariosRoutes = require('./routes/usuarios.routes'); // Importa las rutas de usuarios.
const app = express(); // Crea la instancia principal de Express.
app.use(express.json()); // Permite leer bodies JSON en las peticiones.
app.use('/usuarios', usuariosRoutes); // Monta las rutas de usuarios bajo /usuarios.
app.use((req, res) => { // Maneja rutas no encontradas.
  res.status(404).json({ error: 'Ruta no encontrada' }); // Responde con error 404.
}); // Cierra el middleware de 404.
app.use((err, req, res, next) => { // Maneja errores inesperados en la app.
  console.error(err); // Muestra el error en consola para depurar.
  res.status(500).json({ error: 'Error interno del servidor' }); // Responde con error 500.
}); // Cierra el middleware de errores.
module.exports = app; // Exporta la app para usarla en index.js.
