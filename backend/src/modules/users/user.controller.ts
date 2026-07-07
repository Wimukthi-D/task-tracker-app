import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import { getUserNameList } from "./user.service.js";

export const getUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const users = await getUserNameList();

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};