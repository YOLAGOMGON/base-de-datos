# Actividad Semana 3 - StreamHub (MongoDB)

Esta carpeta contiene la actividad de aprendizaje paso por paso.
Incluye diseno de colecciones, inserciones, consultas, actualizaciones,
eliminaciones, indices y agregaciones.

## Estructura del proyecto (modular)
- `docs/README.md`: guia paso a paso.
- `scripts/streamhub_mongodb.js`: script con TODOS los comandos.
- `evidencias/`: capturas o exportaciones (opcional).

## Paso 1. Analisis del dominio y diseno de documentos

**Dominio**: plataforma de streaming "StreamHub" enfocada en peliculas de ninos.

### Colecciones propuestas
1. **usuarios**
2. **contenidos** (solo peliculas infantiles)
3. **valoraciones**
4. **listas** (listas de favoritos o "ver despues")

### Estructuras JSON (modelo)

**usuarios**
```
{
  _id: ObjectId,
  nombre: "Ana Ruiz",
  email: "ana@mail.com",
  edad: 22,
  pais: "CO",
  suscripcion: "premium",
  fechaRegistro: ISODate("2026-02-01"),
  historialVistos: [
    { contenidoId: ObjectId, fecha: ISODate("2026-02-20"), progreso: 100 }
  ]
}
```

**contenidos**
```
{
  _id: ObjectId,
  tipo: "pelicula",
  titulo: "Aventuras en el Bosque",
  genero: ["Infantil", "Aventura"],
  duracionMin: 95,
  lanzamiento: 2023,
  reparto: ["Actor 1", "Actriz 1"]
}
```

**valoraciones**
```
{
  _id: ObjectId,
  usuarioId: ObjectId,
  contenidoId: ObjectId,
  puntuacion: 4.5,
  comentario: "Muy buena",
  fecha: ISODate("2026-02-25")
}
```

**listas**
```
{
  _id: ObjectId,
  usuarioId: ObjectId,
  nombre: "Favoritos",
  contenidos: [ ObjectId, ObjectId ],
  creadaEn: ISODate("2026-02-10")
}
```

## Paso 2. Insercion de datos
Ejecuta en MongoDB Shell o Compass los comandos del archivo
`scripts/streamhub_mongodb.js` (seccion "Inserciones").

## Paso 3. Consultas (find) con operadores
Ejecuta las consultas en `scripts/streamhub_mongodb.js`:
- $gt, $lt, $eq, $in, $and, $or, $regex

## Paso 4. Actualizaciones y eliminaciones
En `scripts/streamhub_mongodb.js`:
- updateOne / updateMany
- deleteOne / deleteMany

## Paso 5. Indices
En `scripts/streamhub_mongodb.js`:
- createIndex / getIndexes
- Se incluyen notas de justificacion.

## Paso 6. Agregaciones
Hay 3 pipelines completos con:
- $match, $group, $sort, $project, $unwind
- incluye: "peliculas infantiles de los dos ultimos anos mas vistas en Colombia"

## Entrega (ZIP)
1. Ejecuta y verifica cada seccion del script.
2. Guarda evidencias (opcional) en Compass.
3. Comprimes la carpeta `Semana 3 - StreamHub MongoDB` en `.zip`.
4. Sube el zip a Moodle.

