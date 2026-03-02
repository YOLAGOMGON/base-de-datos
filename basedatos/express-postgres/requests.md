# Requests de prueba (PostgreSQL)

Estos ejemplos sirven para probar el CRUD completo con Postman o Thunder Client.

Base URL:
http://localhost:3000

---

## 1) Crear usuario (POST)

Metodo: POST  
URL: /usuarios  
Headers:
Content-Type: application/json

Body (JSON):
{
  "nombre": "Ana",
  "email": "ana@email.com"
}

Que hace:
- Envia un JSON con nombre y email.
- PostgreSQL inserta el registro.
- Responde 201 con el usuario creado.

---

## 2) Listar usuarios (GET)

Metodo: GET  
URL: /usuarios

Que hace:
- Devuelve un arreglo con todos los usuarios.

---

## 3) Obtener usuario por id (GET)

Metodo: GET  
URL: /usuarios/:id

Ejemplo:
/usuarios/1

Que hace:
- Busca el usuario por su id.
- Si existe, devuelve el objeto.
- Si no existe, responde 404.

---

## 4) Actualizar usuario (PUT)

Metodo: PUT  
URL: /usuarios/:id  
Headers:
Content-Type: application/json

Body (JSON):
{
  "nombre": "Ana Actualizada",
  "email": "ana.actualizada@email.com"
}

Que hace:
- Actualiza el usuario por id.
- Devuelve el usuario actualizado.
- Si no existe, responde 404.

---

## 5) Eliminar usuario (DELETE)

Metodo: DELETE  
URL: /usuarios/:id

Que hace:
- Elimina el usuario por id.
- Devuelve el usuario eliminado.
- Si no existe, responde 404.
