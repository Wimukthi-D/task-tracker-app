import { io } from "socket.io-client";

console.log("Socket test client started...");

const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c2VyMUBleGFtcGxlLmNvbSIsInJvbGUiOiJVU0VSIiwic2Vzc2lvbklkIjoxMSwiaWF0IjoxNzgzMzI2ODU0LCJleHAiOjE3ODMzMjc3NTR9.xOPZhpjR8SwHUzfjmJS_uQ3tp7qeWEnf6yFhRWTQuMk";

if (!accessToken) {
    console.error("Please paste a valid access token first.");
    process.exit(1);
}

const socket = io("http://localhost:5001", {
    auth: {
        token: accessToken,
    },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

socket.on("connect", () => {
    console.log("Connected to Socket.IO server");
    console.log("Socket ID:", socket.id);
});

socket.on("connect_error", (error) => {
    console.error("Connection error:", error.message);
});

socket.on("disconnect", (reason) => {
    console.log("Disconnected:", reason);
});

socket.on("task:created", (task) => {
    console.log("task:created received:");
    console.log(task);
});

socket.on("task:updated", (task) => {
    console.log("task:updated received:");
    console.log(task);
});

socket.on("task:deleted", (payload) => {
    console.log("task:deleted received:");
    console.log(payload);
});

// Keeps the Node process alive while listening
setInterval(() => {
    console.log("Listening for task events...");
}, 10000);

process.on("SIGINT", () => {
    console.log("Closing socket client...");
    socket.disconnect();
    process.exit(0);
});