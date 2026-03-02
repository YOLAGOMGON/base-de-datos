# Practica guiada: Sistema de facturacion en PostgreSQL

Este README recopila todo lo trabajado para que puedas practicar paso a paso
desde cero: conexion, creacion de tablas, relaciones, triggers y reportes.
La idea es que entiendas no solo el "como", sino tambien el "por que" de cada
parte, para que puedas replicarlo en otros proyectos.

## Requisitos
- PostgreSQL instalado (motor de base de datos que ejecutara tus consultas).
- Acceso a `psql` o una herramienta como pgAdmin (para escribir y ejecutar SQL).

## Instalacion rapida (Windows)
1. Instala PostgreSQL desde el instalador oficial.
2. Anota la contrasena del usuario `postgres` porque se usara para conectarte.
3. Abre `psql` desde el menu de inicio o usa pgAdmin.
4. En `psql`, conecta con:
```sql
psql -U postgres
```

## Instalacion rapida (Linux/Mac)
1. Instala PostgreSQL con el gestor de paquetes o desde la web oficial.
2. Inicia el servicio para que el motor acepte conexiones.
3. Conecta con:
```sql
psql -U postgres
```

## 1) Crear base de datos
Creamos una base separada para mantener el proyecto aislado y ordenado.
```sql
CREATE DATABASE facturacion;
```

Conectar:
```sql
\c facturacion
```

## 2) Crear tablas base
Aqui definimos las entidades principales del sistema de facturas.
Cada tabla representa un tipo de informacion del negocio.

### Tipos de datos mas usados (y por que)
- `SERIAL`: crea un numero incremental automatico para identificar filas.
- `VARCHAR(n)`: texto con limite, evita guardar cadenas demasiado largas.
- `INT`: enteros para cantidades o contadores.
- `NUMERIC(10,2)`: valores con decimales exactos (dinero).
- `DATE`: fecha sin hora.
- `TIMESTAMP`: fecha y hora, util para auditoria.

