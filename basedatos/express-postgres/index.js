const app = require('./src/app'); // Importa la aplicacion Express ya configurada.
const PORT = 3000; // Define el puerto donde escuchara el servidor.
app.listen(PORT, () => { // Inicia el servidor Express en el puerto indicado.
  console.log(`Servidor en http://localhost:${PORT}`); // Muestra una URL amigable.
}); // Cierra la configuracion de listen.
