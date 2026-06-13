import { prisma } from "../config/db.js";
import { created, ok, pagination } from "../utils/apiResponse.js";
import { toSlug } from "../utils/slug.js";
export async function listCourses(req, res) {
    const { page, limit, skip } = pagination(req.query);
    const where = {
        ...(req.query.search ? { title: { contains: String(req.query.search) } } : {}),
        ...(req.query.categoryId ? { categoryId: String(req.query.categoryId) } : {}),
        ...(req.query.level ? { level: String(req.query.level) } : {}),
        ...(req.query.price === "free" ? { price: 0 } : {}),
        ...(req.query.price === "paid" ? { price: { gt: 0 } } : {})
    };
    const orderBy = req.query.sort === "price-low"
        ? { price: "asc" }
        : req.query.sort === "price-high"
            ? { price: "desc" }
            : req.query.sort === "popular"
                ? { enrollments: { _count: "desc" } }
                : { createdAt: "desc" };
    const [courses, total] = await Promise.all([
        prisma.course.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            include: {
                category: true,
                instructor: { select: { id: true, firstName: true, lastName: true, profileImage: true } },
                _count: { select: { enrollments: true, reviews: true } },
                reviews: { select: { rating: true } }
            }
        }),
        prisma.course.count({ where })
    ]);
    return ok(res, courses, "Courses fetched", { page, limit, total, totalPages: Math.ceil(total / limit) });
}
export async function getCourse(req, res) {
    const course = await prisma.course.findUniqueOrThrow({
        where: { slug: req.params.slug },
        include: {
            category: true,
            instructor: { select: { id: true, firstName: true, lastName: true, profileImage: true } },
            sections: { orderBy: { orderNumber: "asc" }, include: { lessons: { orderBy: { orderNumber: "asc" } } } },
            quizzes: { include: { questions: { include: { options: true } } } },
            assignments: true,
            reviews: { include: { user: { select: { firstName: true, lastName: true, profileImage: true } } } }
        }
    });
    return ok(res, course);
}
export async function createCourse(req, res) {
    const course = await prisma.course.create({
        data: {
            ...req.body,
            slug: `${toSlug(req.body.title)}-${Date.now().toString(36)}`,
            instructorId: req.user.id,
            learningOutcomes: req.body.learningOutcomes ?? [],
            prerequisites: req.body.prerequisites ?? [],
            tags: req.body.tags ?? []
        }
    });
    return created(res, course, "Course created");
}
export async function updateCourse(req, res) {
    const data = { ...req.body };
    if (data.title)
        data.slug = `${toSlug(data.title)}-${Date.now().toString(36)}`;
    const course = await prisma.course.update({ where: { id: req.params.id }, data });
    return ok(res, course, "Course updated");
}
export async function deleteCourse(req, res) {
    await prisma.course.update({ where: { id: req.params.id }, data: { status: "ARCHIVED" } });
    return ok(res, null, "Course archived");
}
export async function publishCourse(req, res) {
    const course = await prisma.course.update({ where: { id: req.params.id }, data: { status: "PUBLISHED" } });
    return ok(res, course, "Course published");
}
export async function createSection(req, res) {
    return created(res, await prisma.section.create({ data: req.body }), "Section created");
}
export async function updateSection(req, res) {
    return ok(res, await prisma.section.update({ where: { id: req.params.id }, data: req.body }), "Section updated");
}
export async function deleteSection(req, res) {
    await prisma.section.delete({ where: { id: req.params.id } });
    return ok(res, null, "Section deleted");
}
export async function createLesson(req, res) {
    return created(res, await prisma.lesson.create({ data: req.body }), "Lesson created");
}
export async function updateLesson(req, res) {
    return ok(res, await prisma.lesson.update({ where: { id: req.params.id }, data: req.body }), "Lesson updated");
}
export async function deleteLesson(req, res) {
    await prisma.lesson.delete({ where: { id: req.params.id } });
    return ok(res, null, "Lesson deleted");
}
export async function uploadAsset(req, res) {
    return ok(res, { url: `/uploads/${req.file?.filename}` }, "File uploaded");
}
