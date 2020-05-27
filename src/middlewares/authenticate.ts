import jwt from "jsonwebtoken";
import express from "express";

/**
 * Middleware for protected routes.
 * Checks if given JWT token is valid and assigns user object to request.
 * 
 * `app.get("/", authenticate, (req, res) => { ... })`
 * 
 * {@link https://expressjs.com/en/guide/using-middleware.html}
 *
 * @remarks
 * The token needs to be in the `authorization` header of the request.
 * 
 * @param req - Express Request
 * @param res - Express Response
 * @param next - Express NextFunction
 * @returns 
 * If token is invalid or not given it returns a status, otherwise it runs the next function.
 * 
 * Example JSON Body: `{status: 403, message: "authentication failed (invalid token)"}`
 */
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
    if (err) {
      console.log(err);
      return res.status(403).json({
        status: 403,
        message: "authentication failed (invalid token)",
      });
    }
    req.user = user;
    next();
  });
}
