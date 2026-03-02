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
    const result = await pool.query("SELECT * FROM vw_facturas_resumen");
    res.json(result.rows);
  })
);

router.get(
  "/:id/detalle",
  asyncHandler(async (req, res) => {
    const id = parseIdParam(req.params.id, "factura_id");
    const result = await pool.query(
      "SELECT * FROM vw_factura_detalle WHERE factura_id = $1",
      [id]
    );
    res.json(result.rows);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    requireFields(req.body, ["cliente_id"]);
    const clienteId = parseIntField(req.body.cliente_id, "cliente_id");
    const result = await pool.query("SELECT * FROM sp_create_factura($1)", [
      clienteId,
    ]);
    if (!result.rows[0]) {
      throw createError(400, "No se pudo crear la factura");
    }
    res.status(201).json(result.rows[0]);
  })
);

router.post(
  "/:id/items",
  asyncHandler(async (req, res) => {
    const facturaId = parseIdParam(req.params.id, "factura_id");
    requireFields(req.body, ["producto_id", "cantidad", "precio_unitario"]);
    const productoId = parseIntField(req.body.producto_id, "producto_id");
    const cantidad = parseIntField(req.body.cantidad, "cantidad");
    const precioUnitario = parseNumberField(
      req.body.precio_unitario,
      "precio_unitario"
    );
    if (cantidad <= 0 || precioUnitario < 0) {
      throw createError(400, "cantidad debe ser > 0 y precio_unitario >= 0");
    }
    const result = await pool.query(
      "SELECT * FROM sp_add_factura_detalle($1, $2, $3, $4)",
      [facturaId, productoId, cantidad, precioUnitario]
    );
    res.status(201).json(result.rows[0]);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseIdParam(req.params.id, "factura_id");
    const result = await pool.query("SELECT * FROM sp_delete_factura($1)", [id]);
    if (!result.rows[0]) {
      throw createError(404, "Factura no encontrada");
    }
    res.json(result.rows[0]);
  })
);

module.exports = router;
