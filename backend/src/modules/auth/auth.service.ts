import bcrypt from "bcryptjs";
import prisma from "../../config/prisma.js";
import { generateToken } from "../../utils/jwt.js";
import { AppError } from "../../middlewares/error.middleware.js";

type RegisterInput = {
    name: string;
    email: string;
    password: string;
    role?: "USER" | "ADMIN";
};

type LoginInput = {
    email: string;
    password: string;
};

export const registerUser = async (data: RegisterInput) => {
    const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
    });

    if (existingUser) {
        throw new AppError("Email already in use", 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: data.role || "USER",
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return { user, token };
};

export const loginUser = async (data: LoginInput) => {
    const user = await prisma.user.findUnique({
        where: { email: data.email },
    });

    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
        throw new AppError("Invalid email or password", 401);
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return {
        user: {
            id: user.id,
            name: user.name,
            role: user.role,
        }, token
    };
};