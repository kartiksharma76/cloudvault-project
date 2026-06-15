import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as { userId: string };
    (req as Request & { userId: string }).userId = payload.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
}

export function getUserId(req: Request): string {
  return (req as Request & { userId: string }).userId;
}
