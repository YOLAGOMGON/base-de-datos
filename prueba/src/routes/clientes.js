// Importa Express para definir rutas.
const express = require("express");
// Importa el pool de Postgres para ejecutar consultas.
const { getPool } = require("../db/postgres");

// Crea el router del recurso clientes.
const router = express.Router();

// POST /clientes: crea un cliente usando procedimiento almacenado.
router.post("/", async (req, res) => {
  const { nombre, telefono, ciudad } = req.body;
  if (!nombre) {
    return res.status(400).json({ error: "nombre es obligatorio" });
  }

  const result = await getPool().query(
    "SELECT * FROM insertar_cliente($1,$2,$3)",
    [nombre, telefono || null, ciudad || null]
  );

  res.status(201).json(result.rows[0]);
});

// GET /clientes: lista todos los clientes.
router.get("/", async (req, res) => {
  const result = await getPool().query(
    "SELECT id_cliente, nombre, telefono, ciudad FROM clientes ORDER BY id_cliente"
  );
  res.json(result.rows);
});

// GET /clientes/:id: obtiene un cliente por id.
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const result = await getPool().query(
    "SELECT id_cliente, nombre, telefono, ciudad FROM clientes WHERE id_cliente=$1",
    [id]
  );
  if (!result.rows[0]) {
    return res.status(404).json({ error: "cliente no encontrado" });
  }
  res.json(result.rows[0]);
});

// PUT /clientes/:id: actualiza un cliente por id.
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, ciudad } = req.body;
  const result = await getPool().query(
    "UPDATE clientes SET nombre=$1, telefono=$2, ciudad=$3 WHERE id_cliente=$4 RETURNING *",
    [nombre, telefono || null, ciudad || null, id]
  );

  if (!result.rows[0]) {
    return res.status(404).json({ error: "cliente no encontrado" });
  }

  res.json(result.rows[0]);
});

// DELETE /clientes/:id: elimina un cliente por id.
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const result = await getPool().query(
    "DELETE FROM clientes WHERE id_cliente=$1 RETURNING *",
    [id]
  );
  if (!result.rows[0]) {
    return res.status(404).json({ error: "cliente no encontrado" });
  }
  res.json({ message: "Eliminado" });
});

// Exporta el router para usarlo en index.js.
module.exports = router;
