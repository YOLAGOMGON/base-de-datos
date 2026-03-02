const Usuario = require('../models/usuario.model'); // Importa el modelo Usuario.
const listarUsuarios = async (req, res, next) => { // Controlador para listar usuarios.
  try { // Inicia el bloque de manejo de errores.
    const usuarios = await Usuario.find(); // Busca todos los documentos.
    res.json(usuarios); // Responde con el arreglo de usuarios.
  } catch (error) { // Captura cualquier error.
    next(error); // Envia el error al middleware correspondiente.
  } // Cierra el bloque try/catch.
}; // Cierra la funcion listarUsuarios.
const obtenerUsuario = async (req, res, next) => { // Controlador para obtener un usuario.
  try { // Inicia el bloque de manejo de errores.
    const usuario = await Usuario.findById(req.params.id); // Busca por id.
    if (!usuario) { // Verifica si no se encontro el usuario.
      return res.status(404).json({ error: 'Usuario no encontrado' }); // Responde 404.
    } // Cierra la condicion de no encontrado.
    res.json(usuario); // Responde con el usuario encontrado.
  } catch (error) { // Captura cualquier error.
    next(error); // Envia el error al middleware correspondiente.
  } // Cierra el bloque try/catch.
}; // Cierra la funcion obtenerUsuario.
const crearUsuario = async (req, res, next) => { // Controlador para crear un usuario.
  try { // Inicia el bloque de manejo de errores.
    const nuevo = await Usuario.create(req.body); // Crea el usuario con el body.
    res.status(201).json(nuevo); // Responde 201 con el usuario creado.
  } catch (error) { // Captura cualquier error.
    next(error); // Envia el error al middleware correspondiente.
  } // Cierra el bloque try/catch.
}; // Cierra la funcion crearUsuario.
const actualizarUsuario = async (req, res, next) => { // Controlador para actualizar un usuario.
  try { // Inicia el bloque de manejo de errores.
    const actualizado = await Usuario.findByIdAndUpdate( // Busca y actualiza por id.
      req.params.id, // Usa el id enviado en la URL.
      req.body, // Aplica los cambios enviados en el body.
      { new: true, runValidators: true } // Devuelve el doc actualizado y valida.
    ); // Cierra la llamada a findByIdAndUpdate.
    if (!actualizado) { // Verifica si no se encontro el usuario.
      return res.status(404).json({ error: 'Usuario no encontrado' }); // Responde 404.
    } // Cierra la condicion de no encontrado.
    res.json(actualizado); // Responde con el usuario actualizado.
  } catch (error) { // Captura cualquier error.
    next(error); // Envia el error al middleware correspondiente.
  } // Cierra el bloque try/catch.
}; // Cierra la funcion actualizarUsuario.
const eliminarUsuario = async (req, res, next) => { // Controlador para eliminar un usuario.
  try { // Inicia el bloque de manejo de errores.
    const eliminado = await Usuario.findByIdAndDelete(req.params.id); // Elimina por id.
    if (!eliminado) { // Verifica si no se encontro el usuario.
      return res.status(404).json({ error: 'Usuario no encontrado' }); // Responde 404.
    } // Cierra la condicion de no encontrado.
    res.json(eliminado); // Responde con el usuario eliminado.
  } catch (error) { // Captura cualquier error.
    next(error); // Envia el error al middleware correspondiente.
  } // Cierra el bloque try/catch.
}; // Cierra la funcion eliminarUsuario.
module.exports = { // Exporta los controladores.
  listarUsuarios, // Exporta listarUsuarios.
  obtenerUsuario, // Exporta obtenerUsuario.
  crearUsuario, // Exporta crearUsuario.
  actualizarUsuario, // Exporta actualizarUsuario.
  eliminarUsuario // Exporta eliminarUsuario.
}; // Cierra el objeto de exportacion.
