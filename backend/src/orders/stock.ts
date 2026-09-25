export type OrderLineInput = {
  menuItemId: string;
  quantity: number;
};

export type InventoryInfo = {
  id: string;
  name: string;
  currentStock: number | string;
};

export type MenuItemWithInventory = {
  id: string;
  name: string;
  available: boolean;
  inventoryItem?: InventoryInfo | null;
};

export function validateOrderStock(lines: OrderLineInput[], menuItems: MenuItemWithInventory[]) {
  const inventoryUsage = new Map<string, { name: string; requested: number; available: number }>();

  for (const line of lines) {
    const item = menuItems.find((menuItem) => menuItem.id === line.menuItemId);

    if (!item) {
      return {
        ok: false,
        message: `Menu item ${line.menuItemId} does not exist.`,
      } as const;
    }

    if (!item.available) {
      return {
        ok: false,
        message: `Menu item "${item.name}" is not available right now.`,
      } as const;
    }

    if (!item.inventoryItem) {
      continue;
    }

    const currentStock = Number(item.inventoryItem.currentStock);
    const totalRequested = (inventoryUsage.get(item.inventoryItem.id)?.requested ?? 0) + line.quantity;

    if (currentStock < totalRequested) {
      return {
        ok: false,
        message: `Not enough stock for ${item.inventoryItem.name}. Available: ${currentStock}, needed: ${totalRequested}.`,
      } as const;
    }

    inventoryUsage.set(item.inventoryItem.id, {
      name: item.inventoryItem.name,
      requested: totalRequested,
      available: currentStock,
    });
  }

  return { ok: true } as const;
}
