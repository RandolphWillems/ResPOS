import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import type { MenuItem, RestaurantTable } from "@respos/shared-types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

function MenuPage() {
  const { qrToken } = useParams();
  const [table, setTable] = useState<RestaurantTable | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/tables/by-qr/${qrToken}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setTable)
      .catch(() => setTable(null));

    fetch(`${API_URL}/api/menu-items`)
      .then((res) => res.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, [qrToken]);

  function addToCart(itemId: string) {
    setCart((current) => ({ ...current, [itemId]: (current[itemId] ?? 0) + 1 }));
  }

  async function placeOrder() {
    if (!table) return;

    const lines = Object.entries(cart).map(([menuItemId, quantity]) => ({ menuItemId, quantity }));
    if (lines.length === 0) return;

    const res = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableId: table.id, lines }),
    });

    if (res.ok) {
      setPlaced(true);
      setCart({});
    }
  }

  if (!qrToken) return null;

  if (!table) {
    return <p className="p-6 text-center text-neutral-500">Tafel niet gevonden. Scan de QR-code opnieuw.</p>;
  }

  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="min-h-screen bg-white p-4">
      <h1 className="mb-1 text-lg font-medium">{table.label}</h1>
      <p className="mb-4 text-sm text-neutral-500">Kies je gerechten en bestel direct aan tafel.</p>

      {placed && (
        <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          Bestelling geplaatst — de keuken is op de hoogte.
        </p>
      )}

      <ul className="mb-24 space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between rounded-lg border border-neutral-200 p-3">
            <div>
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-neutral-500">&euro;{item.price.toFixed(2)}</div>
            </div>
            <button
              onClick={() => addToCart(item.id)}
              className="rounded-md border border-neutral-300 px-3 py-1 text-sm"
            >
              Toevoegen{cart[item.id] ? ` (${cart[item.id]})` : ""}
            </button>
          </li>
        ))}
      </ul>

      {cartCount > 0 && (
        <button
          onClick={placeOrder}
          className="fixed inset-x-4 bottom-4 rounded-lg bg-neutral-900 py-3 text-center text-white"
        >
          Bestel ({cartCount})
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/menu/:qrToken" element={<MenuPage />} />
        <Route
          path="*"
          element={<p className="p-6 text-center text-neutral-500">Scan de QR-code op je tafel om te bestellen.</p>}
        />
      </Routes>
    </BrowserRouter>
  );
}
