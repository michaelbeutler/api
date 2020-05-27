import express from "express";
import jwt from "jsonwebtoken";

const router: express.IRouter = express.Router();

router.get("/", (req: express.Request, res: express.Response) => {
  return res.status(200).json({ status: 200, message: "OK" });
});

router.post("/login", (req: express.Request, res: express.Response) => {
  if (!process.env.JWT_TOKEN) {
    console.error("no jwt token provided in env variables");
    return res
      .status(500)
      .json({ status: 500, message: "internal server error" });
  }

  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ status: 400, message: "no credentials provided" });
  }

  if (!req.body.email || !req.body.password) {
    return res
      .status(400)
      .json({ status: 400, message: "no credentials provided" });
  }

  if (process.env.NODE_ENV === "test") {
    if (
      req.body.email === "test@example.com" &&
      req.body.password === "myTestPassword"
    ) {
      const token = jwt.sign({ email: req.body.email }, process.env.JWT_TOKEN, {
        expiresIn: "1800s",
      });

      return res
        .status(200)
        .json({ status: 200, message: "login success", payload: { token } });
    }
    return res.status(401).json({
      status: 401,
      message: "login failed due to invalid username and/or password",
    });
  }

  // handle auth

  return res
    .status(500)
    .json({ status: 500, message: "internal server error" });
});

export default router;
