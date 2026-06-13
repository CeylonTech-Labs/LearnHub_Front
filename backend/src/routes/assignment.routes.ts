import { Router } from "express";
import { assignmentsByCourse, createAssignment, gradeSubmission, submitAssignment } from "../controllers/assignment.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { authorize } from "../middlewares/roles.js";
import { upload } from "../middlewares/upload.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const assignmentRoutes = Router();
assignmentRoutes.use(authenticate);
assignmentRoutes.post("/", authorize("SUPER_ADMIN", "ADMIN", "INSTRUCTOR"), asyncHandler(createAssignment));
assignmentRoutes.get("/course/:courseId", asyncHandler(assignmentsByCourse));
assignmentRoutes.post("/:assignmentId/submit", authorize("STUDENT"), upload.single("file"), asyncHandler(submitAssignment));
assignmentRoutes.patch("/submissions/:submissionId/grade", authorize("SUPER_ADMIN", "ADMIN", "INSTRUCTOR"), asyncHandler(gradeSubmission));
