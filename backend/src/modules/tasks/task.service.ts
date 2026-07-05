import prisma from "../../config/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";
import type { TaskStatus } from "../../generated/prisma/client.js";

type AuthUser = {
    id: number;
    email: string;
    role: string;
    sessionId: number;
};

type CreateTaskInput = {
    title: string;
    description?: string;
    status?: TaskStatus;
    dueDate: string;
    ownerId?: number
};

type UpdateTaskInput = {
    title?: string;
    description?: string;
    status?: TaskStatus;
    dueDate?: string;
    ownerId?: number;
};

type TaskListQuery = {
    page: number;
    limit: number;
    status?: TaskStatus;
    ownerId?: number;
};

const taskInclude = {
    owner: {
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    },
};

const ensureOwnerExists = async (ownerId: number) => {
    const owner = await prisma.user.findUnique({
        where: {
            id: ownerId,
        },
    });

    if (!owner) {
        throw new AppError("Task owner not found", 404);
    }
};

const ensureTaskAccess = (task: { ownerId: number }, user: AuthUser) => {
    if (user.role !== "ADMIN" && task.ownerId !== user.id) {
        throw new AppError("Forbidden: you cannot access this task", 403);
    }
};

export const createTaskService = async (
    data: CreateTaskInput,
    user: AuthUser
) => {
    if (user.role !== "ADMIN" && data.ownerId && data.ownerId !== user.id) {
        throw new AppError("Forbidden: users can only create tasks for themselves", 403);
    }

    const ownerId = user.role === "ADMIN" && data.ownerId ? data.ownerId : user.id;

    await ensureOwnerExists(ownerId);

    const task = await prisma.task.create({
        data: {
            title: data.title,
            description: data.description ?? "",
            status: data.status || "TODO",
            dueDate: new Date(data.dueDate),
            ownerId,
        },
        include: taskInclude,
    });

    return task;
};

export const getTasksService = async (
  query: TaskListQuery,
  user: AuthUser
) => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const where: {
    status?: TaskStatus;
    ownerId?: number;
  } = {};

  if (query.status) {
    where.status = query.status;
  }

  if (user.role === "ADMIN") {
    if (query.ownerId) {
      await ensureOwnerExists(query.ownerId);
      where.ownerId = query.ownerId;
    }
  } else {
    if (query.ownerId && query.ownerId !== user.id) {
      throw new AppError("Forbidden: users can only filter their own tasks", 403);
    }

    where.ownerId = user.id;
  }

  const [tasks, totalItems] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: taskInclude,
    }),
    prisma.task.count({
      where,
    }),
  ]);

  return {
    tasks,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  };
};

export const getTaskByIdService = async (id: number, user: AuthUser) => {
    const task = await prisma.task.findUnique({
        where: {
            id,
        },
        include: taskInclude,
    });

    if (!task) {
        throw new AppError("Task not found", 404);
    }

    ensureTaskAccess(task, user);

    return task;
};

export const updateTaskService = async (
    id: number,
    data: UpdateTaskInput,
    user: AuthUser
) => {
    const existingTask = await prisma.task.findUnique({
        where: {
            id,
        },
    });

    if (!existingTask) {
        throw new AppError("Task not found", 404);
    }

    ensureTaskAccess(existingTask, user);

    let ownerId = existingTask.ownerId;

    if (data.ownerId) {
        if (user.role !== "ADMIN") {
            throw new AppError("Only admins can change task owner", 403);
        }

        await ensureOwnerExists(data.ownerId);
        ownerId = data.ownerId;
    }

    const updatedTask = await prisma.task.update({
        where: {
            id,
        },
        data: {
            ...(data.title ? { title: data.title } : {}),
            ...(data.description ? { description: data.description } : {}),
            ...(data.status ? { status: data.status } : {}),
            ...(data.dueDate ? { dueDate: new Date(data.dueDate) } : {}),
            ownerId,
        },
        include: taskInclude,
    });

    return updatedTask;
};

export const deleteTaskService = async (id: number, user: AuthUser) => {
    const existingTask = await prisma.task.findUnique({
        where: {
            id,
        },
    });

    if (!existingTask) {
        throw new AppError("Task not found", 404);
    }

    ensureTaskAccess(existingTask, user);

    await prisma.task.delete({
        where: {
            id,
        },
    });
};