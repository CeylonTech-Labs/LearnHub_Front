import { prisma } from "../config/db.js";
import { created, ok } from "../utils/apiResponse.js";
export async function listReviews(req, res) {
    return ok(res, await prisma.review.findMany({ where: req.query.courseId ? { courseId: String(req.query.courseId) } : {}, include: { user: true, course: true } }));
}
export async function upsertReview(req, res) {
    const review = await prisma.review.upsert({
        where: { userId_courseId: { userId: req.user.id, courseId: req.body.courseId } },
        update: { rating: req.body.rating, comment: req.body.comment },
        create: { userId: req.user.id, courseId: req.body.courseId, rating: req.body.rating, comment: req.body.comment }
    });
    return created(res, review, "Review saved");
}
export async function deleteReview(req, res) {
    await prisma.review.delete({ where: { id: req.params.id } });
    return ok(res, null, "Review deleted");
}
