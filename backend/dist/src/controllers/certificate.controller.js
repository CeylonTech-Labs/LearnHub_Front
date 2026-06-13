import { prisma } from "../config/db.js";
import { created, ok } from "../utils/apiResponse.js";
import { randomCode } from "../utils/tokens.js";
export async function myCertificates(req, res) {
    return ok(res, await prisma.certificate.findMany({ where: { userId: req.user.id }, include: { course: true }, orderBy: { issuedAt: "desc" } }));
}
export async function verifyCertificate(req, res) {
    return ok(res, await prisma.certificate.findUniqueOrThrow({
        where: { certificateCode: req.params.certificateCode },
        include: { user: { select: { firstName: true, lastName: true } }, course: { include: { instructor: { select: { firstName: true, lastName: true } } } } }
    }));
}
export async function generateCertificate(req, res) {
    const certificate = await prisma.certificate.upsert({
        where: { userId_courseId: { userId: req.body.userId ?? req.user.id, courseId: req.body.courseId } },
        update: {},
        create: {
            certificateCode: randomCode("CERT"),
            userId: req.body.userId ?? req.user.id,
            courseId: req.body.courseId
        }
    });
    await prisma.notification.create({
        data: {
            userId: certificate.userId,
            title: "Certificate issued",
            message: `Certificate ${certificate.certificateCode} is ready`,
            type: "CERTIFICATE"
        }
    });
    return created(res, certificate, "Certificate generated");
}
