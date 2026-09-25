import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Rollen
  const roleNames = ["Eigenaar", "Manager", "Ober", "Bar", "Keuken"];
  for (const name of roleNames) {
    await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
  }

  // Tafels + bar
  for (let i = 1; i <= 6; i++) {
    await prisma.restaurantTable.upsert({
      where: { qrToken: `seed-tafel-${i}` },
      update: {},
      create: { label: `Tafel ${i}`, zone: "TAFEL", qrToken: `seed-tafel-${i}` },
    });
  }
  for (let i = 1; i <= 2; i++) {
    await prisma.restaurantTable.upsert({
      where: { qrToken: `seed-bar-${i}` },
      update: {},
      create: { label: `Bar ${i}`, zone: "BAR", qrToken: `seed-bar-${i}` },
    });
  }

  // Voorraad (incl. wijn)
  const sauvignon = await prisma.inventoryItem.create({
    data: {
      name: "Sauvignon blanc",
      category: "WIJN",
      unit: "fles",
      currentStock: 3,
      minStock: 6,
      costPrice: 4.5,
      grapeVariety: "Sauvignon blanc",
      vintage: 2023,
      winery: "Domaine Exemple",
    },
  });

  const huiswijnRood = await prisma.inventoryItem.create({
    data: { name: "Huiswijn rood", category: "WIJN", unit: "fles", currentStock: 18, minStock: 6, costPrice: 3.2 },
  });

  const tonic = await prisma.inventoryItem.create({
    data: { name: "Tonic water", category: "DRANK", unit: "fles", currentStock: 6, minStock: 12, costPrice: 0.9 },
  });

  const entrecoteVoorraad = await prisma.inventoryItem.create({
    data: { name: "Entrecote (rauw)", category: "KEUKEN", unit: "kg", currentStock: 8, minStock: 4, costPrice: 14 },
  });

  // Menu
  await prisma.menuItem.createMany({
    data: [
      { name: "Carpaccio", category: "Voorgerechten", price: 14.5 },
      { name: "Tomatensoep", category: "Voorgerechten", price: 8.0 },
      { name: "Entrecote", category: "Hoofdgerechten", price: 26.5, inventoryItemId: entrecoteVoorraad.id },
      { name: "Zalm", category: "Hoofdgerechten", price: 24.0 },
      { name: "Huiswijn rood (glas)", category: "Wijn", price: 6.5, inventoryItemId: huiswijnRood.id },
      { name: "Sauvignon blanc (glas)", category: "Wijn", price: 7.0, inventoryItemId: sauvignon.id },
      { name: "Tonic", category: "Bier & fris", price: 3.8, inventoryItemId: tonic.id },
      { name: "Tiramisu", category: "Desserts", price: 7.5 },
    ],
  });

  console.log("Seed voltooid.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
