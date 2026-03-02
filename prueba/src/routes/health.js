// Importa Express para crear rutas.
const express = require("express");

// Crea un router aislado.
const router = express.Router();

// GET /health para comprobar que la API responde.
router.get("/", (req, res) => {
  res.json({ status: "ok" });
});

// Exporta el router para usarlo en index.js.
module.exports = router;
