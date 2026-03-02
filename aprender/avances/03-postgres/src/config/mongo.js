const { MongoClient, ObjectId } = require("mongodb");

let client;
let db;

async function connectMongo() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB;
  if (!uri || !dbName) {
    throw new Error("Missing MONGO_URI or MONGO_DB");
  }
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  return db;
}

function getDb() {
  if (!db) {
    throw new Error("MongoDB not connected");
  }
  return db;
}

function toObjectId(id) {
  return new ObjectId(id);
}

module.exports = {
  connectMongo,
  getDb,
  toObjectId,
};
