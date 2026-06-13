import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { created, ok } from "../utils/apiResponse.js";

export async function createAssignment(req: Request, res: Response) {
  return created(res, await prisma.assignment.create({ data: { ...req.body, dueDate: new Date(req.body.dueDate) } }), "Assignment created");
}

export async function assignmentsByCourse(req: Request, res: Response) {
  return ok(res, await prisma.assignment.findMany({ where: { courseId: req.params.courseId }, include: { submissions: true } }));
}

export async function submitAssignment(req: Request, res: Response) {
  const submission = await prisma.assignmentSubmission.upsert({
    where: { assignmentId_userId: { assignmentId: req.params.assignmentId, userId: req.user!.id } },
    update: {
      submissionText: req.body.submissionText,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl,
      submittedAt: new Date()
    },
    create: {
      assignmentId: req.params.assignmentId,
      userId: req.user!.id,
      submissionText: req.body.submissionText,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl
    }
  });
  return created(res, submission, "Assignment submitted");
}

export async function gradeSubmission(req: Request, res: Response) {
  const submission = await prisma.assignmentSubmission.update({
    where: { id: req.params.submissionId },
    data: { grade: req.body.grade, feedback: req.body.feedback },
    include: { assignment: true }
  });
  await prisma.notification.create({
    data: {
      userId: submission.userId,
      title: "Assignment graded",
      message: `${submission.assignment.title} has been graded`,
      type: "ASSIGNMENT_GRADED"
    }
  });
  return ok(res, submission, "Submission graded");
}
