const { pool } = require("../config/postgres");

async function listAppointments() {
  const result = await pool.query(
    `SELECT id, patient_id, doctor_id, appointment_date, reason, status, created_at
     FROM appointments
     ORDER BY appointment_date`
  );
  return result.rows;
}

async function getAppointmentById(id) {
  const result = await pool.query(
    `SELECT id, patient_id, doctor_id, appointment_date, reason, status, created_at
     FROM appointments
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function createAppointment(data) {
  const result = await pool.query(
    `INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, patient_id, doctor_id, appointment_date, reason, status, created_at`,
    [
      data.patientId,
      data.doctorId,
      data.appointmentDate,
      data.reason || null,
      data.status || "scheduled",
    ]
  );
  return result.rows[0];
}

async function updateAppointment(id, data) {
  const result = await pool.query(
    `UPDATE appointments
     SET patient_id = COALESCE($2, patient_id),
         doctor_id = COALESCE($3, doctor_id),
         appointment_date = COALESCE($4, appointment_date),
         reason = COALESCE($5, reason),
         status = COALESCE($6, status)
     WHERE id = $1
     RETURNING id, patient_id, doctor_id, appointment_date, reason, status, created_at`,
    [
      id,
      data.patientId || null,
      data.doctorId || null,
      data.appointmentDate || null,
      data.reason || null,
      data.status || null,
    ]
  );
  return result.rows[0] || null;
}

async function deleteAppointment(id) {
  const result = await pool.query(
    `DELETE FROM appointments
     WHERE id = $1
     RETURNING id, patient_id, doctor_id, appointment_date, reason, status, created_at`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  listAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
