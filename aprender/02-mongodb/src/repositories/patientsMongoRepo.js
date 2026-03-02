const { getDb, toObjectId } = require("../config/mongo");

const collectionName = "patients";

async function listPatients() {
  const db = getDb();
  return db.collection(collectionName).find({}).toArray();
}

async function getPatientById(id) {
  const db = getDb();
  return db.collection(collectionName).findOne({ _id: toObjectId(id) });
}

async function createPatient(data) {
  const db = getDb();
  const result = await db.collection(collectionName).insertOne({
    name: data.name,
    email: data.email || "",
    phone: data.phone || "",
    createdAt: new Date(),
  });
  return getPatientById(result.insertedId.toString());
}

async function updatePatient(id, data) {
  const db = getDb();
  await db
    .collection(collectionName)
    .updateOne(
      { _id: toObjectId(id) },
      { $set: { ...data, updatedAt: new Date() } }
    );
  return getPatientById(id);
}

async function deletePatient(id) {
  const db = getDb();
  const existing = await getPatientById(id);
  if (!existing) return null;
  await db.collection(collectionName).deleteOne({ _id: toObjectId(id) });
  return existing;
}

module.exports = {
  listPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
};
