const mongoose = require('mongoose'); // Importa Mongoose para definir el esquema del modelo.
const usuarioSchema = new mongoose.Schema({ // Crea el esquema que describe la coleccion.
  nombre: { type: String, required: true }, // Campo nombre obligatorio de tipo texto.
  email: { type: String, required: true } // Campo email obligatorio de tipo texto.
}); // Cierra la definicion del esquema.
module.exports = mongoose.model('Usuario', usuarioSchema); // Exporta el modelo Usuario.
