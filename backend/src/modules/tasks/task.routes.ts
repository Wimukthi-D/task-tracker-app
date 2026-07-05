import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate.middleware.js";
import { createTask, deleteTask, getTaskById, getTasks, updateTask } from "./task.controller.js";
import { createTaskSchema, taskIdParamSchema, taskListQuerySchema, updateTaskSchema } from "./task.validation.js";

const router = Router();

router.use(authenticate);

router.post("/", validateBody(createTaskSchema), createTask);
router.get("/", validateQuery(taskListQuerySchema), getTasks);
router.get("/:id", validateParams(taskIdParamSchema), getTaskById);
router.patch("/:id", validateParams(taskIdParamSchema), validateBody(updateTaskSchema), updateTask);
router.delete("/:id", validateParams(taskIdParamSchema), deleteTask);

export default router;