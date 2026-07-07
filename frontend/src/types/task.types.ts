import type { User } from "./auth.types";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";

export type Task = {
    id: number;
    title: string;
    description: string | null;
    status: TaskStatus;
    dueDate: string;
    ownerId: number;
    owner: User;
    actor?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type CreateTaskRequest = {
    title: string;
    description?: string;
    status?: TaskStatus;
    dueDate: string;
    ownerId?: number;
};

export type UpdateTaskRequest = Partial<CreateTaskRequest>;

export type TaskListResponse = {
    success: boolean;
    message: string;
    data: Task[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};