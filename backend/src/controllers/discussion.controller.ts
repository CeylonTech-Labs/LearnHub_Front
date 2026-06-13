import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { created, ok } from "../utils/apiResponse.js";

export async function listDiscussions(req: Request, res: Response) {
  return ok(
    res,
    await prisma.discussion.findMany({
      where: { courseId: req.params.courseId },
      include: { user: true, replies: { include: { user: true } } },
      orderBy: { createdAt: "desc" }
    })
  );
}

export async function createDiscussion(req: Request, res: Response) {
  return created(res, await prisma.discussion.create({ data: { ...req.body, userId: req.user!.id } }), "Discussion created");
}

export async function replyDiscussion(req: Request, res: Response) {
  return created(res, await prisma.discussionReply.create({ data: { discussionId: req.params.id, userId: req.user!.id, message: req.body.message } }), "Reply posted");
}

export async function deleteDiscussion(req: Request, res: Response) {
  await prisma.discussion.delete({ where: { id: req.params.id } });
  return ok(res, null, "Discussion deleted");
}
