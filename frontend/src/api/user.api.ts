import { api } from "./api";
import type { UserListResponse } from "../types/user.types.ts";

export const getUsersApi = async (accessToken: string) => {
  const response = await api.get<UserListResponse>("/users", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};