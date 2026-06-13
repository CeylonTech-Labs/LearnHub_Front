import { Router } from "express";
import { createQuiz, quizzesByCourse, startAttempt, submitAttempt } from "../controllers/quiz.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { authorize } from "../middlewares/roles.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const quizRoutes = Router();
quizRoutes.use(authenticate);
quizRoutes.post("/", authorize("SUPER_ADMIN", "ADMIN", "INSTRUCTOR"), asyncHandler(createQuiz));
quizRoutes.get("/course/:courseId", asyncHandler(quizzesByCourse));
quizRoutes.post("/:quizId/attempt", authorize("STUDENT"), asyncHandler(startAttempt));
quizRoutes.post("/:quizId/submit", authorize("STUDENT"), asyncHandler(submitAttempt));
