import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

export interface ValidatedRequest extends Request {
  validatedQuery?: unknown;
  validatedParams?: unknown;
}

const sendValidationError = (res: Response, error: unknown) => {
  return res.status(400).json({
    success: false,
    message: "Validation error",
    errors: error,
  });
};

export const validateBody =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return sendValidationError(res, result.error.flatten());
    }

    req.body = result.data;
    next();
  };

export const validateQuery =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return sendValidationError(res, result.error.flatten());
    }

    (req as ValidatedRequest).validatedQuery = result.data;
    next();
  };

export const validateParams =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      return sendValidationError(res, result.error.flatten());
    }

    (req as ValidatedRequest).validatedParams = result.data;
    next();
  };

  export const validate = validateBody;