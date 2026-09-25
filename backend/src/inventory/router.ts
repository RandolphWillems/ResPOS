import { Router } from "express";
import { prisma } from "../prisma.js";

export const inventoryRouter = Router();

// GET /api/inventory — volledige voorraadlijst
inventoryRouter.get("/", async (_req, res) => {
  const items = await prisma.inventoryItem.findMany({ orderBy: { name: "asc" } });
  res.json(items);
});

// GET /api/inventory/low-stock — items onder hun minimumvoorraad
// (dit voedt de voorraadwaarschuwing op het hoofdscherm)
inventoryRouter.get("/low-stock", async (_req, res) => {
  const items = await prisma.inventoryItem.findMany();
  const lowStock = items.filter((item) => Number(item.currentStock) <= Number(item.minStock));
  res.json(lowStock);
});
