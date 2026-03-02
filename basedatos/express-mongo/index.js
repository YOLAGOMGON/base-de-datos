const app = require('./src/app'); // Importa la aplicacion Express ya configurada.
const connectMongo = require('./src/db/mongo'); // Importa la funcion que conecta a MongoDB.
const PORT = 3000; // Define el puerto donde escuchara el servidor.
connectMongo() // Ejecuta la conexion a MongoDB.
  .then(() => { // Si la conexion fue exitosa, inicia el servidor.
    app.listen(PORT, () => { // Arranca la app para escuchar en el puerto indicado.
      console.log(`Servidor en http://localhost:${PORT}`); // Muestra la URL en consola.
    }); // Cierra la configuracion de listen.
  }) // Cierra el bloque del then.
  .catch((error) => { // Si falla la conexion, captura el error.
    console.error('Error al conectar MongoDB:', error); // Imprime el detalle del error.
    process.exit(1); // Termina el proceso con codigo de error.
  }); // Cierra el bloque del catch.
