// Importa Express para definir rutas.
const express = require("express");
// Importa ObjectId para manejar IDs de MongoDB.
const { ObjectId } = require("mongodb");
// Importa la conexion a MongoDB.
const { getMongoDb } = require("../db/mongo");

// Crea el router del recurso alumnos.
const router = express.Router();

// POST /alumnos: crea un alumno en MongoDB.
router.post("/", async (req, res) => {
  const { nombre, edad, ciudad } = req.body;
  if (!nombre) {
    return res.status(400).json({ error: "nombre es obligatorio" });
  }

  const db = getMongoDb();
  if (!db) {
    return res.status(503).json({ error: "MongoDB no configurado" });
  }

  try {
    const result = await db.collection("alumnos").insertOne({
      nombre,
      edad: edad ?? null,
      ciudad: ciudad ?? null,
      creado_en: new Date(),
    });
    const alumno = await db
      .collection("alumnos")
      .findOne({ _id: result.insertedId });
    res.status(201).json(alumno);
  } catch (error) {
    res.status(500).json({ error: "error al crear alumno" });
  }
});

// GET /alumnos: lista alumnos.
router.get("/", async (req, res) => {
  const db = getMongoDb();
  if (!db) {
    return res.status(503).json({ error: "MongoDB no configurado" });
  }

  try {
    const alumnos = await db.collection("alumnos").find().toArray();
    res.json(alumnos);
  } catch (error) {
    res.status(500).json({ error: "error al listar alumnos" });
  }
});

// GET /alumnos/:id: obtiene un alumno por id.
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const db = getMongoDb();
  if (!db) {
    return res.status(503).json({ error: "MongoDB no configurado" });
  }

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "id invalido" });
  }

  try {
    const alumno = await db
      .collection("alumnos")
      .findOne({ _id: new ObjectId(id) });
    if (!alumno) {
      return res.status(404).json({ error: "alumno no encontrado" });
    }
    res.json(alumno);
  } catch (error) {
    res.status(500).json({ error: "error al obtener alumno" });
  }
});

// PUT /alumnos/:id: actualiza un alumno por id.
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, edad, ciudad } = req.body;
  const db = getMongoDb();
  if (!db) {
    return res.status(503).json({ error: "MongoDB no configurado" });
  }

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "id invalido" });
  }

  try {
    const result = await db.collection("alumnos").findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          nombre,
          edad: edad ?? null,
          ciudad: ciudad ?? null,
          actualizado_en: new Date(),
        },
      },
      { returnDocument: "after" }
    );
    if (!result.value) {
      return res.status(404).json({ error: "alumno no encontrado" });
    }
    res.json(result.value);
  } catch (error) {
    res.status(500).json({ error: "error al actualizar alumno" });
  }
});

// DELETE /alumnos/:id: elimina un alumno por id.
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const db = getMongoDb();
  if (!db) {
    return res.status(503).json({ error: "MongoDB no configurado" });
  }

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "id invalido" });
  }

  try {
    const result = await db
      .collection("alumnos")
      .findOneAndDelete({ _id: new ObjectId(id) });
    if (!result.value) {
      return res.status(404).json({ error: "alumno no encontrado" });
    }
    res.json({ message: "Eliminado" });
  } catch (error) {
    res.status(500).json({ error: "error al eliminar alumno" });
  }
});

// Exporta el router para usarlo en index.js.
module.exports = router;
