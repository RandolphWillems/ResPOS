import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";

export const reportsRouter = Router();

const closeDaySchema = z.object({
  closedById: z.string(),
});

// POST /api/reports/day-closing — sluit de dag af met totale omzet, kosten en winst
reportsRouter.post("/day-closing", async (req, res) => {
  const parsed = closeDaySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "closedById is verplicht." });
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: startOfDay }, status: "AFGEREKEND" },
    include: { lines: { include: { menuItem: { include: { inventoryItem: true } } } } },
  });

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);

  const totalCost = orders.reduce((sum, order) => {
    const orderCost = order.lines.reduce((lineSum, line) => {
      const costPrice = line.menuItem.inventoryItem ? Number(line.menuItem.inventoryItem.costPrice) : 0;
      return lineSum + costPrice * line.quantity;
    }, 0);
    return sum + orderCost;
  }, 0);

  const dayClosing = await prisma.dayClosing.create({
    data: {
      totalRevenue,
      totalCost,
      profit: totalRevenue - totalCost,
      closedById: parsed.data.closedById,
    },
  });

  res.status(201).json(dayClosing);
});
