import { Router } from "express";
import { prisma } from "../prisma.js";

export const menuRouter = Router();

// GET /api/menu-items — gebruikt door zowel de admin-app (producttegels)
// als de customer-app (QR-menu)
menuRouter.get("/", async (_req, res) => {
  const items = await prisma.menuItem.findMany({
    where: { available: true },
    orderBy: { category: "asc" },
  });
  res.json(items);
});
