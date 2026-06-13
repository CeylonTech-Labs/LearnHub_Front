import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { ApiError } from "../utils/apiResponse.js";
export const errorHandler = (error, _req, res, _next) => {
    if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            details: error.details
        });
    }
    if (error instanceof ZodError) {
        return res.status(422).json({
            success: false,
            message: "Validation failed",
            details: error.flatten()
        });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return res.status(400).json({
            success: false,
            message: "Database request failed",
            code: error.code
        });
    }
    console.error(error);
    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
};
