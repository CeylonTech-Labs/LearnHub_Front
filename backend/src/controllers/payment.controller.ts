import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { created, ok } from "../utils/apiResponse.js";

export async function createPayment(req: Request, res: Response) {
  const course = await prisma.course.findUniqueOrThrow({ where: { id: req.body.courseId } });
  const amount = req.body.amount ?? course.discountPrice ?? course.price;
  const payment = await prisma.payment.create({
    data: {
      userId: req.user!.id,
      courseId: course.id,
      amount,
      currency: req.body.currency ?? "USD",
      paymentMethod: req.body.paymentMethod ?? "manual-placeholder",
      paymentStatus: amount === 0 ? "SUCCESS" : "PENDING",
      transactionId: req.body.transactionId,
      paidAt: amount === 0 ? new Date() : undefined
    }
  });
  return created(res, payment, "Payment initialized");
}

export async function myPayments(req: Request, res: Response) {
  return ok(res, await prisma.payment.findMany({ where: { userId: req.user!.id }, include: { course: true }, orderBy: { createdAt: "desc" } }));
}

export async function listPayments(_req: Request, res: Response) {
  return ok(res, await prisma.payment.findMany({ include: { user: true, course: true }, orderBy: { createdAt: "desc" } }));
}
