CREATE OR REPLACE FUNCTION schedule_appointment(
  p_patient_id VARCHAR,
  p_doctor_id INTEGER,
  p_date TIMESTAMP,
  p_reason TEXT
)
RETURNS TABLE (
  id INTEGER,
  patient_id VARCHAR,
  doctor_id INTEGER,
  appointment_date TIMESTAMP,
  reason TEXT,
  status VARCHAR,
  created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason, status)
  VALUES (p_patient_id, p_doctor_id, p_date, p_reason, 'scheduled')
  RETURNING appointments.id,
            appointments.patient_id,
            appointments.doctor_id,
            appointments.appointment_date,
            appointments.reason,
            appointments.status,
            appointments.created_at;
END;
$$;

CREATE OR REPLACE FUNCTION get_doctor_agenda(
  p_doctor_id INTEGER,
  p_from TIMESTAMP,
  p_to TIMESTAMP
)
RETURNS TABLE (
  id INTEGER,
  patient_id VARCHAR,
  doctor_id INTEGER,
  appointment_date TIMESTAMP,
  reason TEXT,
  status VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT a.id,
         a.patient_id,
         a.doctor_id,
         a.appointment_date,
         a.reason,
         a.status
  FROM appointments a
  WHERE a.doctor_id = p_doctor_id
    AND a.appointment_date BETWEEN p_from AND p_to
  ORDER BY a.appointment_date;
END;
$$;
