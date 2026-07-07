import { api } from "./api";
import type { User } from "../types/auth.types";

type UsersResponse = {
  success: boolean;
  message: string;
  data: User[];
};

export const getUsersApi = async (accessToken: string) => {
  const response = await api.get<UsersResponse>("/users", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};