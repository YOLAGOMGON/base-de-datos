# CRUD con Express + PostgreSQL (procedimientos, vistas y triggers)

Este documento explica linea por linea el CRUD que se agrego en este proyecto.
Incluye la API en Express y el SQL con procedimientos almacenados, vistas y
triggers.

## Como ejecutar (resumen)
1. Crea la base `facturacion` en PostgreSQL.
2. Ejecuta `schema.sql` para crear tablas, vistas, triggers y funciones.
3. Copia `.env.example` a `.env` y completa tus datos.
4. Instala dependencias con `npm install`.
5. Inicia el servidor con `npm start`.

## Paso a paso para ejecutar (con explicacion)
### Paso 1: Crear la base de datos
Comando:
```sql
CREATE DATABASE facturacion;
```
Por que: separa este proyecto de otras bases y evita mezclar datos.

### Paso 2: Ejecutar el esquema SQL
Comando (psql):
```bash
psql -U postgres -d facturacion -f schema.sql
```
Por que: crea tablas, triggers, vistas y procedimientos en un solo paso.

### Paso 3: Crear el archivo `.env`
Comando:
```bash
copy .env.example .env
```
Por que: `app.js` y `db.js` leen estas variables para conectarse a la base.

### Paso 4: Editar `.env` y completar datos
Ejemplo:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=facturacion
DB_USER=postgres
DB_PASSWORD=tu_password_real
PORT=3000
```
Por que: sin credenciales correctas no se puede conectar.

### Paso 5: Instalar dependencias
Comando:
```bash
npm install
```
Por que: descarga Express, pg y dotenv que usa el proyecto.

### Paso 6: Iniciar el servidor
Comando:
```bash
npm start
```
Por que: levanta la API para probar los endpoints.

## Archivo: `utils.js` (explicacion linea por linea)
Codigo:
```js
const createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const requireFields = (body, fields) => {
  const missing = fields.filter((f) => {
    const value = body[f];
    return value === undefined || value === null || String(value).trim() === "";
  });
  if (missing.length > 0) {
    throw createError(400, `Faltan campos: ${missing.join(", ")}`);
  }
};

const parseIdParam = (value, fieldName = "id") => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw createError(400, `${fieldName} debe ser entero positivo`);
  }
  return id;
};

const parseIntField = (value, fieldName) => {
  const n = Number(value);
  if (!Number.isInteger(n)) {
    throw createError(400, `${fieldName} debe ser entero`);
  }
  return n;
};

const parseNumberField = (value, fieldName) => {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw createError(400, `${fieldName} debe ser numero`);
  }
  return n;
};

module.exports = {
  createError,
  asyncHandler,
  requireFields,
  parseIdParam,
  parseIntField,
  parseNumberField,
};
```

Explicacion:
1. `createError`: crea errores con codigo HTTP.
2. `asyncHandler`: evita `try/catch` en cada ruta.
3. `requireFields`: valida campos obligatorios.
4. `parseIdParam`: valida ids en URL.
5. `parseIntField`: valida enteros (ej. stock, cantidad).
6. `parseNumberField`: valida numeros con decimales (ej. precio).
7. `module.exports`: exporta funciones para las rutas.

## Archivo: `db.js` (explicacion linea por linea)
Codigo:
```js
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

module.exports = pool;
```

Explicacion:
1. Importa `Pool` de `pg` para manejar conexiones a PostgreSQL.
2. Carga variables de entorno desde `.env`.
3. Crea un pool de conexiones para reutilizar conexiones (mejor rendimiento).
4. Lee `DB_HOST` desde el entorno para saber a que servidor conectar.
5. Convierte `DB_PORT` a numero para evitar errores de tipo.
6. Lee `DB_NAME` para usar la base correcta.
7. Lee `DB_USER` para autenticacion.
8. Lee `DB_PASSWORD` para autenticacion.
9. Cierra el objeto de configuracion.
10. Exporta el pool para usarlo en las rutas.

## Archivo: `app.js` (explicacion linea por linea)
Codigo:
```js
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
```

Explicacion:
1. Importa Express para crear el servidor HTTP.
2. Importa rutas de clientes para el CRUD.
3. Importa rutas de productos para el CRUD.
4. Importa rutas de facturas para operaciones y vistas.
5. Crea la aplicacion Express.
6. Habilita JSON para leer cuerpos de peticiones.
7. Define una ruta raiz para comprobar que la API esta viva.
8. Responde con un JSON simple de estado.
9. Cierra el bloque de la ruta.
10. Monta rutas de clientes en `/clientes`.
11. Monta rutas de productos en `/productos`.
12. Monta rutas de facturas en `/facturas`.
13. Agrega un middleware 404 para rutas inexistentes.
14. Agrega un middleware de errores para respuestas claras.
15. Lee el puerto del entorno o usa 3000 por defecto.
16. Inicia el servidor para escuchar solicitudes.
17. Imprime un mensaje para saber que esta funcionando.
18. Cierra el bloque `listen`.

## Archivo: `routes_clientes.js` (explicacion linea por linea)
Codigo:
```js
const express = require("express");
const pool = require("./db");
const {
  asyncHandler,
  requireFields,
  parseIdParam,
  createError,
} = require("./utils");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const result = await pool.query("SELECT * FROM sp_get_clientes()");
    res.json(result.rows);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseIdParam(req.params.id);
    const result = await pool.query("SELECT * FROM sp_get_cliente($1)", [id]);
    if (!result.rows[0]) {
      throw createError(404, "Cliente no encontrado");
    }
    res.json(result.rows[0]);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    requireFields(req.body, ["nombre", "documento"]);
    const nombre = String(req.body.nombre).trim();
    const documento = String(req.body.documento).trim();
    const email = req.body.email ? String(req.body.email).trim() : null;
    const telefono = req.body.telefono ? String(req.body.telefono).trim() : null;
    const direccion = req.body.direccion ? String(req.body.direccion).trim() : null;
    const result = await pool.query(
      "SELECT * FROM sp_create_cliente($1, $2, $3, $4, $5)",
      [nombre, documento, email, telefono, direccion]
    );
    res.status(201).json(result.rows[0]);
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseIdParam(req.params.id);
    requireFields(req.body, ["nombre", "documento"]);
    const nombre = String(req.body.nombre).trim();
    const documento = String(req.body.documento).trim();
    const email = req.body.email ? String(req.body.email).trim() : null;
    const telefono = req.body.telefono ? String(req.body.telefono).trim() : null;
    const direccion = req.body.direccion ? String(req.body.direccion).trim() : null;
    const result = await pool.query(
      "SELECT * FROM sp_update_cliente($1, $2, $3, $4, $5, $6)",
      [id, nombre, documento, email, telefono, direccion]
    );
    if (!result.rows[0]) {
      throw createError(404, "Cliente no encontrado");
    }
    res.json(result.rows[0]);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseIdParam(req.params.id);
    const result = await pool.query("SELECT * FROM sp_delete_cliente($1)", [id]);
    if (!result.rows[0]) {
      throw createError(404, "Cliente no encontrado");
    }
    res.json(result.rows[0]);
  })
);

