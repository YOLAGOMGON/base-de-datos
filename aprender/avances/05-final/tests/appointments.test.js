jest.mock("../src/repositories/appointmentsPgRepo", () => ({
  listAppointments: jest.fn(async () => [
    {
      id: 1,
      patient_id: "mockPatient",
      doctor_id: 2,
      appointment_date: "2026-03-05T10:00:00.000Z",
      reason: "Consulta",
      status: "scheduled",
      created_at: "2026-03-01T00:00:00.000Z",
    },
  ]),
  getAppointmentById: jest.fn(async () => null),
  createAppointment: jest.fn(async () => ({})),
  createAppointmentSP: jest.fn(async () => ({})),
  listDoctorAgenda: jest.fn(async () => []),
  updateAppointment: jest.fn(async () => ({})),
  deleteAppointment: jest.fn(async () => ({})),
}));

const request = require("supertest");
const app = require("../src/app");

describe("GET /appointments", () => {
  it("returns list of appointments", async () => {
    const response = await request(app).get("/appointments");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      id: 1,
      patient_id: "mockPatient",
    });
  });
});
