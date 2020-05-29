import app, { dbc } from "../src/index";
import supertest from "supertest";

const route: string = "todos";

describe(`tests for /${route}`, () => {
  let request: supertest.SuperTest<supertest.Test>;
  let server;
  let token: string;

  beforeAll(async (done: jest.DoneCallback) => {
    try {
      await dbc.connect();

      /** Create dummy insert for testing. */
      dbc.query(`DELETE FROM ${route}`, (err) => {
        if (err) {
          console.error(err);
        }
        dbc.query(
          `INSERT INTO ${route} SET ?`,
          { id: 1, text: "sample text", done: false },
          (err) => {
            if (err) {
              console.error(err);
            }
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

  // GET
  it("should return a 200 response for GET /", async (done) => {
    const res: supertest.Response = await request
      .get(`/${route}`)
      .set("Authorization", "Bearer " + token);
    expect(res.status).toBe(200);
    expect(res.body.payload).toHaveProperty("todos");
    expect(res.body.payload).toHaveProperty("count");
    done();
  });

  it("should return a 200 response for GET /?limit=10", async (done) => {
    const res: supertest.Response = await request
      .get(`/${route}?limit=10`)
      .set("Authorization", "Bearer " + token);
    expect(res.status).toBe(200);
    expect(res.body.payload).toHaveProperty("todos");
    expect(res.body.payload.limit).toBe(10);
    done();
  });

  it("should return a 200 response for GET /?orderBy=text desc", async (done) => {
    const res: supertest.Response = await request
      .get(`/${route}?orderBy=text desc`)
      .set("Authorization", "Bearer " + token);
    expect(res.status).toBe(200);
    expect(res.body.payload).toHaveProperty("todos");
    expect(res.body.payload.orderBy).toStrictEqual(["text desc"]);
    done();
  });

  it("should return a 200 response for GET /?orderBy=text desc,id", async (done) => {
    const res: supertest.Response = await request
      .get(`/${route}?orderBy=text desc,id`)
      .set("Authorization", "Bearer " + token);
    expect(res.status).toBe(200);
    expect(res.body.payload).toHaveProperty("todos");
    expect(res.body.payload.orderBy).toStrictEqual(["text desc", "id"]);
    done();
  });

  it("should return a 200 response for GET /?orderBy=invalid desc", async (done) => {
    const res: supertest.Response = await request
      .get(`/${route}?orderBy=invalid desc`)
      .set("Authorization", "Bearer " + token);
    expect(res.status).toBe(200);
    expect(res.body.payload).toHaveProperty("todos");
    expect(res.body.payload.orderBy).toStrictEqual([]);
    done();
  });

  it("should return a 200 response for GET /?limit=10&orderBy=text desc", async (done) => {
    const res: supertest.Response = await request
      .get(`/${route}?limit=10&orderBy=text desc`)
      .set("Authorization", "Bearer " + token);
    expect(res.status).toBe(200);
    expect(res.body.payload).toHaveProperty("todos");
    expect(res.body.payload.limit).toBe(10);
    expect(res.body.payload.orderBy).toStrictEqual(["text desc"]);
    done();
  });

  it("should return a 200 response for GET /1", async (done) => {
    const res: supertest.Response = await request
      .get(`/${route}/1`)
      .set("Authorization", "Bearer " + token);
    expect(res.status).toBe(200);
    expect(res.body.payload).toHaveProperty("id");
    expect(res.body.payload).toHaveProperty("text");
    expect(res.body.payload).toHaveProperty("isDone");
    done();
  });

  it("should return a 404 response for GET /test", async (done) => {
    const res: supertest.Response = await request
      .get(`/${route}/test`)
      .set("Authorization", "Bearer " + token);
    expect(res.status).toBe(404);
    done();
  });

  it("should return a 404 response for GET /0", async (done) => {
    const res: supertest.Response = await request
      .get(`/${route}/0`)
      .set("Authorization", "Bearer " + token);
    expect(res.status).toBe(404);
    done();
  });

  // POST
  it("should return a 401 response for POST / if no token is provided", async (done) => {
    const res: supertest.Response = await request.post(`/${route}`);
    expect(res.status).toBe(401);
    done();
  });

  it("should return a 201 response for POST /", async (done) => {
    const text: string = "my test for post";
    const res: supertest.Response = await request
      .post(`/${route}`)
      .set("Authorization", "Bearer " + token)
      .send({
        text,
      });
    expect(res.status).toBe(201);
    expect(res.body.payload.text).toBe(text);
    expect(res.body.payload.isDone).toBe(false);
    done();
  });

  it("should return a 201 response for POST / and text gets trimed", async (done) => {
    const text: string = "      my test for post       ";
    const res: supertest.Response = await request
      .post(`/${route}`)
      .set("Authorization", "Bearer " + token)
      .send({
        text,
      });
    expect(res.status).toBe(201);
    expect(res.body.payload.text).toBe(text.trim());
    expect(res.body.payload.isDone).toBe(false);
    done();
  });

  it("should return a 201 response for POST / with isDone = true", async (done) => {
    const text: string = "my test for post";
    const res: supertest.Response = await request
      .post(`/${route}`)
      .set("Authorization", "Bearer " + token)
      .send({
        text,
        isDone: true,
      });
    expect(res.status).toBe(201);
    expect(res.body.payload.text).toBe(text);
    expect(res.body.payload.isDone).toBe(true);
    done();
  });

  it("should return a 400 response for POST / if no body provided", async (done) => {
    const res: supertest.Response = await request
      .post(`/${route}`)
      .set("Authorization", "Bearer " + token);
    expect(res.status).toBe(400);
    done();
  });

  it("should return a 400 response for POST / if no text provided", async (done) => {
    const res: supertest.Response = await request
      .post(`/${route}`)
      .set("Authorization", "Bearer " + token)
      .send({ invalid: "my invalid variable" });
    expect(res.status).toBe(400);
    done();
  });

  // PUT
  it("should return a 401 response for PUT /1 if no token is provided", async (done) => {
    const res: supertest.Response = await request.put(`/${route}/1`);
    expect(res.status).toBe(401);
    done();
  });

  it("should return a 201 response for PUT /1", async (done) => {
    const text: string = "this item was updated.";
    const res: supertest.Response = await request
      .put(`/${route}/1`)
      .set("Authorization", "Bearer " + token)
      .send({ text });
    expect(res.status).toBe(201);
    expect(res.body.payload.text).toBe(text);
    done();
  });

  it("should return a 404 response for PUT /test", async (done) => {
    const res: supertest.Response = await request
      .put(`/${route}/test`)
      .set("Authorization", "Bearer " + token);
    expect(res.status).toBe(404);
    done();
  });

  it("should return a 404 response for PUT /0", async (done) => {
    const res: supertest.Response = await request
      .put(`/${route}/0`)
      .set("Authorization", "Bearer " + token);
    expect(res.status).toBe(404);
    done();
  });

  // DELETE
  it("should return a 401 response for DELETE /1 if no token is provided", async (done) => {
    const res: supertest.Response = await request.delete(`/${route}/1`);
    expect(res.status).toBe(401);
    done();
  });

  it("should return a 201 response for DELETE /1", async (done) => {
    const res: supertest.Response = await request
      .delete(`/${route}/1`)
      .set("Authorization", "Bearer " + token);
    expect(res.status).toBe(201);
    expect(res.body.payload).toHaveProperty("text");

    // item is deleted
    const res2: supertest.Response = await request
      .get(`/${route}/1`)
      .set("Authorization", "Bearer " + token);
    expect(res2.status).toBe(404);

    done();
  });

  it("should return a 404 response for DELETE /test", async (done) => {
    const res: supertest.Response = await request
      .delete(`/${route}/test`)
      .set("Authorization", "Bearer " + token);
    expect(res.status).toBe(404);
    done();
  });

  it("should return a 404 response for DELETE /0", async (done) => {
    const res: supertest.Response = await request
      .delete(`/${route}/0`)
      .set("Authorization", "Bearer " + token);
    expect(res.status).toBe(404);
    done();
  });
});
