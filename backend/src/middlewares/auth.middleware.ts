import type { NextFunction, Request, Response } from "express";
import { AppError } from "./error.middleware.js";
import { verifyToken } from "../utils/jwt.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Unauthorized: No token provided", 401));
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next(new AppError("Unauthorized: Invalid token format", 401));
    }

    const decoded = verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError("Unauthorized: Invalid or expired token", 401));
  }
};