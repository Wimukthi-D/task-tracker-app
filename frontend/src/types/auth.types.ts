export type Role = "USER" | "ADMIN";

export type User = {
    id: number;
    name: string;
    email: string;
    role: Role;
};

export type LoginRequest = {
    email: string;
    password: string;
};

export type RegisterRequest = {
    name: string;
    email: string;
    password: string;
};

export type AuthResponse = {
    success: boolean;
    message: string;
    data: {
        user: User;
        accessToken: string;
    };
};