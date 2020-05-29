import app from "../src/index";
import supertest from "supertest";
import { dbc } from "../src/index";

describe("app", () => {
  let request: supertest.SuperTest<supertest.Test>;
  let server;

  beforeAll(async (done: jest.DoneCallback) => {
    try {
      await dbc.connect();
      done();
    } catch (err) {
      console.error(err);
      process.exit();
    }
  });

  beforeEach((done: jest.DoneCallback) => {
    server = app.listen(done);
    request = supertest.agent(server);
  });

  afterEach((done: jest.DoneCallback) => {
    server.close(done);
  });

  afterAll(async (done: jest.DoneCallback) => {
    dbc.end();
    done();
  });

  it("should return a 200 response for GET /", async (done) => {
    const res: supertest.Response = await request.get("/");
    expect(res.status).toBe(200);
    done();
  });

  it("should return a 404 response for GET /invalidRoute", async (done) => {
    const res: supertest.Response = await request.get("/invalidRoute");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
    done();
  });

  it("should return a 404 response for POST /invalidRoute", async (done) => {
    const res: supertest.Response = await request.post("/invalidRoute");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
    done();
  });

  it("should return a 400 response for POST /login if no data provided", async (done) => {
    const res: supertest.Response = await request.post("/login");
    expect(res.status).toBe(400);
    done();
  });

  it("should return a 400 response for POST /login if only email provided", async (done) => {
    const res: supertest.Response = await request
      .post("/login")
      .send({ email: "test@example.com" });
    expect(res.status).toBe(400);
    done();
  });

  it("should return a 401 response for POST /login if invalid credentials provided", async (done) => {
    const res: supertest.Response = await request
      .post("/login")
      .send({ email: "test@example.com", password: "invalidPassword" });
    expect(res.status).toBe(401);
    done();
  });

  it("should return a 200 response for POST /login", async (done) => {
    const res: supertest.Response = await request
      .post("/login")
      .send({ email: "test@example.com", password: "myTestPassword" });
    expect(res.status).toBe(200);
    expect(res.body.payload).toHaveProperty("token");
    done();
  });
});
