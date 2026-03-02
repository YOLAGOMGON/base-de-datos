// Genera un Excel (.xlsx) desde el CSV de clientes.
const fs = require("fs");
// Importa xlsx para crear el archivo de Excel.
const xlsx = require("xlsx");
// Importa path para resolver rutas.
const path = require("path");

// Ruta del CSV de entrada.
const csvPath = path.join(__dirname, "..", "data", "clientes.csv");
// Ruta del Excel de salida.
const xlsxPath = path.join(__dirname, "..", "data", "clientes.xlsx");

// Lee el CSV como texto.
const csvContent = fs.readFileSync(csvPath, "utf-8");
// Convierte el CSV a arreglo de filas y columnas.
const rows = csvContent
  .trim()
  .split(/\r?\n/)
  .map((line) => line.split(","));
// Convierte el arreglo a hoja de Excel.
const worksheet = xlsx.utils.aoa_to_sheet(rows);
// Crea un libro de Excel.
const workbook = xlsx.utils.book_new();
// Agrega la hoja al libro.
xlsx.utils.book_append_sheet(workbook, worksheet, "clientes");
// Escribe el archivo .xlsx en disco.
xlsx.writeFile(workbook, xlsxPath);

console.log(`Excel generado en: ${xlsxPath}`);
