// Write your tests here
const request = require("supertest");
const db = require("../data/dbConfig");

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

beforeEach(async () => {
  await db("users").truncate();
});

afterAll(async () => {
  await db.destroy();
});

it("should be able to launch three browsers simultaneously", async () => {
  jest.setTimeout(30000);
});

test("sanity", () => {
  expect(true).toBe(true);
});
