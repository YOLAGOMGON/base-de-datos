const express = require("express");
const repo = require("../repositories/patientsMongoRepo");

const router = express.Router();

router.get("/", async (req, res) => {
  const patients = await repo.listPatients();
  res.json(patients);
});

router.get("/:id", async (req, res) => {
  const patient = await repo.getPatientById(req.params.id);
  if (!patient) {
    return res.status(404).json({ error: "Patient not found" });
  }
  res.json(patient);
});

router.post("/", async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const patient = await repo.createPatient({ name, email, phone });
  res.status(201).json(patient);
});

router.put("/:id", async (req, res) => {
  const { name, email, phone } = req.body;
  const patient = await repo.updatePatient(req.params.id, {
    name,
    email,
    phone,
  });
  if (!patient) {
    return res.status(404).json({ error: "Patient not found" });
  }
  res.json(patient);
});

router.delete("/:id", async (req, res) => {
  const patient = await repo.deletePatient(req.params.id);
  if (!patient) {
    return res.status(404).json({ error: "Patient not found" });
  }
  res.json(patient);
});

module.exports = router;
