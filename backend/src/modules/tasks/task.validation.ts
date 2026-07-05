import { date, z } from "zod";

const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]);

const dueDateSchema = z
    .string()
    .min(1, "Due date is required")
    .refine((date) => !Number.isNaN(Date.parse(date)), {
        message: "Invalid date format",
    });

export const createTaskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(2, "Description must be at least 2 characters long"),
    status: taskStatusSchema.optional(),
    dueDate: dueDateSchema.optional(),
    ownerId: z.number().int().positive().optional(),
});

export const updateTaskSchema = z.object({
    title: z.string().min(1, "Title is required").optional(),
    description: z.string().min(2, "Description must be at least 2 characters long").optional(),
    status: taskStatusSchema.optional(),
    dueDate: dueDateSchema.optional(),
    ownerId: z.number().int().positive().optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
});

export const taskIdParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export const taskListQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    status: taskStatusSchema.optional(),
    ownerId: z.coerce.number().int().positive().optional(),
});