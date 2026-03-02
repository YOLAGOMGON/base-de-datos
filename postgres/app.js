const express = require("express");
const clientesRoutes = require("./routes_clientes");
const productosRoutes = require("./routes_productos");
const facturasRoutes = require("./routes_facturas");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ ok: true, mensaje: "API de facturacion activa" });
});

app.use("/clientes", clientesRoutes);
app.use("/productos", productosRoutes);
app.use("/facturas", facturasRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Error interno" });
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
