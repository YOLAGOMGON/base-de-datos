03 - Cargar un Excel a Postgres

Objetivo
Importar datos desde Excel a Postgres de forma segura y ordenada.

Requisitos
- Postgres instalado
- Excel o LibreOffice
- Archivo .csv exportado desde Excel

Paso 1: Prepara tu Excel
- Revisa encabezados y elimina filas vacias.
- Usa solo una tabla por archivo.
- Asegura tipos: numeros, fechas, texto.

Paso 2: Exporta a CSV
- Archivo > Guardar como
- Selecciona "CSV (delimitado por comas)"
- Revisa que el separador sea coma o punto y coma.

Paso 3: Crea la tabla en Postgres
Ejemplo (tabla clientes):
CREATE TABLE clientes (
  id_cliente SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(30),
  ciudad VARCHAR(60)
);

Paso 4: Importa con COPY
1) Abre psql y conecta a tu DB
2) Ejecuta:
COPY clientes(nombre, telefono, ciudad)
FROM 'C:/ruta/archivo.csv'
DELIMITER ','
CSV HEADER;

Notas importantes
- En Windows usa rutas con / o doble \\
- Si el CSV tiene ; usa DELIMITER ';'
- Si falla por permisos, usa \copy (con backslash)
- Si hay tildes raras, guarda el CSV como UTF-8

Paso 5: Verifica
SELECT * FROM clientes LIMIT 5;

Alternativa: Importar con pgAdmin
- Tools > Import/Export Data
- Selecciona la tabla
- Elige archivo CSV
- Configura delimitador y header

Ejemplo con \copy
\copy clientes(nombre, telefono, ciudad)
FROM 'C:/ruta/archivo.csv'
DELIMITER ','
CSV HEADER;

Ejemplo real del repo
- CSV: data/clientes.csv
- Tabla: sql/06-csv-table.sql
- Comando:
  \copy clientes_csv(nombre, telefono, ciudad)
  FROM 'C:/programacion/Base de dattos/prueba/data/clientes.csv'
  DELIMITER ','
  CSV HEADER;

Checklist rapido
- CSV limpio y con header correcto
- Tabla creada con tipos correctos
- Importacion sin errores
- Datos revisados en SELECT
