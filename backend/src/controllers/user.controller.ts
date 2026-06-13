import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { created, ok, pagination } from "../utils/apiResponse.js";

const select = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  profileImage: true,
  role: true,
  status: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true
};

export async function listUsers(req: Request, res: Response) {
  const { page, limit, skip } = pagination(req.query);
  const where = {
    ...(req.query.role ? { role: String(req.query.role) as never } : {}),
    ...(req.query.status ? { status: String(req.query.status) as never } : {}),
    ...(req.query.search
      ? {
          OR: [
            { firstName: { contains: String(req.query.search) } },
            { lastName: { contains: String(req.query.search) } },
            { email: { contains: String(req.query.search) } }
          ]
        }
      : {})
  };
  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, select, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.user.count({ where })
  ]);
  return ok(res, users, "Users fetched", { page, limit, total, totalPages: Math.ceil(total / limit) });
}

export async function getUser(req: Request, res: Response) {
  return ok(res, await prisma.user.findUniqueOrThrow({ where: { id: req.params.id }, select }));
}

export async function createUser(req: Request, res: Response) {
  const user = await prisma.user.create({
    data: { ...req.body, password: await bcrypt.hash(req.body.password ?? "Password@123", 12), emailVerified: true },
    select
  });
  return created(res, user, "User created");
}

export async function updateUser(req: Request, res: Response) {
  const data = { ...req.body };
  if (data.password) data.password = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.update({ where: { id: req.params.id }, data, select });
  return ok(res, user, "User updated");
}

export async function deleteUser(req: Request, res: Response) {
  await prisma.user.update({ where: { id: req.params.id }, data: { status: "SUSPENDED" } });
  return ok(res, null, "User deactivated");
}

export async function activity(req: Request, res: Response) {
  const [enrollments, attempts, submissions, certificates] = await Promise.all([
    prisma.enrollment.findMany({ where: { userId: req.params.id }, include: { course: true }, take: 10 }),
    prisma.quizAttempt.findMany({ where: { userId: req.params.id }, include: { quiz: true }, take: 10 }),
    prisma.assignmentSubmission.findMany({ where: { userId: req.params.id }, include: { assignment: true }, take: 10 }),
    prisma.certificate.findMany({ where: { userId: req.params.id }, include: { course: true }, take: 10 })
  ]);
  return ok(res, { enrollments, attempts, submissions, certificates });
}
