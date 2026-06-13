import { prisma } from "../config/db.js";
import { ok } from "../utils/apiResponse.js";
export async function analytics(_req, res) {
    const [users, courses, enrollments, revenue, popularCourses, recentUsers, recentCourses] = await Promise.all([
        prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
        prisma.course.count(),
        prisma.enrollment.count(),
        prisma.payment.aggregate({ where: { paymentStatus: "SUCCESS" }, _sum: { amount: true } }),
        prisma.course.findMany({
            take: 5,
            include: { _count: { select: { enrollments: true } }, instructor: true },
            orderBy: { enrollments: { _count: "desc" } }
        }),
        prisma.user.findMany({ take: 8, orderBy: { createdAt: "desc" } }),
        prisma.course.findMany({ take: 8, orderBy: { createdAt: "desc" }, include: { instructor: true } })
    ]);
    return ok(res, {
        users,
        totalCourses: courses,
        totalEnrollments: enrollments,
        totalRevenue: revenue._sum.amount ?? 0,
        popularCourses,
        recentUsers,
        recentCourses,
        monthlyEnrollments: [],
        completionRate: 0
    });
}
