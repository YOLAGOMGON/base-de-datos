11 - Consultas SQL de verificacion

Objetivo
Tener consultas rapidas para comprobar que la base funciona.

1) Verificar tablas creadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

2) Verificar clientes
SELECT * FROM clientes ORDER BY id_cliente;

3) Verificar productos
SELECT * FROM productos ORDER BY id_producto;

4) Verificar ventas y detalle
SELECT * FROM ventas ORDER BY id_venta;
SELECT * FROM detalle_venta ORDER BY id_detalle;

5) Verificar vista
SELECT * FROM vw_clientes_resumen ORDER BY id_cliente;

6) Verificar trigger (auditoria)
INSERT INTO clientes(nombre, telefono, ciudad)
VALUES ('Prueba', '000', 'Test');

SELECT * FROM auditoria_clientes ORDER BY id DESC;

7) Verificar funcion insertar_cliente
SELECT * FROM insertar_cliente('Carlos', '999', 'Cartagena');
