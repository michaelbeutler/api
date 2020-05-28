import app, { dbc } from "../src/index";
import supertest from "supertest";
import fs from "fs";
import { query } from "../utils/todos.sql";

describe("todo", () => {
  let request: supertest.SuperTest<supertest.Test>;
  let server;
  let token: string;

  beforeAll(async (done: jest.DoneCallback) => {
    try {
      await dbc.connect();
      /** Create database for testing. */
      dbc.query(String(query), () => {
        dbc.query(
          "INSERT INTO todos SET ?",
          { id: 1, text: "test", done: false },
          () => {
            done();
          }
        );
      });
    } catch (err) {
      console.error(err);
      process.exit();
    }
  });

  beforeEach(async (done: jest.DoneCallback) => {
    server = app.listen(done);
    request = supertest.agent(server);
    const res: supertest.Response = await request
      .post("/login")
      .send({ email: "test@example.com", password: "myTestPassword" });
    token = res.body.payload.token;
  });

  afterEach((done: jest.DoneCallback) => {
    server.close(done);
  });

  afterAll(async (done: jest.DoneCallback) => {
    dbc.end();
    done();
  });

  it("should return a 401 response for GET /", async (done) => {
    const res: supertest.Response = await request.get("/todos");
    expect(res.status).toBe(401);
    done();
  });

  it("should return a successful response for GET /todos if authenticated", async (done) => {
    const res: supertest.Response = await request
      .get("/todos")
      .set("Authorization", "Bearer " + token);
    expect(res.status).toBe(200);
    expect(res.body.payload).toHaveProperty("todos");
    expect(res.body.payload).toHaveProperty("count");
    done();
  });

  it("should return a successful response for GET /todos/1 if authenticated", async (done) => {
    const res: supertest.Response = await request
      .get("/todos/1")
      .set("Authorization", "Bearer " + token);
    expect(res.status).toBe(200);
    expect(res.body.payload).toHaveProperty("todo");
    done();
  });

  it("should return a 404 response for GET /todos/test if authenticated", async (done) => {
    const res: supertest.Response = await request
      .get("/todos/test")
      .set("Authorization", "Bearer " + token);
    expect(res.status).toBe(404);
    done();
  });

  it("should return a 404 response for GET /todos/0 if authenticated", async (done) => {
    const res: supertest.Response = await request
      .get("/todos/0")
      .set("Authorization", "Bearer " + token);
    expect(res.status).toBe(404);
    done();
  });
});
