import { io, type Socket } from "socket.io-client";
import type { Task } from "../types/task.types";

type TaskDeletedPayload = {
    id: number;
    ownerId: number;
    actor: string;
};

type ServerToClientEvents = {
    "task:created": (task: Task) => void;
    "task:updated": (task: Task) => void;
    "task:deleted": (payload: TaskDeletedPayload) => void;
};

type ClientToServerEvents = Record<string, never>;

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export const connectSocket = (accessToken: string) => {
    if (socket?.connected) {
        return socket;
    }

    socket = io(import.meta.env.VITE_SOCKET_URL, {
        auth: {
            token: accessToken,
        },
    });
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};