import { api } from "./api";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../types/auth.types";

export const loginApi = async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
};

export const registerApi = async (data: RegisterRequest) => {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
};

export const refreshApi = async () => {
    const response = await api.post<AuthResponse>("/auth/refresh");
    return response.data;
};

export const logoutApi = async () => {
    const response = await api.post<AuthResponse>("/auth/logout");
    return response.data;
};

export const getMeApi = async (accessToken: string) => {
    const response = await api.get("/auth/me", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    return response.data;
};
