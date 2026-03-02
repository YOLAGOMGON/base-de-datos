// Importa el cliente oficial de MongoDB.
const { MongoClient } = require("mongodb");

// Guarda la instancia del cliente para reutilizarla.
let mongoClient;

// Conecta a MongoDB si hay variables de entorno.
async function connectMongo() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB;

  // Si no hay configuracion, se omite la conexion.
  if (!uri || !dbName) {
    console.log("MongoDB no configurado, se omite conexion");
    return null;
  }

  // Crea el cliente y se conecta.
  mongoClient = new MongoClient(uri);
  await mongoClient.connect();
  // Verifica que la base responda.
  await mongoClient.db(dbName).command({ ping: 1 });
  console.log("MongoDB conectado");
  return mongoClient;
}

// Retorna la base activa si existe conexion.
function getMongoDb() {
  if (!mongoClient) {
    return null;
  }
  return mongoClient.db(process.env.MONGO_DB);
}

// Exporta funciones para otros modulos.
module.exports = { connectMongo, getMongoDb };
