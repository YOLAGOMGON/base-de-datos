02 - Excel normalizado (1FN, 2FN, 3FN)

Objetivo
Aprender a convertir un Excel desordenado en tablas normalizadas para
usar en una base de datos relacional.

Conceptos clave
- 1FN: valores atomicos, sin listas en una celda.
- 2FN: no depender de una parte de la clave compuesta.
- 3FN: no depender de columnas no clave (sin dependencias transitivas).

Ejemplo inicial (no normalizado)
Tabla: ventas_excel
| id_venta | cliente | telefono | producto | precio | cantidad | ciudad |

Problemas:
- Cliente y telefono se repiten.
- Ciudad depende de cliente, no de la venta.
- Producto y precio se repiten.
- Si un cliente compra varios productos, terminarias duplicando datos.

Paso a paso de normalizacion

Paso 1: Identifica entidades
- Cliente
- Producto
- Venta

Paso 2: Separa tablas
Tabla clientes
| id_cliente | nombre | telefono | ciudad |

Tabla productos
| id_producto | nombre | precio |

Tabla ventas
| id_venta | id_cliente | fecha |

Tabla detalle_venta
| id_detalle | id_venta | id_producto | cantidad | precio_unitario |

Paso 2.1: Si hay listas en una celda
- Ejemplo: "producto = lapiz, cuaderno, borrador"
- Solucion: crear una fila por cada producto en detalle_venta.

Paso 3: Define claves primarias (PK) y foraneas (FK)
- clientes.id_cliente (PK)
- productos.id_producto (PK)
- ventas.id_venta (PK)
- ventas.id_cliente (FK -> clientes)
- detalle_venta.id_venta (FK -> ventas)
- detalle_venta.id_producto (FK -> productos)

Paso 4: Reglas de Excel para normalizar
- Cada hoja = una tabla
- Encabezados claros y sin espacios raros
- IDs unicos en cada tabla
- FK con datos coherentes
- No mezcles texto y numeros en la misma columna

Checklist rapido
- Cada columna tiene un solo dato.
- No hay datos repetidos en diferentes columnas.
- Cada tabla representa una entidad.
- Las FK apuntan a PK existentes.
