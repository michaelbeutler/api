import app from "../src/index";
import supertest from "supertest";

describe("app", () => {
  let request: supertest.SuperTest<supertest.Test>;
  let server;

  beforeEach((done: jest.DoneCallback) => {
    server = app.listen(done);
    request = supertest.agent(server);
  });

  afterEach((done: jest.DoneCallback) => {
    server.close(done);
  });

  it("should return a 401 response for GET /", async (done) => {
    const res: supertest.Response = await request.get("/todos");
    expect(res.status).toBe(401);
    done();
  });

  it("should return a successful response for GET /todos if authenticated", async (done) => {
    const res: supertest.Response = await request
      .post("/login")
      .send({ email: "test@example.com", password: "myTestPassword" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("token");

    const res2: supertest.Response = await request
      .get("/todos")
      .set("Authorization", "Bearer " + res.body.token);
    expect(res2.status).toBe(200);
    expect(res2.body).toHaveProperty("message");
    expect(res2.body).toHaveProperty("todos");
    done();
  });

  it("should return a successful response for POST /todos if authenticated", async (done) => {
    const res: supertest.Response = await request
      .post("/login")
      .send({ email: "test@example.com", password: "myTestPassword" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("token");

    const res2: supertest.Response = await request
      .post("/todos")
      .set("Authorization", "Bearer " + res.body.token)
      .send({ text: "test" });
    expect(res2.status).toBe(201);
    expect(res2.body).toHaveProperty("message");
    expect(res2.body).toHaveProperty("todo");

    const res3: supertest.Response = await request
      .get("/todos")
      .set("Authorization", "Bearer " + res.body.token);
    expect(res3.status).toBe(200);
    expect(res3.body).toHaveProperty("message");
    expect(res3.body).toHaveProperty("count");
    expect(res3.body.count).toBe(2);
    done();
  });

  it("should return a successful response for GET /todos/1 if authenticated", async (done) => {
    const res: supertest.Response = await request
      .post("/login")
      .send({ email: "test@example.com", password: "myTestPassword" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("token");

    const res2: supertest.Response = await request
      .get("/todos/1")
      .set("Authorization", "Bearer " + res.body.token);
    expect(res2.status).toBe(200);
    expect(res2.body).toHaveProperty("message");
    expect(res2.body).toHaveProperty("todo");
    done();
  });

  it("should return a successful response for DELETE /todos/1 if authenticated", async (done) => {
    const res: supertest.Response = await request
      .post("/login")
      .send({ email: "test@example.com", password: "myTestPassword" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("token");

    const res2: supertest.Response = await request
      .delete("/todos/0")
      .set("Authorization", "Bearer " + res.body.token);
    expect(res2.status).toBe(404);
    expect(res2.body).toHaveProperty("message");

    const res3: supertest.Response = await request
      .delete("/todos/1")
      .set("Authorization", "Bearer " + res.body.token);
    expect(res3.status).toBe(201);
    expect(res3.body).toHaveProperty("message");

    const res4: supertest.Response = await request
      .get("/todos")
      .set("Authorization", "Bearer " + res.body.token);
    expect(res4.status).toBe(200);
    expect(res4.body).toHaveProperty("message");
    expect(res4.body).toHaveProperty("count");
    expect(res4.body.count).toBe(1);
    done();
  });

  it("should return a successful response for PUT /todos/1 if authenticated", async (done) => {
    const res: supertest.Response = await request
      .post("/login")
      .send({ email: "test@example.com", password: "myTestPassword" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("token");

    const res2: supertest.Response = await request
      .put("/todos/0")
      .set("Authorization", "Bearer " + res.body.token)
      .send({ isDone: true });
    expect(res2.status).toBe(404);
    expect(res2.body).toHaveProperty("message");

    const res3: supertest.Response = await request
      .put("/todos/2")
      .set("Authorization", "Bearer " + res.body.token)
      .send({ isDone: true });
    expect(res3.status).toBe(201);
    expect(res3.body).toHaveProperty("message");

    const res4: supertest.Response = await request
      .get("/todos/2")
      .set("Authorization", "Bearer " + res.body.token);
    expect(res4.status).toBe(200);
    expect(res4.body).toHaveProperty("message");
    expect(res4.body).toHaveProperty("todo");
    expect(res4.body.todo.isDone).toBe(true);
    expect(res4.body.todo.text).toBe("test");

    const res5: supertest.Response = await request
      .put("/todos/2")
      .set("Authorization", "Bearer " + res.body.token)
      .send({ text: "test2" });
    expect(res5.status).toBe(201);
    expect(res5.body).toHaveProperty("message");

    const res6: supertest.Response = await request
      .get("/todos/2")
      .set("Authorization", "Bearer " + res.body.token);
    expect(res6.status).toBe(200);
    expect(res6.body).toHaveProperty("message");
    expect(res6.body).toHaveProperty("todo");
    expect(res6.body.todo.isDone).toBe(true);
    expect(res6.body.todo.text).toBe("test2");

    done();
  });
});
