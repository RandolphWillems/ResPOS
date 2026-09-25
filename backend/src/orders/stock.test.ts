import test from "node:test";
import assert from "node:assert/strict";

import { validateOrderStock } from "./stock.js";

test("validateOrderStock allows orders when stock is sufficient", () => {
  const result = validateOrderStock(
    [{ menuItemId: "menu-1", quantity: 2 }],
    [
      {
        id: "menu-1",
        name: "Entrecote",
        available: true,
        inventoryItem: {
          id: "inventory-1",
          name: "Entrecote (rauw)",
          currentStock: 10,
        },
      },
    ]
  );

  assert.deepEqual(result, { ok: true });
});

test("validateOrderStock rejects orders when stock is insufficient", () => {
  const result = validateOrderStock(
    [{ menuItemId: "menu-1", quantity: 4 }],
    [
      {
        id: "menu-1",
        name: "Entrecote",
        available: true,
        inventoryItem: {
          id: "inventory-1",
          name: "Entrecote (rauw)",
          currentStock: 3,
        },
      },
    ]
  );

  assert.equal(result.ok, false);
  assert.match(result.message, /Not enough stock/i);
});
