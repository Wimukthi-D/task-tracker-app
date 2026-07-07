import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { getUsers } from "./user.controller.js";

const router = Router();

router.get("/", authenticate, getUsers);

export default router;