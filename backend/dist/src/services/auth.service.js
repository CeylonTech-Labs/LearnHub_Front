import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { prisma } from "../config/db.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiResponse.js";
import { signAccessToken, signRefreshToken } from "../utils/tokens.js";
import { sendEmail } from "./email.service.js";
const userSelect = {
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
export async function registerUser(input) {
    const exists = await prisma.user.findUnique({ where: { email: input.email } });
    if (exists)
        throw new ApiError(409, "Email is already registered");
    const password = await bcrypt.hash(input.password, 12);
    const token = crypto.randomBytes(32).toString("hex");
    const user = await prisma.user.create({
        data: {
            ...input,
            password,
            status: input.role === "INSTRUCTOR" ? "PENDING" : "ACTIVE",
            emailVerificationToken: token
        },
        select: userSelect
    });
    await sendEmail(user.email, "Verify your LearnHub account", `<p>Welcome to LearnHub. Verify your account using this code:</p><p><b>${token}</b></p>`);
    return user;
}
export async function loginUser(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
        throw new ApiError(401, "Invalid credentials");
    if (user.status === "SUSPENDED" || user.status === "REJECTED")
        throw new ApiError(403, "Account is not active");
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
        throw new ApiError(401, "Invalid credentials");
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
    });
    const safeUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: userSelect });
    return { user: safeUser, accessToken, refreshToken };
}
export async function forgotPassword(email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
        return;
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.user.update({
        where: { id: user.id },
        data: {
            passwordResetToken: token,
            passwordResetExpiresAt: new Date(Date.now() + 60 * 60 * 1000)
        }
    });
    await sendEmail(email, "Reset your LearnHub password", `<p>Reset code: <b>${token}</b></p>`);
}
export async function resetPassword(token, password) {
    const user = await prisma.user.findFirst({
        where: {
            passwordResetToken: token,
            passwordResetExpiresAt: { gt: new Date() }
        }
    });
    if (!user)
        throw new ApiError(400, "Invalid or expired reset token");
    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: await bcrypt.hash(password, 12),
            passwordResetToken: null,
            passwordResetExpiresAt: null
        }
    });
}
export async function verifyEmail(token) {
    const user = await prisma.user.findFirst({ where: { emailVerificationToken: token } });
    if (!user)
        throw new ApiError(400, "Invalid verification token");
    return prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true, emailVerificationToken: null },
        select: userSelect
    });
}
export async function changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid)
        throw new ApiError(401, "Current password is incorrect");
    await prisma.user.update({
        where: { id: userId },
        data: { password: await bcrypt.hash(newPassword, 12) }
    });
}
export async function revokeRefreshToken(refreshToken) {
    if (!refreshToken)
        return;
    const tokens = await prisma.refreshToken.findMany({ where: { revokedAt: null } });
    const found = await Promise.all(tokens.map(async (token) => ((await bcrypt.compare(refreshToken, token.tokenHash)) ? token : null)));
    const match = found.find((token) => token !== null);
    if (match)
        await prisma.refreshToken.update({ where: { id: match.id }, data: { revokedAt: new Date() } });
}
export const cookieOptions = {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: "lax"
};
