import type { Request, Response, NextFunction } from "express";
import { AppError } from "./error.middleware.js";
import type { AuthRequest } from "./auth.middleware.js";

export const authorizedRoles = (...roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError("Unauthorized: User not authenticated", 401));
  }

  if (!roles.includes(req.user.role)) {
    return next(new AppError("Forbidden: You do not have permission to access this resource", 403));
  }

  next();
};