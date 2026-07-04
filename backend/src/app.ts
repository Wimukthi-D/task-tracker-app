import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Task Tracker API is running",
  });
});

app.use("/api/auth", authRoutes);

app.use(errorMiddleware);

export default app;