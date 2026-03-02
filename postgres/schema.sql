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
