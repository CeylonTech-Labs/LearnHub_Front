import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { created, ok } from "../utils/apiResponse.js";

export async function enroll(req: Request, res: Response) {
  const course = await prisma.course.findUniqueOrThrow({ where: { id: req.body.courseId } });
  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: req.user!.id, courseId: course.id } },
    update: { status: "ACTIVE" },
    create: { userId: req.user!.id, courseId: course.id }
  });
  await prisma.notification.create({
    data: {
      userId: course.instructorId,
      title: "New enrollment",
      message: `${req.user!.email} enrolled in ${course.title}`,
      type: "ENROLLMENT"
    }
  });
  return created(res, enrollment, "Enrolled successfully");
}

export async function myCourses(req: Request, res: Response) {
  return ok(
    res,
    await prisma.enrollment.findMany({
      where: { userId: req.user!.id },
      include: { course: { include: { category: true, instructor: { select: { firstName: true, lastName: true } } } } },
      orderBy: { enrolledAt: "desc" }
    })
  );
}

export async function courseEnrollments(req: Request, res: Response) {
  return ok(res, await prisma.enrollment.findMany({ where: { courseId: req.params.courseId }, include: { user: true } }));
}
