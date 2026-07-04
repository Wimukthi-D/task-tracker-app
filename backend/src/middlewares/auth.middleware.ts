import type { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "./error.middleware.js";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    sessionId: number;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication token is required", 401);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new AppError("Authentication token is required", 401);
    }

    const decoded = verifyAccessToken(token);

    const session = await prisma.authSession.findUnique({
      where: {
        id: decoded.sessionId,
      },
    });

    if (!session) {
      throw new AppError("Session not found", 401);
    }

    if (session.userId !== decoded.id) {
      throw new AppError("Invalid token session", 401);
    }

    if (session.revokedAt) {
      throw new AppError("Session has been logged out", 401);
    }

    if (session.expiresAt < new Date()) {
      throw new AppError("Session has expired", 401);
    }

    req.user = decoded;

    next();
  } catch (error) {
    next(error);
  }
};