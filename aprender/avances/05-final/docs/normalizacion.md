# Normalizacion (resumen)

Este ejemplo separa entidades para evitar duplicidad:

- Pacientes viven en MongoDB (flexible para datos personales).
- Doctores viven en PostgreSQL (relacional).
- Citas relacionan paciente (MongoDB) con doctor (PostgreSQL) usando `patient_id` y `doctor_id`.

El archivo `normalizacion.csv` puede abrirse en Excel para revisar columnas y tipos.