module.exports = router;
```

Explicacion:
1. Importa Express para crear rutas.
2. Importa el pool para ejecutar SQL.
3. Importa helpers de validacion y manejo de errores.
4. Crea un router para agrupar endpoints.
5. GET `/clientes` usa `asyncHandler` para capturar errores.
6. Llama a `sp_get_clientes` y devuelve la lista.
7. GET `/clientes/:id` valida el id con `parseIdParam`.
8. Llama a `sp_get_cliente` y si no hay resultado devuelve 404.
9. POST `/clientes` valida campos obligatorios.
10. Limpia texto con `trim()` para evitar espacios en blanco.
11. Llama a `sp_create_cliente` con parametros seguros.
12. Devuelve el cliente creado con status 201.
13. PUT `/clientes/:id` valida id y campos.
14. Llama a `sp_update_cliente` y devuelve 404 si no existe.
15. DELETE `/clientes/:id` valida id y devuelve 404 si no existe.
16. Exporta el router para usarlo en `app.js`.

## Archivo: `routes_productos.js` (explicacion linea por linea)
Codigo:
```js
const express = require("express");
const pool = require("./db");
const {
  asyncHandler,
  requireFields,
  parseIdParam,
  parseIntField,
  parseNumberField,
  createError,
} = require("./utils");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const result = await pool.query("SELECT * FROM sp_get_productos()");
    res.json(result.rows);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseIdParam(req.params.id);
    const result = await pool.query("SELECT * FROM sp_get_producto($1)", [id]);
    if (!result.rows[0]) {
      throw createError(404, "Producto no encontrado");
    }
    res.json(result.rows[0]);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    requireFields(req.body, ["nombre", "precio", "stock"]);
    const nombre = String(req.body.nombre).trim();
    const precio = parseNumberField(req.body.precio, "precio");
    const stock = parseIntField(req.body.stock, "stock");
    if (precio < 0 || stock < 0) {
      throw createError(400, "precio y stock deben ser >= 0");
    }
    const result = await pool.query(
      "SELECT * FROM sp_create_producto($1, $2, $3)",
      [nombre, precio, stock]
    );
    res.status(201).json(result.rows[0]);
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseIdParam(req.params.id);
    requireFields(req.body, ["nombre", "precio", "stock"]);
    const nombre = String(req.body.nombre).trim();
    const precio = parseNumberField(req.body.precio, "precio");
    const stock = parseIntField(req.body.stock, "stock");
    if (precio < 0 || stock < 0) {
      throw createError(400, "precio y stock deben ser >= 0");
    }
    const result = await pool.query(
      "SELECT * FROM sp_update_producto($1, $2, $3, $4)",
      [id, nombre, precio, stock]
    );
    if (!result.rows[0]) {
      throw createError(404, "Producto no encontrado");
    }
    res.json(result.rows[0]);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseIdParam(req.params.id);
    const result = await pool.query("SELECT * FROM sp_delete_producto($1)", [id]);
    if (!result.rows[0]) {
      throw createError(404, "Producto no encontrado");
    }
    res.json(result.rows[0]);
  })
);

