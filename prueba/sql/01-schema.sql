-- Tabla de clientes (datos principales).
CREATE TABLE IF NOT EXISTS clientes (
  -- Identificador unico del cliente.
  id_cliente SERIAL PRIMARY KEY,
  -- Nombre del cliente.
  nombre VARCHAR(100) NOT NULL,
  -- Telefono de contacto.
  telefono VARCHAR(30),
  -- Ciudad de residencia.
  ciudad VARCHAR(60)
);

-- Tabla de productos disponibles.
CREATE TABLE IF NOT EXISTS productos (
  -- Identificador unico del producto.
  id_producto SERIAL PRIMARY KEY,
  -- Nombre del producto.
  nombre VARCHAR(100) NOT NULL,
  -- Precio base del producto.
  precio NUMERIC(10,2) NOT NULL
);

-- Tabla de ventas (cabecera).
CREATE TABLE IF NOT EXISTS ventas (
  -- Identificador unico de la venta.
  id_venta SERIAL PRIMARY KEY,
  -- Cliente asociado a la venta.
  id_cliente INT NOT NULL,
  -- Fecha de la venta.
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Relacion con clientes.
  CONSTRAINT fk_ventas_cliente
    FOREIGN KEY (id_cliente)
    REFERENCES clientes (id_cliente)
);

-- Detalle de productos por venta.
CREATE TABLE IF NOT EXISTS detalle_venta (
  -- Identificador unico del detalle.
  id_detalle SERIAL PRIMARY KEY,
  -- Venta a la que pertenece.
  id_venta INT NOT NULL,
  -- Producto vendido.
  id_producto INT NOT NULL,
  -- Cantidad vendida (no puede ser 0).
  cantidad INT NOT NULL CHECK (cantidad > 0),
  -- Precio unitario al momento de la venta.
  precio_unitario NUMERIC(10,2) NOT NULL,
  -- Relacion con ventas.
  CONSTRAINT fk_detalle_venta
    FOREIGN KEY (id_venta)
    REFERENCES ventas (id_venta),
  -- Relacion con productos.
  CONSTRAINT fk_detalle_producto
    FOREIGN KEY (id_producto)
    REFERENCES productos (id_producto)
);

-- Auditoria de acciones sobre clientes.
CREATE TABLE IF NOT EXISTS auditoria_clientes (
  -- Identificador del registro de auditoria.
  id SERIAL PRIMARY KEY,
  -- Accion realizada (INSERT, UPDATE, DELETE).
  accion VARCHAR(20) NOT NULL,
  -- Fecha y hora de la accion.
  fecha TIMESTAMP DEFAULT now(),
  -- Cliente afectado (si aplica).
  id_cliente INT
);
