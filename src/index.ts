"use strict";
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import bodyParser from "body-parser";
import helmet from "helmet";

import indexRoute from "./routes";
import todosRoute from "./routes/todos";

dotenv.config();

const app: express.Application = express();
const port: number = parseInt(process.env.PORT, 10) | 3000;

app.use(helmet.xssFilter());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", indexRoute);
app.use("/todos", todosRoute);

app.all("*", (req: express.Request, res: express.Response) => {
  return res.status(404).json({ status: 404, message: "not found" });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`api running on port ${port}`);
  });
}

export default app;