module.exports = router;
```

Explicacion:
1. Importa Express y el pool.
2. Importa helpers de validacion.
3. Crea el router.
4. GET `/productos` lista todos.
5. GET `/productos/:id` valida id y devuelve 404 si no existe.
6. POST `/productos` valida campos y numeros.
7. Evita precios y stock negativos.
8. PUT `/productos/:id` valida id y campos, devuelve 404 si no existe.
9. DELETE `/productos/:id` valida id y devuelve 404 si no existe.
10. Exporta el router.

## Archivo: `routes_facturas.js` (explicacion linea por linea)
Codigo:
```js
const express = require("express");
const pool = require("./db");
const {
  asyncHandler,
  requireFields,
  parseIdParam,
  parseIntField,
  parseNumberField,
  createError,
} = require("./utils");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const result = await pool.query("SELECT * FROM vw_facturas_resumen");
    res.json(result.rows);
  })
);

router.get(
  "/:id/detalle",
  asyncHandler(async (req, res) => {
    const id = parseIdParam(req.params.id, "factura_id");
    const result = await pool.query(
      "SELECT * FROM vw_factura_detalle WHERE factura_id = $1",
      [id]
    );
    res.json(result.rows);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    requireFields(req.body, ["cliente_id"]);
    const clienteId = parseIntField(req.body.cliente_id, "cliente_id");
    const result = await pool.query("SELECT * FROM sp_create_factura($1)", [
      clienteId,
    ]);
    if (!result.rows[0]) {
      throw createError(400, "No se pudo crear la factura");
    }
    res.status(201).json(result.rows[0]);
  })
);

router.post(
  "/:id/items",
  asyncHandler(async (req, res) => {
    const facturaId = parseIdParam(req.params.id, "factura_id");
    requireFields(req.body, ["producto_id", "cantidad", "precio_unitario"]);
    const productoId = parseIntField(req.body.producto_id, "producto_id");
    const cantidad = parseIntField(req.body.cantidad, "cantidad");
    const precioUnitario = parseNumberField(
      req.body.precio_unitario,
      "precio_unitario"
    );
    if (cantidad <= 0 || precioUnitario < 0) {
      throw createError(400, "cantidad debe ser > 0 y precio_unitario >= 0");
    }
    const result = await pool.query(
      "SELECT * FROM sp_add_factura_detalle($1, $2, $3, $4)",
      [facturaId, productoId, cantidad, precioUnitario]
    );
    res.status(201).json(result.rows[0]);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseIdParam(req.params.id, "factura_id");
    const result = await pool.query("SELECT * FROM sp_delete_factura($1)", [id]);
    if (!result.rows[0]) {
      throw createError(404, "Factura no encontrada");
    }
    res.json(result.rows[0]);
  })
);

