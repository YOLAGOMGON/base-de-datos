// Genera un Excel con hojas normalizadas (clientes, productos, ventas, detalle).
const xlsx = require("xlsx");
// Importa path para resolver rutas.
const path = require("path");

// Datos de ejemplo para cada tabla.
const clientes = [
  ["id_cliente", "nombre", "telefono", "ciudad"],
  [1, "Maria", "3001112233", "Medellin"],
  [2, "Jose", "3002223344", "Bogota"],
];

const productos = [
  ["id_producto", "nombre", "precio"],
  [1, "Cuaderno", 5.5],
  [2, "Lapiz", 1.2],
];

const ventas = [
  ["id_venta", "id_cliente", "fecha"],
  [1, 1, "2026-03-02"],
  [2, 2, "2026-03-02"],
];

const detalle = [
  ["id_detalle", "id_venta", "id_producto", "cantidad", "precio_unitario"],
  [1, 1, 1, 2, 5.5],
  [2, 2, 2, 3, 1.2],
];

// Crea el libro de Excel.
const workbook = xlsx.utils.book_new();
// Agrega cada hoja al libro.
xlsx.utils.book_append_sheet(
  workbook,
  xlsx.utils.aoa_to_sheet(clientes),
  "clientes"
);
xlsx.utils.book_append_sheet(
  workbook,
  xlsx.utils.aoa_to_sheet(productos),
  "productos"
);
xlsx.utils.book_append_sheet(
  workbook,
  xlsx.utils.aoa_to_sheet(ventas),
  "ventas"
);
xlsx.utils.book_append_sheet(
  workbook,
  xlsx.utils.aoa_to_sheet(detalle),
  "detalle_venta"
);

// Ruta de salida.
const outPath = path.join(__dirname, "..", "data", "ventas_normalizado.xlsx");
// Escribe el archivo.
xlsx.writeFile(workbook, outPath);

console.log(`Excel normalizado generado en: ${outPath}`);
