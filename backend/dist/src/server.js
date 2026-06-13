import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "node:path";
import { env } from "./config/env.js";
import { prisma } from "./config/db.js";
import { errorHandler } from "./middlewares/error.js";
import { routes } from "./routes/index.js";
const app = express();
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve(env.UPLOAD_DIR)));
app.get("/health", (_req, res) => res.json({ success: true, message: "LearnHub API is healthy" }));
app.use("/api", routes);
app.use((_req, res) => res.status(404).json({ success: false, message: "Route not found" }));
app.use(errorHandler);
const server = app.listen(env.PORT, () => {
    console.log(`LearnHub API running on http://localhost:${env.PORT}`);
});
process.on("SIGINT", async () => {
    await prisma.$disconnect();
    server.close(() => process.exit(0));
});
