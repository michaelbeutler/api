import express from "express";
import jwt from "jsonwebtoken";
import IResponse from "../interfaces/response";

/**
 * Defines the `/` route.
 * This class is exported via es6 export syntax.
 *
 * ```ts
 * export default router;
 * ```
 */
const router: express.IRouter = express.Router();

router.get("/", (req: express.Request, res: express.Response) => {
  const resObj: IResponse = { status: 200, message: "ok" };
  return res.status(200).json(resObj);
});

router.post("/login", (req: express.Request, res: express.Response) => {
  /** Check if JWT token is provided. */
  if (!process.env.JWT_TOKEN) {
    console.error("no jwt token provided in env variables");
    const resObj: IResponse = {
      status: 500,
      message: "internal server error",
    };
    return res.status(500).json(resObj);
  }

  /** Check if request provided body. */
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    const resObj: IResponse = {
      status: 400,
      message: "no credentials provided",
    };
    return res.status(400).json(resObj);
  }

  /** Check if email and username given. */
  if (!req.body.email || !req.body.password) {
    const resObj: IResponse = {
      status: 400,
      message: "no credentials provided",
    };
    return res.status(400).json(resObj);
  }

  /** Dummy login for devlopment. */
  if (
    req.body.email === "test@example.com" &&
    req.body.password === "myTestPassword"
  ) {
    const token = jwt.sign({ email: req.body.email }, process.env.JWT_TOKEN, {
      expiresIn: "1800s",
    });

    const resObj: IResponse = {
      status: 200,
      message: "login success",
      payload: { token },
    };
    return res.status(200).json(resObj);
  }

  const resObj: IResponse = {
    status: 401,
    message: "login failed due to invalid username and/or password",
  };
  return res.status(401).json(resObj);

  /** @remark Todo: Implement Auth. */
});

export default router;
