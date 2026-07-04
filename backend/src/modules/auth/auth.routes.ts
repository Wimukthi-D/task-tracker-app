import { Router } from "express";
import {
  getMe,
  login,
  logout,
  logoutAll,
  refreshToken,
  register,
} from "./auth.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { loginSchema, registerSchema } from "./auth.validation.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.post("/logout-all", authenticate, logoutAll);
router.get("/me", authenticate, getMe);

export default router;