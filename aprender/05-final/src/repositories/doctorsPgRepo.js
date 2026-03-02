const { pool } = require("../config/postgres");

async function listDoctors() {
  const result = await pool.query(
    "SELECT id, name, specialty, email, created_at FROM doctors ORDER BY id"
  );
  return result.rows;
}

async function getDoctorById(id) {
  const result = await pool.query(
    "SELECT id, name, specialty, email, created_at FROM doctors WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
}

async function createDoctor(data) {
  const result = await pool.query(
    "INSERT INTO doctors (name, specialty, email) VALUES ($1, $2, $3) RETURNING id, name, specialty, email, created_at",
    [data.name, data.specialty, data.email || null]
  );
  return result.rows[0];
}

async function updateDoctor(id, data) {
  const result = await pool.query(
    `UPDATE doctors
     SET name = COALESCE($2, name),
         specialty = COALESCE($3, specialty),
         email = COALESCE($4, email)
     WHERE id = $1
     RETURNING id, name, specialty, email, created_at`,
    [id, data.name || null, data.specialty || null, data.email || null]
  );
  return result.rows[0] || null;
}

async function deleteDoctor(id) {
  const result = await pool.query(
    "DELETE FROM doctors WHERE id = $1 RETURNING id, name, specialty, email, created_at",
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  listDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
