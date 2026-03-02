-- Funcion para insertar un cliente y devolver el registro creado.
CREATE OR REPLACE FUNCTION insertar_cliente(
  -- Parametros de entrada.
  p_nombre VARCHAR,
  p_telefono VARCHAR,
  p_ciudad VARCHAR
)
-- Tipo de retorno: una fila con columnas del cliente.
RETURNS TABLE(id_cliente INT, nombre VARCHAR, telefono VARCHAR, ciudad VARCHAR)
AS $$
BEGIN
  -- Inserta y retorna el cliente creado.
  RETURN QUERY
  INSERT INTO clientes(nombre, telefono, ciudad)
  VALUES (p_nombre, p_telefono, p_ciudad)
  RETURNING clientes.id_cliente, clientes.nombre, clientes.telefono, clientes.ciudad;
END;
$$ LANGUAGE plpgsql;
