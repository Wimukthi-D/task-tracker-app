import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";

export const validate =
  (schema: z.ZodType) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: result.error.flatten(),
      });
    }

    next();
  };