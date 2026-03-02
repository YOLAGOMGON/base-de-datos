CREATE TABLE IF NOT EXISTS doctors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  specialty VARCHAR(120) NOT NULL,
  email VARCHAR(120) UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  patient_id VARCHAR(40) NOT NULL,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id),
  appointment_date TIMESTAMP NOT NULL,
  reason TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS appointments_doctor_idx
  ON appointments(doctor_id);

CREATE INDEX IF NOT EXISTS appointments_patient_idx
  ON appointments(patient_id);
