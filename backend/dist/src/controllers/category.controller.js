import { prisma } from "../config/db.js";
import { created, ok } from "../utils/apiResponse.js";
import { toSlug } from "../utils/slug.js";
export async function listCategories(_req, res) {
    return ok(res, await prisma.category.findMany({ include: { _count: { select: { courses: true } } }, orderBy: { name: "asc" } }));
}
export async function getCategory(req, res) {
    return ok(res, await prisma.category.findUniqueOrThrow({ where: { id: req.params.id }, include: { courses: true } }));
}
export async function createCategory(req, res) {
    return created(res, await prisma.category.create({ data: { ...req.body, slug: toSlug(req.body.name) } }), "Category created");
}
export async function updateCategory(req, res) {
    const data = { ...req.body };
    if (data.name)
        data.slug = toSlug(data.name);
    return ok(res, await prisma.category.update({ where: { id: req.params.id }, data }), "Category updated");
}
export async function deleteCategory(req, res) {
    await prisma.category.delete({ where: { id: req.params.id } });
    return ok(res, null, "Category deleted");
}
