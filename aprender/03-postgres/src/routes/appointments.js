const express = require("express");
const repo = require("../repositories/appointmentsPgRepo");

const router = express.Router();

router.get("/", async (req, res) => {
  const appointments = await repo.listAppointments();
  res.json(appointments);
});

router.get("/:id", async (req, res) => {
  const appointment = await repo.getAppointmentById(req.params.id);
  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  res.json(appointment);
});

router.post("/", async (req, res) => {
  const { patientId, doctorId, appointmentDate, reason, status } = req.body;
  if (!patientId || !doctorId || !appointmentDate) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const appointment = await repo.createAppointment({
    patientId,
    doctorId,
    appointmentDate,
    reason,
    status,
  });
  res.status(201).json(appointment);
});

router.put("/:id", async (req, res) => {
  const { patientId, doctorId, appointmentDate, reason, status } = req.body;
  const appointment = await repo.updateAppointment(req.params.id, {
    patientId,
    doctorId,
    appointmentDate,
    reason,
    status,
  });
  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  res.json(appointment);
});

router.delete("/:id", async (req, res) => {
  const appointment = await repo.deleteAppointment(req.params.id);
  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  res.json(appointment);
});

module.exports = router;
