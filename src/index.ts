"use strict";
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import bodyParser from "body-parser";
import helmet from "helmet";
import mysql from "mysql";

import indexRoute from "./routes";
import todosRoute from "./routes/todos";

/** Load variables from `.env` file into the process. */
dotenv.config();

/**
 * Create MySql Database connection object.
 */
export const dbc: mysql.Connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

/**
 * Basic application object.
 * This class is exported via es6 export syntax.
 *
 * ```ts
 * export default app;
 * ```
 */
const app: express.Application = express();

/**
 * Defines the port the api is running on. The default port is `3000` but it can be overriden in the `.env` file.
 */
const port: number = parseInt(process.env.PORT, 10) | 3000;

/** Apply the `xssFilter` */
app.use(helmet.xssFilter());

/** Apply `morgan` middleware with `dev` option */
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

/** Apply `body-parser` middleware for `json` and `urlencoded` request bodies */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/** Define routes */
app.use("/", indexRoute);
app.use("/todos", todosRoute);

/** Handle invalid routes and send `HTTP 404` as response. */
app.all("*", (req: express.Request, res: express.Response) => {
  return res.status(404).json({ status: 404, message: "not found" });
});

/** Start the server.
 * @remark if tests are running this part will be skiped and handled by the tests.
 * */
if (process.env.NODE_ENV !== "test") {
  /** Try to connect with database. */
  try {
    dbc.connect();
    console.log("database connection established");
  } catch (err) {
    console.error(err);
    process.exit();
  }
  app.listen(port, () => {
    console.log(`api running on port ${port}`);
  });
}

export default app;