### Clientes
Guardamos los datos del cliente porque cada factura debe tener un cliente.
```sql
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    documento VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    direccion VARCHAR(200),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Productos
Guardamos productos porque las facturas se componen de items vendidos.
```sql
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio NUMERIC(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Facturas (cabecera)
La cabecera guarda datos generales de la venta: cliente, fecha y totales.
```sql
CREATE TABLE facturas (
    id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL REFERENCES clientes(id),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    impuesto NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0
);
```

### Detalle de factura
El detalle guarda cada linea vendida: producto, cantidad y precio.
```sql
CREATE TABLE factura_detalle (
    id SERIAL PRIMARY KEY,
    factura_id INT NOT NULL REFERENCES facturas(id),
    producto_id INT NOT NULL REFERENCES productos(id),
    cantidad INT NOT NULL,
    precio_unitario NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL
);
```

### Relaciones (resumen claro)
- `facturas.cliente_id -> clientes.id` (una factura pertenece a un cliente).
- `factura_detalle.factura_id -> facturas.id` (muchos detalles por factura).
- `factura_detalle.producto_id -> productos.id` (cada detalle usa un producto).

## 3) Datos de ejemplo (opcional)
Sirven para probar que todo funciona sin tener que inventar datos cada vez.
```sql
INSERT INTO clientes (nombre, documento, email, telefono, direccion)
VALUES
('Ana Lopez', '12345678', 'ana@mail.com', '999-111', 'Av. Principal 123'),
('Luis Perez', '87654321', 'luis@mail.com', '999-222', 'Calle 45');

INSERT INTO productos (nombre, precio, stock)
VALUES
('Laptop', 2500.00, 10),
('Mouse', 50.00, 100);
```

## 4) Trigger: calcular subtotal automaticamente
No pedimos el subtotal al usuario para evitar errores. Se calcula siempre con
cantidad * precio_unitario antes de guardar la fila.
```sql
CREATE OR REPLACE FUNCTION calcular_subtotal()
RETURNS TRIGGER AS $$
BEGIN
    NEW.subtotal := NEW.cantidad * NEW.precio_unitario;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calcular_subtotal ON factura_detalle;

CREATE TRIGGER trg_calcular_subtotal
BEFORE INSERT OR UPDATE
ON factura_detalle
FOR EACH ROW
EXECUTE FUNCTION calcular_subtotal();
```

## 5) Trigger: actualizar stock automaticamente
El stock cambia cuando se vende. Este trigger mantiene el inventario correcto
y evita vender mas de lo disponible.
```sql
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

DROP TRIGGER IF EXISTS trg_actualizar_stock ON factura_detalle;

CREATE TRIGGER trg_actualizar_stock
BEFORE INSERT OR UPDATE OR DELETE
ON factura_detalle
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock();
```

## 6) Trigger: calcular subtotal, IGV y total en facturas
Cada factura debe reflejar el total real. Se recalcula cada vez que cambia
su detalle. IGV fijo al 18% (puedes cambiarlo en la funcion).

```sql
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

DROP TRIGGER IF EXISTS trg_actualizar_totales ON factura_detalle;

CREATE TRIGGER trg_actualizar_totales
AFTER INSERT OR UPDATE OR DELETE
ON factura_detalle
FOR EACH ROW
EXECUTE FUNCTION actualizar_totales_factura();
```

## 7) Integracion sin conflictos (orden recomendado)
El orden importa: primero calculas subtotal y ajustas stock, y al final
recalculas los totales de la factura.
1. `BEFORE` en `factura_detalle`
   - `trg_calcular_subtotal`
   - `trg_actualizar_stock`
2. `AFTER` en `factura_detalle`
   - `trg_actualizar_totales`

Esto garantiza:
- Se calcula el subtotal antes de guardar.
- Se valida y ajusta el stock antes de guardar.
- Se recalculan subtotal, impuesto y total despues del cambio.

## 8) Reporte de ventas por mes
Agrupamos por mes para saber cuanto se vendio en cada periodo.
```sql
SELECT
    DATE_TRUNC('month', fecha) AS mes,
    SUM(subtotal) AS subtotal_mes,
    SUM(impuesto) AS impuesto_mes,
    SUM(total) AS total_mes
FROM facturas
GROUP BY mes
ORDER BY mes;
```

Formato de mes en texto:
```sql
SELECT
    TO_CHAR(DATE_TRUNC('month', fecha), 'YYYY-MM') AS mes,
    SUM(total) AS total_mes
FROM facturas
GROUP BY mes
ORDER BY mes;
```

## 9) Errores comunes y como evitarlos
- `insert/update on table ... violates foreign key`: estas usando un `cliente_id`,
  `factura_id` o `producto_id` que no existe. Primero crea el registro padre.
- `Stock insuficiente`: estas intentando vender mas de lo disponible.
- `null value in column ... violates not-null constraint`: falta un dato obligatorio.
- Totales no cambian: verifica que los triggers existan y esten activos.

## 9) Pruebas rapidas
Con estas consultas verificas que triggers y totales funcionen.
```sql
INSERT INTO facturas (cliente_id) VALUES (1) RETURNING id;

INSERT INTO factura_detalle (factura_id, producto_id, cantidad, precio_unitario)
VALUES (1, 1, 2, 2500.00);

SELECT * FROM facturas WHERE id = 1;
SELECT * FROM factura_detalle WHERE factura_id = 1;
SELECT id, nombre, stock FROM productos;
```

## 10) Diagrama de relaciones (texto)
```
clientes 1 ---- n facturas 1 ---- n factura_detalle n ---- 1 productos
```

## 10) Ejercicios guiados
Practicas para confirmar que comprendes el flujo completo.
1. Crea 3 clientes nuevos y 5 productos con stock distinto.
2. Genera 2 facturas con al menos 3 items cada una.
3. Cambia la cantidad de un item y verifica el stock.
4. Elimina un item y verifica que el stock se devuelva.
5. Revisa que subtotal, impuesto y total se actualicen solos.
6. Ejecuta el reporte mensual y valida los totales.

## 11) Ejercicios con resultados esperados
Usa datos simples para poder comprobar los calculos y comparar resultados.

### Ejercicio A: una factura simple
1. Crea un producto con precio 100 y stock 10.
2. Crea una factura con un item de cantidad 2.

Consultas:
```sql
SELECT stock FROM productos WHERE nombre = 'Producto A';
SELECT subtotal, impuesto, total FROM facturas WHERE id = 1;
```

Resultados esperados:
- Stock: 8
- Subtotal: 200.00
- IGV (18%): 36.00
- Total: 236.00

### Ejercicio B: actualizar cantidad
1. Cambia la cantidad del item de 2 a 3.

Consultas:
```sql
SELECT stock FROM productos WHERE nombre = 'Producto A';
SELECT subtotal, impuesto, total FROM facturas WHERE id = 1;
```

Resultados esperados:
- Stock: 7
- Subtotal: 300.00
- IGV (18%): 54.00
- Total: 354.00

### Ejercicio C: eliminar item
1. Elimina el item de la factura.

Consultas:
```sql
SELECT stock FROM productos WHERE nombre = 'Producto A';
SELECT subtotal, impuesto, total FROM facturas WHERE id = 1;
```

Resultados esperados:
- Stock: 10
- Subtotal: 0.00
- IGV (18%): 0.00
- Total: 0.00

## 12) Checklist de validacion
Lista corta para saber si todo esta bien configurado.
- Se puede insertar en `factura_detalle` sin escribir `subtotal`.
- El stock baja al insertar un item.
- El stock se ajusta al actualizar cantidad.
- El stock se devuelve al eliminar un item.
- `subtotal`, `impuesto` y `total` cambian automaticamente.
- El reporte mensual devuelve valores coherentes.

## 13) Soluciones (SQL completo)
Bloques listos para ejecutar si quieres comparar tu trabajo.

## 14) Pasos de depuracion (si algo falla)
1. Verifica que estas en la base `facturacion` con `\c facturacion`.
2. Confirma que las tablas existen con `\dt`.
3. Revisa si las funciones y triggers existen:
   - `\df` para funciones
   - `\dS factura_detalle` para ver triggers
4. Si un trigger no esta, vuelve a ejecutar su bloque de creacion.
5. Repite una insercion simple y mira si cambia el stock y los totales.
### Solucion Ejercicio A
```sql
INSERT INTO productos (nombre, precio, stock)
VALUES ('Producto A', 100.00, 10);

INSERT INTO facturas (cliente_id) VALUES (1) RETURNING id;

INSERT INTO factura_detalle (factura_id, producto_id, cantidad, precio_unitario)
VALUES (1, 1, 2, 100.00);
```

### Solucion Ejercicio B
```sql
UPDATE factura_detalle
SET cantidad = 3, precio_unitario = 100.00
WHERE factura_id = 1 AND producto_id = 1;
```

### Solucion Ejercicio C
```sql
DELETE FROM factura_detalle
WHERE factura_id = 1 AND producto_id = 1;
```

Listo. Si quieres, seguimos con impuestos configurables, notas de credito,
reportes por cliente o por producto.

## CRUD con Express
Para el CRUD con Express, procedimientos almacenados, vistas y triggers,
revisa `CRUD_README.md`.
