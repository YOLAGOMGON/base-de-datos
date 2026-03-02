10 - Excel real + CSV y carga simulada en Postgres

Objetivo
Crear un Excel simple, exportarlo a CSV y simular la carga en Postgres.

Paso 1: Crear el Excel
1) Abre Excel o LibreOffice.
2) Crea una hoja con estas columnas:
   nombre | telefono | ciudad
3) Agrega 4 filas de datos.

Paso 2: Exportar a CSV
1) Archivo > Guardar como
2) Tipo: CSV (delimitado por comas)
3) Guarda como: clientes.csv

Paso 3: Usar el CSV de ejemplo del repo
En este repo ya tienes:
data/clientes.csv

Paso 3.1: Generar el Excel desde el CSV (opcional)
1) npm install
2) npm run excel:generate
3) Se genera: data/clientes.xlsx

Paso 3.2: Generar Excel normalizado (opcional)
1) npm run excel:normalized
2) Se genera: data/ventas_normalizado.xlsx

Paso 4: Crear la tabla de importacion
Ejecuta:
sql/06-csv-table.sql

Paso 5: Cargar el CSV en Postgres
En psql:
\copy clientes_csv(nombre, telefono, ciudad)
FROM 'C:/programacion/Base de dattos/prueba/data/clientes.csv'
DELIMITER ','
CSV HEADER;

Paso 6: Verificar
SELECT * FROM clientes_csv;

Alternativa automatica (script)
1) Asegura que existe la tabla clientes_csv
2) Ejecuta:
   npm run csv:load

Checklist rapido
- CSV creado o exportado.
- Tabla creada en Postgres.
- \copy ejecutado sin error.
- Datos visibles en SELECT.
