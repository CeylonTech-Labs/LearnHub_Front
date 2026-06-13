import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export function signAccessToken(payload) {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRES_IN
    });
}
export function signRefreshToken(payload) {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN
    });
}
export function verifyAccessToken(token) {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
}
export function verifyRefreshToken(token) {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
}
export function randomCode(prefix = "LMS") {
    return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`;
}
