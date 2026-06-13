import jwt, { type SignOptions } from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { env } from "../config/env.js";

export type TokenPayload = {
  sub: string;
  email: string;
  role: Role;
};

export function signAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN
  } as SignOptions);
}

export function signRefreshToken(payload: TokenPayload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN
  } as SignOptions);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}

export function randomCode(prefix = "LMS") {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}
