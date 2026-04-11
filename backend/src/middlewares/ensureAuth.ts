import type { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import type { Secret, JwtPayload } from "jsonwebtoken";
// No local imports here

const JWT_SECRET_ENV = process.env.JWT_SECRET;
if (!JWT_SECRET_ENV) throw new Error("Missing JWT_SECRET env var");

const JWT_SECRET: Secret = JWT_SECRET_ENV;

export function ensureAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }

  const [scheme, token] = auth.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authorization must be Bearer <token>" });
  }

  try {
    const payload = (jwt as any).default.verify(token, JWT_SECRET) as JwtPayload;
    
    const sub = payload.sub;
    if (!sub || typeof sub !== "string") {
      return res.status(401).json({ message: "Invalid token" });
    }

    const userId = Number(sub);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({ message: "Invalid token subject" });
    }

    req.userId = userId;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}