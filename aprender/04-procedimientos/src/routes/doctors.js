const express = require("express");
const repo = require("../repositories/doctorsPgRepo");
const appointmentsRepo = require("../repositories/appointmentsPgRepo");

const router = express.Router();

router.get("/", async (req, res) => {
  const doctors = await repo.listDoctors();
  res.json(doctors);
});

router.get("/:id", async (req, res) => {
  const doctor = await repo.getDoctorById(req.params.id);
  if (!doctor) {
    return res.status(404).json({ error: "Doctor not found" });
  }
  res.json(doctor);
});

router.get("/:id/agenda", async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ error: "Missing from/to query params" });
  }
  const agenda = await appointmentsRepo.listDoctorAgenda(
    req.params.id,
    from,
    to
  );
  res.json(agenda);
});

router.post("/", async (req, res) => {
  const { name, specialty, email } = req.body;
  if (!name || !specialty) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const doctor = await repo.createDoctor({ name, specialty, email });
  res.status(201).json(doctor);
});

router.put("/:id", async (req, res) => {
  const { name, specialty, email } = req.body;
  const doctor = await repo.updateDoctor(req.params.id, {
    name,
    specialty,
    email,
  });
  if (!doctor) {
    return res.status(404).json({ error: "Doctor not found" });
  }
  res.json(doctor);
});

router.delete("/:id", async (req, res) => {
  const doctor = await repo.deleteDoctor(req.params.id);
  if (!doctor) {
    return res.status(404).json({ error: "Doctor not found" });
  }
  res.json(doctor);
});

module.exports = router;
