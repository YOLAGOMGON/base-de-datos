const db = require('../db/postgres'); // Importa el pool de PostgreSQL.
const listarUsuarios = async (req, res, next) => { // Controlador para listar usuarios.
  try { // Inicia el bloque de manejo de errores.
    const { rows } = await db.query('SELECT * FROM usuarios'); // Trae usuarios.
    res.json(rows); // Responde con los usuarios en JSON.
  } catch (error) { // Captura cualquier error.
    next(error); // Envia el error al middleware correspondiente.
  } // Cierra el bloque try/catch.
}; // Cierra la funcion listarUsuarios.
const obtenerUsuario = async (req, res, next) => { // Controlador para obtener un usuario.
  try { // Inicia el bloque de manejo de errores.
    const { rows } = await db.query( // Ejecuta una consulta parametrizada.
      'SELECT * FROM usuarios WHERE id = $1', // SQL con placeholder.
      [req.params.id] // Pasa el id de la URL como parametro.
    ); // Cierra la consulta.
    if (!rows[0]) { // Verifica si no existe el usuario.
      return res.status(404).json({ error: 'Usuario no encontrado' }); // Responde 404.
    } // Cierra la condicion de no encontrado.
    res.json(rows[0]); // Responde con el usuario encontrado.
  } catch (error) { // Captura cualquier error.
    next(error); // Envia el error al middleware correspondiente.
  } // Cierra el bloque try/catch.
}; // Cierra la funcion obtenerUsuario.
const crearUsuario = async (req, res, next) => { // Controlador para crear un usuario.
  try { // Inicia el bloque de manejo de errores.
    const { nombre, email } = req.body; // Extrae nombre y email del body.
    const { rows } = await db.query( // Inserta el usuario en la tabla.
      'INSERT INTO usuarios (nombre, email) VALUES ($1, $2) RETURNING *', // SQL.
      [nombre, email] // Valores a insertar en orden seguro.
    ); // Cierra la consulta.
    res.status(201).json(rows[0]); // Responde 201 con el usuario creado.
  } catch (error) { // Captura cualquier error.
    next(error); // Envia el error al middleware correspondiente.
  } // Cierra el bloque try/catch.
}; // Cierra la funcion crearUsuario.
const actualizarUsuario = async (req, res, next) => { // Controlador para actualizar un usuario.
  try { // Inicia el bloque de manejo de errores.
    const { nombre, email } = req.body; // Extrae nombre y email del body.
    const { rows } = await db.query( // Ejecuta el UPDATE con parametros.
      'UPDATE usuarios SET nombre = $1, email = $2 WHERE id = $3 RETURNING *', // SQL.
      [nombre, email, req.params.id] // Valores a actualizar y el id.
    ); // Cierra la consulta.
    if (!rows[0]) { // Verifica si no se encontro el usuario.
      return res.status(404).json({ error: 'Usuario no encontrado' }); // Responde 404.
    } // Cierra la condicion de no encontrado.
    res.json(rows[0]); // Responde con el usuario actualizado.
  } catch (error) { // Captura cualquier error.
    next(error); // Envia el error al middleware correspondiente.
  } // Cierra el bloque try/catch.
}; // Cierra la funcion actualizarUsuario.
const eliminarUsuario = async (req, res, next) => { // Controlador para eliminar un usuario.
  try { // Inicia el bloque de manejo de errores.
    const { rows } = await db.query( // Ejecuta el DELETE con parametro.
      'DELETE FROM usuarios WHERE id = $1 RETURNING *', // SQL.
      [req.params.id] // Id del usuario a eliminar.
    ); // Cierra la consulta.
    if (!rows[0]) { // Verifica si no se encontro el usuario.
      return res.status(404).json({ error: 'Usuario no encontrado' }); // Responde 404.
    } // Cierra la condicion de no encontrado.
    res.json(rows[0]); // Responde con el usuario eliminado.
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
