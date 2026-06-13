import { prisma } from "../config/db.js";
import { ok } from "../utils/apiResponse.js";
export async function getSettings(_req, res) {
    const settings = await prisma.setting.findMany();
    return ok(res, Object.fromEntries(settings.map((setting) => [setting.key, setting.value])));
}
export async function updateSettings(req, res) {
    const entries = Object.entries(req.body);
    await Promise.all(entries.map(([key, value]) => prisma.setting.upsert({
        where: { key },
        update: { value: value },
        create: { key, value: value }
    })));
    return getSettings(req, res);
}
