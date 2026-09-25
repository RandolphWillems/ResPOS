import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken, type AuthUser } from "./service.js";

export type AuthenticatedRequest = Request & {
  user?: AuthUser;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const token = authHeader.replace("Bearer ", "").trim();
    const user = verifyAccessToken(token);
    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRoles = req.user?.roles ?? [];

    if (!allowedRoles.some((role) => userRoles.includes(role))) {
      return res.status(403).json({ message: "You do not have access to this action." });
    }

    return next();
  };
}
