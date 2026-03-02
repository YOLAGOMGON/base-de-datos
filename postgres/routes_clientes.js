const express = require("express");
const pool = require("./db");
const {
  asyncHandler,
  requireFields,
  parseIdParam,
  createError,
} = require("./utils");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const result = await pool.query("SELECT * FROM sp_get_clientes()");
    res.json(result.rows);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseIdParam(req.params.id);
    const result = await pool.query("SELECT * FROM sp_get_cliente($1)", [id]);
    if (!result.rows[0]) {
      throw createError(404, "Cliente no encontrado");
    }
    res.json(result.rows[0]);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    requireFields(req.body, ["nombre", "documento"]);
    const nombre = String(req.body.nombre).trim();
    const documento = String(req.body.documento).trim();
    const email = req.body.email ? String(req.body.email).trim() : null;
    const telefono = req.body.telefono ? String(req.body.telefono).trim() : null;
    const direccion = req.body.direccion ? String(req.body.direccion).trim() : null;
    const result = await pool.query(
      "SELECT * FROM sp_create_cliente($1, $2, $3, $4, $5)",
      [nombre, documento, email, telefono, direccion]
    );
    res.status(201).json(result.rows[0]);
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseIdParam(req.params.id);
    requireFields(req.body, ["nombre", "documento"]);
    const nombre = String(req.body.nombre).trim();
    const documento = String(req.body.documento).trim();
    const email = req.body.email ? String(req.body.email).trim() : null;
    const telefono = req.body.telefono ? String(req.body.telefono).trim() : null;
    const direccion = req.body.direccion ? String(req.body.direccion).trim() : null;
    const result = await pool.query(
      "SELECT * FROM sp_update_cliente($1, $2, $3, $4, $5, $6)",
      [id, nombre, documento, email, telefono, direccion]
    );
    if (!result.rows[0]) {
      throw createError(404, "Cliente no encontrado");
    }
    res.json(result.rows[0]);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseIdParam(req.params.id);
    const result = await pool.query("SELECT * FROM sp_delete_cliente($1)", [id]);
    if (!result.rows[0]) {
      throw createError(404, "Cliente no encontrado");
    }
    res.json(result.rows[0]);
  })
);

module.exports = router;
