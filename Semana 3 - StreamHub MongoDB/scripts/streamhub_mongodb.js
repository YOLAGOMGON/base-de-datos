// StreamHub - Semana 3 (MongoDB)
// Usa esta base de datos en Mongo Shell o Compass:
// use streamhub

// ------------------------------
// TASK 2 - Inserciones
// ------------------------------

db.usuarios.insertMany([
  {
    _id: ObjectId("65faaa111111111111111111"),
    nombre: "Ana Ruiz",
    email: "ana@mail.com",
    edad: 22,
    pais: "CO",
    suscripcion: "premium",
    fechaRegistro: ISODate("2026-02-01"),
    historialVistos: [
      { contenidoId: ObjectId("65fbbb111111111111111113"), fecha: ISODate("2025-06-12"), progreso: 100 },
      { contenidoId: ObjectId("65fbbb111111111111111118"), fecha: ISODate("2026-01-18"), progreso: 100 },
      { contenidoId: ObjectId("65fbbb111111111111111117"), fecha: ISODate("2026-02-20"), progreso: 100 }
    ]
  },
  {
    _id: ObjectId("65faaa111111111111111112"),
    nombre: "Luis Soto",
    email: "luis@mail.com",
    edad: 29,
    pais: "MX",
    suscripcion: "estandar",
    fechaRegistro: ISODate("2026-02-02"),
    historialVistos: [
      { contenidoId: ObjectId("65fbbb111111111111111113"), fecha: ISODate("2026-02-23"), progreso: 100 },
      { contenidoId: ObjectId("65fbbb111111111111111114"), fecha: ISODate("2026-02-24"), progreso: 100 },
      { contenidoId: ObjectId("65fbbb111111111111111115"), fecha: ISODate("2026-02-25"), progreso: 100 },
      { contenidoId: ObjectId("65fbbb111111111111111116"), fecha: ISODate("2026-02-26"), progreso: 100 },
      { contenidoId: ObjectId("65fbbb111111111111111117"), fecha: ISODate("2026-02-27"), progreso: 100 },
      { contenidoId: ObjectId("65fbbb111111111111111118"), fecha: ISODate("2026-02-28"), progreso: 100 }
    ]
  },
  {
    _id: ObjectId("65faaa111111111111111113"),
    nombre: "Sara Diaz",
    email: "sara@mail.com",
    edad: 19,
    pais: "CO",
    suscripcion: "gratis",
    fechaRegistro: ISODate("2026-02-10"),
    historialVistos: [
      { contenidoId: ObjectId("65fbbb111111111111111113"), fecha: ISODate("2025-10-10"), progreso: 100 },
      { contenidoId: ObjectId("65fbbb111111111111111118"), fecha: ISODate("2026-02-10"), progreso: 80 }
    ]
  }
]);

