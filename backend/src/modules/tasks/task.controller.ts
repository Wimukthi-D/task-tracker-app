import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import {
  createTaskService,
  deleteTaskService,
  getTaskByIdService,
  getTasksService,
  updateTaskService,
} from "./task.service.js";
import type { ValidatedRequest } from "../../middlewares/validate.middleware.js";

export const createTask = async (
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

    const task = await createTaskService(req.body, req.user);

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (
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

    const validatedReq = req as AuthRequest & ValidatedRequest;

    const result = await getTasksService(
      validatedReq.validatedQuery as never,
      req.user
    );

    res.status(200).json({
      success: true,
      message: "Tasks retrieved successfully",
      data: result.tasks,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (
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

    const validatedReq = req as AuthRequest & ValidatedRequest;
    const params = validatedReq.validatedParams as { id: number };

    const task = await getTaskByIdService(params.id, req.user);

    res.status(200).json({
      success: true,
      message: "Task retrieved successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
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

    const validatedReq = req as AuthRequest & ValidatedRequest;
    const params = validatedReq.validatedParams as { id: number };

    const task = await updateTaskService(
      params.id,
      req.body,
      req.user
    );

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
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

    const validatedReq = req as AuthRequest & ValidatedRequest;
    const params = validatedReq.validatedParams as { id: number };

    await deleteTaskService(params.id, req.user);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};