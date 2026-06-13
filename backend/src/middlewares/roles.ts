import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { ApiError } from "../utils/apiResponse.js";

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError(401, "Authentication required"));
    if (!roles.includes(req.user.role)) return next(new ApiError(403, "Insufficient permissions"));
    return next();
  };
}