db.contenidos.insertMany([
  {
    _id: ObjectId("65fbbb111111111111111111"),
    tipo: "pelicula",
    titulo: "Aventuras en el Bosque",
    genero: ["Infantil", "Aventura"],
    duracionMin: 95,
    lanzamiento: 2023,
    reparto: ["Actor 1", "Actriz 1"]
  },
  {
    _id: ObjectId("65fbbb111111111111111112"),
    tipo: "pelicula",
    titulo: "La Isla de Colores",
    genero: ["Infantil", "Fantasia"],
    duracionMin: 88,
    lanzamiento: 2021,
    reparto: ["Actriz 2", "Actor 2"]
  },
  {
    _id: ObjectId("65fbbb111111111111111113"),
    tipo: "pelicula",
    titulo: "El Robot Amigo",
    genero: ["Infantil", "Ciencia Ficcion"],
    duracionMin: 112,
    lanzamiento: 2024,
    reparto: ["Actor 3", "Actriz 3"]
  },
  {
    _id: ObjectId("65fbbb111111111111111114"),
    tipo: "pelicula",
    titulo: "El Tren de los Suenos",
    genero: ["Infantil", "Aventura"],
    duracionMin: 101,
    lanzamiento: 2020,
    reparto: ["Actor 4", "Actriz 4"]
  },
  {
    _id: ObjectId("65fbbb111111111111111115"),
    tipo: "pelicula",
    titulo: "Los Guardianes del Rio",
    genero: ["Infantil", "Aventura"],
    duracionMin: 120,
    lanzamiento: 2019,
    reparto: ["Actriz 5", "Actor 5"]
  },
  {
    _id: ObjectId("65fbbb111111111111111116"),
    tipo: "pelicula",
    titulo: "Magia en la Nieve",
    genero: ["Infantil", "Fantasia"],
    duracionMin: 90,
    lanzamiento: 2022,
    reparto: ["Actriz 6", "Actor 6"]
  },
  {
    _id: ObjectId("65fbbb111111111111111117"),
    tipo: "pelicula",
    titulo: "El Pequeno Capitan",
    genero: ["Infantil", "Aventura"],
    duracionMin: 84,
    lanzamiento: 2025,
    reparto: ["Actor 7"]
  },
  {
    _id: ObjectId("65fbbb111111111111111118"),
    tipo: "pelicula",
    titulo: "La Ciudad de los Globos",
    genero: ["Infantil", "Comedia"],
    duracionMin: 99,
    lanzamiento: 2024,
    reparto: ["Actriz 7", "Actor 8"]
  }
]);

db.valoraciones.insertMany([
  {
    _id: ObjectId("65fccc111111111111111111"),
    usuarioId: ObjectId("65faaa111111111111111111"),
    contenidoId: ObjectId("65fbbb111111111111111111"),
    puntuacion: 4.5,
    comentario: "Muy buena",
    fecha: ISODate("2026-02-25")
  },
  {
    _id: ObjectId("65fccc111111111111111112"),
    usuarioId: ObjectId("65faaa111111111111111112"),
    contenidoId: ObjectId("65fbbb111111111111111113"),
    puntuacion: 4.8,
    comentario: "Excelente",
    fecha: ISODate("2026-02-26")
  },
  {
    _id: ObjectId("65fccc111111111111111113"),
    usuarioId: ObjectId("65faaa111111111111111113"),
    contenidoId: ObjectId("65fbbb111111111111111112"),
    puntuacion: 3.5,
    comentario: "Normal",
    fecha: ISODate("2026-02-27")
  }
]);

db.listas.insertMany([
  {
    _id: ObjectId("65fddd111111111111111111"),
    usuarioId: ObjectId("65faaa111111111111111111"),
    nombre: "Favoritos",
    contenidos: [
      ObjectId("65fbbb111111111111111111"),
      ObjectId("65fbbb111111111111111114")
    ],
    creadaEn: ISODate("2026-02-10")
  },
  {
    _id: ObjectId("65fddd111111111111111112"),
    usuarioId: ObjectId("65faaa111111111111111112"),
    nombre: "Ver despues",
    contenidos: [
      ObjectId("65fbbb111111111111111115"),
      ObjectId("65fbbb111111111111111116")
    ],
    creadaEn: ISODate("2026-02-12")
  }
]);

// ------------------------------
// TASK 3 - Consultas con operadores
// ------------------------------

// $gt: Peliculas con duracion > 100 min
db.contenidos.find({ tipo: "pelicula", duracionMin: { $gt: 100 } });

// $lt: Peliculas con duracion < 90 min
db.contenidos.find({ tipo: "pelicula", duracionMin: { $lt: 90 } });

// $eq: Usuarios con suscripcion "premium"
db.usuarios.find({ suscripcion: { $eq: "premium" } });

// $in: Contenidos con genero Infantil o Comedia
db.contenidos.find({ genero: { $in: ["Infantil", "Comedia"] } });

