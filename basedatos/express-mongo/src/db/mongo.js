const mongoose = require('mongoose'); // Importa Mongoose para conectar y modelar MongoDB.
const connectMongo = async () => { // Define una funcion asincrona para conectar a MongoDB.
  const uri = 'mongodb://localhost:27017/mi_db'; // Define la URI de conexion a la base.
  await mongoose.connect(uri); // Abre la conexion usando Mongoose.
  console.log('MongoDB conectado'); // Informa que la conexion fue exitosa.
}; // Cierra la definicion de la funcion.
module.exports = connectMongo; // Exporta la funcion para usarla desde index.js.
