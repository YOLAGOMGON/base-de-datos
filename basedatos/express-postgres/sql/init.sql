CREATE TABLE usuarios ( -- Crea la tabla principal de usuarios.
  id SERIAL PRIMARY KEY, -- Columna id con autoincremento y clave primaria.
  nombre VARCHAR(100) NOT NULL, -- Columna nombre obligatoria de 100 caracteres.
  email VARCHAR(100) NOT NULL -- Columna email obligatoria de 100 caracteres.
); -- Cierra la definicion de la tabla.
