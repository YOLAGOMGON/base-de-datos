const express = require('express'); // Importa Express para crear un router.
const { // Abre la lista de controladores a importar.
  listarUsuarios, // Controlador para listar usuarios.
  obtenerUsuario, // Controlador para obtener un usuario.
  crearUsuario, // Controlador para crear un usuario.
  actualizarUsuario, // Controlador para actualizar un usuario.
  eliminarUsuario // Controlador para eliminar un usuario.
} = require('../controllers/usuarios.controller'); // Importa desde el archivo.
const router = express.Router(); // Crea un router dedicado a usuarios.
router.get('/', listarUsuarios); // Ruta GET para listar usuarios.
router.get('/:id', obtenerUsuario); // Ruta GET para obtener un usuario por id.
router.post('/', crearUsuario); // Ruta POST para crear un usuario.
router.put('/:id', actualizarUsuario); // Ruta PUT para actualizar un usuario por id.
router.delete('/:id', eliminarUsuario); // Ruta DELETE para eliminar un usuario por id.
module.exports = router; // Exporta el router para montarlo en app.js.
