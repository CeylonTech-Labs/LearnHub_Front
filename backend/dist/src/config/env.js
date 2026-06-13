import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();
const schema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().default(5000),
    DATABASE_URL: z.string().min(1),
    FRONTEND_URL: z.string().url().default("http://localhost:3000"),
    JWT_ACCESS_SECRET: z.string().min(20),
    JWT_REFRESH_SECRET: z.string().min(20),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
    COOKIE_SECURE: z.coerce.boolean().default(false),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    MAIL_FROM: z.string().default("LearnHub <noreply@learnhub.local>"),
    UPLOAD_DIR: z.string().default("src/uploads")
});
export const env = schema.parse(process.env);
