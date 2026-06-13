import { Router } from "express";
import { changeOwnPassword, forgot, login, logout, me, register, reset, updateProfile, verify } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { changePasswordSchema, forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "../validators/auth.validator.js";

export const authRoutes = Router();

authRoutes.post("/register", validate(registerSchema), asyncHandler(register));
authRoutes.post("/login", validate(loginSchema), asyncHandler(login));
authRoutes.post("/logout", asyncHandler(logout));
authRoutes.post("/forgot-password", validate(forgotPasswordSchema), asyncHandler(forgot));
authRoutes.post("/reset-password", validate(resetPasswordSchema), asyncHandler(reset));
authRoutes.get("/verify-email", asyncHandler(verify));
authRoutes.get("/me", authenticate, asyncHandler(me));
authRoutes.put("/profile", authenticate, asyncHandler(updateProfile));
authRoutes.patch("/change-password", authenticate, validate(changePasswordSchema), asyncHandler(changeOwnPassword));
