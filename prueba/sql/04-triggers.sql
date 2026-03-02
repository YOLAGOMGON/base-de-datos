-- Funcion que registra auditoria cuando se inserta un cliente.
CREATE OR REPLACE FUNCTION log_insert_cliente()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserta un registro de auditoria.
  INSERT INTO auditoria_clientes(accion, id_cliente)
  VALUES ('INSERT', NEW.id_cliente);
  -- Retorna el nuevo registro para finalizar el trigger.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Elimina el trigger si ya existe (evita error al recrear).
DROP TRIGGER IF EXISTS trg_insert_cliente ON clientes;

-- Crea el trigger que se ejecuta despues de INSERT.
CREATE TRIGGER trg_insert_cliente
AFTER INSERT ON clientes
FOR EACH ROW
EXECUTE FUNCTION log_insert_cliente();
