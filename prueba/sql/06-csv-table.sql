-- Crea tabla para importar el CSV de clientes.
CREATE TABLE IF NOT EXISTS clientes_csv (
  -- Identificador interno.
  id_cliente SERIAL PRIMARY KEY,
  -- Nombre del cliente.
  nombre VARCHAR(100) NOT NULL,
  -- Telefono del cliente.
  telefono VARCHAR(30),
  -- Ciudad del cliente.
  ciudad VARCHAR(60)
);
