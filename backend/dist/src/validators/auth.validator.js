import { z } from "zod";
export const registerSchema = z.object({
    body: z.object({
        firstName: z.string().min(2),
        lastName: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(8),
        phone: z.string().optional(),
        role: z.enum(["INSTRUCTOR", "STUDENT"]).default("STUDENT")
    })
});
export const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(1)
    })
});
export const forgotPasswordSchema = z.object({
    body: z.object({ email: z.string().email() })
});
export const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string().min(10),
        password: z.string().min(8)
    })
});
export const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8)
    })
});
