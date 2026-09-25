import { Router } from "express";
import { z } from "zod";
import type { Server as SocketIOServer } from "socket.io";
import { prisma } from "../prisma.js";
import { requireAuth } from "../auth/middleware.js";
import { validateOrderStock } from "./stock.js";

const orderLineSchema = z.object({
  menuItemId: z.string(),
  quantity: z.number().int().positive().default(1),
  note: z.string().optional(),
});

const createOrderSchema = z.object({
  tableId: z.string(),
  lines: z.array(orderLineSchema).min(1),
});

// De router krijgt de socket.io-server mee zodat een nieuwe bestelling
// direct naar het kassascherm en de keuken-view gestuurd kan worden.
export function createOrdersRouter(io: SocketIOServer) {
  const router = Router();

  router.use(requireAuth);

  // POST /api/orders — wordt aangeroepen vanuit de customer-app (QR-menu)
  // of vanuit de admin-app (bediening voegt handmatig toe).
  router.post("/", async (req, res) => {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Ongeldige bestelling.", errors: parsed.error.flatten() });
    }

    const { tableId, lines } = parsed.data;

    const table = await prisma.restaurantTable.findUnique({ where: { id: tableId } });
    if (!table) {
      return res.status(404).json({ message: "Tafel niet gevonden." });
    }

    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: lines.map((l) => l.menuItemId) } },
      include: { inventoryItem: true },
    });

    const stockValidation = validateOrderStock(
      lines.map((line) => ({ menuItemId: line.menuItemId, quantity: line.quantity })),
      menuItems.map((menuItem) => ({
        id: menuItem.id,
        name: menuItem.name,
        available: menuItem.available,
        inventoryItem: menuItem.inventoryItem
          ? {
              id: menuItem.inventoryItem.id,
              name: menuItem.inventoryItem.name,
              currentStock: Number(menuItem.inventoryItem.currentStock),
            }
          : null,
      }))
    );

    if (!stockValidation.ok) {
      return res.status(400).json({ message: stockValidation.message });
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          tableId,
          status: "BESTELD",
          lines: {
            create: lines.map((line) => {
              const menuItem = menuItems.find((m) => m.id === line.menuItemId)!;
              return {
                menuItemId: line.menuItemId,
                quantity: line.quantity,
                price: menuItem.price,
                note: line.note,
              };
            }),
          },
          total: lines.reduce((sum, line) => {
            const menuItem = menuItems.find((m) => m.id === line.menuItemId)!;
            return sum + Number(menuItem.price) * line.quantity;
          }, 0),
        },
        include: { lines: { include: { menuItem: true } }, table: true },
      });

      for (const line of lines) {
        const menuItem = menuItems.find((item) => item.id === line.menuItemId);
        if (!menuItem?.inventoryItem) continue;

        await tx.inventoryItem.update({
          where: { id: menuItem.inventoryItem.id },
          data: {
            currentStock: {
              decrement: line.quantity,
            },
          },
        });
      }

      await tx.restaurantTable.update({
        where: { id: tableId },
        data: { status: "BESTELD" },
      });

      return newOrder;
    });

    io.emit("order:new", order);

    res.status(201).json(order);
  });

  // GET /api/orders/:id
  router.get("/:id", async (req, res) => {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { lines: { include: { menuItem: true } }, table: true },
    });

    if (!order) {
      return res.status(404).json({ message: "Bestelling niet gevonden." });
    }

    res.json(order);
  });

  return router;
}
