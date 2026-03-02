jest.mock("../src/repositories/patientsMongoRepo", () => ({
  listPatients: jest.fn(async () => [
    { _id: "mock1", name: "Juan" },
  ]),
  getPatientById: jest.fn(async () => null),
  createPatient: jest.fn(async () => ({})),
  updatePatient: jest.fn(async () => ({})),
  deletePatient: jest.fn(async () => ({})),
}));

const request = require("supertest");
const app = require("../src/app");

describe("GET /patients", () => {
  it("returns list of patients", async () => {
    const response = await request(app).get("/patients");
    expect(response.status).toBe(200);
    expect(response.body[0]).toMatchObject({ _id: "mock1" });
  });
});
