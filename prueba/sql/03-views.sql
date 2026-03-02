-- Vista para resumir clientes con total de ventas.
CREATE OR REPLACE VIEW vw_clientes_resumen AS
SELECT c.id_cliente, c.nombre, COUNT(v.id_venta) AS total_ventas
FROM clientes c
LEFT JOIN ventas v ON v.id_cliente = c.id_cliente
GROUP BY c.id_cliente, c.nombre;
