const express = require("express");
const appointmentsRouter = require("./routes/appointments");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/appointments", appointmentsRouter);

module.exports = app;


http://localhost:3000/appointments?nombre=andres&apellido=naranjo&salario=0

(req,res) => {
  let nombre =  req.query.nombre 
  let apellido = req.query.apellido
  let salario = req.query.salario 


}

body = {
  nombre: "andres",
  apellido: "naranjo",
  salario: 0
}






