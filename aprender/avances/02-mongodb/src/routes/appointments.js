const express = require("express");

const router = express.Router();

const appointments = [];
let nextId = 1;

router.get("/", (req, res) => {
  res.json(appointments);
});

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const appointment = appointments.find((item) => item.id === id);
  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  res.json(appointment);
});

router.post("/", (req, res) => {
  const { patientName, doctorName, date, reason } = req.body;
  if (!patientName || !doctorName || !date) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const appointment = {
    id: nextId++,
    patientName,
    doctorName,
    date,
    reason: reason || "",
    status: "scheduled",
  };
  appointments.push(appointment);
  res.status(201).json(appointment);
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const appointment = appointments.find((item) => item.id === id);
  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  const { patientName, doctorName, date, reason, status } = req.body;
  if (patientName !== undefined) appointment.patientName = patientName;
  if (doctorName !== undefined) appointment.doctorName = doctorName;
  if (date !== undefined) appointment.date = date;
  if (reason !== undefined) appointment.reason = reason;
  if (status !== undefined) appointment.status = status;
  res.json(appointment);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = appointments.findIndex((item) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  const deleted = appointments.splice(index, 1)[0];
  res.json(deleted);
});

module.exports = router;
