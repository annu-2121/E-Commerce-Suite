import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../lib/logger";

const SECRET = process.env.SESSION_SECRET ?? "dev-secret";

export interface JwtPayload {
  userId: number;
  role: "admin" | "user";
}

declare global {
  namespace Express {
    interface Request {
      jwtPayload?: JwtPayload;
    }
  }
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, SECRET) as JwtPayload;
    req.jwtPayload = payload;
    next();
  } catch {
    logger.warn("Invalid token");
    res.status(401).json({ error: "Unauthorized" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.jwtPayload) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (req.jwtPayload.role !== "admin") {
    res.status(403).json({ error: "Forbidden: admin only" });
    return;
  }
  next();
}
