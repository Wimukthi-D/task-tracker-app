import type { Request, Response, NextFunction } from "express";
import { loginUser,registerUser } from "./auth.service.js";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await loginUser(req.body);

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};