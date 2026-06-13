import { Router } from "express";
import { completeLesson, courseProgress } from "../controllers/progress.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
export const progressRoutes = Router();
progressRoutes.use(authenticate);
progressRoutes.post("/complete-lesson", asyncHandler(completeLesson));
progressRoutes.get("/:courseId", asyncHandler(courseProgress));
