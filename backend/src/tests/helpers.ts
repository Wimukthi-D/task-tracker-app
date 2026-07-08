import request from "supertest";
import app from "../app.js";

type TestUserRole = "USER" | "ADMIN";

export const testPassword = "password123";

const getCookies = (setCookieHeader: string | string[] | undefined): string[] => {
    if (!setCookieHeader) {
        return [];
    }

    return Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
};

export const registerTestUser = async (
    role: TestUserRole = "USER",
    override?: Partial<{
        name: string;
        email: string;
        password: string;
    }>
) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100000);

    const payload = {
        name: override?.name ?? `${role} Test User`,
        email:
            override?.email ??
            `${role.toLowerCase()}-${timestamp}-${random}@test.com`,
        password: override?.password ?? testPassword,
        role,
    };

    const response = await request(app).post("/api/auth/register").send(payload);

    return {
        response,
        user: response.body.data?.user,
        accessToken: response.body.data?.accessToken as string,
        payload,
        cookies: getCookies(response.headers["set-cookie"]),
    };
};

export const loginTestUser = async (email: string, password = testPassword) => {
    const response = await request(app).post("/api/auth/login").send({
        email,
        password,
    });

    return {
        response,
        user: response.body.data?.user,
        accessToken: response.body.data?.accessToken as string,
        cookies: getCookies(response.headers["set-cookie"]),
    };
};

export const authHeader = (token: string) => {
    return {
        Authorization: `Bearer ${token}`,
    };
};

export const createTaskPayload = (
    override?: Partial<{
        title: string;
        description: string;
        status: "TODO" | "IN_PROGRESS" | "COMPLETED";
        dueDate: string;
        ownerId: number;
    }>
) => {
    return {
        title: override?.title ?? "Test Task",
        description: override?.description ?? "Test task description",
        status: override?.status ?? "TODO",
        dueDate: override?.dueDate ?? "2026-12-31",
        ...(override?.ownerId ? { ownerId: override.ownerId } : {}),
    };
};