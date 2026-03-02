# Guia basica de Bases de Datos (SQL) para principiantes

Este README es una introduccion completa y practica a bases de datos relacionales.
Incluye conceptos, sintaxis SQL y ejemplos listos para probar.

## 1) Que es una base de datos
Una base de datos es un sistema para almacenar informacion de forma organizada,
permitiendo consultar, modificar y mantener datos con seguridad y eficiencia.

## 2) Conceptos clave
- **Tabla**: estructura con filas y columnas (como una hoja de calculo).
- **Fila (registro)**: un elemento completo de datos.
- **Columna (campo)**: atributo del registro (nombre, edad, etc.).
- **Clave primaria (PK)**: identifica de forma unica cada fila.
- **Clave foranea (FK)**: referencia a la PK de otra tabla.
- **Relacion**: vinculo entre tablas (1 a 1, 1 a muchos, muchos a muchos).
- **Indice**: estructura que acelera las consultas.
- **Transaccion**: conjunto de operaciones que se ejecutan juntas.

## 3) SQL basico
SQL es el lenguaje para trabajar con bases de datos relacionales.

### Crear una base de datos (conceptual)
En muchos motores se usa:
```
CREATE DATABASE tienda;
```

### Crear tablas
```
CREATE TABLE clientes (
  id_cliente INT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(120) UNIQUE,
  fecha_registro DATE
);

CREATE TABLE productos (
  id_producto INT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL
);
```

### Insertar datos
```
INSERT INTO clientes (id_cliente, nombre, email, fecha_registro)
VALUES (1, 'Ana Ruiz', 'ana@mail.com', '2026-02-28');

INSERT INTO productos (id_producto, nombre, precio, stock)
VALUES (10, 'Teclado', 35.50, 50);
```

### Consultar datos
```
SELECT * FROM clientes;
SELECT nombre, precio FROM productos;
```

### Filtrar resultados
```
SELECT * FROM productos
WHERE precio >= 30 AND stock > 0;
```

### Ordenar resultados
```
SELECT * FROM productos
ORDER BY precio DESC;
```

### Actualizar datos
```
UPDATE productos
SET stock = stock - 1
WHERE id_producto = 10;
```

### Eliminar datos
```
DELETE FROM productos
WHERE id_producto = 10;
```

## 4) Relaciones entre tablas

### 1 a muchos (clientes -> pedidos)
```
CREATE TABLE pedidos (
  id_pedido INT PRIMARY KEY,
  id_cliente INT NOT NULL,
  fecha DATE NOT NULL,
  FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
);
```

### Muchos a muchos (pedidos <-> productos)
Se usa una tabla intermedia:
```
CREATE TABLE detalle_pedido (
  id_pedido INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id_pedido, id_producto),
  FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
  FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);
```

## 5) Consultas con JOIN
```
SELECT p.id_pedido, c.nombre, p.fecha
FROM pedidos p
JOIN clientes c ON p.id_cliente = c.id_cliente;

SELECT p.id_pedido, pr.nombre, d.cantidad, d.precio_unitario
FROM detalle_pedido d
JOIN productos pr ON d.id_producto = pr.id_producto
JOIN pedidos p ON d.id_pedido = p.id_pedido;
```

## 6) Agregaciones y agrupaciones
```
SELECT id_pedido, SUM(cantidad * precio_unitario) AS total
FROM detalle_pedido
GROUP BY id_pedido
HAVING total > 50;
```

## 7) Indices
```
CREATE INDEX idx_productos_nombre ON productos(nombre);
```

## 8) Transacciones
```
BEGIN;
UPDATE productos SET stock = stock - 1 WHERE id_producto = 10;
INSERT INTO pedidos (id_pedido, id_cliente, fecha) VALUES (100, 1, '2026-02-28');
COMMIT;
```

## 9) Normalizacion (resumen)
- **1FN**: no datos repetidos en una misma columna.
- **2FN**: todo depende de la clave primaria completa.
- **3FN**: sin dependencias entre columnas no clave.

## 10) Ejemplo completo (mini proyecto tienda)

### Datos de ejemplo
```
INSERT INTO clientes (id_cliente, nombre, email, fecha_registro)
VALUES
  (1, 'Ana Ruiz', 'ana@mail.com', '2026-02-01'),
  (2, 'Luis Soto', 'luis@mail.com', '2026-02-02');

INSERT INTO productos (id_producto, nombre, precio, stock)
VALUES
  (10, 'Teclado', 35.50, 50),
  (11, 'Mouse', 15.90, 80),
  (12, 'Monitor', 180.00, 20);

INSERT INTO pedidos (id_pedido, id_cliente, fecha)
VALUES
  (100, 1, '2026-02-28'),
  (101, 2, '2026-02-28');

INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario)
VALUES
  (100, 10, 1, 35.50),
  (100, 11, 2, 15.90),
  (101, 12, 1, 180.00);
```

### Consultas utiles del proyecto
```
-- Total por pedido
SELECT id_pedido, SUM(cantidad * precio_unitario) AS total
FROM detalle_pedido
GROUP BY id_pedido;

-- Productos con poco stock
SELECT nombre, stock
FROM productos
WHERE stock < 30;

-- Pedidos con nombre de cliente
SELECT p.id_pedido, c.nombre, p.fecha
FROM pedidos p
JOIN clientes c ON p.id_cliente = c.id_cliente;
```

## 11) Siguientes pasos recomendados
1. Instalar un motor (SQLite, MySQL o PostgreSQL).
2. Practicar CRUD con 2 o 3 tablas relacionadas.
3. Aprender JOIN y agregaciones con ejercicios reales.
4. Crear un mini proyecto (inventario, biblioteca, ventas).

---
Si quieres, puedo crear ejercicios guiados y un plan de estudio dia a dia.
