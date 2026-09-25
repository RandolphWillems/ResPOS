import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAuth } from "../auth/middleware.js";

export const tablesRouter = Router();

tablesRouter.use(requireAuth);

// GET /api/tables — overzicht van alle tafels en de bar, met status
tablesRouter.get("/", async (_req, res) => {
  const tables = await prisma.restaurantTable.findMany({
    orderBy: { label: "asc" },
  });
  res.json(tables);
});

// GET /api/tables/by-qr/:qrToken — gebruikt door de customer-app na het scannen
tablesRouter.get("/by-qr/:qrToken", async (req, res) => {
  const table = await prisma.restaurantTable.findUnique({
    where: { qrToken: req.params.qrToken },
  });

  if (!table) {
    return res.status(404).json({ message: "Tafel niet gevonden." });
  }

  res.json(table);
});
