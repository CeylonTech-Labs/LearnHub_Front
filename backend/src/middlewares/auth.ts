import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiResponse.js";
import { verifyAccessToken } from "../utils/tokens.js";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const cookieToken = req.cookies?.accessToken;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : cookieToken;

  if (!token) {
    return next(new ApiError(401, "Authentication required"));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    return next();
  } catch {
    return next(new ApiError(401, "Invalid or expired token"));
  }
}
