import { api } from "./api";
import type {
  CreateTaskRequest,
  Task,
  TaskListResponse,
  TaskStatus,
  UpdateTaskRequest,
} from "../types/task.types";

type GetTasksParams = {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  ownerId?: number;
};

export const getTasksApi = async (
  accessToken: string,
  params: GetTasksParams
) => {
  const response = await api.get<TaskListResponse>("/tasks", {
    params,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

export const getTaskByIdApi = async (accessToken: string, id: number) => {
  const response = await api.get<{ success: boolean; data: Task }>(
    `/tasks/${id}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};

export const createTaskApi = async (
  accessToken: string,
  data: CreateTaskRequest
) => {
  const response = await api.post<{ success: boolean; data: Task }>(
    "/tasks",
    data,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};

export const updateTaskApi = async (
  accessToken: string,
  id: number,
  data: UpdateTaskRequest
) => {
  const response = await api.patch<{ success: boolean; data: Task }>(
    `/tasks/${id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};

export const deleteTaskApi = async (accessToken: string, id: number) => {
  const response = await api.delete<{ success: boolean; data: Task }>(
    `/tasks/${id}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};