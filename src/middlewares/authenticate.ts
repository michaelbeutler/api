import jwt from "jsonwebtoken";
import express from "express";

export default function authenticate(
  req: express.Request & { user: any },
  res: express.Response,
  next: express.NextFunction
) {
  if (!process.env.JWT_TOKEN) {
    console.error("no jwt token provided in env variables");
    return res
      .status(500)
      .json({ status: 500, message: "internal server error" });
  }

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null)
    return res
      .status(401)
      .json({ status: 401, message: "authentication required" });

  jwt.verify(token, process.env.JWT_TOKEN as string, (err: any, user: any) => {
    console.log(err);
    if (err)
      return res.status(403).json({
        status: 403,
        message: "authentication failed (invalid token)",
      });
    req.user = user;
    next();
  });
}
