import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";
import { ok } from "../utils/apiResponse.js";

export async function getSettings(_req: Request, res: Response) {
  const settings = await prisma.setting.findMany();
  return ok(res, Object.fromEntries(settings.map((setting) => [setting.key, setting.value])));
}

export async function updateSettings(req: Request, res: Response) {
  const entries = Object.entries(req.body);
  await Promise.all(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: value as Prisma.InputJsonValue },
        create: { key, value: value as Prisma.InputJsonValue }
      })
    )
  );
  return getSettings(req, res);
}
