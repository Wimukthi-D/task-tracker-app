import { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

type Role = "USER" | "ADMIN";

type SocketUser = {
    id: number;
    role: Role;
};

type AccessTokenPayload = jwt.JwtPayload & {
    userId: number | string;
    id?: number | string;
    email?: string;
    role?: Role;
};

type TaskEventPayload = {
    id: number;
    title: string;
    actor: string;
    description: string | null;
    status: string;
    dueDate: Date;
    ownerId: number;
    owner?: unknown;
};

type TaskDeletedEventPayload = {
    id: number;
    title: string;
    ownerId: number;
    actor: string;
};

type ServerToClientEvents = {
    "task:created": (payload: TaskEventPayload) => void;
    "task:updated": (payload: TaskEventPayload) => void;
    "task:deleted": (payload: TaskDeletedEventPayload) => void;
};

type ClientToServerEvents = Record<string, never>;
type InterServerEvents = Record<string, never>;

type SocketData = {
    user: SocketUser;
};

let io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>;

const userRoom = (userId: number) => `user:${userId}`;
const adminRoom = "admins";

export const initSocket = (server: HttpServer) => {
    io = new Server<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            credentials: true,
            methods: ["GET", "POST"],
        },
    });

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if (!token || typeof token !== "string") {
                return next(new Error("Authentication required"));
            }

            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as AccessTokenPayload;

            const userId = Number(decoded.userId ?? decoded.id ?? decoded.sub);
            const role = decoded.role;

            if (!userId || !role) {
                return next(new Error("Invalid token payload"));
            }

            socket.data.user = { id: userId, role };

            next();
        }
        catch (error) {
            next(new Error("Invalid or expired token"));
        }
    });

    io.on("connection", (socket) => {
        const { id: userId, role } = socket.data.user;

        socket.join(userRoom(userId));

        if (role === "ADMIN") {
            socket.join(adminRoom);
        }

        console.log(`Socket connected: user=${userId}, role=${role}`);

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: user=${userId}, role=${role}`);
        });
    });
    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized.");
    }
    return io;
}

export const emitTaskCreated = (task: TaskEventPayload) => {
    if (!io) {
        return;
    }

    io.to(userRoom(task.ownerId))
        .to(adminRoom)
        .emit("task:created", task);
};

export const emitTaskUpdated = (task: TaskEventPayload) => {
    if (!io) {
        return;
    }

    io.to(userRoom(task.ownerId))
        .to(adminRoom)
        .emit("task:updated", task);
};

export const emitTaskDeleted = (task: TaskDeletedEventPayload) => {
    if (!io) {
        return;
    }

    io.to(userRoom(task.ownerId))
        .to(adminRoom)
        .emit("task:deleted", task);
};