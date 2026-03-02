const express = require("express");
const pool = require("./db");
const {
  asyncHandler,
  requireFields,
  parseIdParam,
  parseIntField,
  parseNumberField,
  createError,
} = require("./utils");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const result = await pool.query("SELECT * FROM sp_get_productos()");
    res.json(result.rows);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseIdParam(req.params.id);
    const result = await pool.query("SELECT * FROM sp_get_producto($1)", [id]);
    if (!result.rows[0]) {
      throw createError(404, "Producto no encontrado");
    }
    res.json(result.rows[0]);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    requireFields(req.body, ["nombre", "precio", "stock"]);
    const nombre = String(req.body.nombre).trim();
    const precio = parseNumberField(req.body.precio, "precio");
    const stock = parseIntField(req.body.stock, "stock");
    if (precio < 0 || stock < 0) {
      throw createError(400, "precio y stock deben ser >= 0");
    }
    const result = await pool.query(
      "SELECT * FROM sp_create_producto($1, $2, $3)",
      [nombre, precio, stock]
    );
    res.status(201).json(result.rows[0]);
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseIdParam(req.params.id);
    requireFields(req.body, ["nombre", "precio", "stock"]);
    const nombre = String(req.body.nombre).trim();
    const precio = parseNumberField(req.body.precio, "precio");
    const stock = parseIntField(req.body.stock, "stock");
    if (precio < 0 || stock < 0) {
      throw createError(400, "precio y stock deben ser >= 0");
    }
    const result = await pool.query(
      "SELECT * FROM sp_update_producto($1, $2, $3, $4)",
      [id, nombre, precio, stock]
    );
    if (!result.rows[0]) {
      throw createError(404, "Producto no encontrado");
    }
    res.json(result.rows[0]);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseIdParam(req.params.id);
    const result = await pool.query("SELECT * FROM sp_delete_producto($1)", [id]);
    if (!result.rows[0]) {
      throw createError(404, "Producto no encontrado");
    }
    res.json(result.rows[0]);
  })
);

module.exports = router;
