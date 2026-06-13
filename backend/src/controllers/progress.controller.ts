import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { ok } from "../utils/apiResponse.js";

export async function completeLesson(req: Request, res: Response) {
  const lesson = await prisma.lesson.findUniqueOrThrow({ where: { id: req.body.lessonId } });
  const progress = await prisma.progress.upsert({
    where: { userId_lessonId: { userId: req.user!.id, lessonId: lesson.id } },
    update: { isCompleted: true, completedAt: new Date(), lastAccessedAt: new Date() },
    create: { userId: req.user!.id, courseId: lesson.courseId, lessonId: lesson.id, isCompleted: true, completedAt: new Date() }
  });
  const [completed, total] = await Promise.all([
    prisma.progress.count({ where: { userId: req.user!.id, courseId: lesson.courseId, isCompleted: true } }),
    prisma.lesson.count({ where: { courseId: lesson.courseId } })
  ]);
  const percentage = total ? Math.round((completed / total) * 100) : 0;
  await prisma.enrollment.updateMany({
    where: { userId: req.user!.id, courseId: lesson.courseId },
    data: { progressPercentage: percentage, completedAt: percentage === 100 ? new Date() : null, status: percentage === 100 ? "COMPLETED" : "ACTIVE" }
  });
  return ok(res, { progress, percentage }, "Lesson completed");
}

export async function courseProgress(req: Request, res: Response) {
  return ok(
    res,
    await prisma.progress.findMany({
      where: { userId: req.user!.id, courseId: req.params.courseId },
      include: { lesson: true },
      orderBy: { lastAccessedAt: "desc" }
    })
  );
}
