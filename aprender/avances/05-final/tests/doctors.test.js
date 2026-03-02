jest.mock("../src/repositories/doctorsPgRepo", () => ({
  listDoctors: jest.fn(async () => [
    { id: 1, name: "Dra. Perez", specialty: "Cardiologia" },
  ]),
  getDoctorById: jest.fn(async () => null),
  createDoctor: jest.fn(async () => ({})),
  updateDoctor: jest.fn(async () => ({})),
  deleteDoctor: jest.fn(async () => ({})),
}));

jest.mock("../src/repositories/appointmentsPgRepo", () => ({
  listAppointments: jest.fn(async () => []),
  getAppointmentById: jest.fn(async () => null),
  createAppointment: jest.fn(async () => ({})),
  createAppointmentSP: jest.fn(async () => ({})),
  listDoctorAgenda: jest.fn(async () => [
    {
      id: 10,
      patient_id: "mockPatient",
      doctor_id: 1,
      appointment_date: "2026-03-10T09:00:00.000Z",
      reason: "Control",
      status: "scheduled",
    },
  ]),
  updateAppointment: jest.fn(async () => ({})),
  deleteAppointment: jest.fn(async () => ({})),
}));

const request = require("supertest");
const app = require("../src/app");

describe("GET /doctors", () => {
  it("returns list of doctors", async () => {
    const response = await request(app).get("/doctors");
    expect(response.status).toBe(200);
    expect(response.body[0]).toMatchObject({ id: 1 });
  });
});

describe("GET /doctors/:id/agenda", () => {
  it("returns agenda for doctor", async () => {
    const response = await request(app).get(
      "/doctors/1/agenda?from=2026-03-01&to=2026-03-31"
    );
    expect(response.status).toBe(200);
    expect(response.body[0]).toMatchObject({ doctor_id: 1 });
  });
});
