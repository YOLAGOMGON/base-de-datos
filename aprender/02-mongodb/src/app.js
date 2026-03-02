const express = require("express");
const appointmentsRouter = require("./routes/appointments");
const patientsRouter = require("./routes/patients");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/patients", patientsRouter);
app.use("/appointments", appointmentsRouter);

module.exports = app;
