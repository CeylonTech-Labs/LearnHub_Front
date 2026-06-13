import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { ok } from "../utils/apiResponse.js";

export async function myNotifications(req: Request, res: Response) {
  return ok(res, await prisma.notification.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: "desc" } }));
}

export async function markRead(req: Request, res: Response) {
  return ok(res, await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true } }), "Notification read");
}
