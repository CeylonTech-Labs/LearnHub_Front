import { prisma } from "../config/db.js";
import { changePassword, cookieOptions, forgotPassword, loginUser, registerUser, resetPassword, revokeRefreshToken, verifyEmail } from "../services/auth.service.js";
import { created, ok } from "../utils/apiResponse.js";
export async function register(req, res) {
    const user = await registerUser(req.body);
    return created(res, user, "Registration successful");
}
export async function login(req, res) {
    const result = await loginUser(req.body.email, req.body.password);
    res.cookie("accessToken", result.accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie("refreshToken", result.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return ok(res, result, "Login successful");
}
export async function logout(req, res) {
    await revokeRefreshToken(req.cookies?.refreshToken);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return ok(res, null, "Logged out");
}
export async function me(req, res) {
    const user = await prisma.user.findUniqueOrThrow({
        where: { id: req.user.id },
        select: {
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
        }
    });
    return ok(res, user);
}
export async function forgot(req, res) {
    await forgotPassword(req.body.email);
    return ok(res, null, "If the email exists, a reset link has been sent");
}
export async function reset(req, res) {
    await resetPassword(req.body.token, req.body.password);
    return ok(res, null, "Password reset successful");
}
export async function verify(req, res) {
    const user = await verifyEmail(String(req.query.token));
    return ok(res, user, "Email verified");
}
export async function updateProfile(req, res) {
    const user = await prisma.user.update({
        where: { id: req.user.id },
        data: {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone: req.body.phone,
            profileImage: req.body.profileImage
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileImage: true,
            role: true,
            status: true,
            emailVerified: true
        }
    });
    return ok(res, user, "Profile updated");
}
export async function changeOwnPassword(req, res) {
    await changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
    return ok(res, null, "Password changed");
}