// $and: Peliculas infantiles con duracion > 90 y lanzamiento >= 2023
db.contenidos.find({
  $and: [
    { tipo: "pelicula" },
    { duracionMin: { $gt: 90 } },
    { lanzamiento: { $gte: 2023 } }
  ]
});

// $or: Peliculas con genero Fantasia o Aventura
db.contenidos.find({
  $or: [
    { genero: "Fantasia" },
    { genero: "Aventura" }
  ]
});

// $regex: Titulos que contienen "la" (case-insensitive)
db.contenidos.find({ titulo: { $regex: "la", $options: "i" } });

// Usuarios que vieron > 5 contenidos (usa historialVistos)
db.usuarios.find({ "historialVistos.5": { $exists: true } });

// ------------------------------
// TASK 4 - Actualizaciones y eliminaciones
// ------------------------------

// updateOne: cambiar suscripcion de un usuario
db.usuarios.updateOne(
  { email: "sara@mail.com" },
  { $set: { suscripcion: "estandar" } }
);

// updateMany: aumentar puntuacion 0.5 en valoraciones < 4
db.valoraciones.updateMany(
  { puntuacion: { $lt: 4 } },
  { $inc: { puntuacion: 0.5 } }
);

// deleteOne: eliminar una lista por nombre
db.listas.deleteOne({ nombre: "Ver despues" });

// deleteMany: eliminar contenidos de lanzamiento < 2020
db.contenidos.deleteMany({ lanzamiento: { $lt: 2020 } });

// ------------------------------
// TASK 5 - Indices
// ------------------------------

// Indices utiles para consultas frecuentes
db.contenidos.createIndex({ titulo: 1 });
db.contenidos.createIndex({ genero: 1 });
db.usuarios.createIndex({ email: 1 }, { unique: true });

// Ver indices
db.contenidos.getIndexes();
db.usuarios.getIndexes();

// Justificacion:
// - titulo y genero se consultan con frecuencia en filtros y busquedas.
// - email debe ser unico para evitar duplicados y acelerar busqueda.

// ------------------------------
// TASK 6 - Agregaciones
// ------------------------------

// Pipeline 1: promedio de puntuacion por contenido
db.valoraciones.aggregate([
  { $match: { puntuacion: { $gte: 3 } } },
  { $group: { _id: "$contenidoId", promedio: { $avg: "$puntuacion" }, total: { $sum: 1 } } },
  { $sort: { promedio: -1 } },
  { $project: { _id: 0, contenidoId: "$_id", promedio: 1, total: 1 } }
]);

// Pipeline 2: conteo de contenidos por genero (desanidando genero)
db.contenidos.aggregate([
  { $unwind: "$genero" },
  { $group: { _id: "$genero", total: { $sum: 1 } } },
  { $sort: { total: -1 } },
  { $project: { _id: 0, genero: "$_id", total: 1 } }
]);

// Pipeline 3: peliculas infantiles de los dos ultimos anos mas vistas en Colombia
// Nota: se usa como corte 2024-02-28 (dos anos desde la fecha actual de la actividad)
db.usuarios.aggregate([
  { $match: { pais: "CO" } },
  { $unwind: "$historialVistos" },
  { $match: { "historialVistos.fecha": { $gte: ISODate("2024-02-28") } } },
  { $group: { _id: "$historialVistos.contenidoId", vistas: { $sum: 1 } } },
  { $sort: { vistas: -1 } },
  {
    $lookup: {
      from: "contenidos",
      localField: "_id",
      foreignField: "_id",
      as: "contenido"
    }
  },
  { $unwind: "$contenido" },
  {
    $match: {
      "contenido.tipo": "pelicula",
      "contenido.genero": "Infantil",
      "contenido.lanzamiento": { $gte: 2024 }
    }
  },
  {
    $project: {
      _id: 0,
      contenidoId: "$_id",
      titulo: "$contenido.titulo",
      lanzamiento: "$contenido.lanzamiento",
      vistas: 1
    }
  }
]);

