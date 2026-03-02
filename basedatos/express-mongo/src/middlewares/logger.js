module.exports = (req, res, next) => { // Exporta un middleware que registra cada peticion.
  console.log(`[${req.method}] ${req.url}`); // Muestra el metodo HTTP y la URL solicitada.
  next(); // Continua con el siguiente middleware o ruta.
}; // Cierra la funcion del middleware.
