import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiResponse.js";

const uploadRoot = path.resolve(env.UPLOAD_DIR);
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
    cb(null, `${Date.now()}-${safeName}`);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 250 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
      "video/mp4",
      "video/webm",
      "application/zip"
    ];
    if (!allowed.includes(file.mimetype)) return cb(new ApiError(400, "Unsupported file type"));
    cb(null, true);
  }
});
