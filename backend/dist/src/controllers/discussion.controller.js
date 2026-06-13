import { prisma } from "../config/db.js";
import { created, ok } from "../utils/apiResponse.js";
export async function listDiscussions(req, res) {
    return ok(res, await prisma.discussion.findMany({
        where: { courseId: req.params.courseId },
        include: { user: true, replies: { include: { user: true } } },
        orderBy: { createdAt: "desc" }
    }));
}
export async function createDiscussion(req, res) {
    return created(res, await prisma.discussion.create({ data: { ...req.body, userId: req.user.id } }), "Discussion created");
}
export async function replyDiscussion(req, res) {
    return created(res, await prisma.discussionReply.create({ data: { discussionId: req.params.id, userId: req.user.id, message: req.body.message } }), "Reply posted");
}
export async function deleteDiscussion(req, res) {
    await prisma.discussion.delete({ where: { id: req.params.id } });
    return ok(res, null, "Discussion deleted");
}