module.exports = router;
```

Explicacion:
1. Importa Express y el pool.
2. Importa helpers de validacion.
3. Crea el router.
4. GET `/facturas` usa la vista resumen.
5. GET `/facturas/:id/detalle` valida id y muestra items.
6. POST `/facturas` valida `cliente_id` y crea factura.
7. POST `/facturas/:id/items` valida datos y agrega item.
8. La insercion dispara triggers de subtotal, stock y totales.
9. DELETE `/facturas/:id` valida id y devuelve 404 si no existe.
10. Exporta el router.

## Archivo: `schema.sql` (explicacion linea por linea)
Codigo:
```sql
-- TABLAS PRINCIPALES
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    documento VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    direccion VARCHAR(200),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio NUMERIC(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE facturas (
    id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL REFERENCES clientes(id),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    impuesto NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0
);

CREATE TABLE factura_detalle (
    id SERIAL PRIMARY KEY,
    factura_id INT NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
    producto_id INT NOT NULL REFERENCES productos(id),
    cantidad INT NOT NULL,
    precio_unitario NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL
);

-- TRIGGER: CALCULAR SUBTOTAL
CREATE OR REPLACE FUNCTION calcular_subtotal()
RETURNS TRIGGER AS $$
BEGIN
    NEW.subtotal := NEW.cantidad * NEW.precio_unitario;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calcular_subtotal
BEFORE INSERT OR UPDATE
ON factura_detalle
FOR EACH ROW
EXECUTE FUNCTION calcular_subtotal();

-- TRIGGER: ACTUALIZAR STOCK
CREATE OR REPLACE FUNCTION actualizar_stock()
RETURNS TRIGGER AS $$
DECLARE
    diff INT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF (SELECT stock FROM productos WHERE id = NEW.producto_id) < NEW.cantidad THEN
            RAISE EXCEPTION 'Stock insuficiente para el producto %', NEW.producto_id;
        END IF;

        UPDATE productos
        SET stock = stock - NEW.cantidad
        WHERE id = NEW.producto_id;

        RETURN NEW;
    END IF;

    IF TG_OP = 'DELETE' THEN
        UPDATE productos
        SET stock = stock + OLD.cantidad
        WHERE id = OLD.producto_id;

        RETURN OLD;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF NEW.producto_id = OLD.producto_id THEN
            diff := NEW.cantidad - OLD.cantidad;

            IF diff > 0 THEN
                IF (SELECT stock FROM productos WHERE id = NEW.producto_id) < diff THEN
                    RAISE EXCEPTION 'Stock insuficiente para el producto %', NEW.producto_id;
                END IF;
            END IF;

            UPDATE productos
            SET stock = stock - diff
            WHERE id = NEW.producto_id;
        ELSE
            UPDATE productos
            SET stock = stock + OLD.cantidad
            WHERE id = OLD.producto_id;

            IF (SELECT stock FROM productos WHERE id = NEW.producto_id) < NEW.cantidad THEN
                RAISE EXCEPTION 'Stock insuficiente para el producto %', NEW.producto_id;
            END IF;

            UPDATE productos
            SET stock = stock - NEW.cantidad
            WHERE id = NEW.producto_id;
        END IF;

        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_stock
BEFORE INSERT OR UPDATE OR DELETE
ON factura_detalle
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock();

-- TRIGGER: CALCULAR SUBTOTAL, IGV Y TOTAL EN FACTURAS
CREATE OR REPLACE FUNCTION actualizar_totales_factura()
RETURNS TRIGGER AS $$
DECLARE
    v_subtotal NUMERIC(12,2);
    v_impuesto NUMERIC(12,2);
    v_total NUMERIC(12,2);
    v_factura_id INT;
BEGIN
    v_factura_id := COALESCE(NEW.factura_id, OLD.factura_id);

    SELECT COALESCE(SUM(subtotal), 0)
    INTO v_subtotal
    FROM factura_detalle
    WHERE factura_id = v_factura_id;

    v_impuesto := ROUND(v_subtotal * 0.18, 2);
    v_total := v_subtotal + v_impuesto;

    UPDATE facturas
    SET subtotal = v_subtotal,
        impuesto = v_impuesto,
        total = v_total
    WHERE id = v_factura_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_totales
AFTER INSERT OR UPDATE OR DELETE
ON factura_detalle
FOR EACH ROW
EXECUTE FUNCTION actualizar_totales_factura();

-- VISTAS
CREATE OR REPLACE VIEW vw_facturas_resumen AS
SELECT
    f.id AS factura_id,
    f.fecha,
    c.id AS cliente_id,
    c.nombre AS cliente_nombre,
    f.subtotal,
    f.impuesto,
    f.total
FROM facturas f
JOIN clientes c ON f.cliente_id = c.id;

CREATE OR REPLACE VIEW vw_factura_detalle AS
SELECT
    d.factura_id,
    d.id AS detalle_id,
    d.producto_id,
    p.nombre AS producto_nombre,
    d.cantidad,
    d.precio_unitario,
    d.subtotal
FROM factura_detalle d
JOIN productos p ON d.producto_id = p.id;

-- PROCEDIMIENTOS (FUNCIONES) PARA CLIENTES
CREATE OR REPLACE FUNCTION sp_get_clientes()
RETURNS SETOF clientes AS $$
BEGIN
    RETURN QUERY SELECT * FROM clientes ORDER BY id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_get_cliente(p_id INT)
RETURNS SETOF clientes AS $$
BEGIN
    RETURN QUERY SELECT * FROM clientes WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_create_cliente(
    p_nombre VARCHAR,
    p_documento VARCHAR,
    p_email VARCHAR,
    p_telefono VARCHAR,
    p_direccion VARCHAR
)
RETURNS clientes AS $$
DECLARE
    v_cliente clientes;
BEGIN
    INSERT INTO clientes (nombre, documento, email, telefono, direccion)
    VALUES (p_nombre, p_documento, p_email, p_telefono, p_direccion)
    RETURNING * INTO v_cliente;

    RETURN v_cliente;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_update_cliente(
    p_id INT,
    p_nombre VARCHAR,
    p_documento VARCHAR,
    p_email VARCHAR,
    p_telefono VARCHAR,
    p_direccion VARCHAR
)
RETURNS clientes AS $$
DECLARE
    v_cliente clientes;
BEGIN
    UPDATE clientes
    SET nombre = p_nombre,
        documento = p_documento,
        email = p_email,
        telefono = p_telefono,
        direccion = p_direccion
    WHERE id = p_id
    RETURNING * INTO v_cliente;

    RETURN v_cliente;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_delete_cliente(p_id INT)
RETURNS clientes AS $$
DECLARE
    v_cliente clientes;
BEGIN
    DELETE FROM clientes
    WHERE id = p_id
    RETURNING * INTO v_cliente;

    RETURN v_cliente;
END;
$$ LANGUAGE plpgsql;

-- PROCEDIMIENTOS (FUNCIONES) PARA PRODUCTOS
CREATE OR REPLACE FUNCTION sp_get_productos()
RETURNS SETOF productos AS $$
BEGIN
    RETURN QUERY SELECT * FROM productos ORDER BY id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_get_producto(p_id INT)
RETURNS SETOF productos AS $$
BEGIN
    RETURN QUERY SELECT * FROM productos WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_create_producto(
    p_nombre VARCHAR,
    p_precio NUMERIC,
    p_stock INT
)
RETURNS productos AS $$
DECLARE
    v_producto productos;
BEGIN
    INSERT INTO productos (nombre, precio, stock)
    VALUES (p_nombre, p_precio, p_stock)
    RETURNING * INTO v_producto;

    RETURN v_producto;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_update_producto(
    p_id INT,
    p_nombre VARCHAR,
    p_precio NUMERIC,
    p_stock INT
)
RETURNS productos AS $$
DECLARE
    v_producto productos;
BEGIN
    UPDATE productos
    SET nombre = p_nombre,
        precio = p_precio,
        stock = p_stock
    WHERE id = p_id
    RETURNING * INTO v_producto;

    RETURN v_producto;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_delete_producto(p_id INT)
RETURNS productos AS $$
DECLARE
    v_producto productos;
BEGIN
    DELETE FROM productos
    WHERE id = p_id
    RETURNING * INTO v_producto;

    RETURN v_producto;
END;
$$ LANGUAGE plpgsql;

-- PROCEDIMIENTOS (FUNCIONES) PARA FACTURAS
CREATE OR REPLACE FUNCTION sp_create_factura(p_cliente_id INT)
RETURNS facturas AS $$
DECLARE
    v_factura facturas;
BEGIN
    INSERT INTO facturas (cliente_id)
    VALUES (p_cliente_id)
    RETURNING * INTO v_factura;

    RETURN v_factura;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_add_factura_detalle(
    p_factura_id INT,
    p_producto_id INT,
    p_cantidad INT,
    p_precio_unitario NUMERIC
)
RETURNS factura_detalle AS $$
DECLARE
    v_detalle factura_detalle;
BEGIN
    INSERT INTO factura_detalle (factura_id, producto_id, cantidad, precio_unitario)
    VALUES (p_factura_id, p_producto_id, p_cantidad, p_precio_unitario)
    RETURNING * INTO v_detalle;

    RETURN v_detalle;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_delete_factura(p_id INT)
RETURNS facturas AS $$
DECLARE
    v_factura facturas;
BEGIN
    DELETE FROM facturas
    WHERE id = p_id
    RETURNING * INTO v_factura;

    RETURN v_factura;
END;
$$ LANGUAGE plpgsql;
```

Explicacion linea por linea:

### TABLAS (linea por linea)
1. `-- TABLAS PRINCIPALES`: comentario para separar secciones.
2. `CREATE TABLE clientes (`: inicia la tabla de clientes.
3. `id SERIAL PRIMARY KEY,`: id unico autoincremental para identificar filas.
4. `nombre VARCHAR(100) NOT NULL,`: nombre obligatorio con limite de 100.
5. `documento VARCHAR(20) UNIQUE NOT NULL,`: documento unico y obligatorio.
6. `email VARCHAR(100),`: correo opcional.
7. `telefono VARCHAR(20),`: telefono opcional.
8. `direccion VARCHAR(200),`: direccion opcional.
9. `created_at TIMESTAMP DEFAULT NOW()`: guarda fecha de creacion.
10. `);`: cierra la tabla.
11. `CREATE TABLE productos (`: inicia la tabla de productos.
12. `id SERIAL PRIMARY KEY,`: id unico autoincremental.
13. `nombre VARCHAR(100) NOT NULL,`: nombre obligatorio.
14. `precio NUMERIC(10,2) NOT NULL,`: precio exacto con 2 decimales.
15. `stock INT NOT NULL DEFAULT 0,`: stock obligatorio, inicia en 0.
16. `created_at TIMESTAMP DEFAULT NOW()`: fecha de creacion.
17. `);`: cierra la tabla.
18. `CREATE TABLE facturas (`: inicia la tabla de facturas.
19. `id SERIAL PRIMARY KEY,`: id unico autoincremental.
20. `cliente_id INT NOT NULL REFERENCES clientes(id),`: relacion con cliente.
21. `fecha DATE NOT NULL DEFAULT CURRENT_DATE,`: fecha de venta.
22. `subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,`: subtotal calculado.
23. `impuesto NUMERIC(12,2) NOT NULL DEFAULT 0,`: impuesto calculado.
24. `total NUMERIC(12,2) NOT NULL DEFAULT 0`: total calculado.
25. `);`: cierra la tabla.
26. `CREATE TABLE factura_detalle (`: inicia detalles de factura.
27. `id SERIAL PRIMARY KEY,`: id unico autoincremental.
28. `factura_id INT NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,`: relacion y borrado en cascada.
29. `producto_id INT NOT NULL REFERENCES productos(id),`: relacion con producto.
30. `cantidad INT NOT NULL,`: cantidad vendida.
31. `precio_unitario NUMERIC(10,2) NOT NULL,`: precio del producto.
32. `subtotal NUMERIC(12,2) NOT NULL`: subtotal de la linea.
33. `);`: cierra la tabla.

### TRIGGER: SUBTOTAL (linea por linea)
1. `-- TRIGGER: CALCULAR SUBTOTAL`: comentario de seccion.
2. `CREATE OR REPLACE FUNCTION calcular_subtotal()`: crea la funcion.
3. `RETURNS TRIGGER AS $$`: indica que es trigger.
4. `BEGIN`: inicia el bloque.
5. `NEW.subtotal := NEW.cantidad * NEW.precio_unitario;`: calcula subtotal.
6. `RETURN NEW;`: devuelve la fila nueva ya calculada.
7. `END;`: termina la funcion.
8. `$$ LANGUAGE plpgsql;`: define lenguaje.
9. `CREATE TRIGGER trg_calcular_subtotal`: crea el trigger.
10. `BEFORE INSERT OR UPDATE`: antes de insertar o actualizar.
11. `ON factura_detalle`: sobre la tabla detalle.
12. `FOR EACH ROW`: se ejecuta por fila.
13. `EXECUTE FUNCTION calcular_subtotal();`: llama a la funcion.

### TRIGGER: STOCK (linea por linea)
1. `-- TRIGGER: ACTUALIZAR STOCK`: comentario de seccion.
2. `CREATE OR REPLACE FUNCTION actualizar_stock()`: crea la funcion.
3. `RETURNS TRIGGER AS $$`: funcion para trigger.
4. `DECLARE`: seccion de variables.
5. `diff INT;`: diferencia de cantidades.
6. `BEGIN`: inicia el bloque.
7. `IF TG_OP = 'INSERT' THEN`: si es insercion.
8. `IF (SELECT stock ... ) < NEW.cantidad THEN`: valida stock.
9. `RAISE EXCEPTION ...`: detiene si no hay stock.
10. `END IF;`: cierra validacion.
11. `UPDATE productos SET stock = stock - NEW.cantidad ...`: resta stock.
12. `RETURN NEW;`: devuelve la fila.
13. `END IF;`: cierra bloque INSERT.
14. `IF TG_OP = 'DELETE' THEN`: si es eliminacion.
15. `UPDATE productos SET stock = stock + OLD.cantidad ...`: devuelve stock.
16. `RETURN OLD;`: devuelve la fila anterior.
17. `END IF;`: cierra bloque DELETE.
18. `IF TG_OP = 'UPDATE' THEN`: si es actualizacion.
19. `IF NEW.producto_id = OLD.producto_id THEN`: mismo producto.
20. `diff := NEW.cantidad - OLD.cantidad;`: calcula diferencia.
21. `IF diff > 0 THEN`: solo si aumenta.
22. `IF (SELECT stock ...) < diff THEN`: valida stock extra.
23. `RAISE EXCEPTION ...`: si no hay stock suficiente.
24. `END IF;`: cierra validacion.
25. `UPDATE productos SET stock = stock - diff ...`: ajusta stock.
26. `ELSE`: cambia de producto.
27. `UPDATE productos SET stock = stock + OLD.cantidad ...`: devuelve al anterior.
28. `IF (SELECT stock ...) < NEW.cantidad THEN`: valida nuevo stock.
29. `RAISE EXCEPTION ...`: si no hay stock.
30. `END IF;`: cierra validacion.
31. `UPDATE productos SET stock = stock - NEW.cantidad ...`: descuenta nuevo.
32. `END IF;`: cierra bloque de producto.
33. `RETURN NEW;`: devuelve la fila nueva.
34. `END IF;`: cierra bloque UPDATE.
35. `RETURN NULL;`: default si no aplica.
36. `END;`: cierra la funcion.
37. `$$ LANGUAGE plpgsql;`: define lenguaje.
38. `CREATE TRIGGER trg_actualizar_stock`: crea el trigger.
39. `BEFORE INSERT OR UPDATE OR DELETE`: antes de cambios.
40. `ON factura_detalle`: sobre detalle.
41. `FOR EACH ROW`: por fila.
42. `EXECUTE FUNCTION actualizar_stock();`: llama a la funcion.

### TRIGGER: TOTALES (linea por linea)
1. `-- TRIGGER: CALCULAR SUBTOTAL, IGV Y TOTAL EN FACTURAS`: comentario.
2. `CREATE OR REPLACE FUNCTION actualizar_totales_factura()`: crea funcion.
3. `RETURNS TRIGGER AS $$`: funcion de trigger.
4. `DECLARE`: variables locales.
5. `v_subtotal NUMERIC(12,2);`: subtotal acumulado.
6. `v_impuesto NUMERIC(12,2);`: impuesto calculado.
7. `v_total NUMERIC(12,2);`: total final.
8. `v_factura_id INT;`: id de la factura.
9. `BEGIN`: inicia bloque.
10. `v_factura_id := COALESCE(...);`: obtiene id correcto.
11. `SELECT COALESCE(SUM(subtotal), 0) ...`: suma subtotales.
12. `v_impuesto := ROUND(v_subtotal * 0.18, 2);`: calcula IGV.
13. `v_total := v_subtotal + v_impuesto;`: total final.
14. `UPDATE facturas SET ... WHERE id = v_factura_id;`: guarda totales.
15. `RETURN NULL;`: no modifica fila detalle.
16. `END;`: termina funcion.
17. `$$ LANGUAGE plpgsql;`: define lenguaje.
18. `CREATE TRIGGER trg_actualizar_totales`: crea trigger.
19. `AFTER INSERT OR UPDATE OR DELETE`: despues del cambio.
20. `ON factura_detalle`: sobre detalle.
21. `FOR EACH ROW`: por fila.
22. `EXECUTE FUNCTION actualizar_totales_factura();`: llama a funcion.

### VISTAS (linea por linea)
1. `-- VISTAS`: comentario de seccion.
2. `CREATE OR REPLACE VIEW vw_facturas_resumen AS`: crea vista resumen.
3. `SELECT ...`: selecciona columnas de factura y cliente.
4. `FROM facturas f`: base de facturas.
5. `JOIN clientes c ON f.cliente_id = c.id;`: une cliente.
6. `CREATE OR REPLACE VIEW vw_factura_detalle AS`: crea vista detalle.
7. `SELECT ...`: columnas de detalle y producto.
8. `FROM factura_detalle d`: base de detalle.
9. `JOIN productos p ON d.producto_id = p.id;`: une producto.

### PROCEDIMIENTOS (linea por linea)
#### sp_get_clientes
1. `CREATE OR REPLACE FUNCTION sp_get_clientes()`: crea la funcion para listar.
2. `RETURNS SETOF clientes AS $$`: indica que retorna varias filas de clientes.
3. `BEGIN`: inicia el bloque.
4. `RETURN QUERY SELECT * FROM clientes ORDER BY id;`: consulta ordenada para consistencia.
5. `END;`: termina el bloque.
6. `$$ LANGUAGE plpgsql;`: define el lenguaje.

#### sp_get_cliente
1. `CREATE OR REPLACE FUNCTION sp_get_cliente(p_id INT)`: recibe id como parametro.
2. `RETURNS SETOF clientes AS $$`: retorna filas (cero o una).
3. `BEGIN`: inicia el bloque.
4. `RETURN QUERY SELECT * FROM clientes WHERE id = p_id;`: filtra por id.
5. `END;`: termina el bloque.
6. `$$ LANGUAGE plpgsql;`: define el lenguaje.

#### sp_create_cliente
1. `CREATE OR REPLACE FUNCTION sp_create_cliente(... )`: recibe datos del cliente.
2. `RETURNS clientes AS $$`: retorna el cliente creado.
3. `DECLARE`: seccion de variables.
4. `v_cliente clientes;`: variable para guardar el resultado.
5. `BEGIN`: inicia el bloque.
6. `INSERT INTO clientes ...`: inserta en la tabla.
7. `VALUES (...)`: usa los parametros recibidos.
8. `RETURNING * INTO v_cliente;`: guarda el registro creado.
9. `RETURN v_cliente;`: devuelve el cliente creado.
10. `END;`: termina el bloque.
11. `$$ LANGUAGE plpgsql;`: define el lenguaje.

#### sp_update_cliente
1. `CREATE OR REPLACE FUNCTION sp_update_cliente(... )`: recibe id y datos.
2. `RETURNS clientes AS $$`: retorna el cliente actualizado.
3. `DECLARE`: seccion de variables.
4. `v_cliente clientes;`: variable de salida.
5. `BEGIN`: inicia el bloque.
6. `UPDATE clientes SET ...`: actualiza campos.
7. `WHERE id = p_id`: limita a un cliente.
8. `RETURNING * INTO v_cliente;`: guarda el actualizado.
9. `RETURN v_cliente;`: devuelve el cliente.
10. `END;`: termina el bloque.
11. `$$ LANGUAGE plpgsql;`: define el lenguaje.

#### sp_delete_cliente
1. `CREATE OR REPLACE FUNCTION sp_delete_cliente(p_id INT)`: recibe id.
2. `RETURNS clientes AS $$`: retorna el cliente eliminado.
3. `DECLARE`: seccion de variables.
4. `v_cliente clientes;`: variable de salida.
5. `BEGIN`: inicia el bloque.
6. `DELETE FROM clientes WHERE id = p_id`: elimina el cliente.
7. `RETURNING * INTO v_cliente;`: guarda el eliminado.
8. `RETURN v_cliente;`: devuelve el eliminado.
9. `END;`: termina el bloque.
10. `$$ LANGUAGE plpgsql;`: define el lenguaje.

#### sp_get_productos
1. `CREATE OR REPLACE FUNCTION sp_get_productos()`: crea funcion de listado.
2. `RETURNS SETOF productos AS $$`: retorna varias filas.
3. `BEGIN`: inicia el bloque.
4. `RETURN QUERY SELECT * FROM productos ORDER BY id;`: lista ordenada.
5. `END;`: termina el bloque.
6. `$$ LANGUAGE plpgsql;`: define el lenguaje.

#### sp_get_producto
1. `CREATE OR REPLACE FUNCTION sp_get_producto(p_id INT)`: recibe id.
2. `RETURNS SETOF productos AS $$`: retorna filas (cero o una).
3. `BEGIN`: inicia el bloque.
4. `RETURN QUERY SELECT * FROM productos WHERE id = p_id;`: filtra.
5. `END;`: termina el bloque.
6. `$$ LANGUAGE plpgsql;`: define el lenguaje.

#### sp_create_producto
1. `CREATE OR REPLACE FUNCTION sp_create_producto(... )`: recibe datos.
2. `RETURNS productos AS $$`: retorna producto creado.
3. `DECLARE`: variables.
4. `v_producto productos;`: variable de salida.
5. `BEGIN`: inicia el bloque.
6. `INSERT INTO productos ...`: inserta en tabla.
7. `VALUES (...)`: usa parametros recibidos.
8. `RETURNING * INTO v_producto;`: guarda el creado.
9. `RETURN v_producto;`: devuelve el creado.
10. `END;`: termina el bloque.
11. `$$ LANGUAGE plpgsql;`: define el lenguaje.

#### sp_update_producto
1. `CREATE OR REPLACE FUNCTION sp_update_producto(... )`: recibe id y datos.
2. `RETURNS productos AS $$`: retorna producto actualizado.
3. `DECLARE`: variables.
4. `v_producto productos;`: variable de salida.
5. `BEGIN`: inicia el bloque.
6. `UPDATE productos SET ...`: actualiza campos.
7. `WHERE id = p_id`: limita a un producto.
8. `RETURNING * INTO v_producto;`: guarda el actualizado.
9. `RETURN v_producto;`: devuelve el actualizado.
10. `END;`: termina el bloque.
11. `$$ LANGUAGE plpgsql;`: define el lenguaje.

#### sp_delete_producto
1. `CREATE OR REPLACE FUNCTION sp_delete_producto(p_id INT)`: recibe id.
2. `RETURNS productos AS $$`: retorna producto eliminado.
3. `DECLARE`: variables.
4. `v_producto productos;`: variable de salida.
5. `BEGIN`: inicia el bloque.
6. `DELETE FROM productos WHERE id = p_id`: elimina el producto.
7. `RETURNING * INTO v_producto;`: guarda el eliminado.
8. `RETURN v_producto;`: devuelve el eliminado.
9. `END;`: termina el bloque.
10. `$$ LANGUAGE plpgsql;`: define el lenguaje.

#### sp_create_factura
1. `CREATE OR REPLACE FUNCTION sp_create_factura(p_cliente_id INT)`: recibe cliente.
2. `RETURNS facturas AS $$`: retorna factura creada.
3. `DECLARE`: variables.
4. `v_factura facturas;`: variable de salida.
5. `BEGIN`: inicia el bloque.
6. `INSERT INTO facturas (cliente_id)`: crea factura vacia.
7. `VALUES (p_cliente_id)`: usa el cliente recibido.
8. `RETURNING * INTO v_factura;`: guarda la factura creada.
9. `RETURN v_factura;`: devuelve la factura.
10. `END;`: termina el bloque.
11. `$$ LANGUAGE plpgsql;`: define el lenguaje.

#### sp_add_factura_detalle
1. `CREATE OR REPLACE FUNCTION sp_add_factura_detalle(... )`: recibe item.
2. `RETURNS factura_detalle AS $$`: retorna detalle creado.
3. `DECLARE`: variables.
4. `v_detalle factura_detalle;`: variable de salida.
5. `BEGIN`: inicia el bloque.
6. `INSERT INTO factura_detalle (...)`: inserta el item.
7. `VALUES (...)`: usa parametros recibidos.
8. `RETURNING * INTO v_detalle;`: guarda el detalle.
9. `RETURN v_detalle;`: devuelve el detalle creado.
10. `END;`: termina el bloque.
11. `$$ LANGUAGE plpgsql;`: define el lenguaje.

#### sp_delete_factura
1. `CREATE OR REPLACE FUNCTION sp_delete_factura(p_id INT)`: recibe id.
2. `RETURNS facturas AS $$`: retorna factura eliminada.
3. `DECLARE`: variables.
4. `v_factura facturas;`: variable de salida.
5. `BEGIN`: inicia el bloque.
6. `DELETE FROM facturas WHERE id = p_id`: elimina la factura.
7. `RETURNING * INTO v_factura;`: guarda la factura eliminada.
8. `RETURN v_factura;`: devuelve la factura.
9. `END;`: termina el bloque.
10. `$$ LANGUAGE plpgsql;`: define el lenguaje.

## Ejemplos de requests (Postman o curl)
Base URL: `http://localhost:3000`

### 1) Crear cliente
POST `/clientes`
Body:
```json
{
  "nombre": "Ana Lopez",
  "documento": "12345678",
  "email": "ana@mail.com",
  "telefono": "999-111",
  "direccion": "Av. Principal 123"
}
```
Respuesta esperada (ejemplo):
```json
{
  "id": 1,
  "nombre": "Ana Lopez",
  "documento": "12345678",
  "email": "ana@mail.com",
  "telefono": "999-111",
  "direccion": "Av. Principal 123",
  "created_at": "2026-03-02T12:00:00.000Z"
}
```

### 2) Crear producto
POST `/productos`
Body:
```json
{
  "nombre": "Laptop",
  "precio": 2500.00,
  "stock": 10
}
```

### 3) Crear factura
POST `/facturas`
Body:
```json
{
  "cliente_id": 1
}
```

### 4) Agregar item a factura
POST `/facturas/1/items`
Body:
```json
{
  "producto_id": 1,
  "cantidad": 2,
  "precio_unitario": 2500.00
}
```
Nota: el subtotal, stock e impuestos se calculan por triggers.

### 5) Ver resumen de facturas
GET `/facturas`

### 6) Ver detalle de una factura
GET `/facturas/1/detalle`

### 7) Actualizar cliente
PUT `/clientes/1`
Body:
```json
{
  "nombre": "Ana Lopez",
  "documento": "12345678",
  "email": "ana.nuevo@mail.com",
  "telefono": "999-111",
  "direccion": "Av. Principal 123"
}
```

### 8) Eliminar producto
DELETE `/productos/1`

## Ejemplo rapido con curl
```bash
curl -X POST http://localhost:3000/clientes ^
  -H "Content-Type: application/json" ^
  -d "{\"nombre\":\"Ana\",\"documento\":\"12345678\"}"
```
